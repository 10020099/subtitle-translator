'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AppSettings } from '@/types/app';

interface TranslationHistory {
  id: string;
  timestamp: number;
  fileName: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  model: string;
  entriesCount: number;
  duration: number; // 翻译耗时（秒）
  quality: string;
}

export default function SettingsPanel() {
  const { state, dispatch } = useAppContext();
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 从localStorage加载设置和历史记录
  useEffect(() => {
    const savedSettings = localStorage.getItem('subtitle-translator-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) as Partial<AppSettings>;
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    const savedHistory = localStorage.getItem('subtitle-translator-history');
    if (savedHistory) {
      try {
        const historyData = JSON.parse(savedHistory) as TranslationHistory[];
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, [dispatch]);

  // 保存设置到localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('subtitle-translator-settings', JSON.stringify(state.settings));
      // 显示保存成功提示
      const event = new CustomEvent('show-toast', {
        detail: { message: '设置已保存', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to save settings:', error);
      const event = new CustomEvent('show-toast', {
        detail: { message: '设置保存失败', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  // 重置设置
  const resetSettings = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      localStorage.removeItem('subtitle-translator-settings');
      dispatch({ type: 'RESET_APP' });
      const event = new CustomEvent('show-toast', {
        detail: { message: '设置已重置', type: 'success' }
      });
      window.dispatchEvent(event);
    }
  };

  // 清空历史记录
  const clearHistory = () => {
    if (confirm('确定要清空所有翻译历史记录吗？')) {
      localStorage.removeItem('subtitle-translator-history');
      setHistory([]);
      const event = new CustomEvent('show-toast', {
        detail: { message: '历史记录已清空', type: 'success' }
      });
      window.dispatchEvent(event);
    }
  };

  // 导出设置
  const exportSettings = () => {
    const settingsData = {
      settings: state.settings,
      timestamp: Date.now(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitle-translator-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导入设置
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          dispatch({ type: 'UPDATE_SETTINGS', payload: data.settings });
          localStorage.setItem('subtitle-translator-settings', JSON.stringify(data.settings));
          const event = new CustomEvent('show-toast', {
            detail: { message: '设置导入成功', type: 'success' }
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        const event = new CustomEvent('show-toast', {
          detail: { message: '设置文件格式错误', type: 'error' }
        });
        window.dispatchEvent(event);
      }
    };
    reader.readAsText(file);
    
    // 重置input
    event.target.value = '';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 设置管理 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          设置管理
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={saveSettings}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            保存设置
          </button>

          <button
            onClick={resetSettings}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重置设置
          </button>

          <button
            onClick={exportSettings}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出设置
          </button>

          <label className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            导入设置
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
        </div>

        {/* 自动保存设置 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">自动保存设置</h3>
              <p className="text-xs text-gray-500 mt-1">自动保存翻译配置和用户偏好</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.settings.autoSave}
                onChange={(e) => dispatch({
                  type: 'UPDATE_SETTINGS',
                  payload: { autoSave: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 翻译历史记录 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            翻译历史记录
          </h2>
          <div className="space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showHistory ? '隐藏' : '显示'} ({history.length})
            </button>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
              >
                清空
              </button>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">暂无翻译历史记录</p>
              </div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">{record.fileName}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {record.entriesCount} 条字幕
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.sourceLanguage} → {record.targetLanguage} | 
                        {record.provider} ({record.model}) | 
                        耗时 {formatDuration(record.duration)} | 
                        {formatDate(record.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
