import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const GOOGLE_CREDS = process.env.GOOGLE_CREDS;

const createAuth = () => {
  if (GOOGLE_CREDS) {
    try {
      const credentials = JSON.parse(GOOGLE_CREDS);
      return new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ],
      });
    } catch (e) {
      throw new Error('CONFIG_ERROR: Invalid GOOGLE_CREDS environment variable.');
    }
  }

  const KEYFILE_PATH = path.join(process.cwd(), 'service-account-key.json');
  if (fs.existsSync(KEYFILE_PATH)) {
    return new google.auth.GoogleAuth({
      keyFile: KEYFILE_PATH,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ],
    });
  }

  throw new Error('MISSING_CREDENTIALS: service-account-key.json not found.');
};

export const getGoogleAuth = () => createAuth();

export const getDrive = () => {
  const auth = createAuth();
  return google.drive({ version: 'v3', auth });
};

export const getSheets = () => {
  const auth = createAuth();
  return google.sheets({ version: 'v4', auth });
};
