import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

const CREDENTIALS_PATH = path.resolve(process.cwd(), '.credentials.json');

// Scopes required for Gmail and Google Docs
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/documents',
];

/**
 * Initialize the OAuth2 client using credentials from environment variables.
 */
export function getOAuthClient() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // Desktop app out-of-band redirect URI
  );
}

/**
 * Get the authorization URL to prompt the user.
 */
export function getAuthUrl() {
  const oAuth2Client = getOAuthClient();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

/**
 * Exchange the authorization code for tokens and save them.
 */
export async function getAndSaveTokens(code: string): Promise<void> {
  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  
  await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
  console.log(`Tokens successfully saved to ${CREDENTIALS_PATH}`);
}

/**
 * Load saved credentials and return an authenticated OAuth2 client.
 * Throws an error if credentials are not found or invalid.
 */
export async function loadAuthenticatedClient() {
  let credentials: any;
  let useFileStorage = false;

  try {
    // 1. Try reading from Environment Variable (Railway deployment)
    if (env.GOOGLE_OAUTH_CREDENTIALS) {
      credentials = JSON.parse(env.GOOGLE_OAUTH_CREDENTIALS);
      console.log('Loaded OAuth credentials from GOOGLE_OAUTH_CREDENTIALS environment variable.');
    } 
    // 2. Fall back to local file storage
    else {
      const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
      credentials = JSON.parse(content);
      useFileStorage = true;
      console.log(`Loaded OAuth credentials from ${CREDENTIALS_PATH}`);
    }

    const oAuth2Client = getOAuthClient();
    oAuth2Client.setCredentials(credentials);
    
    // Automatically handle token refresh if necessary
    oAuth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        credentials.refresh_token = tokens.refresh_token;
      }
      credentials.access_token = tokens.access_token;
      credentials.expiry_date = tokens.expiry_date;
      
      if (useFileStorage) {
        await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
      } else {
        console.warn('OAuth tokens refreshed in memory. For persistence on Railway, update the GOOGLE_OAUTH_CREDENTIALS variable with the new refresh_token if it changed.');
      }
    });

    return oAuth2Client;
  } catch (error) {
    throw new Error('Authentication required. Please run `npm run auth` locally or set GOOGLE_OAUTH_CREDENTIALS.');
  }
}
