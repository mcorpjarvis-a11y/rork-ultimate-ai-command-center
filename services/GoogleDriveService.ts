import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: number;
  modifiedTime: number;
  webViewLink?: string;
}

export interface GoogleDriveAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class GoogleDriveService {
  private auth: GoogleDriveAuth | null = null;
  private readonly STORAGE_KEY = 'google_drive_auth';
  private readonly API_BASE = 'https://www.googleapis.com/drive/v3';
  private readonly UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.auth = JSON.parse(stored);
        if (this.isTokenExpired()) {
          await this.refreshAccessToken();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
    }
  }

  async authenticate(accessToken: string, refreshToken: string, expiresIn: number) {
    this.auth = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.auth));
  }

  async disconnect() {
    this.auth = null;
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.auth !== null && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    if (!this.auth) return true;
    return Date.now() >= this.auth.expiresAt - 60000;
  }

  private async refreshAccessToken() {
    if (!this.auth?.refreshToken) throw new Error('No refresh token available');
    console.log('Refreshing Google Drive access token...');
  }

  private getHeaders() {
    if (!this.auth?.accessToken) throw new Error('Not authenticated');
    return {
      'Authorization': `Bearer ${this.auth.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
    try {
      const query = folderId 
        ? `'${folderId}' in parents and trashed=false`
        : `trashed=false`;
      
      const response = await fetch(
        `${this.API_BASE}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) throw new Error('Failed to list files');
      
      const data = await response.json();
      return data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: parseInt(file.size || '0'),
        createdTime: new Date(file.createdTime).getTime(),
        modifiedTime: new Date(file.modifiedTime).getTime(),
        webViewLink: file.webViewLink,
      }));
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile | null> {
    try {
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      };

      const response = await fetch(`${this.API_BASE}/files`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(metadata),
      });

      if (!response.ok) throw new Error('Failed to create folder');
      
      const file = await response.json();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: 0,
        createdTime: new Date(file.createdTime).getTime(),
        modifiedTime: new Date(file.modifiedTime).getTime(),
      };
    } catch (error) {
      console.error('Failed to create folder:', error);
      return null;
    }
  }

  async uploadFile(
    content: string,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<GoogleDriveFile | null> {
    try {
      const metadata = {
        name: fileName,
        mimeType,
        parents: folderId ? [folderId] : undefined,
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n` +
        content +
        closeDelimiter;

      const response = await fetch(`${this.UPLOAD_BASE}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.auth?.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) throw new Error('Failed to upload file');
      
      const file = await response.json();
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: parseInt(file.size || '0'),
        createdTime: new Date(file.createdTime).getTime(),
        modifiedTime: new Date(file.modifiedTime).getTime(),
        webViewLink: file.webViewLink,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }

  async downloadFile(fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.API_BASE}/files/${fileId}?alt=media`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to download file');
      
      return await response.text();
    } catch (error) {
      console.error('Failed to download file:', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/files/${fileId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async getStorageQuota(): Promise<{ used: number; limit: number; } | null> {
    try {
      const response = await fetch(`${this.API_BASE}/about?fields=storageQuota`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) throw new Error('Failed to get storage quota');
      
      const data = await response.json();
      return {
        used: parseInt(data.storageQuota.usage || '0'),
        limit: parseInt(data.storageQuota.limit || '0'),
      };
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return null;
    }
  }

  async backupAppData(data: string): Promise<GoogleDriveFile | null> {
    const fileName = `ai-command-center-backup-${Date.now()}.json`;
    return this.uploadFile(data, fileName, 'application/json');
  }

  async listBackups(): Promise<GoogleDriveFile[]> {
    const files = await this.listFiles();
    return files.filter(file => file.name.startsWith('ai-command-center-backup-'));
  }

  async restoreFromBackup(fileId: string): Promise<string | null> {
    return this.downloadFile(fileId);
  }
}

export default new GoogleDriveService();
