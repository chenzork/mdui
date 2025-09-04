import { z } from 'zod';
import { cssVariables } from '../data/cssVariables.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出所有 mdui 全局 CSS 变量（Design Tokens）
 * @param server
 */
export function registerListCssVariables(server: McpServer) {
  server.registerTool(
    'list_css_variables',
    {
      title: 'List Global CSS Variables',
      description:
        'List all mdui global CSS custom properties (design tokens) from the local index. Read-only, offline, and deterministic. For each variable returns: name, description, and documentation URL. No input required. Results are sorted by name (ascending). Use this to theme/override styles at app level; for per-component tokens, see get_component_metadata.cssProperties.',
      inputSchema: {},
      outputSchema: {
        variables: z
          .array(
            z.object({
              name: z
                .string()
                .describe(
                  'The CSS custom property name, e.g., --mdui-color-primary',
                ),
              description: z
                .string()
                .describe('A brief description of the CSS variable'),
              docUrl: z
                .string()
                .url()
                .describe('The URL to the CSS variable documentation'),
            }),
          )
          .describe(
            'A list of CSS variables with their names, descriptions, and documentation URLs (sorted by name).',
          ),
      },
    },
    async () => {
      const list = cssVariables.sort((a, b) => a.name.localeCompare(b.name));

      return {
        structuredContent: { variables: list },
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ variables: list }, null, 2),
          },
        ],
      };
    },
  );
}
