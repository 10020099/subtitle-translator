'use client';

import React, { useState, useMemo } from 'react';
import { SubtitleFile, SubtitleEntry } from '@/types/subtitle';

interface SubtitlePreviewProps {
  subtitleFile: SubtitleFile;
  showOriginal?: boolean;
  maxHeight?: string;
}

export default function SubtitlePreview({ 
  subtitleFile, 
  showOriginal = false,
  maxHeight = '400px'
}: SubtitlePreviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // 过滤字幕条目
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return subtitleFile.entries;
    
    const query = searchQuery.toLowerCase();
    return subtitleFile.entries.filter(entry => 
      entry.text.toLowerCase().includes(query) ||
      (entry.translatedText && entry.translatedText.toLowerCase().includes(query))
    );
  }, [subtitleFile.entries, searchQuery]);

  // 分页
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 格式化时间显示
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              字幕预览
            </h3>
            <div className="text-sm text-gray-500">
              共 {filteredEntries.length} 条字幕
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索字幕内容..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // 重置到第一页
              }}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 字幕列表 */}
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {paginatedEntries.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {paginatedEntries.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* 时间轴 */}
                    <div className="flex-shrink-0 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      <div>{formatTime(entry.startTime)}</div>
                      <div className="text-gray-400">↓</div>
                      <div>{formatTime(entry.endTime)}</div>
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 原文 */}
                      {showOriginal && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">原文:</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {entry.originalText || entry.text}
                          </div>
                        </div>
                      )}

                      {/* 译文 */}
                      <div>
                        {showOriginal && (
                          <div className="text-xs text-gray-500 mb-1">译文:</div>
                        )}
                        <div className={`text-sm whitespace-pre-wrap ${
                          entry.translatedText 
                            ? 'text-gray-900' 
                            : 'text-gray-500 italic'
                        }`}>
                          {entry.translatedText || entry.text}
                        </div>
                      </div>
                    </div>

                    {/* 状态指示器 */}
                    <div className="flex-shrink-0">
                      {entry.translatedText ? (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="已翻译" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full" title="未翻译" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? '未找到匹配的字幕' : '暂无字幕内容'}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
