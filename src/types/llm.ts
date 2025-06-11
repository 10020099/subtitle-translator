// LLM 提供商枚举
export enum LLMProvider {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  CUSTOM_OPENAI = 'custom-openai',
  LOCAL = 'local'
}

// LLM 配置接口
export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string; // 用于本地模型或自定义端点
  temperature?: number;
  maxTokens?: number;
  customName?: string; // 自定义提供商名称
  region?: string; // Gemini 区域设置
}

// 翻译请求接口
export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string; // 上下文信息
}

// 翻译响应接口
export interface TranslationResponse {
  translatedText: string;
  confidence?: number;
  error?: string;
}

// 批量翻译进度接口
export interface TranslationProgress {
  total: number;
  completed: number;
  current: string; // 当前正在翻译的文本
  errors: string[];
}

// 支持的语言接口
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// LLM 客户端接口
export interface LLMClient {
  translate(request: TranslationRequest): Promise<TranslationResponse>;
  isConfigured(): boolean;
  validateConfig(): Promise<boolean>;
}
