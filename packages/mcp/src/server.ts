import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGetComponentMetadata } from './tools/getComponentMetadata.js';
import { registerGetDocument } from './tools/getDocument.js';
import { registerListComponents } from './tools/listComponents.js';
import { registerListCssClasses } from './tools/listCssClasses.js';
import { registerListCssVariables } from './tools/listCssVariables.js';
import { registerListDocuments } from './tools/listDocuments.js';
import { registerListIconCodes } from './tools/listIconCodes.js';
import { registerListIconComponents } from './tools/listIconComponents.js';

export function createServer() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const VERSION = (
    JSON.parse(
      fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'),
    ) as { version: string }
  ).version;

  const server = new McpServer({
    name: 'mdui-mcp',
    version: VERSION,
    capabilities: {
      tools: {},
    },
  });

  // Register tool modules
  registerListComponents(server);
  registerGetComponentMetadata(server);
  registerListCssClasses(server);
  registerListCssVariables(server);
  registerListDocuments(server);
  registerGetDocument(server);
  registerListIconCodes(server);
  registerListIconComponents(server);

  return server;
}
