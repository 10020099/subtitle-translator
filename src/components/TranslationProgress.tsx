'use client';

import React from 'react';
import { TranslationProgress as ProgressType } from '@/types/llm';
import { TranslationStatus } from '@/types/app';

interface TranslationProgressProps {
  progress: ProgressType;
  status: TranslationStatus;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export default function TranslationProgress({ progress, status, onPause, onResume, onCancel }: TranslationProgressProps) {
  const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const getStatusText = () => {
    switch (status) {
      case TranslationStatus.RUNNING:
        return '正在翻译字幕...';
      case TranslationStatus.PAUSED:
        return '翻译已暂停';
      case TranslationStatus.COMPLETED:
        return '翻译完成';
      case TranslationStatus.FAILED:
        return '翻译失败';
      default:
        return '准备翻译...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case TranslationStatus.RUNNING:
        return 'text-blue-600';
      case TranslationStatus.PAUSED:
        return 'text-yellow-600';
      case TranslationStatus.COMPLETED:
        return 'text-green-600';
      case TranslationStatus.FAILED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className={`text-lg font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </h2>
            {status === TranslationStatus.RUNNING && (
              <div className="ml-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
            {status === TranslationStatus.PAUSED && (
              <div className="ml-3">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center space-x-2">
            {status === TranslationStatus.RUNNING && onPause && (
              <button
                onClick={onPause}
                className="flex items-center px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 transition-colors"
                title="暂停翻译"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                暂停
              </button>
            )}

            {status === TranslationStatus.PAUSED && onResume && (
              <button
                onClick={onResume}
                className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 transition-colors"
                title="恢复翻译"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                恢复
              </button>
            )}

            {onCancel && status !== TranslationStatus.COMPLETED && (
              <button
                onClick={onCancel}
                className="flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                title="取消翻译"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                取消
              </button>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>翻译进度</span>
            <span>{progress.completed} / {progress.total}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
            <div
              className={`h-4 rounded-full progress-bar transition-all duration-300 ease-out ${
                status === TranslationStatus.PAUSED
                  ? 'bg-yellow-500'
                  : status === TranslationStatus.COMPLETED
                  ? 'bg-green-500'
                  : status === TranslationStatus.FAILED
                  ? 'bg-red-500'
                  : 'bg-primary-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
            {status === TranslationStatus.RUNNING && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            )}
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className="font-medium">{percentage.toFixed(1)}%</span>
            <span>剩余: {progress.total - progress.completed} 条</span>
          </div>
        </div>

        {/* 当前翻译内容 */}
        {progress.current && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">当前翻译:</div>
            <div className="text-sm text-gray-900 line-clamp-2">
              {progress.current}
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {progress.errors.length > 0 && (
          <div className="mb-4">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm text-red-600 hover:text-red-700">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {progress.errors.length} 个错误
                </span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {progress.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-600 py-1 border-l-2 border-red-200 pl-2 mb-1">
                    {error}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-600">{progress.completed}</div>
            <div className="text-blue-500">已完成</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-600">{progress.total - progress.completed}</div>
            <div className="text-yellow-500">待处理</div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-600">{progress.errors.length}</div>
            <div className="text-red-500">错误</div>
          </div>
        </div>
      </div>
    </div>
  );
}
