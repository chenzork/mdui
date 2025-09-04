import { z } from 'zod';
import { icons } from '../data/icons.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 列出指定变体的所有图标名称
 * @param server
 */
export function registerListIconCodes(server: McpServer) {
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
        'Case-insensitive substring to filter by human-readable name or code.',
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
          code: z
            .string()
            .describe(
              "Icon name to use in component attributes/APIs (e.g., 'search' or 'search--outlined').",
            ),
        }),
      )
      .describe(
        "List of icon codes for the requested variant. Use these codes in attributes such as mdui-button's 'icon' or 'end-icon'.",
      ),
  } as const;

  const toTitleCase = (s: string) =>
    s
      .split(' ')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
      .join(' ');

  server.registerTool(
    'list_icon_codes',
    {
      title: 'List Icon Codes',
      description:
        "List icon codes (attribute values) for a single variant from the local index. Read-only, offline, deterministic. Use these codes wherever an icon name is required by a component or API, for example: <mdui-button icon=\"search\" end-icon=\"arrow_forward\">.\n\nOutput: array of { name, code }.\n- name: human-readable label.\n- code: value to use in attributes/APIs (e.g., 'search' or 'search--outlined').\n\nDiffers from list_icon_components: this returns attribute codes, not custom element tags/imports.\n\nInput: optional 'variant' — one of 'filled' (default), 'outlined', 'rounded', 'sharp', 'two-tone'; also supports optional 'query' — case-insensitive substring filter applied to the human-readable name or the code; and 'limit' — maximum number of results to return (1–5000, default: all).",
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
        const code = v === 'filled' ? n : `${n}--${v}`;
        return { name: display, code } as const;
      });

      if (q) {
        list = list.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.code.toLowerCase().includes(q),
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
