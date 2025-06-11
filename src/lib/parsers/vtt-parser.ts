import { SubtitleEntry, SubtitleFile, SubtitleFormat, ParseResult } from '@/types/subtitle';

export class VTTParser {
  /**
   * 解析VTT格式字幕文件
   */
  static parse(content: string, filename: string): ParseResult {
    try {
      const entries: SubtitleEntry[] = [];
      const lines = content.split('\n');
      
      // 检查VTT文件头
      if (!lines[0].trim().startsWith('WEBVTT')) {
        return {
          success: false,
          error: 'VTT文件格式错误：缺少WEBVTT标识'
        };
      }

      let currentEntry: Partial<SubtitleEntry> = {};
      let entryId = 1;
      let textLines: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // 空行表示一个条目结束
        if (line === '') {
          if (currentEntry.startTime !== undefined && currentEntry.endTime !== undefined && textLines.length > 0) {
            entries.push({
              id: entryId++,
              startTime: currentEntry.startTime,
              endTime: currentEntry.endTime,
              text: textLines.join('\n'),
              originalText: textLines.join('\n')
            });
          }
          currentEntry = {};
          textLines = [];
          continue;
        }

        // 解析时间轴
        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
        if (timeMatch) {
          currentEntry.startTime = this.parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
          currentEntry.endTime = this.parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
          continue;
        }

        // 跳过注释和设置
        if (line.startsWith('NOTE') || line.startsWith('STYLE') || line.startsWith('REGION')) {
          continue;
        }

        // 收集文本内容
        if (currentEntry.startTime !== undefined) {
          textLines.push(line);
        }
      }

      // 处理最后一个条目
      if (currentEntry.startTime !== undefined && currentEntry.endTime !== undefined && textLines.length > 0) {
        entries.push({
          id: entryId,
          startTime: currentEntry.startTime,
          endTime: currentEntry.endTime,
          text: textLines.join('\n'),
          originalText: textLines.join('\n')
        });
      }

      const subtitleFile: SubtitleFile = {
        name: filename,
        format: SubtitleFormat.VTT,
        entries: entries.sort((a, b) => a.startTime - b.startTime)
      };

      return {
        success: true,
        data: subtitleFile
      };
    } catch (error) {
      return {
        success: false,
        error: `VTT解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 将时间转换为毫秒
   */
  private static parseTime(hours: string, minutes: string, seconds: string, milliseconds: string): number {
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(seconds) * 1000 +
      parseInt(milliseconds)
    );
  }

  /**
   * 将毫秒转换为VTT时间格式
   */
  static formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  /**
   * 将字幕文件导出为VTT格式
   */
  static export(subtitleFile: SubtitleFile): string {
    const header = 'WEBVTT\n\n';
    const content = subtitleFile.entries
      .map(entry => {
        const startTime = this.formatTime(entry.startTime);
        const endTime = this.formatTime(entry.endTime);
        const text = entry.translatedText || entry.text;
        
        return `${startTime} --> ${endTime}\n${text}`;
      })
      .join('\n\n');

    return header + content;
  }
}
