import { google, gmail_v1 } from 'googleapis';
import { loadAuthenticatedClient } from '../auth/oauth.js';

export async function getGmailClient(): Promise<gmail_v1.Gmail> {
  const auth = await loadAuthenticatedClient();
  return google.gmail({ version: 'v1', auth });
}

export interface EmailOptions {
  recipient: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyType?: 'text/plain' | 'text/html';
}

function createRawMessage(options: EmailOptions): string {
  const headers: Record<string, string> = {
    To: options.recipient,
    Subject: options.subject,
    'Content-Type': `${options.bodyType || 'text/plain'}; charset="UTF-8"`,
  };

  if (options.cc && options.cc.length > 0) {
    headers['Cc'] = options.cc.join(', ');
  }

  if (options.bcc && options.bcc.length > 0) {
    headers['Bcc'] = options.bcc.join(', ');
  }

  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const rawMessage = `${headerLines}\n\n${options.body}`;
  return Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendEmail(options: EmailOptions) {
  const gmail = await getGmailClient();
  const raw = createRawMessage(options);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return res.data;
}

export async function createDraft(options: EmailOptions) {
  const gmail = await getGmailClient();
  const raw = createRawMessage(options);

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  });

  return res.data;
}
