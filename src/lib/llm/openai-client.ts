import { LLMClient, TranslationRequest, TranslationResponse, LLMConfig } from '@/types/llm';

export class OpenAIClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('OpenAI API密钥未配置');
      }

      const prompt = this.buildTranslationPrompt(request);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model || 'gpt-3.5-turbo',
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
        throw new Error(`OpenAI API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('OpenAI API返回空的翻译结果');
      }

      return {
        translatedText,
        confidence: 0.9 // OpenAI不提供置信度，使用默认值
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
    return !!(this.config.apiKey && this.config.model);
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      // 发送一个简单的测试请求
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
