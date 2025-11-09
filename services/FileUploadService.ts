/**
 * FileUploadService - Handle file and photo uploads for JARVIS
 * Supports images, documents, and other file types
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  mimeType?: string;
  base64?: string;
  timestamp: number;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

class FileUploadService {
  /**
   * Pick an image from gallery or camera
   * @param useCamera If true, opens camera instead of gallery
   * @returns Upload result with file info
   */
  async pickImage(useCamera: boolean = false): Promise<UploadResult> {
    try {
      // Request permissions
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return {
          success: false,
          error: `${useCamera ? 'Camera' : 'Gallery'} permission denied`,
        };
      }

      // Launch picker
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
          });

      if (result.canceled) {
        return {
          success: false,
          error: 'Image selection cancelled',
        };
      }

      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'image.jpg';

      const uploadedFile: UploadedFile = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: fileName,
        type: 'image',
        size: asset.fileSize || 0,
        uri: asset.uri,
        mimeType: asset.mimeType || 'image/jpeg',
        base64: asset.base64 || undefined,
        timestamp: Date.now(),
      };

      console.log('[FileUploadService] Image picked:', uploadedFile.name);

      return {
        success: true,
        file: uploadedFile,
      };
    } catch (error) {
      console.error('[FileUploadService] Error picking image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick image',
      };
    }
  }

  /**
   * Pick a document or file
   * @returns Upload result with file info
   */
  async pickDocument(): Promise<UploadResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'Document selection cancelled',
        };
      }

      const asset = result.assets[0];

      // Read file as base64 for small files (< 5MB)
      let base64: string | undefined;
      if (asset.size && asset.size < 5 * 1024 * 1024) {
        try {
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: 'base64',
          });
        } catch (e) {
          console.warn('[FileUploadService] Could not read file as base64:', e);
        }
      }

      const uploadedFile: UploadedFile = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: asset.name,
        type: this.getFileType(asset.mimeType || asset.name),
        size: asset.size || 0,
        uri: asset.uri,
        mimeType: asset.mimeType,
        base64,
        timestamp: Date.now(),
      };

      console.log('[FileUploadService] Document picked:', uploadedFile.name);

      return {
        success: true,
        file: uploadedFile,
      };
    } catch (error) {
      console.error('[FileUploadService] Error picking document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick document',
      };
    }
  }

  /**
   * Upload file to server or process locally
   * @param file File to upload
   * @returns Upload result
   */
  async uploadFile(file: UploadedFile): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // For now, we'll just return the local URI
      // In production, you would upload to a server or cloud storage
      console.log('[FileUploadService] File ready for processing:', file.name);

      return {
        success: true,
        url: file.uri,
      };
    } catch (error) {
      console.error('[FileUploadService] Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get file type from mime type or filename
   * @param mimeTypeOrFilename MIME type or filename
   * @returns File type category
   */
  private getFileType(mimeTypeOrFilename: string): string {
    const mime = mimeTypeOrFilename.toLowerCase();

    if (mime.includes('image')) return 'image';
    if (mime.includes('video')) return 'video';
    if (mime.includes('audio')) return 'audio';
    if (mime.includes('pdf')) return 'pdf';
    if (mime.includes('text') || mime.includes('txt')) return 'text';
    if (
      mime.includes('doc') ||
      mime.includes('docx') ||
      mime.includes('odt')
    )
      return 'document';
    if (
      mime.includes('xls') ||
      mime.includes('xlsx') ||
      mime.includes('csv')
    )
      return 'spreadsheet';
    if (
      mime.includes('ppt') ||
      mime.includes('pptx') ||
      mime.includes('odp')
    )
      return 'presentation';
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar'))
      return 'archive';
    if (mime.includes('json') || mime.includes('xml')) return 'data';

    // Check file extension
    if (mime.endsWith('.jpg') || mime.endsWith('.jpeg') || mime.endsWith('.png'))
      return 'image';
    if (mime.endsWith('.mp4') || mime.endsWith('.mov') || mime.endsWith('.avi'))
      return 'video';
    if (mime.endsWith('.mp3') || mime.endsWith('.wav') || mime.endsWith('.m4a'))
      return 'audio';

    return 'file';
  }

  /**
   * Format file size for display
   * @param bytes Size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get icon name for file type
   * @param type File type
   * @returns Icon name (for lucide-react-native)
   */
  getFileIcon(type: string): string {
    switch (type) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Music';
      case 'pdf':
        return 'FileText';
      case 'document':
        return 'FileText';
      case 'spreadsheet':
        return 'Table';
      case 'presentation':
        return 'Presentation';
      case 'archive':
        return 'Archive';
      case 'data':
        return 'Code';
      default:
        return 'File';
    }
  }
}

export default new FileUploadService();
