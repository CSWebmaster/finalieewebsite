/**
 * Google Apps Script for IEEE SOU SB Website Form Submissions
 * This script receives form data via POST and saves it to a Google Spreadsheet.
 */

// 1. REPLACED THIS WITH YOUR SPREADSHEET ID
var SPREADSHEET_ID = "113HbVSLrued63kyEj3H8aCZ3F0elpQTUgX8nq-GF38";

/**
 * Handle POST requests from the website
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheetName || "Sheet1";
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Get timestamp in IST (Asia/Kolkata)
    var timestamp = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm:ss");
    
    // Prepare the row data
    // We expect the data object to contain the fields directly
    // The first column is always the timestamp
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    
    // If sheet is empty, set headers from data keys
    if (sheet.getLastRow() === 0) {
      headers = ["Timestamp"];
      for (var key in data) {
        if (key !== "sheetName") {
          headers.push(key);
        }
      }
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Map data to headers
    var row = headers.map(function(header) {
      if (header === "Timestamp") return timestamp;
      return data[header] || "";
    });

    // Append the row
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Row appended successfully to " + sheetName 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (Health Check)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    "status": "ok", 
    "message": "IEEE SOU SB Sheets endpoint is live." 
  })).setMimeType(ContentService.MimeType.JSON);
}
