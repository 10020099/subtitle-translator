import { SubtitleFile, SubtitleEntry } from '@/types/subtitle';
import { LLMConfig, TranslationProgress, TranslationRequest } from '@/types/llm';
import { TranslationStatus, ConcurrencySettings, TranslationQuality } from '@/types/app';
import { LLMFactory } from './llm-factory';

export class TranslationService {
  private config: LLMConfig;
  private onProgress?: (progress: TranslationProgress) => void;
  private onStatusChange?: (status: TranslationStatus) => void;
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private concurrencySettings: ConcurrencySettings;
  private translationQuality: TranslationQuality;

  constructor(
    config: LLMConfig,
    concurrencySettings: ConcurrencySettings,
    translationQuality: TranslationQuality,
    onProgress?: (progress: TranslationProgress) => void,
    onStatusChange?: (status: TranslationStatus) => void
  ) {
    this.config = config;
    this.concurrencySettings = concurrencySettings;
    this.translationQuality = translationQuality;
    this.onProgress = onProgress;
    this.onStatusChange = onStatusChange;
  }

  /**
   * 暂停翻译
   */
  pause() {
    this.isPaused = true;
    this.onStatusChange?.(TranslationStatus.PAUSED);
  }

  /**
   * 恢复翻译
   */
  resume() {
    this.isPaused = false;
    this.onStatusChange?.(TranslationStatus.RUNNING);
  }

  /**
   * 取消翻译
   */
  cancel() {
    this.isCancelled = true;
    this.onStatusChange?.(TranslationStatus.IDLE);
  }

  /**
   * 等待暂停状态结束
   */
  private async waitForResume(): Promise<void> {
    while (this.isPaused && !this.isCancelled) {
      await this.delay(100);
    }
  }

