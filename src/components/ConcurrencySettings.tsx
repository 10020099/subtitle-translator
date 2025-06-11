'use client';

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { ConcurrencySettings as ConcurrencySettingsType } from '@/types/app';

interface ConcurrencySettingsProps {
  settings: ConcurrencySettingsType;
  onChange: (settings: Partial<ConcurrencySettingsType>) => void;
}

export default function ConcurrencySettings({ settings, onChange }: ConcurrencySettingsProps) {
  const { state } = useAppContext();

  const presetModes = [
    {
      key: 'low' as const,
      name: '低性能模式',
      description: '适合配置较低的设备',
      maxConcurrent: 1,
      batchSize: 3,
      delayBetweenRequests: 500
    },
    {
      key: 'medium' as const,
      name: '标准模式',
      description: '平衡性能与稳定性',
      maxConcurrent: 3,
      batchSize: 5,
      delayBetweenRequests: 200
    },
    {
      key: 'high' as const,
      name: '高性能模式',
      description: '适合高配置设备',
      maxConcurrent: 6,
      batchSize: 8,
      delayBetweenRequests: 100
    },
    {
      key: 'custom' as const,
      name: '自定义',
      description: '手动调整参数',
      maxConcurrent: settings.maxConcurrent,
      batchSize: settings.batchSize,
      delayBetweenRequests: settings.delayBetweenRequests
    }
  ];

  const handleModeChange = (mode: 'low' | 'medium' | 'high' | 'custom') => {
    const preset = presetModes.find(p => p.key === mode);
    if (preset) {
      onChange({
        mode,
        maxConcurrent: preset.maxConcurrent,
        batchSize: preset.batchSize,
        delayBetweenRequests: preset.delayBetweenRequests
      });
    }
  };

  const handleCustomChange = (field: keyof ConcurrencySettingsType, value: number) => {
    onChange({
      mode: 'custom',
      [field]: value
    });
  };

  const getRecommendedConcurrency = () => {
    // 基于浏览器硬件并发数推荐
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    return Math.min(Math.max(Math.floor(hardwareConcurrency / 2), 1), 8);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          并发处理设置
        </h3>
        <div className="text-sm text-gray-500">
          推荐并发数: {getRecommendedConcurrency()}
        </div>
      </div>

      {/* 性能模式选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          性能模式
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => handleModeChange(mode.key)}
              className={`
                p-4 text-left rounded-lg border-2 transition-colors
                ${settings.mode === mode.key
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="font-semibold text-sm">{mode.name}</div>
              <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
              <div className="text-xs text-gray-400 mt-2">
                并发: {mode.maxConcurrent} | 批量: {mode.batchSize}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义设置 */}
      {settings.mode === 'custom' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">自定义参数</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 最大并发数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大并发数
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.maxConcurrent}
                  onChange={(e) => handleCustomChange('maxConcurrent', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium text-primary-600">{settings.maxConcurrent}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            {/* 批量大小 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                批量大小
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={settings.batchSize}
                  onChange={(e) => handleCustomChange('batchSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium text-primary-600">{settings.batchSize}</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* 请求间隔 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                请求间隔 (ms)
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={settings.delayBetweenRequests}
                  onChange={(e) => handleCustomChange('delayBetweenRequests', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span className="font-medium text-primary-600">{settings.delayBetweenRequests}</span>
                  <span>2000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 说明信息 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">并发设置说明：</p>
            <ul className="text-xs space-y-1">
              <li>• <strong>并发数</strong>：同时进行的翻译任务数量，过高可能导致API限制</li>
              <li>• <strong>批量大小</strong>：每批处理的字幕条目数量</li>
              <li>• <strong>请求间隔</strong>：每次请求之间的延迟，避免触发频率限制</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
