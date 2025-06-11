import React from 'react';
import { SubtitleFile } from './subtitle';
import { LLMConfig, TranslationProgress, Language } from './llm';

// 翻译状态枚举
export enum TranslationStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 翻译质量模式
export enum TranslationQuality {
  FAST = 'fast',
  STANDARD = 'standard',
  PRECISE = 'precise'
}

// 并发设置接口
export interface ConcurrencySettings {
  maxConcurrent: number;
  mode: 'low' | 'medium' | 'high' | 'custom';
  batchSize: number;
  delayBetweenRequests: number;
}

// 应用设置接口
export interface AppSettings {
  concurrency: ConcurrencySettings;
  translationQuality: TranslationQuality;
  autoSave: boolean;
  preserveOriginal: boolean;
}

// 应用状态接口
export interface AppState {
  // 文件相关
  uploadedFile: File | null;
  subtitleFile: SubtitleFile | null;

  // 语言设置
  sourceLanguage: string;
  targetLanguage: string;
  availableLanguages: Language[];

  // LLM 配置
  llmConfig: LLMConfig;

  // 翻译状态
  isTranslating: boolean;
  translationStatus: TranslationStatus;
  translationProgress: TranslationProgress | null;

  // 应用设置
  settings: AppSettings;

  // UI 状态
  currentStep: AppStep;
  showPreview: boolean;
  errors: string[];
}

// 应用步骤枚举
export enum AppStep {
  UPLOAD = 'upload',
  CONFIGURE = 'configure',
  TRANSLATE = 'translate',
  PREVIEW = 'preview',
  DOWNLOAD = 'download',
  SETTINGS = 'settings',
  BATCH = 'batch'
}

// 应用动作类型
export type AppAction =
  | { type: 'SET_UPLOADED_FILE'; payload: File }
  | { type: 'SET_SUBTITLE_FILE'; payload: SubtitleFile }
  | { type: 'SET_SOURCE_LANGUAGE'; payload: string }
  | { type: 'SET_TARGET_LANGUAGE'; payload: string }
  | { type: 'SET_LLM_CONFIG'; payload: LLMConfig }
  | { type: 'START_TRANSLATION' }
  | { type: 'PAUSE_TRANSLATION' }
  | { type: 'RESUME_TRANSLATION' }
  | { type: 'CANCEL_TRANSLATION' }
  | { type: 'UPDATE_TRANSLATION_PROGRESS'; payload: TranslationProgress }
  | { type: 'SET_TRANSLATION_STATUS'; payload: TranslationStatus }
  | { type: 'FINISH_TRANSLATION' }
  | { type: 'SET_CURRENT_STEP'; payload: AppStep }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_APP' };

// 应用上下文接口
export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}
