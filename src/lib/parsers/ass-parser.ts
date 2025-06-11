import { SubtitleEntry, SubtitleFile, SubtitleFormat, ParseResult } from '@/types/subtitle';

export class ASSParser {
  /**
   * 解析ASS格式字幕文件
   */
  static parse(content: string, filename: string): ParseResult {
    try {
      const entries: SubtitleEntry[] = [];
      const lines = content.split('\n');
      
      let inEventsSection = false;
      let formatLine = '';
      let entryId = 1;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 检测Events部分
        if (trimmedLine === '[Events]') {
          inEventsSection = true;
          continue;
        }
        
        // 如果遇到新的部分，退出Events部分
        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']') && trimmedLine !== '[Events]') {
          inEventsSection = false;
          continue;
        }
        
        if (!inEventsSection) continue;
        
        // 获取格式行
        if (trimmedLine.startsWith('Format:')) {
          formatLine = trimmedLine.substring(7).trim();
          continue;
        }
        
        // 解析对话行
        if (trimmedLine.startsWith('Dialogue:')) {
          const dialogueData = trimmedLine.substring(9).trim();
          const entry = this.parseDialogueLine(dialogueData, formatLine, entryId++);
          if (entry) {
            entries.push(entry);
          }
        }
      }

      const subtitleFile: SubtitleFile = {
        name: filename,
        format: SubtitleFormat.ASS,
        entries: entries.sort((a, b) => a.startTime - b.startTime)
      };

      return {
        success: true,
        data: subtitleFile
      };
    } catch (error) {
      return {
        success: false,
        error: `ASS解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 解析对话行
   */
  private static parseDialogueLine(dialogueData: string, formatLine: string, id: number): SubtitleEntry | null {
    try {
      const formatFields = formatLine.split(',').map(field => field.trim());
      const dialogueFields = this.splitDialogueFields(dialogueData);
      
      if (dialogueFields.length < formatFields.length) {
        return null;
      }

      const fieldMap: { [key: string]: string } = {};
      formatFields.forEach((field, index) => {
        fieldMap[field] = dialogueFields[index] || '';
      });

      const startTime = this.parseASSTime(fieldMap['Start'] || '');
      const endTime = this.parseASSTime(fieldMap['End'] || '');
      const text = this.cleanASSText(fieldMap['Text'] || '');

      if (startTime === null || endTime === null || !text) {
        return null;
      }

      return {
        id,
        startTime,
        endTime,
        text,
        originalText: text
      };
    } catch {
      return null;
    }
  }

  /**
   * 分割对话字段（考虑到Text字段可能包含逗号）
   */
  private static splitDialogueFields(dialogueData: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inBraces = 0;
    let fieldCount = 0;
    
    for (let i = 0; i < dialogueData.length; i++) {
      const char = dialogueData[i];
      
      if (char === '{') {
        inBraces++;
      } else if (char === '}') {
        inBraces--;
      }
      
      if (char === ',' && inBraces === 0 && fieldCount < 9) {
        // 前9个字段用逗号分割，第10个字段（Text）包含剩余所有内容
        fields.push(currentField.trim());
        currentField = '';
        fieldCount++;
      } else {
        currentField += char;
      }
    }
    
    // 添加最后一个字段
    fields.push(currentField.trim());
    
    return fields;
  }

  /**
   * 解析ASS时间格式 (H:MM:SS.CC)
   */
  private static parseASSTime(timeStr: string): number | null {
    const match = timeStr.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
    if (!match) return null;

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    const centiseconds = parseInt(match[4]);

    return hours * 3600000 + minutes * 60000 + seconds * 1000 + centiseconds * 10;
  }

  /**
   * 清理ASS文本（移除格式标签）
   */
  private static cleanASSText(text: string): string {
    return text
      .replace(/\{[^}]*\}/g, '') // 移除格式标签
      .replace(/\\N/g, '\n')     // 替换换行符
      .replace(/\\n/g, '\n')     // 替换换行符
      .replace(/\\h/g, ' ')      // 替换硬空格
      .trim();
  }

  /**
   * 将毫秒转换为ASS时间格式
   */
  static formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const centiseconds = Math.floor((milliseconds % 1000) / 10);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  /**
   * 将字幕文件导出为ASS格式
   */
  static export(subtitleFile: SubtitleFile): string {
    const header = `[Script Info]
Title: Translated Subtitle
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    const dialogues = subtitleFile.entries
      .map(entry => {
        const startTime = this.formatTime(entry.startTime);
        const endTime = this.formatTime(entry.endTime);
        const text = (entry.translatedText || entry.text).replace(/\n/g, '\\N');
        
        return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
      })
      .join('\n');

    return header + dialogues;
  }
}
