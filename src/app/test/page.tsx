'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          字幕翻译器 - 测试页面
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 测试 Primary 颜色 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Primary 颜色测试</h2>
            <div className="space-y-2">
              <div className="w-full h-8 bg-primary-50 rounded flex items-center justify-center text-xs">primary-50</div>
              <div className="w-full h-8 bg-primary-100 rounded flex items-center justify-center text-xs">primary-100</div>
              <div className="w-full h-8 bg-primary-200 rounded flex items-center justify-center text-xs">primary-200</div>
              <div className="w-full h-8 bg-primary-300 rounded flex items-center justify-center text-xs text-white">primary-300</div>
              <div className="w-full h-8 bg-primary-400 rounded flex items-center justify-center text-xs text-white">primary-400</div>
              <div className="w-full h-8 bg-primary-500 rounded flex items-center justify-center text-xs text-white">primary-500</div>
              <div className="w-full h-8 bg-primary-600 rounded flex items-center justify-center text-xs text-white">primary-600</div>
              <div className="w-full h-8 bg-primary-700 rounded flex items-center justify-center text-xs text-white">primary-700</div>
              <div className="w-full h-8 bg-primary-800 rounded flex items-center justify-center text-xs text-white">primary-800</div>
              <div className="w-full h-8 bg-primary-900 rounded flex items-center justify-center text-xs text-white">primary-900</div>
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">按钮测试</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                Primary Button
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Secondary Button
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Success Button
              </button>
            </div>
          </div>

          {/* 测试表单 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">表单测试</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="测试输入框"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                <option>选择选项</option>
                <option>选项 1</option>
                <option>选项 2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">功能状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Tailwind CSS 配置正常</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">React 组件渲染正常</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">TypeScript 编译正常</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Next.js 路由正常</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            返回主页面
          </a>
        </div>
      </div>
    </div>
  );
}
