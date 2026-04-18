// ═══════════════════════════════════════════════════════════════════════════
//  IEEE SOU SB — Google Apps Script Web App
//  Paste this entire file into https://script.google.com
//
//  SETUP STEPS:
//  1. Open https://script.google.com → New Project.
//  2. Replace all default code with this file.
//  3. Set SPREADSHEET_ID below (from your Google Sheet URL).
//  4. Click "Deploy" → "New deployment" → Type: Web app.
//     - Execute as: Me
//     - Who has access: Anyone
//  5. Click "Deploy", authorize, then copy the Web App URL.
//  6. Paste that URL into src/lib/googleSheets.ts → APPS_SCRIPT_URL.
// ═══════════════════════════════════════════════════════════════════════════

// ✏️  PASTE YOUR GOOGLE SPREADSHEET ID HERE
//     (the long string in the Sheet URL between /d/ and /edit)
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

var SHEET_CONTACT = "Contact Us Submissions";
var SHEET_JOIN    = "Join Form Submissions";

// Column headers — must match the order rows are appended below
var HEADERS_CONTACT = ["Timestamp", "Name", "Email", "Phone", "Message"];
var HEADERS_JOIN    = ["Timestamp", "Name", "Email", "Phone", "Enrollment No.", "College", "Department", "Semester", "Academic Year", "Reason to Join"];

// ─── Main entry point ───────────────────────────────────────────────────────
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);
    var sheet = data.sheet; // "contact" or "join"

    if (sheet === "contact") {
      appendRow(SHEET_CONTACT, HEADERS_CONTACT, [
        data.timestamp,
        data.name,
        data.email,
        data.phone    || "",
        data.message  || "",
      ]);
    } else if (sheet === "join") {
      appendRow(SHEET_JOIN, HEADERS_JOIN, [
        data.timestamp,
        data.name,
        data.email,
        data.phone        || "",
        data.enrollment   || "",
        data.college      || "",
        data.department   || "",
        data.semester     || "",
        data.academicYear || "",
        data.reason       || "",
      ]);
    } else {
      return jsonResponse({ success: false, error: "Unknown sheet target: " + sheet });
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Appends a row; creates the sheet + header row if it doesn't exist yet
function appendRow(sheetName, headers, values) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    // Bold + freeze the header row
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(values);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── GET handler (health check) ─────────────────────────────────────────────
function doGet() {
  return jsonResponse({ status: "ok", message: "IEEE SOU SB Sheets endpoint is live." });
}
