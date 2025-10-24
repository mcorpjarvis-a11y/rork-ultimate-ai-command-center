import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MediaAsset {
  id: string;
  uri: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size?: number;
  createdAt: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface StorageInfo {
  totalSpace?: number;
  freeSpace?: number;
  usedSpace?: number;
}

export interface StorageSettings {
  useLocalStorage: boolean;
  useCloudStorage: boolean;
  cloudProvider: 'google-drive' | 'dropbox' | 'onedrive' | null;
  autoBackup: boolean;
  maxLocalSize: number;
}

class MediaStorageService {
  private localDirectory: string = '';
  private settings: StorageSettings = {
    useLocalStorage: true,
    useCloudStorage: false,
    cloudProvider: null,
    autoBackup: false,
    maxLocalSize: 500 * 1024 * 1024,
  };

  async initialize(): Promise<void> {
    console.log('[MediaStorageService] Initializing');

    if (Platform.OS !== 'web') {
      this.localDirectory = `${FileSystem.documentDirectory}jarvis-media/`;
      
      const dirInfo = await FileSystem.getInfoAsync(this.localDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.localDirectory, {
          intermediates: true,
        });
      }

      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.warn('[MediaStorageService] Media library permission not granted');
      }
    }

    await this.loadSettings();
    console.log('[MediaStorageService] Initialized with settings:', this.settings);
  }

  async pickImage(options?: {
    allowsMultipleSelection?: boolean;
    allowsEditing?: boolean;
  }): Promise<MediaAsset[]> {
    console.log('[MediaStorageService] Picking image');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: options?.allowsMultipleSelection || false,
      allowsEditing: options?.allowsEditing || false,
      quality: 1,
    });

    if (result.canceled) {
      return [];
    }

    const assets: MediaAsset[] = result.assets.map((asset) => ({
      id: asset.uri,
      uri: asset.uri,
      type: 'image' as const,
      name: asset.fileName || `image-${Date.now()}.jpg`,
      size: asset.fileSize,
      createdAt: Date.now(),
      mimeType: asset.mimeType || 'image/jpeg',
    }));

    if (this.settings.useLocalStorage) {
      await this.saveAssetsLocally(assets);
    }

    return assets;
  }

  async pickVideo(): Promise<MediaAsset | null> {
    console.log('[MediaStorageService] Picking video');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const mediaAsset: MediaAsset = {
      id: asset.uri,
      uri: asset.uri,
      type: 'video',
      name: asset.fileName || `video-${Date.now()}.mp4`,
      size: asset.fileSize,
      createdAt: Date.now(),
      mimeType: asset.mimeType || 'video/mp4',
    };

    if (this.settings.useLocalStorage) {
      await this.saveAssetLocally(mediaAsset);
    }

    return mediaAsset;
  }

  async takePhoto(): Promise<MediaAsset | null> {
    console.log('[MediaStorageService] Taking photo');

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const mediaAsset: MediaAsset = {
      id: asset.uri,
      uri: asset.uri,
      type: 'image',
      name: asset.fileName || `photo-${Date.now()}.jpg`,
      size: asset.fileSize,
      createdAt: Date.now(),
      mimeType: 'image/jpeg',
    };

    if (this.settings.useLocalStorage) {
      await this.saveAssetLocally(mediaAsset);
    }

    return mediaAsset;
  }

  async pickDocument(): Promise<MediaAsset | null> {
    console.log('[MediaStorageService] Picking document');

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const mediaAsset: MediaAsset = {
        id: asset.uri,
        uri: asset.uri,
        type: 'document',
        name: asset.name,
        size: asset.size || undefined,
        createdAt: Date.now(),
        mimeType: asset.mimeType || undefined,
      };

      if (this.settings.useLocalStorage) {
        await this.saveAssetLocally(mediaAsset);
      }

      return mediaAsset;
    } catch (error) {
      console.error('[MediaStorageService] Error picking document:', error);
      return null;
    }
  }

  async getMediaFromLibrary(type: 'image' | 'video' | 'all' = 'all'): Promise<MediaAsset[]> {
    if (Platform.OS === 'web') {
      console.log('[MediaStorageService] Media library not available on web');
      return [];
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Media library permission not granted');
    }

    const mediaType =
      type === 'image'
        ? MediaLibrary.MediaType.photo
        : type === 'video'
        ? MediaLibrary.MediaType.video
        : MediaLibrary.MediaType.unknown;

    const media = await MediaLibrary.getAssetsAsync({
      first: 100,
      mediaType: mediaType === MediaLibrary.MediaType.unknown ? undefined : mediaType,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return media.assets.map((asset) => ({
      id: asset.id,
      uri: asset.uri,
      type: asset.mediaType === MediaLibrary.MediaType.photo ? 'image' : 'video',
      name: asset.filename,
      size: asset.width * asset.height,
      createdAt: asset.creationTime || Date.now(),
      mimeType: undefined,
    }));
  }

  async saveAssetLocally(asset: MediaAsset): Promise<string> {
    if (Platform.OS === 'web') {
      console.log('[MediaStorageService] Local storage not available on web');
      return asset.uri;
    }

    const localPath = `${this.localDirectory}${asset.name}`;
    console.log('[MediaStorageService] Saving asset locally:', localPath);

    try {
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      return localPath;
    } catch (error) {
      console.error('[MediaStorageService] Error saving asset:', error);
      throw error;
    }
  }

  async saveAssetsLocally(assets: MediaAsset[]): Promise<string[]> {
    const paths: string[] = [];
    for (const asset of assets) {
      const path = await this.saveAssetLocally(asset);
      paths.push(path);
    }
    return paths;
  }

  async getLocalAssets(): Promise<MediaAsset[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    const dirInfo = await FileSystem.getInfoAsync(this.localDirectory);
    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(this.localDirectory);
    const assets: MediaAsset[] = [];

    for (const file of files) {
      const filePath = `${this.localDirectory}${file}`;
      const info = await FileSystem.getInfoAsync(filePath);

      if (!info.exists) continue;

      const extension = file.split('.').pop()?.toLowerCase();
      let type: MediaAsset['type'] = 'document';

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        type = 'image';
      } else if (['mp4', 'mov', 'avi'].includes(extension || '')) {
        type = 'video';
      } else if (['mp3', 'wav', 'm4a'].includes(extension || '')) {
        type = 'audio';
      }

      assets.push({
        id: filePath,
        uri: filePath,
        type,
        name: file,
        size: info.size,
        createdAt: info.modificationTime || Date.now(),
      });
    }

    return assets;
  }

  async deleteLocalAsset(uri: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    console.log('[MediaStorageService] Deleting asset:', uri);
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }

  async getStorageInfo(): Promise<StorageInfo> {
    if (Platform.OS === 'web') {
      return {};
    }

    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();
      const totalSpace = await FileSystem.getTotalDiskCapacityAsync();
      const usedSpace = totalSpace - freeSpace;

      return {
        totalSpace,
        freeSpace,
        usedSpace,
      };
    } catch (error) {
      console.error('[MediaStorageService] Error getting storage info:', error);
      return {};
    }
  }

  async getLocalStorageUsage(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    const assets = await this.getLocalAssets();
    return assets.reduce((total, asset) => total + (asset.size || 0), 0);
  }

  async clearLocalStorage(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    console.log('[MediaStorageService] Clearing local storage');
    await FileSystem.deleteAsync(this.localDirectory, { idempotent: true });
    await FileSystem.makeDirectoryAsync(this.localDirectory, { intermediates: true });
  }

  async updateSettings(settings: Partial<StorageSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.saveSettings();
    console.log('[MediaStorageService] Settings updated:', this.settings);
  }

  async loadSettings(): Promise<void> {
    const stored = await AsyncStorage.getItem('media-storage-settings');
    if (stored) {
      this.settings = { ...this.settings, ...JSON.parse(stored) };
    }
  }

  async saveSettings(): Promise<void> {
    await AsyncStorage.setItem('media-storage-settings', JSON.stringify(this.settings));
  }

  getSettings(): StorageSettings {
    return { ...this.settings };
  }

  async convertToBase64(uri: string): Promise<string> {
    if (Platform.OS === 'web') {
      return uri;
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const extension = uri.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';

    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'gif') mimeType = 'image/gif';
    else if (extension === 'webp') mimeType = 'image/webp';

    return `data:${mimeType};base64,${base64}`;
  }
}

export const mediaStorageService = new MediaStorageService();
export default mediaStorageService;
