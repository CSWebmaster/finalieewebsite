// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets Integration via Google Apps Script Web App
//
// HOW TO SET UP:
//   1. Go to https://script.google.com and create a new project.
//   2. Paste the contents of /scripts/google-apps-script.js into the editor.
//   3. Click "Deploy" → "New deployment" → Type: "Web app".
//   4. Set "Execute as" = Me, "Who has access" = Anyone.
//   5. Click "Deploy" and copy the Web App URL.
//   6. Paste that URL below as APPS_SCRIPT_URL.
// ─────────────────────────────────────────────────────────────────────────────

// ✏️  PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5Ajv0mwbo5417QpOM_F-d3W_SZylOgvSwm6yY-09DYYH0uZlMEztISjf8N8VxSp7Ujw/exec";

export type SheetTarget = "contact" | "join";

export interface ContactSheetRow {
  sheet: "contact";
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface JoinSheetRow {
  sheet: "join";
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  enrollment: string;
  college: string;
  department: string;
  semester: string;
  academicYear: string;
  reason: string;
}

type SheetRow = ContactSheetRow | JoinSheetRow;

export async function saveToGoogleSheets(data: SheetRow): Promise<void> {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("[GoogleSheets] Apps Script URL not configured — skipping sheet save.");
    return;
  }

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    // Google Apps Script requires text/plain to avoid CORS preflight on no-cors mode
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets save failed: ${res.status}`);
  }
}
