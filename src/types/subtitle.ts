// 字幕条目接口
export interface SubtitleEntry {
  id: number;
  startTime: number; // 毫秒
  endTime: number;   // 毫秒
  text: string;
  originalText?: string; // 保存原文
  translatedText?: string; // 翻译后的文本
}

// 字幕文件格式枚举
export enum SubtitleFormat {
  SRT = 'srt',
  ASS = 'ass',
  VTT = 'vtt'
}

// 字幕文件接口
export interface SubtitleFile {
  name: string;
  format: SubtitleFormat;
  entries: SubtitleEntry[];
  metadata?: {
    [key: string]: string;
  };
}

// 时间格式化选项
export interface TimeFormatOptions {
  format: 'srt' | 'ass' | 'vtt';
  includeMilliseconds?: boolean;
}

// 解析结果接口
export interface ParseResult {
  success: boolean;
  data?: SubtitleFile;
  error?: string;
}

// 导出选项
export interface ExportOptions {
  format: SubtitleFormat;
  encoding?: string;
  preserveFormatting?: boolean;
}
