import { z } from 'zod';
import { components } from '../data/components.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出所有 mdui 组件
 * @param server
 */
export function registerListComponents(server: McpServer) {
  server.registerTool(
    'list_components',
    {
      title: 'List Components',
      description:
        'List all mdui Web Components (custom elements) available in the local mdui index. Read-only, offline, and deterministic. No input required. For each item returns: tagName, description, documentation URL, and a minimal HTML usage snippet. Results are sorted by tagName (ascending). Note: this excludes stand‑alone icon components—use list_icon_components for icons, or list_icon_codes for attribute values.',
      inputSchema: {},
      outputSchema: {
        components: z
          .array(
            z.object({
              tagName: z
                .string()
                .describe('The tag name of the component, e.g., mdui-button'),
              description: z
                .string()
                .describe('A brief description of the component'),
              docUrl: z
                .string()
                .url()
                .describe('The URL to the component documentation'),
              usage: z
                .string()
                .describe('Example HTML usage snippet of the component'),
            }),
          )
          .describe(
            'A list of components with their tag names, descriptions, documentation URLs, and usage snippets (sorted by tagName).',
          ),
      },
    },
    async () => {
      const list = components
        .map((component) => ({
          tagName: component.tagName,
          description: component.description,
          docUrl: component.docUrl,
          usage: component.usage,
        }))
        .sort((a, b) => a.tagName.localeCompare(b.tagName));

      return {
        structuredContent: { components: list },
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ components: list }, null, 2),
          },
        ],
      };
    },
  );
}
