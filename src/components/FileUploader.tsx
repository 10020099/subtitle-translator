'use client';

import React, { useCallback, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { validateSubtitleFile, readFileAsText, formatFileSize } from '@/lib/utils/file-utils';
import { ParserFactory } from '@/lib/parsers/parser-factory';
import { detectLanguage } from '@/lib/utils/language-utils';

export default function FileUploader() {
  const { state, dispatch } = useAppContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    dispatch({ type: 'CLEAR_ERRORS' });

    try {
      // 验证文件
      const validation = validateSubtitleFile(file);
      if (!validation.valid) {
        dispatch({ type: 'ADD_ERROR', payload: validation.error! });
        return;
      }

      // 读取文件内容
      const content = await readFileAsText(file);
      
      // 解析字幕文件
      const parseResult = ParserFactory.parse(content, file.name);
      if (!parseResult.success) {
        dispatch({ type: 'ADD_ERROR', payload: parseResult.error! });
        return;
      }

      // 检测源语言
      if (parseResult.data && parseResult.data.entries.length > 0) {
        const sampleText = parseResult.data.entries
          .slice(0, 5)
          .map(entry => entry.text)
          .join(' ');
        const detectedLanguage = detectLanguage(sampleText);
        dispatch({ type: 'SET_SOURCE_LANGUAGE', payload: detectedLanguage });
      }

      // 设置文件和解析结果
      dispatch({ type: 'SET_UPLOADED_FILE', payload: file });
      dispatch({ type: 'SET_SUBTITLE_FILE', payload: parseResult.data! });

    } catch (error) {
      dispatch({ 
        type: 'ADD_ERROR', 
        payload: `文件处理失败: ${error instanceof Error ? error.message : '未知错误'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">正在处理文件...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              上传字幕文件
            </h3>
            
            <p className="text-gray-600 mb-4">
              拖拽文件到此处，或点击选择文件
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              支持格式：SRT, VTT, ASS（最大10MB）
            </p>
            
            <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer transition-colors">
              选择文件
              <input
                type="file"
                className="hidden"
                accept=".srt,.vtt,.ass,.ssa"
                onChange={handleFileInputChange}
              />
            </label>
          </>
        )}
      </div>

      {/* 显示已上传的文件信息 */}
      {state.uploadedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                {state.uploadedFile.name}
              </p>
              <p className="text-sm text-green-600">
                {formatFileSize(state.uploadedFile.size)} • {state.subtitleFile?.entries.length || 0} 条字幕
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {state.errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              {state.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-800">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
