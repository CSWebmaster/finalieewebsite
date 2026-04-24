/**
 * IEEE SOU SB — Google Apps Script v2
 * ─────────────────────────────────────────────────────────────
 * SINGLE SHEET, FLAT TABLE format. All submissions (Join IEEE,
 * Contact Us, Event Registrations) go into ONE sheet "Main Data"
 * as rows with a FROZEN column schema.
 *
 * FIXED COLUMNS (always present, left side):
 *   Timestamp | FormType | EventName | Name | Email | Phone | Message | ...dynamicFields
 *
 * Dynamic fields from the form builder are appended AFTER the
 * fixed columns, only if not already present in the header row.
 * Once a column name is added it STAYS — this keeps historical
 * rows stable (missing cells show as blank, not misaligned).
 *
 * HOW TO DEPLOY:
 * 1. Open script.google.com and create a new project
 * 2. Paste this entire file
 * 3. Replace SPREADSHEET_ID with your sheet ID
 * 4. Deploy → New deployment → Web app → Execute as: Me,
 *    Access: Anyone → Copy the URL into .env as VITE_SHEETS_WEBHOOK_URL
 */

var SPREADSHEET_ID = "113HbVSLrued63kyEj3H8aCZ3F0elpQTUgX8nq-GF38";
var SHEET_NAME     = "Main Data";

// Fixed left-side columns. Order is locked — do NOT change.
var FIXED_COLS = ["Timestamp", "FormType", "EventName", "Name", "Email", "Phone", "Message"];

// ─────────────────────────────────────────────────────────────
// doPost — receives JSON payload from Cloud Function or frontend
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Required fields
    var formType  = payload.formType  || "Unknown";   // "Join IEEE" | "Contact Us" | "Event Registration"
    var eventName = payload.eventName || "";           // filled for event registrations
    var fields    = payload.fields    || {};           // key→value map of all dynamic fields

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Auto-create sheet with frozen header if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // ── Step 1: Ensure header row exists ──────────────────────
    var existingHeaders = [];
    if (sheet.getLastRow() === 0) {
      // Brand new sheet — write fixed cols as initial headers
      existingHeaders = FIXED_COLS.slice();
      sheet.getRange(1, 1, 1, existingHeaders.length)
           .setValues([existingHeaders])
           .setFontWeight("bold")
           .setBackground("#00629B")
           .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } else {
      existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // ── Step 2: Expand headers with new dynamic field keys ────
    // Dynamic field keys come from the form builder.
    // We only add keys not already in the header.
    var dynamicKeys = Object.keys(fields).filter(function(k) {
      // Skip keys already covered by fixed columns (case-insensitive check)
      var lower = k.toLowerCase();
      return !["name","email","phone","message"].includes(lower);
    });

    var addedNew = false;
    dynamicKeys.forEach(function(key) {
      if (existingHeaders.indexOf(key) === -1) {
        existingHeaders.push(key);
        addedNew = true;
      }
    });

    // If new columns were added, write the updated header row
    if (addedNew) {
      sheet.getRange(1, 1, 1, existingHeaders.length)
           .setValues([existingHeaders])
           .setFontWeight("bold")
           .setBackground("#00629B")
           .setFontColor("#ffffff");
    }

    // ── Step 3: Build the row values ──────────────────────────
    var timestamp = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm:ss");

    // Helper: extract common fields from the `fields` map (case-insensitive)
    function extract(map, candidates) {
      for (var i = 0; i < candidates.length; i++) {
        var v = map[candidates[i]];
        if (v !== undefined && v !== null && v !== "") return String(v);
      }
      return "";
    }

    var fixedValues = {
      "Timestamp":  timestamp,
      "FormType":   formType,
      "EventName":  eventName,
      "Name":       extract(fields, ["name", "Name", "fullName", "full_name"]),
      "Email":      extract(fields, ["email", "Email"]),
      "Phone":      extract(fields, ["phone", "Phone", "mobile", "Mobile", "contact"]),
      "Message":    extract(fields, ["message", "Message", "description", "query"])
    };

    var row = existingHeaders.map(function(header) {
      if (fixedValues.hasOwnProperty(header)) {
        return fixedValues[header];
      }
      return fields[header] !== undefined ? String(fields[header]) : "";
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", row: row.length }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────────────────
// doGet — health check
// ─────────────────────────────────────────────────────────────
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status:  "ok",
      version: "2.0",
      sheet:   SHEET_NAME,
      message: "IEEE SOU SB Sheets webhook is live."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
