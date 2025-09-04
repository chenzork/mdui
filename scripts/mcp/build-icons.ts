import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../common/build/shared.js';

/**
 * 生成 icons 数据
 */
export const buildIcons = async () => {
  const svgDir = path.join(
    repoRoot,
    'node_modules',
    '@material-design-icons',
    'svg',
    'filled',
  );

  if (!fs.existsSync(svgDir)) {
    throw new Error(
      `未找到目录：${svgDir}\n请先安装依赖：@material-design-icons/svg（pnpm i -D @material-design-icons/svg）`,
    );
  }

  const files = fs
    .readdirSync(svgDir)
    .filter((f) => f.toLowerCase().endsWith('.svg'));

  const names = Array.from(
    new Set(files.map((f) => f.replace(/\.svg$/i, ''))),
  ).sort((a, b) => a.localeCompare(b));

  const outDir = path.join(repoRoot, 'packages', 'mcp', 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  const js = `// 此文件由 scripts/mcp/build-icons.ts 自动生成，请勿手动修改

// Material Icons（Filled 变体）可用图标名称列表
export const icons: string[] = ${JSON.stringify(names, null, 2)};
`;

  const outPath = path.join(outDir, 'icons.ts');
  fs.writeFileSync(outPath, js, 'utf8');
  console.log(`已生成图标数据：\n- ${path.relative(repoRoot, outPath)}`);
};
