import { Language } from '@/types/llm';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'zh-CN', name: '中文（简体）', nativeName: '中文（简体）' },
  { code: 'zh-TW', name: '中文（繁体）', nativeName: '中文（繁體）' },
  { code: 'en', name: '英语', nativeName: 'English' },
  { code: 'ja', name: '日语', nativeName: '日本語' },
  { code: 'ko', name: '韩语', nativeName: '한국어' },
  { code: 'fr', name: '法语', nativeName: 'Français' },
  { code: 'de', name: '德语', nativeName: 'Deutsch' },
  { code: 'es', name: '西班牙语', nativeName: 'Español' },
  { code: 'it', name: '意大利语', nativeName: 'Italiano' },
  { code: 'pt', name: '葡萄牙语', nativeName: 'Português' },
  { code: 'ru', name: '俄语', nativeName: 'Русский' },
  { code: 'ar', name: '阿拉伯语', nativeName: 'العربية' },
  { code: 'hi', name: '印地语', nativeName: 'हिन्दी' },
  { code: 'th', name: '泰语', nativeName: 'ไทย' },
  { code: 'vi', name: '越南语', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: '土耳其语', nativeName: 'Türkçe' },
  { code: 'pl', name: '波兰语', nativeName: 'Polski' },
  { code: 'nl', name: '荷兰语', nativeName: 'Nederlands' },
  { code: 'sv', name: '瑞典语', nativeName: 'Svenska' },
  { code: 'da', name: '丹麦语', nativeName: 'Dansk' },
  { code: 'no', name: '挪威语', nativeName: 'Norsk' },
  { code: 'fi', name: '芬兰语', nativeName: 'Suomi' }
];

/**
 * 根据语言代码获取语言信息
 */
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * 获取语言的显示名称
 */
export function getLanguageDisplayName(code: string): string {
  const language = getLanguageByCode(code);
  return language ? `${language.name} (${language.nativeName})` : code;
}

/**
 * 检测文本语言（简单的启发式方法）
 */
export function detectLanguage(text: string): string {
  const sample = text.substring(0, 200).toLowerCase();
  
  // 中文检测
  if (/[\u4e00-\u9fff]/.test(sample)) {
    // 检测繁体中文特征字符
    if (/[繁體傳統華語臺灣]/.test(sample)) {
      return 'zh-TW';
    }
    return 'zh-CN';
  }
  
  // 日文检测
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(sample)) {
    return 'ja';
  }
  
  // 韩文检测
  if (/[\uac00-\ud7af]/.test(sample)) {
    return 'ko';
  }
  
  // 阿拉伯文检测
  if (/[\u0600-\u06ff]/.test(sample)) {
    return 'ar';
  }
  
  // 俄文检测
  if (/[\u0400-\u04ff]/.test(sample)) {
    return 'ru';
  }
  
  // 泰文检测
  if (/[\u0e00-\u0e7f]/.test(sample)) {
    return 'th';
  }
  
  // 默认返回英语
  return 'en';
}

/**
 * 验证语言代码是否支持
 */
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

/**
 * 获取常用语言列表
 */
export function getPopularLanguages(): Language[] {
  const popularCodes = ['zh-CN', 'en', 'ja', 'ko', 'fr', 'de', 'es'];
  return SUPPORTED_LANGUAGES.filter(lang => popularCodes.includes(lang.code));
}

/**
 * 搜索语言
 */
export function searchLanguages(query: string): Language[] {
  const lowerQuery = query.toLowerCase();
  return SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(lowerQuery) ||
    lang.nativeName.toLowerCase().includes(lowerQuery) ||
    lang.code.toLowerCase().includes(lowerQuery)
  );
}
