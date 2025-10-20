/**
 * i18n 配置
 * 基于 Cherry Studio 的多语言系统
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import zhCN from './locales/zh-cn.json';
import enUS from './locales/en-us.json';

// 支持的语言列表
export type LanguageVarious = 'zh-CN' | 'en-US';

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
};

// 获取系统语言
function getSystemLanguage(): LanguageVarious {
  if (typeof window !== 'undefined') {
    const lang = navigator.language;
    if (lang.startsWith('zh')) return 'zh-CN';
    return 'en-US';
  }
  return 'zh-CN';
}

// 获取存储的语言设置
function getLanguage(): LanguageVarious {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as LanguageVarious;
    return stored || getSystemLanguage();
  }
  return 'zh-CN';
}

// 初始化 i18next
i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  missingKeyHandler: (_lng, _ns, key) => {
    console.warn(`Missing translation: ${key}`);
  },
});

// 切换语言
export function changeLanguage(lang: LanguageVarious) {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

export default i18n;
