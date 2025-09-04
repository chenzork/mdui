import { z } from 'zod';
import { cssClasses } from '../data/cssClasses.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出所有 mdui 全局 CSS class
 * @param server
 */
export function registerListCssClasses(server: McpServer) {
  server.registerTool(
    'list_css_classes',
    {
      title: 'List Global CSS Classes',
      description:
        'List all mdui global CSS classes from the local index (read-only, offline). For each class returns: name, description, documentation URL, and an example usage snippet. Results are sorted by name (ascending). Use this to discover utility/semantics classes, not component APIs.',
      inputSchema: {},
      outputSchema: {
        classes: z
          .array(
            z.object({
              name: z
                .string()
                .describe('The CSS class name, e.g., mdui-theme-dark'),
              description: z
                .string()
                .describe('A brief description of the CSS class'),
              docUrl: z
                .string()
                .url()
                .describe('The URL to the CSS class documentation'),
              example: z
                .string()
                .describe('Example usage snippet of the CSS class'),
            }),
          )
          .describe(
            'A list of global CSS classes with their names, descriptions, documentation URLs, and example usage snippets (sorted by name).',
          ),
      },
    },
    async () => {
      const list = cssClasses.sort((a, b) => a.name.localeCompare(b.name));

      return {
        structuredContent: { classes: list },
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ classes: list }, null, 2),
          },
        ],
      };
    },
  );
}
