import React, { createContext, useContext, useState, ReactNode } from 'react';
import { queryJarvis } from '../services/JarvisAPIRouter';
import { UploadedFile } from '../services/FileUploadService';

type AIProvider = 'google' | 'groq' | 'huggingface' | 'togetherai' | 'deepseek';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: UploadedFile[];
  timestamp: number;
}

interface AIContextType {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  ask: (prompt: string, files?: UploadedFile[]) => Promise<void>;
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  clearMessages: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('groq'); // Default to Groq

  const ask = async (prompt: string, files?: UploadedFile[]) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: prompt,
      files,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Build prompt with file context
    let enhancedPrompt = prompt;
    if (files && files.length > 0) {
      const fileDescriptions = files
        .map((f) => `[${f.type.toUpperCase()}: ${f.name}]`)
        .join(', ');
      enhancedPrompt = `${prompt}\n\nAttached files: ${fileDescriptions}`;
    }

    // Use the unified query function
    const result = await queryJarvis(enhancedPrompt, provider);

    if (result.success && result.content) {
      const assistantMessage: AIMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      setError(result.error || 'An unknown error occurred.');
      // Add error message
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${result.error || 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const contextValue = {
    messages,
    isLoading,
    error,
    ask,
    provider,
    setProvider,
    clearMessages,
  };

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
