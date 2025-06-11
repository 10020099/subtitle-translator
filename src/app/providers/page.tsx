'use client';

import React, { useState } from 'react';
import { LLMProvider, LLMConfig } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';
import LLMConfigPanel from '@/components/LLMConfigPanel';

export default function ProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(LLMProvider.OPENAI);
  const [config, setConfig] = useState<LLMConfig>({
    provider: LLMProvider.OPENAI,
    model: LLMFactory.getDefaultModel(LLMProvider.OPENAI),
    temperature: 0.3,
    maxTokens: 1000
  });

  const handleProviderSelect = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    const newConfig: LLMConfig = {
      provider,
      model: LLMFactory.getDefaultModel(provider),
      temperature: 0.3,
      maxTokens: 1000
    };
    setConfig(newConfig);
  };

  const handleConfigChange = (newConfig: LLMConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LLM 提供商支持
          </h1>
          <p className="text-gray-600">
            字幕翻译器现在支持多种 AI 服务提供商
          </p>
        </div>

        {/* 提供商概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.values(LLMProvider).map((provider) => {
            const info = LLMFactory.getProviderInfo(provider);
            const models = LLMFactory.getSupportedModels(provider);
            
            return (
              <div
                key={provider}
                className={`
                  bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all
                  ${selectedProvider === provider
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {info.name}
                  </h3>
                  {selectedProvider === provider && (
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {info.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <span className={`w-2 h-2 rounded-full mr-2 ${info.requiresApiKey ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                    <span className="text-gray-600">
                      {info.requiresApiKey ? '需要 API 密钥' : 'API 密钥可选'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className={`w-2 h-2 rounded-full mr-2 ${info.requiresBaseUrl ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
                    <span className="text-gray-600">
                      {info.requiresBaseUrl ? '需要自定义地址' : '使用默认地址'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full mr-2 bg-purple-400"></span>
                    <span className="text-gray-600">
                      {models.length} 个可用模型
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <strong>推荐模型:</strong> {LLMFactory.getDefaultModel(provider)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 配置面板 */}
        <div className="mb-8">
          <LLMConfigPanel
            config={config}
            onChange={handleConfigChange}
          />
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            新增功能特性
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                🚀 Google Gemini 支持
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 支持 Gemini 1.5 Pro 和 Flash 模型</li>
                <li>• 优秀的多语言翻译能力</li>
                <li>• 内置安全过滤机制</li>
                <li>• 高性价比的翻译选择</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                🔧 自定义 OpenAI 兼容
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 支持任何 OpenAI API 兼容服务</li>
                <li>• 可配置自定义提供商名称</li>
                <li>• 灵活的认证方式</li>
                <li>• 支持第三方 AI 服务</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                🏠 增强的本地模型支持
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 预设常用本地模型</li>
                <li>• 支持 Ollama、LocalAI 等</li>
                <li>• 完全离线翻译</li>
                <li>• 数据隐私保护</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                ⚡ 更新的模型支持
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• GPT-4o 和 GPT-4o-mini</li>
                <li>• Claude 3.5 Sonnet 和 Haiku</li>
                <li>• Llama 3.1 系列模型</li>
                <li>• Mixtral 和 Qwen 模型</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            开始使用字幕翻译器
          </a>
        </div>
      </div>
    </div>
  );
}
