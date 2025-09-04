import { z } from 'zod';
import { components } from '../data/components.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 获取指定组件的详细元数据
 * @param server
 */
export function registerGetComponentMetadata(server: McpServer) {
  const propertySchema = z
    .object({
      name: z.string().describe('The property name'),
      attribute: z
        .string()
        .nullable()
        .describe('The associated HTML attribute name, or null if none'),
      reflects: z
        .boolean()
        .optional()
        .describe('Whether the property reflects to an attribute'),
      description: z.string().describe('A brief description of the property'),
      type: z.string().describe('The property type as text'),
      default: z
        .string()
        .optional()
        .describe('The default value as text, if any'),
    })
    .strict();

  const methodSchema = z
    .object({
      name: z.string().describe('The method name'),
      signature: z
        .string()
        .describe(
          'The full method signature as text, including parameters and return type',
        ),
      description: z.string().describe('A brief description of the method'),
    })
    .strict();

  const eventSchema = z
    .object({
      name: z.string().describe("The event name (without the 'on' prefix)"),
      description: z.string().describe('A brief description of the event'),
    })
    .strict();

  const slotSchema = z
    .object({
      name: z.string().describe("The slot name ('' for the default slot)"),
      description: z.string().describe('A brief description of the slot'),
    })
    .strict();

  const cssPartSchema = z
    .object({
      name: z.string().describe('The CSS part name (for ::part)'),
      description: z.string().describe('A brief description of the CSS part'),
    })
    .strict();

  const cssPropertySchema = z
    .object({
      name: z
        .string()
        .describe('The CSS custom property name, including the leading --'),
      description: z
        .string()
        .describe('A brief description of the CSS custom property'),
    })
    .strict();

  // Reusable component schema and in-memory index for O(1) lookups
  const componentSchema = z
    .object({
      tagName: z
        .string()
        .describe('The tag name of the component, e.g., mdui-button'),
      description: z.string().describe('A brief description of the component'),
      docUrl: z
        .string()
        .url()
        .describe('The URL to the component documentation'),
      usage: z.string().describe('Example HTML usage snippet of the component'),
      properties: z.array(propertySchema).describe('Public properties'),
      methods: z.array(methodSchema).describe('Public methods'),
      events: z.array(eventSchema).describe('Dispatched events'),
      slots: z.array(slotSchema).describe('Slots'),
      cssParts: z.array(cssPartSchema).describe('Exposed CSS parts'),
      cssProperties: z
        .array(cssPropertySchema)
        .describe('Supported CSS custom properties'),
    })
    .strict();

  type Component = z.infer<typeof componentSchema>;

  const componentsIndex = new Map<string, Component>(
    (components as unknown as Component[]).map((c) => [
      c.tagName.toLowerCase(),
      c,
    ]),
  );

  server.registerTool(
    'get_component_metadata',
    {
      title: 'Get Component Metadata',
      description:
        'Get detailed API metadata for one mdui Web Component by tagName (case-insensitive). Read-only, offline, deterministic. Use list_components to discover available tag names. Returns: tagName, description, documentation URL, usage snippet, and arrays of properties, methods, events, slots, cssParts, and cssProperties. Note: attribute names may differ from property names; when both exist, the property may reflect to the attribute if "reflects" is true.',
      inputSchema: {
        tagName: z
          .string()
          .min(1)
          .transform((s) => s.trim().toLowerCase())
          .describe(
            'The tag name of the component, e.g., mdui-button (case-insensitive).',
          ),
      },
      outputSchema: componentSchema.shape,
    },
    async ({ tagName }: { tagName: string }) => {
      const component = componentsIndex.get(tagName);

      if (!component) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Component not found: ${tagName}. Use list_components to see all available tag names.`,
            },
          ],
        };
      }

      return {
        structuredContent: component,
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(component, null, 2),
          },
        ],
      };
    },
  );
}
