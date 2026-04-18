# Google Sheets Integration Setup Guide
## IEEE SOU SB Website — Contact Us & Join Form

This guide explains how to set up Google Sheets to store all Contact Us and Join form submissions.

---

## What You Need
- A Google account
- Access to the project codebase
- Access to Firebase Console (`sbversion-07march`)

---

## Step 1 — Create the Google Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it: `IEEE SOU SB Form Submissions`
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit
   ```
   The ID is the long string between `/d/` and `/edit`

---

## Step 2 — Set Up Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name the project: `IEEE_SOU_SB_Website_FORM`
4. In the editor (the white area with line numbers), press **Ctrl+A** → **Delete**
5. Open the file `scripts/google-apps-script.js` from the project folder
6. Copy the entire content and paste it into the Apps Script editor
7. On **line 18**, replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID:
   ```js
   var SPREADSHEET_ID = "your_actual_id_here";
   ```
8. Press **Ctrl+S** to save

---

## Step 3 — Deploy as Web App

1. Click **Deploy** (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Type" → select **Web app**
3. Fill in the settings:
   - Description: `IEEE SOU SB Forms`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 4 — Add the URL to the Project

1. Open the file `src/lib/googleSheets.ts`
2. Find this line:
   ```ts
   const APPS_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace it with your copied URL:
   ```ts
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Save the file

---

## Step 5 — Fix Firestore Security Rules

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select project: **sbversion-07march**
3. Click **Firestore Database** → **Rules** tab
4. Replace all existing rules with:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow anyone to write contact form submissions
    match /contacts/{docId} {
      allow create: if true;
    }

    // Allow anyone to write join applications
    match /ieee_applications/{docId} {
      allow create: if true;
    }

    // Everything else requires auth
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

---

## Step 6 — Test It

### Health Check
Paste your Web App URL directly in a browser tab — you should see:
```json
{"status":"ok","message":"IEEE SOU SB Sheets endpoint is live."}
```

### Test Contact Form
1. Run `npm run dev` in the terminal
2. Go to `http://localhost:5173/contact`
3. Fill in Name, Email, Phone, Message → click **Send Message**
4. Open your Google Sheet → a tab **"Contact_Us"** should appear with the row

### Test Join Form
1. Go to `http://localhost:5173/join`
2. Fill all fields → click **Submit Application**
3. Open your Google Sheet → a tab **"Join_IEEE"** should appear with the row

---

## How It Works

```
User submits form
       │
       ├──► Firestore (admin panel storage)
       ├──► Google Sheets (spreadsheet storage)  ← new
       └──► Email notification
```

- Both Firestore and Google Sheets save happen on every submission
- If Google Sheets fails for any reason, the form still submits successfully
- Timestamps are in IST (Asia/Kolkata timezone)

---

## Files Changed in the Project

| File | What Changed |
|------|-------------|
| `src/lib/googleSheets.ts` | New file — shared utility with the Apps Script URL |
| `src/pages/Contact.tsx` | Added `saveToGoogleSheets()` call on submit |
| `src/pages/Join.tsx` | Added `saveToGoogleSheets()` call on submit |
| `scripts/google-apps-script.js` | New file — paste this into Apps Script editor |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `FirebaseError: Missing or insufficient permissions` | Redo Step 5 (Firestore rules) |
| `[GoogleSheets] Apps Script URL not configured` | Redo Step 4 (paste the URL) |
| Form submits but no row in Sheet | Check Apps Script deployment — re-deploy with "Anyone" access |
| `Google Sheets save failed: 401` | Re-authorize the Apps Script deployment |
