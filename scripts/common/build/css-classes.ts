import { docOrigin } from './docs.js';
import { getI18nData, I18nLanguage } from './i18n.js';

interface CssClass {
  name: string;
  description: string;
  example: string;
  docUrl: string;
}

/**
 * 获取 CSS 类，用于写入到 css-data.{language}.json 及 web-types.{language}.json 中
 * @param language i18n 语言
 * @param pathLanguage 文档路径中的语言，不传该参数，则使用 language；传入 null 则使用不含语言的路径
 */
export const getCssClasses = (
  language: I18nLanguage,
  _pathLanguage?: I18nLanguage | null,
): CssClass[] => {
  const i18nData = getI18nData(language);

  const classes: { name: string; docUrl: string }[] = [
    { name: 'mdui-theme-light', docUrl: '/styles/dark-mode' },
    { name: 'mdui-theme-dark', docUrl: '/styles/dark-mode' },
    { name: 'mdui-theme-auto', docUrl: '/styles/dark-mode' },
    { name: 'mdui-prose', docUrl: '/styles/prose' },
    { name: 'mdui-table', docUrl: '/styles/prose' },
  ];

  const pathLanguage = _pathLanguage === undefined ? language : _pathLanguage;
  const languagePath = pathLanguage ? `${pathLanguage}/` : '';

  return classes.map((cls) => ({
    name: cls.name,
    description: i18nData.cssClasses[cls.name].description,
    example: i18nData.cssClasses[cls.name].example,
    docUrl: `${docOrigin}/${languagePath}docs/2${cls.docUrl}`,
  }));
};
