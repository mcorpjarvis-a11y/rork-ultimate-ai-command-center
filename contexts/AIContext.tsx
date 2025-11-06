import React, { createContext, useContext, useState, ReactNode } from 'react';
import { queryJarvis } from '../services/JarvisAPIRouter'; // <-- IMPORT THE NEW ROUTER

type AIProvider = 'google' | 'groq'; // Expand as more providers are added

interface AIContextType {
  response: string | null;
  isLoading: boolean;
  error: string | null;
  ask: (prompt: string, provider: AIProvider) => Promise<void>;
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('groq'); // Default to Groq

  const ask = async (prompt: string, currentProvider: AIProvider) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Use the unified query function
    const result = await queryJarvis(prompt, currentProvider);

    if (result.success && result.content) {
      setResponse(result.content);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  const contextValue = {
    response,
    isLoading,
    error,
    ask: (prompt: string) => ask(prompt, provider),
    provider,
    setProvider,
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
