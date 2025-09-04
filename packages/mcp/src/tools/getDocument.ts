import { z } from 'zod';
import { documents } from '../data/documents.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * 根据 key 或 tagName 获取单个文档内容
 * - key: 来自 list_documents 工具的 key，如 components--button
 * - tagName: 来自 list_components 工具的 tagName，如 mdui-button
 */
export function registerGetDocument(server: McpServer) {
  // 输入：允许传入 key 或 tagName（至少其一，且两者互斥）
  const normalizeOptionalNonEmptyLower = (label: string) =>
    z
      .preprocess((v) => {
        if (typeof v === 'string') {
          const s = v.trim();
          return s.length === 0 ? undefined : s.toLowerCase();
        }
        return v;
      }, z.string().min(1).optional())
      .describe(label);

  const inputSchema = {
    key: normalizeOptionalNonEmptyLower(
      'Document key from list_documents, e.g., components--button (case-insensitive).',
    ),
    tagName: normalizeOptionalNonEmptyLower(
      'Component tag name from list_components, e.g., mdui-button (case-insensitive).',
    ),
  } as const;

  // 输出：文档对象
  const outputSchema = {
    key: z.string().describe('Unique document key, e.g., components--button'),
    title: z.string().describe('Document title'),
    description: z.string().describe('Short description of the document'),
    content: z.string().describe('Full markdown content of the document'),
  } as const;

  server.registerTool(
    'get_document',
    {
      title: 'Get Document',
      description:
        'Get a single mdui documentation page by key or by component tagName (inputs are mutually exclusive). Read-only, offline, deterministic. If both inputs are provided, the tool returns an error. If only tagName is provided, the tool selects the first document that references this tagName. Returns: key, title, description, and full markdown content.',
      inputSchema,
      outputSchema,
    },
    async ({ key, tagName }: { key?: string; tagName?: string }) => {
      // 互斥与必填校验
      if (!key && !tagName) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'Either key or tagName is required.',
            },
          ],
        };
      }
      if (key && tagName) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'Provide either key or tagName, not both (they are mutually exclusive).',
            },
          ],
        };
      }

      // 若未提供 key，则根据 tagName 在 documents 中查找包含该 tag 的页面，确定 key
      let resolvedKey = key?.trim().toLowerCase();
      if (!resolvedKey && tagName) {
        const normalizedTag = tagName.trim().toLowerCase();
        for (const [docKey, docItem] of Object.entries(documents)) {
          const tags = docItem.tagNames;
          if (
            Array.isArray(tags) &&
            tags.map((t) => t.toLowerCase()).includes(normalizedTag)
          ) {
            resolvedKey = docKey;
            break;
          }
        }
      }

      const doc = resolvedKey ? documents[resolvedKey] : undefined;

      if (!doc) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Document not found by ${
                key ? `key: ${key}` : `tagName: ${tagName}`
              }. Use list_documents to enumerate keys or verify that the component has an associated document.`,
            },
          ],
        };
      }

      const result = {
        key: doc.key,
        title: doc.title,
        description: doc.description,
        content: doc.content,
      };

      return {
        structuredContent: result,
        content: [
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  );
}
