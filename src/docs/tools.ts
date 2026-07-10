import { z } from 'zod';
import { appendToDoc, AppendOptions } from './service.js';

export const appendSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  content: z.string().min(1, 'Content to append is required'),
});

export const DOCS_TOOLS = [
  {
    name: 'append_to_doc',
    description: 'Append content to the end of an existing Google Document.',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'The ID of the Google Document (found in the URL)' },
        content: { type: 'string', description: 'The text content to append' },
      },
      required: ['documentId', 'content'],
    },
  },
];

export async function handleDocsTool(name: string, args: any) {
  const parsedArgs = appendSchema.parse(args) as AppendOptions;

  if (name === 'append_to_doc') {
    const result = await appendToDoc(parsedArgs);
    return {
      success: true,
      documentId: result.documentId,
    };
  }

  throw new Error(`Unknown Docs tool: ${name}`);
}
