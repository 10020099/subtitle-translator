'use client';

import React, { useState, useCallback } from 'react';
import { SubtitleFile } from '@/types/subtitle';
import { parseSubtitleFile } from '@/lib/parsers/subtitle-parser';

interface BatchFileProcessorProps {
  onFilesProcessed: (files: SubtitleFile[]) => void;
  onError: (error: string) => void;
}

interface FileProcessingStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: SubtitleFile;
  error?: string;
}

export default function BatchFileProcessor({ onFilesProcessed, onError }: BatchFileProcessorProps) {
  const [files, setFiles] = useState<FileProcessingStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
    // 重置input
    event.target.value = '';
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    const subtitleFiles = droppedFiles.filter(file =>
      file.name.toLowerCase().endsWith('.srt') ||
      file.name.toLowerCase().endsWith('.vtt') ||
      file.name.toLowerCase().endsWith('.ass')
    );

    const newFiles = subtitleFiles.map(file => ({
      file,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const processedFiles: SubtitleFile[] = [];
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status !== 'pending') continue;

      updatedFiles[i].status = 'processing';
      setFiles([...updatedFiles]);

      try {
        const fileContent = await readFileAsText(updatedFiles[i].file);
        const parseResult = parseSubtitleFile(fileContent, updatedFiles[i].file.name);

        if (parseResult.success && parseResult.data) {
          updatedFiles[i].status = 'completed';
          updatedFiles[i].result = parseResult.data;
          processedFiles.push(parseResult.data);
        } else {
          updatedFiles[i].status = 'error';
          updatedFiles[i].error = parseResult.error || '解析失败';
        }
      } catch (error) {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = error instanceof Error ? error.message : '未知错误';
      }

      setFiles([...updatedFiles]);
    }

    setIsProcessing(false);
    
    if (processedFiles.length > 0) {
      onFilesProcessed(processedFiles);
    }
    
    const errorCount = updatedFiles.filter(f => f.status === 'error').length;
    if (errorCount > 0) {
      onError(`${errorCount} 个文件处理失败`);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'utf-8');
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getStatusIcon = (status: FileProcessingStatus['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          批量文件处理
        </h2>

        {/* 文件拖拽区域 */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
        >
          <input
            type="file"
            multiple
            accept=".srt,.vtt,.ass"
            onChange={handleFileSelect}
            className="hidden"
            id="batch-file-input"
          />
          <label htmlFor="batch-file-input" className="cursor-pointer">
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-gray-600">
                <div>
                  <p>拖拽字幕文件到这里，或者 <span className="text-primary-600 font-medium">点击选择文件</span></p>
                  <p className="text-sm text-gray-500 mt-1">支持 .srt, .vtt, .ass 格式</p>
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">
                文件列表 ({files.length})
              </h3>
              <div className="space-x-2">
                <button
                  onClick={processFiles}
                  disabled={isProcessing || files.every(f => f.status !== 'pending')}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '处理中...' : '开始处理'}
                </button>
                <button
                  onClick={clearAll}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  清空列表
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((fileStatus, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fileStatus.status)}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {fileStatus.file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(fileStatus.file.size / 1024).toFixed(1)} KB
                      </div>
                      {fileStatus.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {fileStatus.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* 处理统计 */}
            <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
              <div className="p-2 bg-gray-100 rounded">
                <div className="font-semibold text-gray-600">{files.filter(f => f.status === 'pending').length}</div>
                <div className="text-gray-500">待处理</div>
              </div>
              <div className="p-2 bg-blue-100 rounded">
                <div className="font-semibold text-blue-600">{files.filter(f => f.status === 'processing').length}</div>
                <div className="text-blue-500">处理中</div>
              </div>
              <div className="p-2 bg-green-100 rounded">
                <div className="font-semibold text-green-600">{files.filter(f => f.status === 'completed').length}</div>
                <div className="text-green-500">已完成</div>
              </div>
              <div className="p-2 bg-red-100 rounded">
                <div className="font-semibold text-red-600">{files.filter(f => f.status === 'error').length}</div>
                <div className="text-red-500">失败</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
