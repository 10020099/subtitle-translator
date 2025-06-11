import { SubtitleFormat, ParseResult } from '@/types/subtitle';
import { SRTParser } from './srt-parser';
import { VTTParser } from './vtt-parser';
import { ASSParser } from './ass-parser';

export class ParserFactory {
  /**
   * 根据文件扩展名检测字幕格式
   */
  static detectFormat(filename: string): SubtitleFormat | null {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'srt':
        return SubtitleFormat.SRT;
      case 'vtt':
        return SubtitleFormat.VTT;
      case 'ass':
      case 'ssa':
        return SubtitleFormat.ASS;
      default:
        return null;
    }
  }

  /**
   * 根据内容自动检测字幕格式
   */
  static detectFormatByContent(content: string): SubtitleFormat | null {
    const trimmedContent = content.trim();
    
    // 检测VTT格式
    if (trimmedContent.startsWith('WEBVTT')) {
      return SubtitleFormat.VTT;
    }
    
    // 检测ASS格式
    if (trimmedContent.includes('[Script Info]') || trimmedContent.includes('[V4+ Styles]')) {
      return SubtitleFormat.ASS;
    }
    
    // 检测SRT格式（通过时间轴格式）
    if (trimmedContent.match(/\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/)) {
      return SubtitleFormat.SRT;
    }
    
    return null;
  }

  /**
   * 解析字幕文件
   */
  static parse(content: string, filename: string, format?: SubtitleFormat): ParseResult {
    // 如果没有指定格式，尝试自动检测
    if (!format) {
      format = this.detectFormat(filename) || this.detectFormatByContent(content);
    }

    if (!format) {
      return {
        success: false,
        error: '无法识别字幕文件格式。支持的格式：SRT, VTT, ASS'
      };
    }

    try {
      switch (format) {
        case SubtitleFormat.SRT:
          return SRTParser.parse(content, filename);
        
        case SubtitleFormat.VTT:
          return VTTParser.parse(content, filename);
        
        case SubtitleFormat.ASS:
          return ASSParser.parse(content, filename);
        
        default:
          return {
            success: false,
            error: `不支持的字幕格式: ${format}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 导出字幕文件
   */
  static export(subtitleFile: any, format: SubtitleFormat): string {
    switch (format) {
      case SubtitleFormat.SRT:
        return SRTParser.export(subtitleFile);
      
      case SubtitleFormat.VTT:
        return VTTParser.export(subtitleFile);
      
      case SubtitleFormat.ASS:
        return ASSParser.export(subtitleFile);
      
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }
}