  /**
   * 翻译整个字幕文件
   */
  async translateSubtitleFile(
    subtitleFile: SubtitleFile,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<SubtitleFile> {
    // 重置状态
    this.isPaused = false;
    this.isCancelled = false;
    this.onStatusChange?.(TranslationStatus.RUNNING);

    const client = LLMFactory.createClient(this.config);

    const progress: TranslationProgress = {
      total: subtitleFile.entries.length,
      completed: 0,
      current: '',
      errors: []
    };

    // 根据并发设置选择翻译策略
    if (this.concurrencySettings.maxConcurrent > 1) {
      return await this.translateConcurrently(
        subtitleFile,
        sourceLanguage,
        targetLanguage,
        client,
        progress
      );
    } else {
      return await this.translateSequentially(
        subtitleFile,
        sourceLanguage,
        targetLanguage,
        client,
        progress
      );
    }
  }

  /**
   * 顺序翻译（单线程）
   */
  private async translateSequentially(
    subtitleFile: SubtitleFile,
    sourceLanguage: string,
    targetLanguage: string,
    client: any,
    progress: TranslationProgress
  ): Promise<SubtitleFile> {
    const translatedEntries: SubtitleEntry[] = [];
    const errors: string[] = [];

    for (let i = 0; i < subtitleFile.entries.length; i++) {
      // 检查是否被取消
      if (this.isCancelled) {
        throw new Error('翻译已取消');
      }

      // 等待暂停状态结束
      await this.waitForResume();

      const entry = subtitleFile.entries[i];

      // 更新进度
      progress.current = entry.text.substring(0, 50) + (entry.text.length > 50 ? '...' : '');
      this.onProgress?.(progress);

      try {
        // 准备翻译请求
        const request: TranslationRequest = {
          text: entry.text,
          sourceLanguage,
          targetLanguage,
          context: this.buildContext(subtitleFile.entries, i)
        };

        // 执行翻译
        const response = await client.translate(request);

        if (response.error) {
          errors.push(`条目 ${entry.id}: ${response.error}`);
          translatedEntries.push({
            ...entry,
            translatedText: entry.text
          });
        } else {
          translatedEntries.push({
            ...entry,
            translatedText: response.translatedText
          });
        }

        // 添加延迟
        await this.delay(this.concurrencySettings.delayBetweenRequests);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        errors.push(`条目 ${entry.id}: ${errorMessage}`);

        translatedEntries.push({
          ...entry,
          translatedText: entry.text
        });
      }

      // 更新完成进度
      progress.completed = i + 1;
      progress.errors = errors;
      this.onProgress?.(progress);
    }

    this.onStatusChange?.(TranslationStatus.COMPLETED);
    return {
      ...subtitleFile,
      entries: translatedEntries
    };
  }

  /**
   * 并发翻译（多线程）
   */
  private async translateConcurrently(
    subtitleFile: SubtitleFile,
    sourceLanguage: string,
    targetLanguage: string,
    client: any,
    progress: TranslationProgress
  ): Promise<SubtitleFile> {
    const translatedEntries: SubtitleEntry[] = new Array(subtitleFile.entries.length);
    const errors: string[] = [];
    const { maxConcurrent, batchSize } = this.concurrencySettings;

    // 分批处理
    for (let batchStart = 0; batchStart < subtitleFile.entries.length; batchStart += batchSize) {
      // 检查是否被取消
      if (this.isCancelled) {
        throw new Error('翻译已取消');
      }

      // 等待暂停状态结束
      await this.waitForResume();

      const batchEnd = Math.min(batchStart + batchSize, subtitleFile.entries.length);
      const batch = subtitleFile.entries.slice(batchStart, batchEnd);

      // 并发处理当前批次
      const promises = batch.map(async (entry, index) => {
        const globalIndex = batchStart + index;

        try {
          const request: TranslationRequest = {
            text: entry.text,
            sourceLanguage,
            targetLanguage,
            context: this.buildContext(subtitleFile.entries, globalIndex)
          };

          const response = await client.translate(request);

          if (response.error) {
            errors.push(`条目 ${entry.id}: ${response.error}`);
            return {
              ...entry,
              translatedText: entry.text
            };
          } else {
            return {
              ...entry,
              translatedText: response.translatedText
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          errors.push(`条目 ${entry.id}: ${errorMessage}`);

          return {
            ...entry,
            translatedText: entry.text
          };
        }
      });

      // 限制并发数量
      const results = await this.limitConcurrency(promises, maxConcurrent);

      // 将结果放入正确位置
      results.forEach((result: SubtitleEntry, index: number) => {
        translatedEntries[batchStart + index] = result;
      });

      // 更新进度
      progress.completed = batchEnd;
      progress.errors = errors;
      progress.current = batch[batch.length - 1]?.text.substring(0, 50) + '...';
      this.onProgress?.(progress);

      // 批次间延迟
      if (batchEnd < subtitleFile.entries.length) {
        await this.delay(this.concurrencySettings.delayBetweenRequests);
      }
    }

    this.onStatusChange?.(TranslationStatus.COMPLETED);
    return {
      ...subtitleFile,
      entries: translatedEntries
    };
  }

  /**
   * 构建上下文信息
   */
  private buildContext(entries: SubtitleEntry[], currentIndex: number): string {
    const contextEntries: string[] = [];
    
    // 添加前一条字幕作为上下文
    if (currentIndex > 0) {
      contextEntries.push(`前一句: "${entries[currentIndex - 1].text}"`);
    }
    
    // 添加后一条字幕作为上下文
    if (currentIndex < entries.length - 1) {
      contextEntries.push(`后一句: "${entries[currentIndex + 1].text}"`);
    }
    
    return contextEntries.join('\n');
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 批量翻译文本片段
   */
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    batchSize: number = 5
  ): Promise<string[]> {
    const client = LLMFactory.createClient(this.config);
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => 
        client.translate({
          text,
          sourceLanguage,
          targetLanguage
        })
      );

      try {
        const responses = await Promise.all(batchPromises);
        results.push(...responses.map(r => r.translatedText || ''));
        
        // 添加延迟以避免API限制
        await this.delay(200);
      } catch (error) {
        // 如果批量翻译失败，添加空字符串占位
        results.push(...new Array(batch.length).fill(''));
      }
    }

    return results;
  }

  /**
   * 限制并发数量
   */
  private async limitConcurrency<T>(
    promises: Promise<T>[],
    maxConcurrent: number
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < promises.length; i += maxConcurrent) {
      const batch = promises.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 根据翻译质量调整提示词
   */
  private adjustPromptForQuality(basePrompt: string): string {
    switch (this.translationQuality) {
      case TranslationQuality.FAST:
        return basePrompt + '\n请快速翻译，保持简洁。';

      case TranslationQuality.PRECISE:
        return basePrompt + '\n请仔细翻译，注意语境和细节，确保准确性和流畅性。';

      case TranslationQuality.STANDARD:
      default:
        return basePrompt;
    }
  }

  /**
   * 根据翻译质量调整温度参数
   */
  private getTemperatureForQuality(): number {
    switch (this.translationQuality) {
      case TranslationQuality.FAST:
        return 0.1;

      case TranslationQuality.PRECISE:
        return 0.2;

      case TranslationQuality.STANDARD:
      default:
        return 0.3;
    }
  }
}
