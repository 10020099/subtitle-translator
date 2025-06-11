import { LLMClient, TranslationRequest, TranslationResponse, LLMConfig } from '@/types/llm';

export class LocalClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.config.baseUrl) {
        throw new Error('本地模型API地址未配置');
      }

      const prompt = this.buildTranslationPrompt(request);
      
      // 支持OpenAI兼容的API格式
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          model: this.config.model || 'local-model',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的字幕翻译助手。请准确翻译字幕内容，保持原文的语气和风格，不要添加额外的解释或格式。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature || 0.3,
          max_tokens: this.config.maxTokens || 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`本地模型API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('本地模型API返回空的翻译结果');
      }

      return {
        translatedText,
        confidence: 0.8 // 本地模型使用默认置信度
      };
    } catch (error) {
      return {
        translatedText: '',
        error: error instanceof Error ? error.message : '翻译失败'
      };
    }
  }

  private buildTranslationPrompt(request: TranslationRequest): string {
    const { text, sourceLanguage, targetLanguage, context } = request;
    
    let prompt = `请将以下${sourceLanguage}文本翻译成${targetLanguage}：\n\n"${text}"`;
    
    if (context) {
      prompt += `\n\n上下文信息：${context}`;
    }
    
    prompt += '\n\n请只返回翻译结果，不要包含其他内容。';
    
    return prompt;
  }

  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.model);
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      // 发送一个简单的测试请求
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      return response.ok;
    } catch {
      // 如果models端点不可用，尝试发送一个简单的聊天请求
      try {
        const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 5
          })
        });

        return response.ok;
      } catch {
        return false;
      }
    }
  }
}
