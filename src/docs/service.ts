import { google, docs_v1 } from 'googleapis';
import { loadAuthenticatedClient } from '../auth/oauth.js';

export async function getDocsClient(): Promise<docs_v1.Docs> {
  const auth = await loadAuthenticatedClient();
  return google.docs({ version: 'v1', auth });
}

export interface AppendOptions {
  documentId: string;
  content: string;
}

export async function appendToDoc(options: AppendOptions) {
  const docs = await getDocsClient();
  
  // First, we need to get the document to find its end index
  const doc = await docs.documents.get({
    documentId: options.documentId,
  });

  if (!doc.data.body || !doc.data.body.content) {
    throw new Error('Could not read document body.');
  }

  // The last structural element in a Google Doc is always a paragraph representing the end of the document.
  // Its end index is the end of the document. Wait, actually we can use an index of doc length minus 1,
  // or we can just insert text at the end of the last content block.
  // A safe way is to find the maximum end index of the body elements minus 1 (newline).
  const bodyContent = doc.data.body.content;
  const lastElement = bodyContent[bodyContent.length - 1];
  const endIndex = (lastElement.endIndex || 1) - 1;

  // Now, we perform a batchUpdate to insert text
  const res = await docs.documents.batchUpdate({
    documentId: options.documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: {
              index: endIndex,
            },
            text: `\n${options.content}`,
          },
        },
      ],
    },
  });

  return res.data;
}
