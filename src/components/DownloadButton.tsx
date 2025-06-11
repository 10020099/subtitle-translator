'use client';

import React, { useState } from 'react';
import { SubtitleFile, SubtitleFormat } from '@/types/subtitle';
import { ParserFactory } from '@/lib/parsers/parser-factory';
import { downloadTextAsFile, generateTranslatedFilename } from '@/lib/utils/file-utils';

interface DownloadButtonProps {
  subtitleFile: SubtitleFile;
  targetLanguage: string;
  className?: string;
}

export default function DownloadButton({ 
  subtitleFile, 
  targetLanguage, 
  className = '' 
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SubtitleFormat>(subtitleFile.format);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // 导出字幕内容
      const content = ParserFactory.export(subtitleFile, selectedFormat);
      
      // 生成文件名
      const originalExtension = subtitleFile.name.split('.').pop() || 'srt';
      const newExtension = selectedFormat;
      const filename = generateTranslatedFilename(
        subtitleFile.name.replace(`.${originalExtension}`, `.${newExtension}`),
        targetLanguage
      );
      
      // 下载文件
      downloadTextAsFile(content, filename, 'text/plain;charset=utf-8');
      
    } catch (error) {
      console.error('下载失败:', error);
      alert(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatOptions = [
    { value: SubtitleFormat.SRT, label: 'SRT 格式' },
    { value: SubtitleFormat.VTT, label: 'VTT 格式' },
    { value: SubtitleFormat.ASS, label: 'ASS 格式' }
  ];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* 格式选择 */}
      <select
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value as SubtitleFormat)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      >
        {formatOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 下载按钮 */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            下载中...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下载字幕
          </>
        )}
      </button>
    </div>
  );
}
