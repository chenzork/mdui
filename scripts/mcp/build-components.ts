import fs from 'node:fs';
import path from 'node:path';
import { getAllComponents } from '../common/build/component.js';
import { handleDescription, getDocUrlByTagName } from '../common/build/docs.js';
import { repoRoot } from '../common/build/shared.js';

/**
 * 生成组件元数据
 */
export const buildComponents = async () => {
  const cemPath = path.join(
    repoRoot,
    'packages',
    'mdui',
    'custom-elements.json',
  );

  if (!fs.existsSync(cemPath)) {
    throw new Error(
      `custom-elements.json 未找到，请先构建 mdui（运行: pnpm run customElements:mdui）\n路径: ${cemPath}`,
    );
  }

  const componentsSource = getAllComponents(cemPath);

  const components = componentsSource.map((component) => ({
    tagName: component.tagName,
    // 第一行为简短描述，第二行为代码。这里只取简短描述
    description: component.summary?.split('\n\n')[0],
    docUrl: getDocUrlByTagName(component.tagName),
    // 取 summary 中的代码部分
    usage: component.summary
      ?.split('\n\n')
      .slice(1)
      .join('\n\n')
      .replace(/^```html/, '')
      .replace(/```$/, '')
      .trim()
      .replaceAll('.', ' '),
    properties: component.members
      .filter((member) => member.kind === 'field')
      .map((member) => {
        const type = (member.type?.text ?? '')
          .split('|')
          .map((v) => v.trim())
          .filter((v) => v)
          .map((val) => {
            // 移除注释
            const enumCommentReg = /\/\*([\s\S]*?)\*\//;
            const enumComment = val.match(enumCommentReg);
            if (enumComment) {
              val = val.replace(enumCommentReg, '').trim();
            }

            return val;
          })
          .join(' | ');

        return {
          name: member.name,
          attribute: member.attribute ?? null,
          reflects: member.reflects,
          description: handleDescription(member.description!),
          type,
          default: member.default,
        };
      }),
    methods: component.members
      .filter((member) => member.kind === 'method')
      .map((member) => {
        const parameters = (member.parameters ?? [])
          .map(
            (parameter) =>
              `${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type?.text}`,
          )
          .join(', ');

        return {
          name: member.name,
          signature: `${member.name}(${parameters}): ${member.return?.type?.text}`,
          description: handleDescription(member.description!),
        };
      }),
    // 没有 description 时，是通过 this.dispatchEvent 触发的事件不放到文档中
    events: (component.events ?? [])
      .filter((event) => event.description)
      .map((event) => ({
        name: event.name,
        description: handleDescription(event.description!),
      })),
    slots: (component.slots ?? []).map((slot) => ({
      name: slot.name,
      description: handleDescription(slot.description!),
    })),
    cssParts: (component.cssParts ?? []).map((cssPart) => ({
      name: cssPart.name,
      description: handleDescription(cssPart.description!),
    })),
    cssProperties: (component.cssProperties ?? []).map((cssProperty) => ({
      name: cssProperty.name,
      description: handleDescription(cssProperty.description!),
    })),
  }));

  const js = `// 此文件由 scripts/mcp/build-components.ts 自动生成，请勿手动修改

interface ComponentProperty {
  // property 属性名
  name: string;
  // attribute 属性名，为 null 表示不存在对应的 attribute
  attribute: string | null;
  // property 属性变更时，是否反映到 attribute 属性上
  reflects?: boolean;
  // 属性说明
  description: string;
  // 属性类型
  type: string;
  // 属性默认值
  default?: string;
}

interface ComponentMethod {
  // 方法名
  name: string;
  // 方法签名
  signature: string;
  // 方法描述
  description: string;
}

interface ComponentEvent {
  // 事件名
  name: string;
  // 事件描述
  description: string;
}

interface ComponentSlot {
  // slot 名称，为空字符串时表示为默认slot
  name: string;
  // slot 描述
  description: string;
}

interface ComponentCssPart {
  // part 名称
  name: string;
  // part 描述
  description: string;
}

interface ComponentCssProperty {
  // CSS 自定义属性名称
  name: string;
  // CSS 自定义属性描述
  description: string;
}

interface Component {
  // 标签名
  tagName: string;
  // 组件说明
  description: string;
  // 组件文档链接
  docUrl: string;
  // 组件用法
  usage: string;
  properties: ComponentProperty[];
  methods: ComponentMethod[];
  events: ComponentEvent[];
  slots: ComponentSlot[];
  cssParts: ComponentCssPart[];
  cssProperties: ComponentCssProperty[];
}

export const components: Component[] = ${JSON.stringify(components, null, 2)};
`;

  const outDir = path.join(repoRoot, 'packages', 'mcp', 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  const jsPath = path.join(outDir, 'components.ts');
  fs.writeFileSync(jsPath, js, 'utf8');

  // 简要输出
  console.log(`已生成组件元数据：\n- ${path.relative(repoRoot, jsPath)}`);
};
