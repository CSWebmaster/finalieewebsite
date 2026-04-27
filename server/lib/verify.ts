import { getDrive, getSheets } from './googleAuth';

/**
 * Searches for a certificate across all sheets in a specific Google Drive folder.
 */
export async function verifyCertificate(certificateId: string, name: string) {
  const drive = getDrive();
  const sheets = getSheets();

  const folderId = process.env.FOLDER_ID;
  if (!folderId) throw new Error('FOLDER_ID environment variable is missing');

  try {
    // 1. List all spreadsheets in the folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
    });

    const files = response.data.files || [];
    let spreadsheetFiles = files.filter(f => f.mimeType === 'application/vnd.google-apps.spreadsheet');

    // AUTO-DISCOVERY FALLBACK: If no sheets in folder, search everywhere the robot can see
    if (spreadsheetFiles.length === 0) {
      console.log('No sheets in folder. Attempting auto-discovery for any sheet the robot can see...');
      const discoveryResponse = await drive.files.list({
        q: "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
        fields: 'files(id, name, mimeType)',
      });
      spreadsheetFiles = discoveryResponse.data.files || [];
      console.log(`Auto-discovery found ${spreadsheetFiles.length} potential sheets.`);
    }

    if (spreadsheetFiles.length === 0) {
      const foundNames = files.map(f => `${f.name} (${f.mimeType?.split('.').pop()})`).join(', ');
      const errorMsg = files.length > 0 
        ? `I found ${files.length} file(s) [${foundNames.substring(0, 200)}...], but none are Google Sheets. Please "Save as Google Sheets".`
        : `No files found. Please SHARE your spreadsheet folder with the service account.`;
      return { valid: false, error: errorMsg };
    }

    // 2. Iterate through each sheet to find a match
    for (const file of spreadsheetFiles) {
      if (!file.id) continue;
      const match = await searchInSpreadsheet(sheets, file.id, certificateId, name);
      if (match) {
        return {
          valid: true,
          data: match.details,
          fileUrl: match.pdfUrl,
          source: file.name
        };
      }
    }

    return { valid: false, error: 'Certificate not found or identity mismatch (check Name/Email).' };
  } catch (error) {
    console.error('Verification Logic Error:', error);
    throw error;
  }
}

async function searchInSpreadsheet(sheetsInstance: any, spreadsheetId: string, certId: string, nameOrEmail: string) {
  try {
    const metadata = await sheetsInstance.spreadsheets.get({ spreadsheetId });
    const sheetsList = metadata.data.sheets;

    if (!sheetsList) return null;

    for (const sheet of sheetsList) {
      const sheetName = sheet.properties?.title;
      if (!sheetName) continue;
      
      console.log(`Scanning sheet: "${sheetName}" in file ID: ${spreadsheetId}`);
      
      const response = await sheetsInstance.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z100`, // Scan top 100 rows for performance
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log(`- Sheet "${sheetName}" is empty.`);
        continue;
      }

      const headers = rows[0].map((h: string) => h.trim().toLowerCase());
      console.log(`- Headers found: ${headers.join(', ')}`);
      
      // Find indexes for all potential identity columns
      const certIdIdx = headers.findIndex((h: string) => h.includes('certificate') && h.includes('id'));
      const nameIdx = headers.findIndex((h: string) => h === 'name' || h.includes('full name'));
      const emailIdx = headers.findIndex((h: string) => h.includes('email') || h === 'e-mail');
      const pdfUrlIdx = headers.findIndex((h: string) => h.includes('pdf') && h.includes('url'));

      console.log(`- Column Indexes -> ID: ${certIdIdx}, Name: ${nameIdx}, Email: ${emailIdx}`);

      if (certIdIdx === -1) {
        console.log(`- Skipping sheet: No Certificate ID column found.`);
        continue;
      }

      const matchRow = rows.slice(1).find((row: any[]) => {
        const rowCertId = (row[certIdIdx] || '').toString().trim();
        const rowName = nameIdx !== -1 ? (row[nameIdx] || '').toString().trim() : '';
        const rowEmail = emailIdx !== -1 ? (row[emailIdx] || '').toString().trim() : '';
        
        const idMatches = rowCertId.toLowerCase() === certId.toLowerCase();
        const identityMatches = 
          (rowName.toLowerCase() === nameOrEmail.toLowerCase()) || 
          (rowEmail.toLowerCase() === nameOrEmail.toLowerCase());

        return idMatches && identityMatches;
      });

      if (matchRow) {
        console.log(`✅ MATCH FOUND in row!`);
        const details: any = {};
        headers.forEach((header: string, index: number) => {
          details[header] = matchRow[index] || '';
        });

        return {
          details,
          pdfUrl: matchRow[pdfUrlIdx] || ''
        };
      }
    }
    return null;
  } catch (err: any) {
    console.error(`Error searching in sheet ${spreadsheetId}:`, err.message);
    return null;
  }
}
