# Google Workspace MCP Server

A generic Model Context Protocol (MCP) Server that exposes Google Workspace capabilities to AI agents. Currently, it supports sending and drafting emails via Gmail and appending content to Google Docs.

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **Google Cloud Project** with the following APIs enabled:
   - Gmail API
   - Google Docs API

## Setup Instructions

### 1. Configure Google Cloud OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Library** and enable **Gmail API** and **Google Docs API**.
4. Navigate to **APIs & Services > OAuth consent screen** and configure it. Add your email address as a test user if the app is in "Testing" mode.
5. Navigate to **APIs & Services > Credentials**.
6. Click **Create Credentials > OAuth client ID**.
7. Select **Desktop app** as the application type and create it.
8. Download the client ID and client secret.

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Authenticate

Run the authentication script to generate and save your OAuth tokens locally:

```bash
npm run auth
```

Follow the prompt in your terminal. It will provide a URL for you to visit. Log in with your Google account, authorize the requested scopes, and copy the provided code back into the terminal.

This will generate a `.credentials.json` file in the root of the project. **Keep this file secure and do not commit it to version control.**

### 5. Build and Run Locally

To compile the TypeScript code:
```bash
npm run build
```

To run the MCP server (starts an Express server on port 3000 by default):
```bash
npm start
```

For development, you can use:
```bash
npm run dev
```

### 6. Deploy to Railway

1. Push your repository to GitHub.
2. Create a new project on [Railway](https://railway.app/) and deploy from your GitHub repo.
3. In the Railway Variables dashboard, add the following variables:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
   - `GOOGLE_OAUTH_CREDENTIALS`: Copy the entire contents of your local `.credentials.json` and paste it here.
4. Railway will automatically build and start the Express server.

## Configuring an MCP Client

This server uses **Server-Sent Events (SSE)** over HTTP, meaning it is meant to be accessed via a URL rather than a local command. 

If your AI client supports connecting to remote MCP servers via SSE (like some custom clients or extensions), point it to your Railway URL (or `localhost` if running locally):

**SSE URL**: `https://your-app-name.up.railway.app/sse`

If you are using a client that requires a local executable (like Claude Desktop), you will need a proxy or wrapper that bridges `stdio` to the remote SSE endpoints, as Claude Desktop currently natively spawns local processes via `stdio`.

## Available Tools

- **`send_email`**: Sends an email using the authenticated user's Gmail account.
- **`draft_email`**: Creates a draft email in the authenticated user's Gmail account.
- **`append_to_doc`**: Appends text to the end of an existing Google Document.
