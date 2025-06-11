import { SubtitleEntry, SubtitleFile, SubtitleFormat, ParseResult } from '@/types/subtitle';

export class SRTParser {
  /**
   * 解析SRT格式字幕文件
   */
  static parse(content: string, filename: string): ParseResult {
    try {
      const entries: SubtitleEntry[] = [];
      const blocks = content.trim().split(/\n\s*\n/);

      for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue;

        // 解析序号
        const id = parseInt(lines[0].trim());
        if (isNaN(id)) continue;

        // 解析时间轴
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (!timeMatch) continue;

        const startTime = this.parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
        const endTime = this.parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);

        // 解析文本内容
        const text = lines.slice(2).join('\n').trim();

        entries.push({
          id,
          startTime,
          endTime,
          text,
          originalText: text
        });
      }

      const subtitleFile: SubtitleFile = {
        name: filename,
        format: SubtitleFormat.SRT,
        entries: entries.sort((a, b) => a.startTime - b.startTime)
      };

      return {
        success: true,
        data: subtitleFile
      };
    } catch (error) {
      return {
        success: false,
        error: `SRT解析失败: ${error instanceof Error ? error.message : '未知错误'}`
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
   * 将毫秒转换为SRT时间格式
   */
  static formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  /**
   * 将字幕文件导出为SRT格式
   */
  static export(subtitleFile: SubtitleFile): string {
    return subtitleFile.entries
      .map(entry => {
        const startTime = this.formatTime(entry.startTime);
        const endTime = this.formatTime(entry.endTime);
        const text = entry.translatedText || entry.text;
        
        return `${entry.id}\n${startTime} --> ${endTime}\n${text}`;
      })
      .join('\n\n');
  }
}
