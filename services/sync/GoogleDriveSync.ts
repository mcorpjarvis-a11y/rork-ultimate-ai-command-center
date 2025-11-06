import GoogleAuthService from '@/services/auth/GoogleAuthService';
import UserProfileService, { UserProfile } from '@/services/user/UserProfileService';

const APPDATA_FOLDER = 'appDataFolder';
const PROFILE_FILENAME = 'jarvis_user_profile.json';

export interface SyncStatus {
  lastSyncTime?: number;
  syncInProgress: boolean;
  lastError?: string;
}

/**
 * GoogleDriveSync - Syncs user profile data to Google Drive AppData folder
 * Handles automatic and manual syncing of encrypted user profiles
 * Implements conflict resolution using last-write-wins strategy
 */
class GoogleDriveSync {
  private syncStatus: SyncStatus = {
    syncInProgress: false,
  };

  /**
   * Upload user profile to Google Drive AppData folder
   */
  async uploadProfile(profile?: UserProfile): Promise<void> {
    if (this.syncStatus.syncInProgress) {
      console.log('[GoogleDriveSync] Sync already in progress');
      return;
    }

    try {
      this.syncStatus.syncInProgress = true;

      const accessToken = await GoogleAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated with Google');
      }

      // Get profile data for sync
      const syncData = await UserProfileService.getProfileForSync();
      if (!syncData) {
        throw new Error('No profile data to sync');
      }

      // Check if file already exists
      const existingFileId = await this.findProfileFile(accessToken);

      if (existingFileId) {
        // Update existing file
        await this.updateFile(accessToken, existingFileId, syncData);
        console.log('[GoogleDriveSync] Updated profile in Drive');
      } else {
        // Create new file in AppData folder
        await this.createFile(accessToken, syncData);
        console.log('[GoogleDriveSync] Created profile in Drive');
      }

      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.lastError = undefined;
      
      console.log('[GoogleDriveSync] Upload complete');
    } catch (error) {
      console.error('[GoogleDriveSync] Upload error:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Upload failed';
      throw error;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Download user profile from Google Drive AppData folder
   */
  async downloadProfile(): Promise<UserProfile | null> {
    if (this.syncStatus.syncInProgress) {
      console.log('[GoogleDriveSync] Sync already in progress');
      return null;
    }

    try {
      this.syncStatus.syncInProgress = true;

      const accessToken = await GoogleAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated with Google');
      }

      // Find profile file
      const fileId = await this.findProfileFile(accessToken);
      if (!fileId) {
        console.log('[GoogleDriveSync] No profile found in Drive');
        return null;
      }

      // Download file content
      const content = await this.downloadFile(accessToken, fileId);
      
      // Restore profile from sync data
      const profile = await UserProfileService.restoreProfileFromSync(content);

      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.lastError = undefined;
      
      console.log('[GoogleDriveSync] Download complete');
      return profile;
    } catch (error) {
      console.error('[GoogleDriveSync] Download error:', error);
      this.syncStatus.lastError = error instanceof Error ? error.message : 'Download failed';
      return null;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Sync profile bidirectionally with conflict resolution
   * Uses last-write-wins strategy
   */
  async syncProfile(): Promise<void> {
    try {
      console.log('[GoogleDriveSync] Starting bidirectional sync');

      const accessToken = await GoogleAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated with Google');
      }

      // Check if remote file exists
      const fileId = await this.findProfileFile(accessToken);
      
      if (!fileId) {
        // No remote file, upload local profile
        console.log('[GoogleDriveSync] No remote profile, uploading local');
        await this.uploadProfile();
        return;
      }

      // Get remote file metadata
      const remoteMetadata = await this.getFileMetadata(accessToken, fileId);
      const remoteModifiedTime = new Date(remoteMetadata.modifiedTime).getTime();

      // Get local profile
      const localProfile = UserProfileService.getCurrentProfile();
      if (!localProfile) {
        // No local profile, download from cloud
        console.log('[GoogleDriveSync] No local profile, downloading from cloud');
        await this.downloadProfile();
        return;
      }

      const localModifiedTime = localProfile.lastLogin;

      // Compare timestamps and use last-write-wins
      if (remoteModifiedTime > localModifiedTime) {
        console.log('[GoogleDriveSync] Remote is newer, downloading');
        await this.downloadProfile();
      } else if (localModifiedTime > remoteModifiedTime) {
        console.log('[GoogleDriveSync] Local is newer, uploading');
        await this.uploadProfile();
      } else {
        console.log('[GoogleDriveSync] Profiles are in sync');
      }
    } catch (error) {
      console.error('[GoogleDriveSync] Sync error:', error);
      throw error;
    }
  }

  /**
   * Find profile file in Google Drive AppData folder
   */
  private async findProfileFile(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?spaces=${APPDATA_FOLDER}&q=name='${PROFILE_FILENAME}'&fields=files(id,name,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for profile file');
      }

      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }

      return null;
    } catch (error) {
      console.error('[GoogleDriveSync] Error finding profile file:', error);
      return null;
    }
  }

  /**
   * Create new file in Google Drive AppData folder
   */
  private async createFile(accessToken: string, content: string): Promise<string> {
    const metadata = {
      name: PROFILE_FILENAME,
      parents: [APPDATA_FOLDER],
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }) as any);
    form.append('file', new Blob([content], { type: 'application/json' }) as any);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create file in Drive');
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * Update existing file in Google Drive
   */
  private async updateFile(accessToken: string, fileId: string, content: string): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update file in Drive');
    }
  }

  /**
   * Download file from Google Drive
   */
  private async downloadFile(accessToken: string, fileId: string): Promise<string> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file from Drive');
    }

    return await response.text();
  }

  /**
   * Get file metadata
   */
  private async getFileMetadata(accessToken: string, fileId: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,modifiedTime,createdTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get file metadata');
    }

    return await response.json();
  }

  /**
   * Delete profile from Google Drive
   */
  async deleteProfile(): Promise<void> {
    try {
      const accessToken = await GoogleAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated with Google');
      }

      const fileId = await this.findProfileFile(accessToken);
      if (!fileId) {
        console.log('[GoogleDriveSync] No profile to delete');
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete file from Drive');
      }

      console.log('[GoogleDriveSync] Profile deleted from Drive');
    } catch (error) {
      console.error('[GoogleDriveSync] Delete error:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.syncStatus.syncInProgress;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): number | undefined {
    return this.syncStatus.lastSyncTime;
  }

  /**
   * Get last sync error
   */
  getLastSyncError(): string | undefined {
    return this.syncStatus.lastError;
  }

  /**
   * Clear sync error
   */
  clearSyncError(): void {
    this.syncStatus.lastError = undefined;
  }
}

export default new GoogleDriveSync();
