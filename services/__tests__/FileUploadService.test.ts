/**
 * Tests for FileUploadService
 */

import FileUploadService from '../FileUploadService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Mock expo modules
jest.mock('expo-image-picker');
jest.mock('expo-document-picker');
jest.mock('expo-file-system');

describe('FileUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickImage', () => {
    it('should successfully pick image from gallery', async () => {
      const mockPermission = { granted: true, canAskAgain: true, expires: 'never', status: 'granted' };
      const mockResult = {
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
            width: 1920,
            height: 1080,
            fileSize: 500000,
            mimeType: 'image/jpeg',
            base64: 'mockBase64Data',
          },
        ],
      };

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue(mockPermission);
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await FileUploadService.pickImage(false);

      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
      expect(result.file?.type).toBe('image');
      expect(result.file?.uri).toBe('file:///path/to/image.jpg');
    });

    it('should successfully pick image from camera', async () => {
      const mockPermission = { granted: true, canAskAgain: true, expires: 'never', status: 'granted' };
      const mockResult = {
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/camera.jpg',
            width: 1920,
            height: 1080,
            fileSize: 600000,
            mimeType: 'image/jpeg',
          },
        ],
      };

      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue(mockPermission);
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await FileUploadService.pickImage(true);

      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
      expect(result.file?.type).toBe('image');
    });

    it('should handle permission denial', async () => {
      const mockPermission = { granted: false, canAskAgain: true, expires: 'never', status: 'denied' };

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue(mockPermission);

      const result = await FileUploadService.pickImage(false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('permission denied');
    });

    it('should handle cancelled selection', async () => {
      const mockPermission = { granted: true, canAskAgain: true, expires: 'never', status: 'granted' };
      const mockResult = { canceled: true, assets: [] };

      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue(mockPermission);
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await FileUploadService.pickImage(false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled');
    });
  });

  describe('pickDocument', () => {
    it('should successfully pick a document', async () => {
      const mockResult = {
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/document.pdf',
            name: 'document.pdf',
            size: 1024000,
            mimeType: 'application/pdf',
          },
        ],
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await FileUploadService.pickDocument();

      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
      expect(result.file?.name).toBe('document.pdf');
      expect(result.file?.type).toBe('pdf');
    });

    it('should read small files as base64', async () => {
      const mockResult = {
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/small.txt',
            name: 'small.txt',
            size: 1000, // < 5MB
            mimeType: 'text/plain',
          },
        ],
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockResult);
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mockBase64Content');

      const result = await FileUploadService.pickDocument();

      expect(result.success).toBe(true);
      expect(result.file?.base64).toBe('mockBase64Content');
    });

    it('should handle cancelled document selection', async () => {
      const mockResult = { canceled: true, assets: [] };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue(mockResult);

      const result = await FileUploadService.pickDocument();

      expect(result.success).toBe(false);
      expect(result.error).toContain('cancelled');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(FileUploadService.formatFileSize(0)).toBe('0 Bytes');
      expect(FileUploadService.formatFileSize(1024)).toBe('1 KB');
      expect(FileUploadService.formatFileSize(1048576)).toBe('1 MB');
      expect(FileUploadService.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format partial sizes', () => {
      expect(FileUploadService.formatFileSize(1536)).toBe('1.5 KB');
      expect(FileUploadService.formatFileSize(2621440)).toBe('2.5 MB');
    });
  });

  describe('getFileIcon', () => {
    it('should return correct icons for file types', () => {
      expect(FileUploadService.getFileIcon('image')).toBe('Image');
      expect(FileUploadService.getFileIcon('video')).toBe('Video');
      expect(FileUploadService.getFileIcon('audio')).toBe('Music');
      expect(FileUploadService.getFileIcon('pdf')).toBe('FileText');
      expect(FileUploadService.getFileIcon('document')).toBe('FileText');
      expect(FileUploadService.getFileIcon('unknown')).toBe('File');
    });
  });

  describe('uploadFile', () => {
    it('should return success with URI', async () => {
      const mockFile = {
        id: 'test123',
        name: 'test.jpg',
        type: 'image',
        size: 1000,
        uri: 'file:///test.jpg',
        timestamp: Date.now(),
      };

      const result = await FileUploadService.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.url).toBe('file:///test.jpg');
    });
  });
});
