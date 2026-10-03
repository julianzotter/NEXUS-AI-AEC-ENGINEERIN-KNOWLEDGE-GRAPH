/**
 * Google Drive API Service
 * Interacts with Google Drive via Bearer token obtained from Firebase Auth.
 */

import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
}

export async function listDriveFiles(customQuery?: string): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive. Please sign in first.');
  }

  const q = customQuery ? encodeURIComponent(customQuery) : 'trashed%20%3D%20false';
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,modifiedTime,size)&q=${q}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch files: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function fetchDriveFileContent(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch file content: ${res.statusText}`);
  }

  return await res.text();
}

export async function uploadAuditBundleToDrive(fileName: string, jsonPayload: object): Promise<{ id: string; name: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google Drive');
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'NEXUS-4 SIO Signed Structural Engineering Audit Certificate'
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(jsonPayload, null, 2) +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to upload to Google Drive: ${res.statusText}`);
  }

  return await res.json();
}
