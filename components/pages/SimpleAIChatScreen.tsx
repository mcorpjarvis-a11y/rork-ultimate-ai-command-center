/**
 * SimpleAIChatScreen - Simplified AI chat interface with file upload
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bot, User, File as FileIcon, X } from 'lucide-react-native';
import { useAI, AIMessage } from '@/contexts/AIContext';
import ChatInputWithUpload from '@/components/ChatInputWithUpload';
import { UploadedFile } from '@/services/FileUploadService';

export default function SimpleAIChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, isLoading, ask, clearMessages } = useAI();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = (message: string, files?: UploadedFile[]) => {
    ask(message, files);
  };

  const renderMessage = (msg: AIMessage) => {
    const isUser = msg.role === 'user';

    return (
      <View
        key={msg.id}
        style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}
      >
        <View style={styles.messageHeader}>
          {isUser ? (
            <User size={20} color="#6366f1" />
          ) : (
            <Bot size={20} color="#10b981" />
          )}
          <Text style={styles.messageSender}>
            {isUser ? 'You' : 'JARVIS'}
          </Text>
        </View>

        {/* Attached Files */}
        {msg.files && msg.files.length > 0 && (
          <View style={styles.filesContainer}>
            {msg.files.map((file) => (
              <View key={file.id} style={styles.filePreview}>
                {file.type === 'image' && file.uri ? (
                  <Image source={{ uri: file.uri }} style={styles.fileImage} />
                ) : (
                  <View style={styles.fileIcon}>
                    <FileIcon size={24} color="#6366f1" />
                  </View>
                )}
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.messageText}>{msg.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(msg.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bot size={28} color="#6366f1" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>JARVIS Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {isLoading ? 'Thinking...' : 'Ready to help'}
            </Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearMessages} style={styles.clearButton}>
            <X size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Bot size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>
              Start a conversation with JARVIS
            </Text>
            <Text style={styles.emptySubtext}>
              Ask questions, upload files, or request assistance
            </Text>
          </View>
        ) : (
          messages.map(renderMessage)
        )}

        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.messageHeader}>
              <Bot size={20} color="#10b981" />
              <Text style={styles.messageSender}>JARVIS</Text>
            </View>
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <ChatInputWithUpload
        onSend={handleSend}
        placeholder="Message JARVIS..."
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ede9fe',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  filePreview: {
    alignItems: 'center',
    gap: 4,
  },
  fileImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  fileIcon: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  fileName: {
    fontSize: 10,
    color: '#6b7280',
    maxWidth: 100,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
    opacity: 0.4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.8,
  },
});
