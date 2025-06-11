'use client';

import React, { useState } from 'react';
import { LLMProvider, LLMConfig } from '@/types/llm';
import { LLMFactory } from '@/lib/llm/llm-factory';
import LLMConfigPanel from '@/components/LLMConfigPanel';

export default function CustomOpenAIPage() {
  const [config, setConfig] = useState<LLMConfig>({
    provider: LLMProvider.CUSTOM_OPENAI,
    model: 'deepseek-v3',
    temperature: 0.3,
    maxTokens: 1000,
    apiKey: '',
    baseUrl: '',
    customName: ''
  });

  const handleConfigChange = (newConfig: LLMConfig) => {
    setConfig(newConfig);
  };

  const services = [
    {
      name: 'DeepSeek',
      description: '国产大模型，推理能力强，价格便宜',
      url: 'https://api.deepseek.com/v1/chat/completions',
      models: ['deepseek-v3', 'deepseek-reasoner', 'deepseek-chat'],
      pricing: '¥0.14/1M tokens',
      features: ['强推理能力', '代码生成', '数学解题', '中文优化']
    },
    {
      name: '智谱AI (GLM)',
      description: '清华大学技术，多模态能力强',
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      models: ['glm-4-plus', 'glm-4-flash', 'glm-4-0520'],
      pricing: '¥0.1/1M tokens',
      features: ['多模态', '长文本', '函数调用', '中文理解']
    },
    {
      name: '月之暗面 (Kimi)',
      description: '超长上下文，文档处理能力强',
      url: 'https://api.moonshot.cn/v1/chat/completions',
      models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
      pricing: '¥0.12/1M tokens',
      features: ['200万字上下文', '文档分析', '网页总结', '多语言']
    },
    {
      name: '硅基流动',
      description: '多模型聚合平台，模型选择丰富',
      url: 'https://api.siliconflow.cn/v1/chat/completions',
      models: ['deepseek-v3', 'qwen2.5-72b-instruct', 'llama-3.1-70b'],
      pricing: '¥0.07/1M tokens',
      features: ['多模型选择', '价格优势', '稳定服务', 'API兼容']
    },
    {
      name: '零一万物 (Yi)',
      description: '李开复团队，平衡性能与成本',
      url: 'https://api.lingyiwanwu.com/v1/chat/completions',
      models: ['yi-large', 'yi-lightning', 'yi-medium'],
      pricing: '¥0.2/1M tokens',
      features: ['高质量输出', '快速响应', '多语言', '安全可靠']
    },
    {
      name: 'Ollama (本地)',
      description: '本地部署，完全离线，数据隐私',
      url: 'http://localhost:11434/v1/chat/completions',
      models: ['llama3.3:70b', 'qwen2.5:32b', 'deepseek-r1:32b'],
      pricing: '免费 (本地计算)',
      features: ['完全离线', '数据隐私', '无限使用', '自定义模型']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            自定义 OpenAI 兼容服务配置
          </h1>
          <p className="text-gray-600">
            支持各种第三方 AI 服务，享受更多选择和更优价格
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 配置面板 */}
          <div className="lg:order-2">
            <div className="sticky top-8">
              <LLMConfigPanel
                config={config}
                onChange={handleConfigChange}
              />
            </div>
          </div>

          {/* 服务列表 */}
          <div className="lg:order-1 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              支持的服务商
            </h2>
            
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {service.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleConfigChange({
                        ...config,
                        baseUrl: service.url,
                        model: service.models[0],
                        customName: service.name
                      });
                    }}
                    className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                  >
                    快速配置
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">API 地址</div>
                    <code className="text-xs bg-gray-100 p-1 rounded block truncate">
                      {service.url}
                    </code>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">参考价格</div>
                    <div className="text-xs text-green-600 font-medium">
                      {service.pricing}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">支持模型</div>
                  <div className="flex flex-wrap gap-1">
                    {service.models.map((model) => (
                      <span
                        key={model}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200"
                        onClick={() => handleConfigChange({ ...config, model })}
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">特色功能</div>
                  <div className="flex flex-wrap gap-1">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 配置说明 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📖 配置说明
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">基本配置步骤:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>选择或点击"快速配置"按钮</li>
                <li>输入对应服务的 API 密钥</li>
                <li>选择或输入模型名称</li>
                <li>点击"验证配置"测试连接</li>
                <li>开始使用翻译功能</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">注意事项:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>需要先注册对应服务获取 API 密钥</li>
                <li>不同服务的计费方式可能不同</li>
                <li>建议先小量测试再大批量使用</li>
                <li>本地服务需要先启动对应程序</li>
                <li>确保网络连接正常</li>
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
            href="/model-test"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            模型测试
          </a>
        </div>
      </div>
    </div>
  );
}
