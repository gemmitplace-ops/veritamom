import { google } from 'googleapis';
import { Readable } from 'stream';

const GDRIVE_CLIENT_EMAIL = process.env.GDRIVE_CLIENT_EMAIL || '';
const GDRIVE_PRIVATE_KEY = (process.env.GDRIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || '';

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GDRIVE_CLIENT_EMAIL,
      private_key: GDRIVE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

export async function uploadFileToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId?: string
): Promise<string> {
  const drive = getDriveClient();
  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId || GDRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id,webViewLink',
  });

  return response.data.webViewLink || response.data.id || '';
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

export async function createBackupFolder(name: string): Promise<string> {
  const drive = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [GDRIVE_FOLDER_ID],
    },
    fields: 'id',
  });
  return response.data.id || '';
}
