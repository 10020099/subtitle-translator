'use client';

import React from 'react';
import { TranslationQuality } from '@/types/app';

interface TranslationQualitySettingsProps {
  quality: TranslationQuality;
  onChange: (quality: TranslationQuality) => void;
}

export default function TranslationQualitySettings({ quality, onChange }: TranslationQualitySettingsProps) {
  const qualityOptions = [
    {
      value: TranslationQuality.FAST,
      name: '快速模式',
      description: '优先速度，适合快速预览',
      icon: '⚡',
      features: [
        '较低的温度参数',
        '较少的上下文信息',
        '更短的提示词',
        '适合批量处理'
      ],
      estimatedSpeed: '快 (2-3倍速度)'
    },
    {
      value: TranslationQuality.STANDARD,
      name: '标准模式',
      description: '平衡质量与速度',
      icon: '⚖️',
      features: [
        '标准温度参数',
        '适量上下文信息',
        '标准提示词模板',
        '推荐日常使用'
      ],
      estimatedSpeed: '中等 (标准速度)'
    },
    {
      value: TranslationQuality.PRECISE,
      name: '精确模式',
      description: '追求最高翻译质量',
      icon: '🎯',
      features: [
        '优化的温度参数',
        '丰富的上下文信息',
        '详细的提示词',
        '多轮验证机制'
      ],
      estimatedSpeed: '慢 (需要更多时间)'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          翻译质量设置
        </h3>
        <div className="text-sm text-gray-500">
          当前: {qualityOptions.find(q => q.value === quality)?.name}
        </div>
      </div>

      <div className="space-y-4">
        {qualityOptions.map((option) => (
          <div
            key={option.value}
            className={`
              relative rounded-lg border-2 p-4 cursor-pointer transition-colors
              ${quality === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
            onClick={() => onChange(option.value)}
          >
            <div className="flex items-start">
              <div className="text-2xl mr-3 mt-1">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-semibold ${
                    quality === option.value ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {option.name}
                  </h4>
                  <div className={`text-sm font-medium ${
                    quality === option.value ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {option.estimatedSpeed}
                  </div>
                </div>
                
                <p className={`text-sm mt-1 ${
                  quality === option.value ? 'text-primary-700' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>

                <div className="mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {option.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`flex items-center text-xs ${
                          quality === option.value ? 'text-primary-600' : 'text-gray-500'
                        }`}
                      >
                        <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 选中指示器 */}
              {quality === option.value && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 质量对比说明 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">质量模式对比</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600">
                <th className="text-left py-2">特性</th>
                <th className="text-center py-2">快速</th>
                <th className="text-center py-2">标准</th>
                <th className="text-center py-2">精确</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr>
                <td className="py-1">翻译速度</td>
                <td className="text-center">⭐⭐⭐</td>
                <td className="text-center">⭐⭐</td>
                <td className="text-center">⭐</td>
              </tr>
              <tr>
                <td className="py-1">翻译质量</td>
                <td className="text-center">⭐</td>
                <td className="text-center">⭐⭐</td>
                <td className="text-center">⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="py-1">上下文理解</td>
                <td className="text-center">⭐</td>
                <td className="text-center">⭐⭐</td>
                <td className="text-center">⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="py-1">API消耗</td>
                <td className="text-center">⭐</td>
                <td className="text-center">⭐⭐</td>
                <td className="text-center">⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
