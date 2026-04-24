import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

export type ContentSection = "blogs" | "events" | "members" | "awards" | "sigs" | "journey" | "forms";

/**
 * Maps content sections to their live Firestore collections
 */
export const getLiveCollection = (section: ContentSection) => {
  return collection(db, section);
};

/**
 * Standardized function to submit content changes to the moderation queue
 */
export const submitContentChange = async (
  userId: string,
  userName: string,
  section: ContentSection,
  contentData: any,
  docId: string | null = null,
  userEmail?: string,
  role?: string,
  action: 'create' | 'update' | 'delete' = 'create'
) => {
  if (!userId) throw new Error("User must be logged in to submit changes.");

  const pendingRef = collection(db, "pendingChanges");
  const effectiveAction = action || (docId ? "update" : "create");

  console.log("[CMS] Submitting change. Role:", role, "Action:", effectiveAction);

  // Determine role if not passed
  let effectiveRole = role;
  if (!effectiveRole) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      effectiveRole = userDoc.data()?.role || "core_member";
    } catch (e) {
      effectiveRole = "core_member";
    }
  }

  // ── Webmaster Fast-Path: Write directly to live collection ──
  if (effectiveRole === 'webmaster') {
    const liveColl = collection(db, section);
    const { updateDoc, deleteDoc, doc: firestoreDoc } = await import("firebase/firestore");
    
    if (effectiveAction === 'delete' && docId) {
      await deleteDoc(firestoreDoc(db, section, docId));
    } else if (effectiveAction === 'update' && docId) {
      const itemDocRef = firestoreDoc(db, section, docId);
      await updateDoc(itemDocRef, { ...contentData, updatedAt: serverTimestamp() });
    } else if (effectiveAction === 'create') {
      await addDoc(liveColl, { ...contentData, updatedAt: serverTimestamp(), createdAt: serverTimestamp() });
    }

    // Write to audit logs
    const auditRef = collection(db, "auditLogs");
    await addDoc(auditRef, {
      action: `content_${effectiveAction}_direct`,
      section,
      performedBy: userId,
      performedByEmail: userEmail || "",
      timestamp: serverTimestamp(),
      data: effectiveAction === 'delete' ? { id: docId } : contentData
    });

    console.log(`[CMS] Direct ${effectiveAction} successful.`);
    return { id: "direct", status: "success" };
  }

  // ── Standard Path: Pending Approval ──
  const changeRequest = {
    section,
    docId,
    status: "pending",
    data: contentData,
    submittedBy: userId,
    submittedByName: userName,
    submittedByEmail: userEmail || "",
    submittedAt: serverTimestamp(),
    reviewedBy: null,
    reviewedByEmail: null,
    reviewedAt: null,
    rejectionReason: null,
    action: effectiveAction,
  };

  const result = await addDoc(pendingRef, changeRequest);
  console.log("[CMS] Submission successful, ID:", result.id);
  return result;
};


/**
 * Unified listener for all pending changes in the system (for Admins)
 */
export const listenToAllPendingChanges = (callback: (changes: any[]) => void) => {
  const q = query(
    collection(db, "pendingChanges"),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/**
 * Listener for a writer's own submission history
 */
export const listenToMySubmissions = (userId: string, callback: (changes: any[]) => void) => {
  const q = query(
    collection(db, "pendingChanges"),
    where("submittedBy", "==", userId),
    orderBy("submittedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
