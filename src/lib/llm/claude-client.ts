import { LLMClient, TranslationRequest, TranslationResponse, LLMConfig } from '@/types/llm';

export class ClaudeClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Claude API密钥未配置');
      }

      const prompt = this.buildTranslationPrompt(request);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-haiku-20240307',
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.3,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.content?.[0]?.text?.trim();

      if (!translatedText) {
        throw new Error('Claude API返回空的翻译结果');
      }

      return {
        translatedText,
        confidence: 0.9 // Claude不提供置信度，使用默认值
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
    
    let prompt = `你是一个专业的字幕翻译助手。请将以下${sourceLanguage}文本准确翻译成${targetLanguage}，保持原文的语气和风格：\n\n"${text}"`;
    
    if (context) {
      prompt += `\n\n上下文信息：${context}`;
    }
    
    prompt += '\n\n请只返回翻译结果，不要包含其他内容或解释。';
    
    return prompt;
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      // 发送一个简单的测试请求
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
