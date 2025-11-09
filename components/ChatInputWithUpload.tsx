/**
 * ChatInputWithUpload - Enhanced chat input with file and photo upload
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Send,
  Paperclip,
  Camera,
  Image as ImageIcon,
  X,
  File as FileIcon,
} from 'lucide-react-native';
import FileUploadService, { UploadedFile } from '@/services/FileUploadService';

interface ChatInputWithUploadProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function ChatInputWithUpload({
  onSend,
  placeholder = 'Ask JARVIS anything...',
  disabled = false,
  autoFocus = false,
}: ChatInputWithUploadProps) {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      onSend(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
      setMessage('');
      setAttachedFiles([]);
    }
  };

  const handleAttachFile = async () => {
    Alert.alert(
      'Attach File',
      'Choose file type to upload',
      [
        {
          text: 'Take Photo',
          onPress: () => handleImagePick(true),
        },
        {
          text: 'Choose Photo',
          onPress: () => handleImagePick(false),
        },
        {
          text: 'Choose Document',
          onPress: handleDocumentPick,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleImagePick = async (useCamera: boolean) => {
    setIsUploading(true);
    const result = await FileUploadService.pickImage(useCamera);
    setIsUploading(false);

    if (result.success && result.file) {
      setAttachedFiles([...attachedFiles, result.file]);
    } else if (result.error && !result.error.includes('cancelled')) {
      Alert.alert('Error', result.error);
    }
  };

  const handleDocumentPick = async () => {
    setIsUploading(true);
    const result = await FileUploadService.pickDocument();
    setIsUploading(false);

    if (result.success && result.file) {
      setAttachedFiles([...attachedFiles, result.file]);
    } else if (result.error && !result.error.includes('cancelled')) {
      Alert.alert('Error', result.error);
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter((f) => f.id !== fileId));
  };

  return (
    <View style={styles.container}>
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <ScrollView
          horizontal
          style={styles.attachmentsScroll}
          showsHorizontalScrollIndicator={false}
        >
          {attachedFiles.map((file) => (
            <View key={file.id} style={styles.attachmentItem}>
              {file.type === 'image' && file.uri ? (
                <Image source={{ uri: file.uri }} style={styles.attachmentImage} />
              ) : (
                <View style={styles.attachmentFile}>
                  <FileIcon size={32} color="#6366f1" />
                </View>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(file.id)}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.attachmentName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.attachmentSize}>
                {FileUploadService.formatFileSize(file.size)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.iconButton, isUploading && styles.iconButtonDisabled]}
          onPress={handleAttachFile}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Paperclip size={24} color={disabled ? '#9ca3af' : '#6366f1'} />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={2000}
          editable={!disabled}
          autoFocus={autoFocus}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() && attachedFiles.length === 0) &&
              styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={disabled || (!message.trim() && attachedFiles.length === 0)}
        >
          <Send
            size={24}
            color={
              disabled || (!message.trim() && attachedFiles.length === 0)
                ? '#9ca3af'
                : '#fff'
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachmentsScroll: {
    maxHeight: 120,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  attachmentItem: {
    marginRight: 12,
    alignItems: 'center',
    width: 80,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  attachmentFile: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentName: {
    fontSize: 10,
    color: '#374151',
    marginTop: 4,
    width: 80,
    textAlign: 'center',
  },
  attachmentSize: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});
