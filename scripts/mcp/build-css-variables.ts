import fs from 'node:fs';
import path from 'node:path';
import { getCssProperties } from '../common/build/css-properties.js';
import { handleDescription } from '../common/build/docs.js';
import { repoRoot } from '../common/build/shared.js';

/**
 * 生成全局 CSS 变量（自定义属性）数据
 */
export const buildCssVariables = async () => {
  const cssVariables = getCssProperties('zh-cn', null).map((prop) => ({
    ...prop,
    description: handleDescription(prop.description),
  }));

  const js = `// 此文件由 scripts/mcp/build-css-variables.ts 自动生成，请勿手动修改

interface CssVariable {
	// CSS 变量名
	name: string;
	// CSS 变量描述
	description: string;
	// CSS 变量文档链接
	docUrl: string;
}

export const cssVariables: CssVariable[] = ${JSON.stringify(cssVariables, null, 2)};
`;

  const outDir = path.join(repoRoot, 'packages', 'mcp', 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  const jsPath = path.join(outDir, 'cssVariables.ts');
  fs.writeFileSync(jsPath, js, 'utf8');

  // 简要输出
  console.log(
    `已生成全局 CSS 变量数据：\n- ${path.relative(repoRoot, jsPath)}`,
  );
};
