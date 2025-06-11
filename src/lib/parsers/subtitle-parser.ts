import { ParserFactory } from './parser-factory';
import { SubtitleFormat, ParseResult } from '@/types/subtitle';

/**
 * 解析字幕文件的便捷函数
 */
export function parseSubtitleFile(content: string, filename: string, format?: SubtitleFormat): ParseResult {
  return ParserFactory.parse(content, filename, format);
}

/**
 * 导出字幕文件的便捷函数
 */
export function exportSubtitleFile(subtitleFile: any, format: SubtitleFormat): string {
  return ParserFactory.export(subtitleFile, format);
}
