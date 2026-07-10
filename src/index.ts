import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from './mcp/server.js';
import { env } from './config/env.js';

const app = express();
app.use(cors());

const PORT = env.PORT || 3000;
const transports = new Map<string, SSEServerTransport>();

async function main() {
  const mcpServer = createServer();

  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/message', res);
    await mcpServer.connect(transport);
    
    const sessionId = transport.sessionId;
    if (sessionId) {
      transports.set(sessionId, transport);
    }
    
    req.on('close', async () => {
      if (sessionId) {
        transports.delete(sessionId);
      }
      await transport.close();
    });
  });

  app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    
    if (!transport) {
      res.status(404).send('Session not found');
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
