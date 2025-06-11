'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, AppContextType, AppStep, TranslationStatus, TranslationQuality } from '@/types/app';
import { LLMProvider } from '@/types/llm';
import { SUPPORTED_LANGUAGES } from '@/lib/utils/language-utils';

// 初始状态
const initialState: AppState = {
  uploadedFile: null,
  subtitleFile: null,
  sourceLanguage: 'auto',
  targetLanguage: 'zh-CN',
  availableLanguages: SUPPORTED_LANGUAGES,
  llmConfig: {
    provider: LLMProvider.OPENAI,
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1000
  },
  isTranslating: false,
  translationStatus: TranslationStatus.IDLE,
  translationProgress: null,
  settings: {
    concurrency: {
      maxConcurrent: 3,
      mode: 'medium',
      batchSize: 5,
      delayBetweenRequests: 200
    },
    translationQuality: TranslationQuality.STANDARD,
    autoSave: true,
    preserveOriginal: true
  },
  currentStep: AppStep.UPLOAD,
  showPreview: false,
  errors: []
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_UPLOADED_FILE':
      return {
        ...state,
        uploadedFile: action.payload,
        currentStep: AppStep.CONFIGURE,
        errors: []
      };

    case 'SET_SUBTITLE_FILE':
      return {
        ...state,
        subtitleFile: action.payload
      };

    case 'SET_SOURCE_LANGUAGE':
      return {
        ...state,
        sourceLanguage: action.payload
      };

    case 'SET_TARGET_LANGUAGE':
      return {
        ...state,
        targetLanguage: action.payload
      };

    case 'SET_LLM_CONFIG':
      return {
        ...state,
        llmConfig: action.payload
      };

    case 'START_TRANSLATION':
      return {
        ...state,
        isTranslating: true,
        translationStatus: TranslationStatus.RUNNING,
        currentStep: AppStep.TRANSLATE,
        translationProgress: {
          total: state.subtitleFile?.entries.length || 0,
          completed: 0,
          current: '',
          errors: []
        },
        errors: []
      };

    case 'PAUSE_TRANSLATION':
      return {
        ...state,
        translationStatus: TranslationStatus.PAUSED
      };

    case 'RESUME_TRANSLATION':
      return {
        ...state,
        translationStatus: TranslationStatus.RUNNING
      };

    case 'CANCEL_TRANSLATION':
      return {
        ...state,
        isTranslating: false,
        translationStatus: TranslationStatus.IDLE,
        translationProgress: null,
        currentStep: AppStep.CONFIGURE
      };

    case 'UPDATE_TRANSLATION_PROGRESS':
      return {
        ...state,
        translationProgress: action.payload
      };

    case 'SET_TRANSLATION_STATUS':
      return {
        ...state,
        translationStatus: action.payload
      };

    case 'FINISH_TRANSLATION':
      return {
        ...state,
        isTranslating: false,
        translationStatus: TranslationStatus.COMPLETED,
        currentStep: AppStep.PREVIEW
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        showPreview: !state.showPreview
      };

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload]
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'RESET_APP':
      return {
        ...initialState,
        availableLanguages: state.availableLanguages,
        settings: state.settings // 保留用户设置
      };

    default:
      return state;
  }
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
