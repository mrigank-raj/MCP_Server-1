import { z } from 'zod';
import { sendEmail, createDraft, EmailOptions } from './service.js';

export const emailSchema = z.object({
  recipient: z.string().email('Invalid email address for recipient'),
  cc: z.array(z.string().email('Invalid email in cc')).optional(),
  bcc: z.array(z.string().email('Invalid email in bcc')).optional(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  bodyType: z.enum(['text/plain', 'text/html']).optional().default('text/plain'),
});

export const GMAIL_TOOLS = [
  {
    name: 'send_email',
    description: 'Send an email using Gmail on behalf of the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        recipient: { type: 'string', description: 'Primary recipient email address' },
        cc: { type: 'array', items: { type: 'string' }, description: 'CC recipients' },
        bcc: { type: 'array', items: { type: 'string' }, description: 'BCC recipients' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body content' },
        bodyType: { type: 'string', enum: ['text/plain', 'text/html'], description: 'Format of the email body' },
      },
      required: ['recipient', 'subject', 'body'],
    },
  },
  {
    name: 'draft_email',
    description: 'Create an email draft using Gmail without sending it.',
    inputSchema: {
      type: 'object',
      properties: {
        recipient: { type: 'string', description: 'Primary recipient email address' },
        cc: { type: 'array', items: { type: 'string' }, description: 'CC recipients' },
        bcc: { type: 'array', items: { type: 'string' }, description: 'BCC recipients' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body content' },
        bodyType: { type: 'string', enum: ['text/plain', 'text/html'], description: 'Format of the email body' },
      },
      required: ['recipient', 'subject', 'body'],
    },
  },
];

export async function handleGmailTool(name: string, args: any) {
  const parsedArgs = emailSchema.parse(args) as EmailOptions;

  if (name === 'send_email') {
    const result = await sendEmail(parsedArgs);
    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  } else if (name === 'draft_email') {
    const result = await createDraft(parsedArgs);
    return {
      success: true,
      draftId: result.id,
      messageId: result.message?.id,
    };
  }

  throw new Error(`Unknown Gmail tool: ${name}`);
}
