'use client';

import React, { useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppStep, TranslationStatus } from '@/types/app';
import FileUploader from '@/components/FileUploader';
import LanguageSelector from '@/components/LanguageSelector';
import LLMConfigPanel from '@/components/LLMConfigPanel';
import TranslationProgress from '@/components/TranslationProgress';
import SubtitlePreview from '@/components/SubtitlePreview';
import DownloadButton from '@/components/DownloadButton';
import ConcurrencySettings from '@/components/ConcurrencySettings';
import TranslationQualitySettings from '@/components/TranslationQualitySettings';
import BatchFileProcessor from '@/components/BatchFileProcessor';
import SettingsPanel from '@/components/SettingsPanel';
import { TranslationService } from '@/lib/llm/translation-service';

export default function Home() {
  const { state, dispatch } = useAppContext();
  const translationServiceRef = useRef<TranslationService | null>(null);

  const handleSourceLanguageChange = (language: string) => {
    dispatch({ type: 'SET_SOURCE_LANGUAGE', payload: language });
  };

  const handleTargetLanguageChange = (language: string) => {
    dispatch({ type: 'SET_TARGET_LANGUAGE', payload: language });
  };

  const handleLLMConfigChange = (config: any) => {
    dispatch({ type: 'SET_LLM_CONFIG', payload: config });
  };

  const handleStartTranslation = async () => {
    if (!state.subtitleFile) return;

    dispatch({ type: 'START_TRANSLATION' });

    try {
      const translationService = new TranslationService(
        state.llmConfig,
        state.settings.concurrency,
        state.settings.translationQuality,
        (progress) => {
          dispatch({ type: 'UPDATE_TRANSLATION_PROGRESS', payload: progress });
        },
        (status) => {
          dispatch({ type: 'SET_TRANSLATION_STATUS', payload: status });
        }
      );

      // 保存服务引用以便暂停/恢复
      translationServiceRef.current = translationService;

      const translatedFile = await translationService.translateSubtitleFile(
        state.subtitleFile,
        state.sourceLanguage,
        state.targetLanguage
      );

      dispatch({ type: 'SET_SUBTITLE_FILE', payload: translatedFile });
      dispatch({ type: 'FINISH_TRANSLATION' });
    } catch (error) {
      dispatch({
        type: 'ADD_ERROR',
        payload: `翻译失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
      dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.CONFIGURE });
    }
  };

  const handlePauseTranslation = () => {
    translationServiceRef.current?.pause();
  };

  const handleResumeTranslation = () => {
    translationServiceRef.current?.resume();
  };

  const handleCancelTranslation = () => {
    translationServiceRef.current?.cancel();
    dispatch({ type: 'CANCEL_TRANSLATION' });
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: AppStep.UPLOAD, label: '上传文件' },
      { key: AppStep.CONFIGURE, label: '配置设置' },
      { key: AppStep.TRANSLATE, label: '翻译处理' },
      { key: AppStep.PREVIEW, label: '预览结果' },
      { key: AppStep.DOWNLOAD, label: '下载文件' }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === state.currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStepIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {index + 1}
              </div>
              <span
                className={`
                  ml-2 text-sm font-medium
                  ${index <= currentStepIndex ? 'text-primary-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  w-12 h-0.5 mx-4
                  ${index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case AppStep.UPLOAD:
        return <FileUploader />;

      case AppStep.CONFIGURE:
        return (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                语言设置
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LanguageSelector
                  type="source"
                  label="源语言"
                  value={state.sourceLanguage}
                  onChange={handleSourceLanguageChange}
                  showAutoDetect={true}
                />

                <LanguageSelector
                  type="target"
                  label="目标语言"
                  value={state.targetLanguage}
                  onChange={handleTargetLanguageChange}
                />
              </div>
            </div>

            <LLMConfigPanel
              config={state.llmConfig}
              onChange={handleLLMConfigChange}
            />

            <TranslationQualitySettings
              quality={state.settings.translationQuality}
              onChange={(quality) => dispatch({
                type: 'UPDATE_SETTINGS',
                payload: { translationQuality: quality }
              })}
            />

            <ConcurrencySettings
              settings={state.settings.concurrency}
              onChange={(concurrency) => dispatch({
                type: 'UPDATE_SETTINGS',
                payload: { concurrency: { ...state.settings.concurrency, ...concurrency } }
              })}
            />

            <div className="flex justify-between">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.UPLOAD })}
              >
                返回
              </button>

              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!state.llmConfig.apiKey}
                onClick={handleStartTranslation}
              >
                开始翻译
              </button>
            </div>
          </div>
        );

      case AppStep.TRANSLATE:
        return state.translationProgress ? (
          <TranslationProgress
            progress={state.translationProgress}
            status={state.translationStatus}
            onPause={handlePauseTranslation}
            onResume={handleResumeTranslation}
            onCancel={handleCancelTranslation}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                准备翻译...
              </h2>
            </div>
          </div>
        );

      case AppStep.PREVIEW:
        return state.subtitleFile ? (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <SubtitlePreview
              subtitleFile={state.subtitleFile}
              showOriginal={true}
            />

            <div className="flex justify-between items-center">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.CONFIGURE })}
              >
                重新翻译
              </button>

              <DownloadButton
                subtitleFile={state.subtitleFile}
                targetLanguage={state.targetLanguage}
              />
            </div>
          </div>
        ) : null;

      case AppStep.BATCH:
        return (
          <BatchFileProcessor
            onFilesProcessed={(files) => {
              // 处理批量文件
              console.log('批量文件处理完成:', files);
            }}
            onError={(error) => {
              dispatch({ type: 'ADD_ERROR', payload: error });
            }}
          />
        );

      case AppStep.SETTINGS:
        return <SettingsPanel />;

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">功能开发中...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            字幕翻译器
          </h1>
          <p className="text-gray-600">
            使用AI大语言模型翻译字幕文件的专业工具
          </p>
        </div>

        {/* 导航栏 */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.UPLOAD })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                [AppStep.UPLOAD, AppStep.CONFIGURE, AppStep.TRANSLATE, AppStep.PREVIEW].includes(state.currentStep)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              单文件翻译
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.BATCH })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.currentStep === AppStep.BATCH
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              批量处理
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: AppStep.SETTINGS })}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.currentStep === AppStep.SETTINGS
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              设置
            </button>
          </nav>
        </div>

        {/* 步骤指示器 - 只在单文件翻译模式显示 */}
        {[AppStep.UPLOAD, AppStep.CONFIGURE, AppStep.TRANSLATE, AppStep.PREVIEW].includes(state.currentStep) && renderStepIndicator()}

        {/* 主要内容 */}
        <div className="fade-in">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
