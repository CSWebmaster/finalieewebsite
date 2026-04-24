const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require("https");
const url = require("url");

admin.initializeApp();
const db = admin.firestore();

/**
 * PRODUCTION-GRADE FORM SUBMISSION PIPELINE
 * 
 * Responsibilities:
 * 1. Bot Protection (Honeypot)
 * 2. Strict Input Validation
 * 3. Firestore Backup (Permanent)
 * 4. Google Sheets Sync (via Secure Webhook)
 */
exports.submitFormData = functions.https.onCall(async (data, context) => {
  // ── 1. Bot Protection ──────────────────────────────────────
  if (data._honeypot && data._honeypot.length > 0) {
    return { success: true, id: "bot_trapped" };
  }

  // Prevent rapid-fire submissions (anti-spam)
  const loadedAt = Number(data._loadedAt) || 0;
  if (loadedAt > 0 && (Date.now() - loadedAt < 2000)) {
    throw new functions.https.HttpsError("resource-exhausted", "Submission rejected (too fast).");
  }

  // ── 2. Request Validation ──────────────────────────────
  // The frontend calls with: { formType, responses, eventName, ... }
  // We map them to the format requested by the admin: { type, eventName, values }
  const { formType, responses, eventName } = data;
  
  if (!formType || !responses || typeof responses !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields (formType/responses).");
  }

  const allowedTypes = ["Contact Us", "Join IEEE", "Event Registration"];
  if (!allowedTypes.includes(formType)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid form type.");
  }

  // ── 3. Firestore Backup (Primary Storage) ───────────────
  let responseId = "";
  try {
    const responseRef = db.collection("formResponses").doc();
    await responseRef.set({
      type: formType,
      eventName: eventName || "General",
      values: responses,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      _ip: (context.rawRequest && context.rawRequest.ip) || "unknown"
    });
    responseId = responseRef.id;
  } catch (error) {
    console.error("[submitFormData] Firestore Write failed:", error);
    throw new functions.https.HttpsError("internal", "Failed to store submission.");
  }

  // ── 4. Google Sheets Synchronization ────────────────────
  const webhookUrl = functions.config().sheets?.webhook_url;
  const secretKey = functions.config().sheets?.secret_key;

  if (webhookUrl && secretKey) {
    try {
      // Async call to webhook (non-blocking for the client, but awaited for reliability here)
      await postJson(webhookUrl, {
        secret: secretKey,
        type: formType,
        eventName: eventName || "General",
        values: responses
      });
    } catch (sheetErr) {
      // We log but still return success because Firestore write was successful
      console.error("[submitFormData] Sheets Webhook Error:", sheetErr.message);
    }
  } else {
    console.warn("[submitFormData] sheets.webhook_url or secret_key NOT CONFIGURED.");
  }

  return { success: true, id: responseId };
});

/**
 * Helper: Send JSON POST request via standard Node.js https
 */
function postJson(targetUrl, body) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const payload = JSON.stringify(body);

    const options = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => resolve(raw));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ── EXISTING ADMIN FUNCTIONS ─────────────────────────────────────
// (Keeping these for system stability as per user's earlier needs)

exports.submitChange = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  const userData = userDoc.data();
  if (!userData || (userData.role !== "admin" && userData.role !== "writer")) {
    throw new functions.https.HttpsError("permission-denied", "Insufficient permissions.");
  }
  const changeRef = await db.collection("pendingChanges").add({
    ...data,
    status: "pending",
    submittedBy: context.auth.uid,
    submittedByName: userData.name || "Unknown",
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, changeId: changeRef.id };
});

exports.approveChange = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
  const adminDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admin role required.");
  }
  const { changeId, notes } = data;
  const changeRef = db.collection("pendingChanges").doc(changeId);
  const changeSnap = await changeRef.get();
  const changeData = changeSnap.data();
  const targetDocId = changeData.docId || db.collection("publishedContent").doc(changeData.section).collection("items").doc().id;
  const batch = db.batch();
  batch.set(db.collection("publishedContent").doc(changeData.section).collection("items").doc(targetDocId), {
    ...changeData.data,
    lastModifiedBy: context.auth.uid,
    lastModifiedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.update(changeRef, { status: "approved", reviewedBy: context.auth.uid, reviewedAt: admin.firestore.FieldValue.serverTimestamp() });
  await batch.commit();
  return { success: true };
});

exports.rejectChange = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
  const adminDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admin role required.");
  }
  await db.collection("pendingChanges").doc(data.changeId).update({
    status: "rejected",
    adminNotes: data.notes || "No reason",
    reviewedBy: context.auth.uid,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true };
});

exports.adminCreateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required.");
  const adminDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Admin role required.");
  }
  const { email, password, name, role } = data;
  const userRecord = await admin.auth().createUser({ email, password, displayName: name });
  await db.collection("users").doc(userRecord.uid).set({
    name, email, role: role || "writer", createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, uid: userRecord.uid };
});
