import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './mcp/server.js';
import { env } from './config/env.js';

const app = express();
app.use(cors());

const PORT = env.PORT || 3000;
let transport: SSEServerTransport;

async function main() {
  const mcpServer = createServer();

  app.get('/sse', async (req, res) => {
    transport = new SSEServerTransport('/message', res);
    await mcpServer.connect(transport);
    
    // Express closes the connection when the client disconnects
    req.on('close', async () => {
      await transport.close();
    });
  });

  app.post('/message', express.json(), async (req, res) => {
    if (!transport) {
      res.status(503).send('SSE transport not initialized. Connect to /sse first.');
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  app.listen(PORT, () => {
    console.log(`Google Workspace MCP Server is running.`);
    console.log(`- SSE Endpoint: http://localhost:${PORT}/sse`);
    console.log(`- Message Endpoint: http://localhost:${PORT}/message`);
  });
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
