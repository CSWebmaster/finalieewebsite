/**
 * Utility to save form data to Google Sheets via Apps Script Web App
 */

// REPLACE THIS with your deployed Apps Script Web App URL from Step 3 & 4 of the guide
const APPS_SCRIPT_URL = "https://script.google.com/a/macros/socet.edu.in/s/AKfycbxrVuXdpQvdc8_a8lFxZZfVyzl1drqYcGHw9GLrcLMjEWeqqvNYeqKS5dZYe3O3vqO9/exec";

export async function saveToGoogleSheets(data: Record<string, any>, sheetName: string) {
  if (APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
    console.warn("[GoogleSheets] Apps Script URL not configured. Skipping sheet save.");
    return;
  }

  try {
    const payload = {
      ...data,
      sheetName: sheetName,
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[GoogleSheets] Success: Data successfully sent to ${sheetName}`);
    return true;
  } catch (error) {
    console.error("[GoogleSheets] Save failed:", error);
    return false;
  }
}
