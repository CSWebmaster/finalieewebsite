/**
 * Cloudflare Pages Function: /api/verify
 * 
 * Handles Certificate Verification by talking directly to Google Drive and Google Sheets APIs.
 * Since Cloudflare Workers do not support Node.js `googleapis` out-of-the-box (without nodejs_compat
 * and heavy polyfills), this implementation uses raw REST APIs and WebCrypto for JWT signing.
 * 
 * Environment Variables required in Cloudflare Pages Dashboard:
 * - FOLDER_ID: The Google Drive folder ID containing the certificates.
 * - GOOGLE_CREDS: Stringified JSON of the Google Service Account key.
 */

interface Env {
  FOLDER_ID?: string;
  GOOGLE_CREDS?: string;
}

interface VerifyPayload {
  certificate_id: string;
  name: string;
}

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

  // Extract base64 key from PEM
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
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signatureInput)
  );

  const jwt = `${signatureInput}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Google token: ${err}`);
  }

  const data = await res.json() as any;
  return data.access_token;
}

async function verifyCertificate(certificateId: string, nameOrEmail: string, token: string, folderId: string) {
  // 1. List all spreadsheets in folder
  const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and trashed = false`)}&fields=files(id,name,mimeType)`;
  
  let driveRes = await fetch(driveUrl, { headers: { Authorization: `Bearer ${token}` } });
  let driveData: any = await driveRes.json();

  let files = driveData.files || [];
  let spreadsheetFiles = files.filter((f: any) => f.mimeType === 'application/vnd.google-apps.spreadsheet');

  if (spreadsheetFiles.length === 0) {
    // Auto discovery fallback
    const discoveryUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`)}&fields=files(id,name,mimeType)`;
    const discRes = await fetch(discoveryUrl, { headers: { Authorization: `Bearer ${token}` } });
    const discData: any = await discRes.json();
    spreadsheetFiles = discData.files || [];
  }

  if (spreadsheetFiles.length === 0) {
    const foundNames = files.map((f: any) => `${f.name}`).join(', ');
    const errorMsg = files.length > 0 
      ? `I found ${files.length} file(s) [${foundNames.substring(0, 200)}...], but none are Google Sheets. Please "Save as Google Sheets".`
      : `No files found. Please SHARE your spreadsheet folder with the service account.`;
    return { valid: false, error: errorMsg };
  }

  // 2. Iterate and search
  for (const file of spreadsheetFiles) {
    if (!file.id) continue;
    
    // Get sheets metadata
    const sheetsMetaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${file.id}?fields=sheets.properties.title`;
    const metaRes = await fetch(sheetsMetaUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!metaRes.ok) continue;
    
    const metaData: any = await metaRes.json();
    const sheetsList = metaData.sheets || [];

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;

      // Get values
      const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${file.id}/values/${encodeURIComponent(sheetName)}!A1:Z100`;
      const valRes = await fetch(valuesUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!valRes.ok) continue;

      const valData: any = await valRes.json();
      const rows = valData.values;
      if (!rows || rows.length === 0) continue;

      const headers = rows[0].map((h: any) => (h || '').toString().trim().toLowerCase());
      
      const certIdIdx = headers.findIndex((h: string) => h.includes('certificate') && h.includes('id'));
      const nameIdx = headers.findIndex((h: string) => h === 'name' || h.includes('full name'));
      const emailIdx = headers.findIndex((h: string) => h.includes('email') || h === 'e-mail');
      const pdfUrlIdx = headers.findIndex((h: string) => h.includes('pdf') && h.includes('url'));

      if (certIdIdx === -1) continue;

      const matchRow = rows.slice(1).find((row: any[]) => {
        const rowCertId = (row[certIdIdx] || '').toString().trim();
        const rowName = nameIdx !== -1 ? (row[nameIdx] || '').toString().trim() : '';
        const rowEmail = emailIdx !== -1 ? (row[emailIdx] || '').toString().trim() : '';

        const idMatches = rowCertId.toLowerCase() === certificateId.toLowerCase();
        const identityMatches = 
          (rowName.toLowerCase() === nameOrEmail.toLowerCase()) || 
          (rowEmail.toLowerCase() === nameOrEmail.toLowerCase());

        return idMatches && identityMatches;
      });

      if (matchRow) {
        const details: any = {};
        headers.forEach((header: string, index: number) => {
          details[header] = matchRow[index] || '';
        });

        return {
          valid: true,
          data: details,
          fileUrl: matchRow[pdfUrlIdx] || '',
          source: file.name
        };
      }
    }
  }

  return { valid: false, error: 'Certificate not found or identity mismatch (check Name/Email).' };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let payload: VerifyPayload;
  try {
    payload = (await request.json()) as VerifyPayload;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { certificate_id, name } = payload;
  if (!certificate_id || !name) {
    return new Response(
      JSON.stringify({ error: "Certificate ID and Name are required." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Determine configuration
    let folderId = env.FOLDER_ID;
    let credsStr = env.GOOGLE_CREDS;

    // Provide helpful error messages if missing
    if (!folderId) {
      return new Response(
        JSON.stringify({ error: "Configuration Error: FOLDER_ID environment variable is missing in Cloudflare Pages." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!credsStr) {
      return new Response(
        JSON.stringify({ error: "Configuration Error: GOOGLE_CREDS environment variable is missing in Cloudflare Pages. Please set it to the JSON string of your service account key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let creds;
    try {
      creds = JSON.parse(credsStr);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Configuration Error: GOOGLE_CREDS is not valid JSON. Ensure it is copied correctly." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!creds.client_email || !creds.private_key) {
      return new Response(
        JSON.stringify({ error: "Configuration Error: GOOGLE_CREDS is missing client_email or private_key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate
    const token = await getGoogleAccessToken(creds.client_email, creds.private_key, [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
    ]);

    // Verify
    const result = await verifyCertificate(certificate_id, name, token, folderId);

    if (result.valid) {
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ valid: false, error: result.error }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
