'use client';

import React, { useState } from 'react';
import { LLMProvider, LLMConfig } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';

interface LLMConfigPanelProps {
  config: LLMConfig;
  onChange: (config: LLMConfig) => void;
  onValidate?: (isValid: boolean) => void;
}

export default function LLMConfigPanel({ config, onChange, onValidate }: LLMConfigPanelProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const handleProviderChange = (provider: LLMProvider) => {
    const providerInfo = LLMFactory.getProviderInfo(provider);
    const newConfig: LLMConfig = {
      ...config,
      provider,
      model: LLMFactory.getDefaultModel(provider),
      apiKey: '',
      baseUrl: providerInfo.requiresBaseUrl ? (providerInfo.baseUrlPlaceholder || '') : undefined,
      customName: providerInfo.supportsCustomName ? '' : undefined
    };
    onChange(newConfig);
    setValidationResult(null);
  };

  const handleConfigChange = (updates: Partial<LLMConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(newConfig);
    setValidationResult(null);
  };

  const handleValidateConfig = async () => {
    setIsValidating(true);
    try {
      const result = await LLMFactory.validateConfig(config);
      setValidationResult(result);
      onValidate?.(result.valid);
    } catch (error) {
      setValidationResult({
        valid: false,
        error: error instanceof Error ? error.message : '验证失败'
      });
      onValidate?.(false);
    } finally {
      setIsValidating(false);
    }
  };

  const supportedModels = LLMFactory.getSupportedModels(config.provider);
  const providerInfo = LLMFactory.getProviderInfo(config.provider);
  const customModelSuggestions = LLMFactory.getCustomModelSuggestions(config.provider);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        LLM 配置
      </h2>

      <div className="space-y-4">
        {/* API 提供商选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API 提供商
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(LLMProvider).map((provider) => {
              const info = LLMFactory.getProviderInfo(provider);
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`
                    p-3 text-sm font-medium rounded-lg border-2 transition-colors text-left
                    ${config.provider === provider
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-semibold">{info.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{info.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 模型选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            模型
          </label>
          <div className="space-y-3">
            {/* 模型输入方式选择 */}
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modelInputType"
                  value="preset"
                  checked={supportedModels.filter(m => m !== 'custom-model').includes(config.model)}
                  onChange={() => {
                    const firstPresetModel = supportedModels.filter(m => m !== 'custom-model')[0];
                    if (firstPresetModel) {
                      handleConfigChange({ model: firstPresetModel });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">预设模型</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="modelInputType"
                  value="custom"
                  checked={!supportedModels.filter(m => m !== 'custom-model').includes(config.model)}
                  onChange={() => {
                    if (supportedModels.filter(m => m !== 'custom-model').includes(config.model)) {
                      handleConfigChange({ model: '' });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">自定义模型</span>
              </label>
            </div>

            {/* 预设模型选择 */}
            {supportedModels.filter(m => m !== 'custom-model').includes(config.model) && (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={config.model}
                onChange={(e) => handleConfigChange({ model: e.target.value })}
              >
                {supportedModels.filter(m => m !== 'custom-model').map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}

            {/* 自定义模型输入 */}
            {!supportedModels.filter(m => m !== 'custom-model').includes(config.model) && (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="输入自定义模型名称，如: gpt-4.1-2025-04-14"
                    value={config.model}
                    onChange={(e) => handleConfigChange({ model: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => handleConfigChange({ model: LLMFactory.getDefaultModel(config.provider) })}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="使用默认模型"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                {/* 模型建议 */}
                {customModelSuggestions.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">常用模型建议 (点击快速填入):</div>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {customModelSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleConfigChange({ model: suggestion })}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {supportedModels.filter(m => m !== 'custom-model').includes(config.model)
              ? '使用经过测试的预设模型'
              : '输入任何模型名称，确保您的API提供商支持该模型'
            }
          </p>
        </div>

        {/* 自定义提供商名称 */}
        {providerInfo.supportsCustomName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提供商名称
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="自定义提供商名称"
              value={config.customName || ''}
              onChange={(e) => handleConfigChange({ customName: e.target.value })}
            />
          </div>
        )}

        {/* API 密钥 */}
        {(providerInfo.requiresApiKey || config.provider === LLMProvider.CUSTOM_OPENAI || !providerInfo.requiresBaseUrl) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 密钥 {!providerInfo.requiresApiKey && config.provider !== LLMProvider.CUSTOM_OPENAI && '(可选)'}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder={providerInfo.apiKeyPlaceholder || '请输入API密钥'}
              value={config.apiKey || ''}
              onChange={(e) => handleConfigChange({ apiKey: e.target.value })}
            />
            {config.provider === LLMProvider.CUSTOM_OPENAI && (
              <p className="mt-1 text-xs text-gray-500">
                大多数第三方服务都需要 API 密钥进行身份验证
              </p>
            )}
          </div>
        )}

        {/* API 地址 */}
        {providerInfo.requiresBaseUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API 地址
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder={providerInfo.baseUrlPlaceholder || 'https://api.example.com'}
              value={config.baseUrl || ''}
              onChange={(e) => handleConfigChange({ baseUrl: e.target.value })}
            />

            {/* 第三方服务快速配置 */}
            {config.provider === LLMProvider.CUSTOM_OPENAI && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">常用服务快速配置 (点击自动填入):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'DeepSeek', url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-v3' },
                    { name: '智谱AI', url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-plus' },
                    { name: '月之暗面', url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k' },
                    { name: '硅基流动', url: 'https://api.siliconflow.cn/v1/chat/completions', model: 'deepseek-v3' },
                    { name: '零一万物', url: 'https://api.lingyiwanwu.com/v1/chat/completions', model: 'yi-large' },
                    { name: 'Ollama', url: 'http://localhost:11434/v1/chat/completions', model: 'llama3.3:70b' }
                  ].map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => {
                        handleConfigChange({
                          baseUrl: service.url,
                          model: service.model,
                          customName: service.name
                        });
                      }}
                      className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-left border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-gray-500 truncate mt-1">{service.model}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              {config.provider === LLMProvider.LOCAL
                ? '支持 Ollama、LocalAI 等 OpenAI 兼容的本地模型服务'
                : '支持 OpenAI API 格式的第三方服务'
              }
            </p>
          </div>
        )}

        {/* 高级设置 */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            高级设置
            <svg className="inline w-4 h-4 ml-1 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
            {/* 温度设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                温度 (Temperature): {config.temperature || 0.3}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
                value={config.temperature || 0.3}
                onChange={(e) => handleConfigChange({ temperature: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守 (0)</span>
                <span>创造性 (1)</span>
              </div>
            </div>

            {/* 最大令牌数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大令牌数
              </label>
              <input
                type="number"
                min="100"
                max="4000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                value={config.maxTokens || 1000}
                onChange={(e) => handleConfigChange({ maxTokens: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </details>

        {/* 验证按钮 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleValidateConfig}
            disabled={isValidating || (providerInfo.requiresApiKey && !config.apiKey) || (providerInfo.requiresBaseUrl && !config.baseUrl)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? '验证中...' : '验证配置'}
          </button>

          {/* 验证结果 */}
          {validationResult && (
            <div className={`mt-3 p-3 rounded-md ${
              validationResult.valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {validationResult.valid ? (
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm ${
                  validationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.valid ? '配置验证成功' : validationResult.error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
