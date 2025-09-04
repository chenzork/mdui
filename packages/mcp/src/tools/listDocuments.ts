import { z } from 'zod';
import { documents } from '../data/documents.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出所有文档（key、title、description）
 * @param server
 */
export function registerListDocuments(server: McpServer) {
  server.registerTool(
    'list_documents',
    {
      title: 'List Documents',
      description:
        'List all mdui documentation pages from the local index (read-only, offline). For each document returns: key, title, and description. Results are sorted by key (ascending). Use get_document with a key from this list to fetch the full markdown content.',
      inputSchema: {},
      outputSchema: {
        documents: z
          .array(
            z.object({
              key: z
                .string()
                .describe('Unique document key, e.g., components--button'),
              title: z.string().describe('Document title'),
              description: z
                .string()
                .describe('Short description of the document'),
            }),
          )
          .describe(
            'A list of documents with key, title, and description (sorted by key).',
          ),
      },
    },
    async () => {
      const list = Object.values(documents)
        .map((doc) => ({
          key: doc.key,
          title: doc.title,
          description: doc.description,
        }))
        .sort((a, b) => a.key.localeCompare(b.key));

      return {
        structuredContent: { documents: list },
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ documents: list }, null, 2),
          },
        ],
      };
    },
  );
}
