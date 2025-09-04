import fs from 'node:fs';
import path from 'node:path';
import { getCssClasses } from '../common/build/css-classes.js';
import { handleDescription } from '../common/build/docs.js';
import { repoRoot } from '../common/build/shared.js';

/**
 * 生成全局 CSS class 数据
 */
export const buildCssClasses = async () => {
  const cssClasses = getCssClasses('zh-cn', null).map((cls) => ({
    ...cls,
    description: handleDescription(cls.description),
  }));

  const js = `// 此文件由 scripts/mcp/build-css-classes.ts 自动生成，请勿手动修改

interface CssClass {
  // CSS 类名
  name: string;
  // CSS 类描述
  description: string;
  // CSS 类使用示例
  example: string;
  // CSS 类文档链接
  docUrl: string;
}

export const cssClasses: CssClass[] = ${JSON.stringify(cssClasses, null, 2)};
`;

  const outDir = path.join(repoRoot, 'packages', 'mcp', 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  const jsPath = path.join(outDir, 'cssClasses.ts');
  fs.writeFileSync(jsPath, js, 'utf8');

  // 简要输出
  console.log(
    `已生成全局 CSS class 数据：\n- ${path.relative(repoRoot, jsPath)}`,
  );
};
