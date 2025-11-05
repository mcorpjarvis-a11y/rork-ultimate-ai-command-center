import { useChat } from '@ai-sdk/react';
import { tool } from 'ai';

/**
 * JARVIS Agent Hook - Wrapper around useChat with JARVIS-specific configuration
 * @param {Object} options - Configuration options
 * @param {Object} options.tools - Tools available to the agent
 * @param {string} options.apiEndpoint - API endpoint for chat (defaults to /api/chat)
 * @param {Function} options.onFinish - Callback when a response is complete
 * @returns {Object} Chat state and methods (messages, sendMessage, isLoading, etc.)
 */
export const useJarvisAgent = (options) => {
  // Provide default values for all options
  const { 
    tools, 
    apiEndpoint, 
    onFinish, 
    ...restOptions 
  } = options || {};

  // Convert tools object to the format expected by useChat if provided
  const formattedTools = tools ? Object.entries(tools).reduce((acc, [name, toolDef]) => {
    acc[name] = toolDef;
    return acc;
  }, {}) : undefined;

  const chatResult = useChat({
    api: apiEndpoint,
    tools: formattedTools,
    onFinish,
    ...restOptions,
  });

  return {
    ...chatResult,
    // Alias append to sendMessage for consistency
    sendMessage: (message) => {
      if (typeof message === 'string') {
        return chatResult.append({ role: 'user', content: message });
      }
      return chatResult.append(message);
    },
  };
};

/**
 * Create a JARVIS Tool - Wrapper around AI SDK tool function
 * @param {Object} config - Tool configuration
 * @param {string} config.description - Description of what the tool does
 * @param {Object} config.zodSchema - Zod schema for input validation
 * @param {Function} config.execute - Function to execute when tool is called
 * @returns {Object} Tool definition compatible with AI SDK
 */
export const createJarvisTool = (config) => {
  // Provide defaults
  const { description, zodSchema, execute } = config || {};

  if (!description) {
    console.warn('[JARVIS Toolkit] Tool created without description');
  }

  if (!zodSchema) {
    console.warn('[JARVIS Toolkit] Tool created without schema');
  }

  if (!execute) {
    console.warn('[JARVIS Toolkit] Tool created without execute function');
    return tool({
      description: description || 'A JARVIS tool',
      parameters: zodSchema,
      execute: async () => 'Tool executed',
    });
  }

  return tool({
    description,
    parameters: zodSchema,
    execute: async (input) => {
      try {
        const result = await execute(input);
        return result;
      } catch (error) {
        console.error('[JARVIS Toolkit] Tool execution error:', error);
        throw error;
      }
    },
  });
};

/**
 * Initialize the JARVIS Toolkit
 */
export const initToolkit = () => {
  console.log('[JARVIS Toolkit] Initialized successfully');
  return true;
};

/**
 * Get the current version of the toolkit
 */
export const getToolkitVersion = () => '2.0.0';

// Default export for convenience
export default {
  useJarvisAgent,
  createJarvisTool,
  initToolkit,
  getToolkitVersion,
};
