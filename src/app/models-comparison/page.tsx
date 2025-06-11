'use client';

import React from 'react';
import { LLMProvider } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';

export default function ModelsComparisonPage() {
  const providers = Object.values(LLMProvider);

  const getModelInfo = (provider: LLMProvider, model: string) => {
    const isDefault = LLMFactory.getDefaultModel(provider) === model;
    const isLatest = model.includes('2024') || model.includes('2025') || model.includes('latest') || model.includes('exp');
    const isReasoning = model.includes('o1') || model.includes('reasoning') || model.includes('thinking');
    
    return { isDefault, isLatest, isReasoning };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            最新模型对比 (2024年12月)
          </h1>
          <p className="text-gray-600">
            查看各个 AI 提供商的最新模型和推荐配置
          </p>
        </div>

        {/* 模型对比表格 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    提供商
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    推荐模型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所有可用模型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    特色功能
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => {
                  const info = LLMFactory.getProviderInfo(provider);
                  const models = LLMFactory.getSupportedModels(provider);
                  const defaultModel = LLMFactory.getDefaultModel(provider);
                  const suggestions = LLMFactory.getCustomModelSuggestions(provider);

                  return (
                    <tr key={provider} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {info.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {info.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {defaultModel}
                          </div>
                          <div className="text-xs text-gray-500">
                            默认推荐
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {models.slice(0, 5).map((model) => {
                            const { isDefault, isLatest, isReasoning } = getModelInfo(provider, model);
                            return (
                              <div key={model} className="flex items-center space-x-2">
                                <span className={`text-xs font-mono ${isDefault ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                                  {model}
                                </span>
                                {isLatest && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    最新
                                  </span>
                                )}
                                {isReasoning && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    推理
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {models.length > 5 && (
                            <div className="text-xs text-gray-400">
                              +{models.length - 5} 更多模型...
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {provider === LLMProvider.OPENAI && (
                            <>
                              <div className="text-xs text-blue-600">• o1 推理模型</div>
                              <div className="text-xs text-blue-600">• GPT-4o 多模态</div>
                              <div className="text-xs text-blue-600">• 函数调用</div>
                            </>
                          )}
                          {provider === LLMProvider.CLAUDE && (
                            <>
                              <div className="text-xs text-purple-600">• 长上下文 (200K)</div>
                              <div className="text-xs text-purple-600">• 代码生成</div>
                              <div className="text-xs text-purple-600">• 安全对话</div>
                            </>
                          )}
                          {provider === LLMProvider.GEMINI && (
                            <>
                              <div className="text-xs text-green-600">• Gemini 2.0 Flash</div>
                              <div className="text-xs text-green-600">• 多模态理解</div>
                              <div className="text-xs text-green-600">• 免费额度</div>
                            </>
                          )}
                          {provider === LLMProvider.CUSTOM_OPENAI && (
                            <>
                              <div className="text-xs text-orange-600">• 第三方服务</div>
                              <div className="text-xs text-orange-600">• 价格优势</div>
                              <div className="text-xs text-orange-600">• 中文优化</div>
                            </>
                          )}
                          {provider === LLMProvider.LOCAL && (
                            <>
                              <div className="text-xs text-gray-600">• 完全离线</div>
                              <div className="text-xs text-gray-600">• 数据隐私</div>
                              <div className="text-xs text-gray-600">• 无使用限制</div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 最新模型亮点 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🧠 OpenAI o1 系列
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• o1-preview: 复杂推理任务</li>
              <li>• o1-mini: 快速推理模型</li>
              <li>• 适合数学、编程、科学问题</li>
              <li>• 更强的逻辑思维能力</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ⚡ Gemini 2.0 Flash
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• 下一代多模态模型</li>
              <li>• 实时流式处理</li>
              <li>• 图像生成能力</li>
              <li>• 思维链推理</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              🚀 Claude 3.5 最新版
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>• Sonnet: 平衡性能与成本</li>
              <li>• Haiku: 快速响应</li>
              <li>• 计算机使用能力</li>
              <li>• 改进的代码理解</li>
            </ul>
          </div>
        </div>

        {/* 使用建议 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            💡 模型选择建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <strong>字幕翻译推荐:</strong>
              <ul className="mt-1 space-y-1">
                <li>• 高质量: GPT-4o, Claude-3.5-Sonnet</li>
                <li>• 性价比: GPT-4o-mini, Gemini-1.5-Flash</li>
                <li>• 中文优化: DeepSeek-Chat, GLM-4-Plus</li>
              </ul>
            </div>
            <div>
              <strong>特殊需求:</strong>
              <ul className="mt-1 space-y-1">
                <li>• 隐私保护: 本地模型 (Llama, Qwen)</li>
                <li>• 批量处理: Claude-3.5-Haiku</li>
                <li>• 复杂语境: o1-preview</li>
              </ul>
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
            href="/models"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            模型测试
          </a>
        </div>
      </div>
    </div>
  );
}
