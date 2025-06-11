'use client';

import React, { useState } from 'react';
import { LLMProvider, LLMConfig } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';

export default function ModelTestPage() {
  const [config, setConfig] = useState<LLMConfig>({
    provider: LLMProvider.OPENAI,
    model: '',
    temperature: 0.3,
    maxTokens: 1000
  });

  const [testResults, setTestResults] = useState<{
    isPreset: boolean;
    isValid: boolean;
    suggestions: string[];
  } | null>(null);

  const handleModelChange = (model: string) => {
    const newConfig = { ...config, model };
    setConfig(newConfig);
    
    // 测试模型
    const supportedModels = LLMFactory.getSupportedModels(config.provider);
    const suggestions = LLMFactory.getCustomModelSuggestions(config.provider);
    
    setTestResults({
      isPreset: supportedModels.filter(m => m !== 'custom-model').includes(model),
      isValid: model.length > 0,
      suggestions
    });
  };

  const handleProviderChange = (provider: LLMProvider) => {
    const newConfig = {
      ...config,
      provider,
      model: LLMFactory.getDefaultModel(provider)
    };
    setConfig(newConfig);
    handleModelChange(newConfig.model);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            自定义模型输入测试 (2025年6月)
          </h1>
          <p className="text-gray-600">
            测试最新的模型支持和自定义输入功能
          </p>
        </div>

        {/* 提供商选择 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">选择提供商</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.values(LLMProvider).map((provider) => {
              const info = LLMFactory.getProviderInfo(provider);
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`
                    p-3 text-sm font-medium rounded-lg border-2 transition-colors
                    ${config.provider === provider
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {info.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 模型输入测试 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">模型输入测试</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入任何模型名称
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="例如: gpt-4.1-2025-04-14, claude-opus-4-20250514, gemini-2.5-pro-preview-06-05"
                value={config.model}
                onChange={(e) => handleModelChange(e.target.value)}
              />
            </div>

            {/* 快速选择按钮 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">快速选择最新模型:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'gpt-4.1-2025-04-14',
                  'o3-pro-2025-06-10',
                  'claude-opus-4-20250514',
                  'gemini-2.5-pro-preview-06-05',
                  'deepseek-r1-671b',
                  'llama4:8b'
                ].map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelChange(model)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        {testResults && config.model && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">测试结果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">模型信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-20 text-gray-600">模型名称:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{config.model}</code>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-600">提供商:</span>
                    <span>{LLMFactory.getProviderInfo(config.provider).name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-600">类型:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      testResults.isPreset 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {testResults.isPreset ? '预设模型' : '自定义模型'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20 text-gray-600">状态:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      testResults.isValid 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {testResults.isValid ? '有效' : '无效'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">配置预览</h3>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <pre>{JSON.stringify(config, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 当前提供商的所有模型 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              预设模型 ({LLMFactory.getSupportedModels(config.provider).filter(m => m !== 'custom-model').length} 个)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {LLMFactory.getSupportedModels(config.provider).filter(m => m !== 'custom-model').map((model, index) => (
                <div
                  key={model}
                  className={`
                    p-2 rounded border cursor-pointer transition-colors
                    ${config.model === model 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${index === 0 ? 'ring-2 ring-green-200' : ''}
                  `}
                  onClick={() => handleModelChange(model)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{model}</span>
                    {index === 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        默认
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              自定义模型建议 ({testResults?.suggestions.length || 0} 个)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(testResults?.suggestions || []).map((model) => (
                <div
                  key={model}
                  className={`
                    p-2 rounded border cursor-pointer transition-colors
                    ${config.model === model 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                    }
                  `}
                  onClick={() => handleModelChange(model)}
                >
                  <span className="font-mono text-sm text-blue-800">{model}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mr-4"
          >
            开始翻译
          </a>
          <a
            href="/models-comparison"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            查看模型对比
          </a>
        </div>
      </div>
    </div>
  );
}
