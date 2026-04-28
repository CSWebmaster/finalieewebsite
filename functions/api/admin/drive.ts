/**
 * Cloudflare Pages Function: /api/admin/drive
 * 
 * Secure API for Webmasters to manage Google Sheets for Certificate Verification.
 * Authenticates users by verifying their Firebase ID Token against Google Identity Toolkit.
 */

interface Env {
  FOLDER_ID?: string;
  GOOGLE_CREDS?: string;
  client_email?: string;
  private_key?: string;
  project_id?: string;
}

const WEBMASTERS = [
  "ieee.wm@socet.edu.in",
  "ieeewie.wm@silveroakuni.ac.in",
  "ieeecs.wm@silveroakuni.ac.in",
  "ieeesps.wm@silveroakuni.ac.in",
  "ieeesight.wm@silveroakuni.ac.in"
];

// Helper: base64url encoding
const base64url = (str: string | Uint8Array) => {
  const b64 = typeof str === 'string' ? btoa(str) : btoa(String.fromCharCode(...Array.from(new Uint8Array(str))));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

// Generate JWT for Google Service Account using WebCrypto
async function getGoogleAccessToken(clientEmail: string, privateKey: string, scopes: string[]): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  if (!privateKey.includes(pemHeader)) throw new Error("Invalid private key format");

  const pemContents = privateKey.substring(
    privateKey.indexOf(pemHeader) + pemHeader.length,
    privateKey.indexOf(pemFooter)
  ).replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(signatureInput));
  const jwt = `${signatureInput}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  if (!res.ok) throw new Error(`Failed to get Google token: ${await res.text()}`);
  const data = await res.json() as any;
  return data.access_token;
}

// Ensure the caller is an authenticated Webmaster
async function authenticateWebmaster(request: Request): Promise<{ valid: boolean; email?: string; error?: string; apiKey?: string }> {
  const authHeader = request.headers.get("Authorization");
  const apiKey = request.headers.get("X-Firebase-Api-Key");

  if (!authHeader || !authHeader.startsWith("Bearer ") || !apiKey) {
    return { valid: false, error: "Missing Authorization header or Firebase API Key." };
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    if (!res.ok) {
      return { valid: false, error: "Invalid Firebase ID Token." };
    }

    const data = await res.json() as any;
    const user = data.users?.[0];

    if (!user || !user.email) {
      return { valid: false, error: "Could not retrieve user email." };
    }

    if (!WEBMASTERS.includes(user.email.toLowerCase())) {
      return { valid: false, error: "Unauthorized. You are not a Webmaster." };
    }

    return { valid: true, email: user.email.toLowerCase(), apiKey };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

async function getConfiguration(env: Env, requestApiKey?: string): Promise<{ folderId: string; token: string }> {
  let projectId = "sbversion-07march";
  let clientEmail = env.client_email || env['"client_email"'];
  let privateKey = env.private_key || env['"private_key"'];
  let folderId = env.FOLDER_ID;

  if (env.GOOGLE_CREDS) {
    try {
      const creds = JSON.parse(env.GOOGLE_CREDS);
      clientEmail = creds.client_email;
      privateKey = creds.private_key;
      if (creds.project_id) projectId = creds.project_id;
    } catch (e) {}
  } else if (env.project_id || env['"project_id"']) {
    projectId = (env.project_id || env['"project_id"']) as string;
  }

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Credentials (client_email / private_key).");
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  // Dynamically fetch folderId from Firestore if missing from env
  if (!folderId) {
    try {
      const fsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/certificates`);
      if (fsRes.ok) {
        const fsData = await fsRes.json() as any;
        if (fsData.fields?.folderId?.stringValue) {
          folderId = fsData.fields.folderId.stringValue;
        }
      }
    } catch (e) {}
  }

  if (!folderId) throw new Error("FOLDER_ID is missing from settings and environment variables.");

  const token = await getGoogleAccessToken(clientEmail, privateKey, [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ]);

  return { folderId, token };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Firebase-Api-Key",
};

export const onRequestOptions: PagesFunction = async () => new Response(null, { headers: corsHeaders });

// GET: List all Google Sheets in the configured folder
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const auth = await authenticateWebmaster(request);
  if (!auth.valid) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { folderId, token } = await getConfiguration(env, auth.apiKey);

    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`)}&fields=files(id,name,createdTime,webViewLink)`;
    const driveRes = await fetch(driveUrl, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!driveRes.ok) {
      const err = await driveRes.text();
      return new Response(JSON.stringify({ error: `Drive API Error: ${err}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const driveData = await driveRes.json() as any;
    return new Response(JSON.stringify({ sheets: driveData.files || [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};

// POST: Create a new Google Sheet inside the folder
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const auth = await authenticateWebmaster(request);
  if (!auth.valid) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  let payload;
  try {
    payload = await request.json() as { sheetName: string };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!payload.sheetName) {
    return new Response(JSON.stringify({ error: "sheetName is required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { folderId, token } = await getConfiguration(env, auth.apiKey);

    // 1. Create the Spreadsheet via Google Sheets API (this creates it in the root directory first)
    const createUrl = `https://sheets.googleapis.com/v4/spreadsheets`;
    const createBody = {
      properties: { title: payload.sheetName },
      sheets: [
        {
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: "Certificate ID" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Name" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Email" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "Role/Achievement" }, userEnteredFormat: { textFormat: { bold: true } } },
                { userEnteredValue: { stringValue: "PDF URL" }, userEnteredFormat: { textFormat: { bold: true } } }
              ]
            }]
          }]
        }
      ]
    };

    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(createBody)
    });

    if (!createRes.ok) {
      return new Response(JSON.stringify({ error: `Failed to create sheet: ${await createRes.text()}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sheetData = await createRes.json() as any;
    const fileId = sheetData.spreadsheetId;

    // 2. Move the file from root to the target FOLDER_ID using Google Drive API
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const fileMeta = await fileRes.json() as any;
    const previousParents = (fileMeta.parents || []).join(',');

    const moveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!moveRes.ok) {
      console.warn("Failed to move file to folder", await moveRes.text());
      // It still created the file, so we won't fail completely
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: fileId, 
      name: payload.sheetName,
      webViewLink: sheetData.spreadsheetUrl
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
};
