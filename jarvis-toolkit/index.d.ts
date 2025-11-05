import { Message } from '@ai-sdk/react';
import { CoreTool } from 'ai';
import { z } from 'zod';

export interface JarvisAgentOptions {
  tools?: Record<string, any>;
  apiEndpoint?: string;
  onFinish?: (message: Message) => void;
  [key: string]: any;
}

export interface JarvisAgentResult {
  messages: Message[];
  sendMessage: (message: string | Message) => void;
  isLoading?: boolean;
  error?: Error;
  append: (message: Message) => void;
  reload: () => void;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e?: any) => void;
  [key: string]: any;
}

export interface JarvisToolConfig<T extends z.ZodType = z.ZodType> {
  description: string;
  zodSchema: T;
  execute: (input: z.infer<T>) => Promise<any> | any;
}

export function useJarvisAgent(options?: JarvisAgentOptions): JarvisAgentResult;

export function createJarvisTool<T extends z.ZodType>(
  config: JarvisToolConfig<T>
): CoreTool<T, any>;

export function initToolkit(): boolean;

export function getToolkitVersion(): string;

declare const _default: {
  useJarvisAgent: typeof useJarvisAgent;
  createJarvisTool: typeof createJarvisTool;
  initToolkit: typeof initToolkit;
  getToolkitVersion: typeof getToolkitVersion;
};

export default _default;
