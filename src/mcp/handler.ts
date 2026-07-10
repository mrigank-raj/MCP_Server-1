import { GMAIL_TOOLS, handleGmailTool } from '../gmail/tools.js';
import { DOCS_TOOLS, handleDocsTool } from '../docs/tools.js';

export const ALL_TOOLS = [...GMAIL_TOOLS, ...DOCS_TOOLS];

export async function handleToolCall(name: string, args: any) {
  try {
    if (GMAIL_TOOLS.some(t => t.name === name)) {
      const result = await handleGmailTool(name, args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }
    
    if (DOCS_TOOLS.some(t => t.name === name)) {
      const result = await handleDocsTool(name, args);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    // Return structured error as per requirements
    const errorResponse = {
      success: false,
      error: {
        code: error.code || 'EXECUTION_ERROR',
        message: error.message || 'An unknown error occurred.',
      },
    };
    
    return {
      content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }],
      isError: true,
    };
  }
}
