'use client';

import React, { useState } from 'react';
import { LLMProvider, LLMConfig } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';

export default function ModelsPage() {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(LLMProvider.OPENAI);
  const [customModel, setCustomModel] = useState('');

  const supportedModels = LLMFactory.getSupportedModels(selectedProvider);
  const customModelSuggestions = LLMFactory.getCustomModelSuggestions(selectedProvider);
  const providerInfo = LLMFactory.getProviderInfo(selectedProvider);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            模型支持展示
          </h1>
          <p className="text-gray-600">
            查看各个提供商支持的模型和自定义模型功能
          </p>
        </div>

        {/* 提供商选择 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">选择提供商</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.values(LLMProvider).map((provider) => {
              const info = LLMFactory.getProviderInfo(provider);
              return (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`
                    p-3 text-sm font-medium rounded-lg border-2 transition-colors text-center
                    ${selectedProvider === provider
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 预设模型 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 预设模型 ({supportedModels.length} 个)
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {supportedModels.map((model, index) => (
                <div
                  key={model}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${index === 0 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}
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

          {/* 自定义模型建议 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 自定义模型建议
            </h3>
            
            {customModelSuggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  以下是 {providerInfo.name} 的常用自定义模型:
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customModelSuggestions.map((model) => (
                    <div
                      key={model}
                      className="p-3 rounded-lg border border-blue-200 bg-blue-50"
                    >
                      <span className="font-mono text-sm text-blue-800">{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>暂无自定义模型建议</p>
              </div>
            )}
          </div>
        </div>

        {/* 自定义模型测试 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 自定义模型测试
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入自定义模型名称
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="例如: gpt-4o-2024-11-20"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            </div>
            
            {customModel && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">模型信息预览:</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>提供商:</strong> {providerInfo.name}</div>
                  <div><strong>模型名称:</strong> <code className="bg-gray-200 px-1 rounded">{customModel}</code></div>
                  <div><strong>是否为预设:</strong> {supportedModels.includes(customModel) ? '是' : '否'}</div>
                  <div><strong>配置要求:</strong> 
                    {providerInfo.requiresApiKey && ' API密钥'}
                    {providerInfo.requiresBaseUrl && ' 自定义地址'}
                    {!providerInfo.requiresApiKey && !providerInfo.requiresBaseUrl && ' 无特殊要求'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📖 自定义模型使用说明
          </h3>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <strong>1. 预设模型:</strong> 从下拉菜单中选择经过测试的推荐模型
            </div>
            <div>
              <strong>2. 自定义模型:</strong> 选择"自定义模型..."选项，然后输入任何模型名称
            </div>
            <div>
              <strong>3. 模型建议:</strong> 点击建议的模型名称快速填入
            </div>
            <div>
              <strong>4. 兼容性:</strong> 确保您的API提供商支持所输入的模型名称
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
            href="/providers"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            查看提供商
          </a>
        </div>
      </div>
    </div>
  );
}
