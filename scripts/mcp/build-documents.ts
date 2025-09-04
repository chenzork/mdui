import fs from 'node:fs';
import path from 'node:path';
import { docComponents } from '../common/build/docs.js';
import { repoRoot, traverseDirectory } from '../common/build/shared.js';

interface DocItem {
  key: string;
  title: string;
  description: string;
  content: string;
  tagNames?: string[];
}

/**
 * 读取 docs/zh-cn 中的所有 Markdown 文档，编译为对象并输出到 packages/mcp/src/data/docs.ts
 */
export const buildDocuments = async () => {
  const zhCnRoot = path.join(repoRoot, 'docs', 'zh-cn');
  const outDir = path.join(repoRoot, 'packages', 'mcp', 'src', 'data');

  const docsMap: Record<string, DocItem> = {};

  // 遍历 zh-cn 下的所有 .md 文件
  traverseDirectory(zhCnRoot, '.md', (filePath) => {
    const rel = path.relative(zhCnRoot, filePath); // e.g. components/avatar.md
    const parts = rel.replace(/\\/g, '/').replace(/\.md$/i, '').split('/');
    const key = parts.join('--'); // e.g. components--avatar 或 index

    const content =
      fs
        .readFileSync(filePath, 'utf8')
        .replace(/^```html[^\n]*$/gm, '```html') + '\n'; // 移除 ```html 后面的参数
    const lines = content.split(/\r?\n/);

    // 提取第一行一级标题作为 title
    let title = '';
    let titleLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^#\s+(.+?)\s*$/);
      if (m) {
        title = m[1].trim();
        titleLineIndex = i;
        break;
      }
    }

    // 提取标题后的第一行非空文本作为 description
    let description = '';
    if (titleLineIndex >= 0) {
      for (let i = titleLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // 跳过空行
        description = line;
        break;
      }
    }

    // 若是组件文档（components/*），为其附加 tagNames，来源于 docComponents[pageName]
    let tagNames: string[] | undefined;
    if (parts[0] === 'components' && parts[1]) {
      const pageName = parts[1];
      tagNames = docComponents[pageName];
    }

    docsMap[key] = {
      key,
      title,
      description,
      content,
      ...(tagNames ? { tagNames } : {}),
    };
  });

  // 生成 TS 文件内容
  const js = `// 此文件由 scripts/mcp/build-documents.ts 自动生成，请勿手动修改

interface DocItem {
  key: string;
  title: string;
  description: string;
  content: string;
  tagNames?: string[];
}

export const documents: Record<string, DocItem> = ${JSON.stringify(docsMap, null, 2)};
`;

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'documents.ts');
  fs.writeFileSync(outPath, js, 'utf8');
  console.log(`已生成文档数据：\n- ${path.relative(repoRoot, outPath)}`);
};
