import { z } from 'zod';
import { icons } from '../data/icons.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出指定变体的所有图标组件信息
 * 返回 { name, tagName, import } 数组
 * @param server
 */
export function registerListIconComponents(server: McpServer) {
  const variantSchema = z.enum([
    'filled',
    'outlined',
    'rounded',
    'sharp',
    'two-tone',
  ]);

  const inputSchema = {
    variant: variantSchema
      .optional()
      .describe(
        "Icon variant to list. One of: 'filled' (default), 'outlined', 'rounded', 'sharp', 'two-tone'.",
      ),
    query: z
      .preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string().min(1).optional(),
      )
      .describe(
        'Case-insensitive substring to filter by human-readable name or tagName.',
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(5000)
      .optional()
      .describe('Maximum number of results to return (default: all).'),
  } as const;

  const outputSchema = {
    icons: z
      .array(
        z.object({
          name: z.string().describe('Human-readable icon label'),
          tagName: z
            .string()
            .describe('Custom element tag for the icon component.'),
          import: z
            .string()
            .describe(
              "ESM import statement to register the icon element, e.g., import '@mdui/icons/search.js' or import '@mdui/icons/search--outlined.js';",
            ),
        }),
      )
      .describe(
        "List of stand‑alone icon Web Components for the requested variant (default: 'filled'). Each item includes a display name, the custom element tag, and the ESM import statement.",
      ),
  } as const;

  const toTitleCase = (s: string) =>
    s
      .split(' ')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
      .join(' ');

  server.registerTool(
    'list_icon_components',
    {
      title: 'List Icon Components',
      description:
        "List stand‑alone icon Web Components for a single variant from the local index (read-only, offline, deterministic). These are custom elements you can import and use directly. Examples:\nimport '@mdui/icons/search.js'\nimport '@mdui/icons/search--outlined.js'\n<mdui-icon-search></mdui-icon-search>\n<mdui-icon-search--outlined></mdui-icon-search--outlined>\n\nOutput: array of { name, tagName, import }.\n- name: human-readable label.\n- tagName: custom element tag.\n- import: ESM statement to register the element.\n\nDiffers from list_icon_codes: this returns component tags/import statements, not attribute codes.\n\nInput: optional 'variant' — one of 'filled' (default), 'outlined', 'rounded', 'sharp', 'two-tone'; optional 'query' — case-insensitive substring filter applied to the human-readable name or the tagName; and 'limit' — maximum number of results to return (1–5000, default: all).",
      inputSchema,
      outputSchema,
    },
    async ({
      variant,
      query,
      limit,
    }: {
      variant?: 'filled' | 'outlined' | 'rounded' | 'sharp' | 'two-tone';
      query?: string;
      limit?: number;
    }) => {
      const v = variant ?? 'filled';
      const q = query?.toLowerCase();

      let list = icons.map((n) => {
        const display = toTitleCase(n.replace(/_/g, ' '));
        const base = n.replace(/_/g, '-');
        const suffix = v === 'filled' ? '' : `--${v}`;

        const tagName = `mdui-icon-${base}${suffix}`;
        const importStmt = `import '@mdui/icons/${base}${suffix}.js';`;

        return { name: display, tagName, import: importStmt } as const;
      });

      if (q) {
        list = list.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.tagName.toLowerCase().includes(q),
        );
      }

      if (typeof limit === 'number') {
        list = list.slice(0, limit);
      }

      const result = { icons: list } as const;

      return {
        structuredContent: result,
        content: [
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );
}
