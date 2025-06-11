import { LLMClient, TranslationRequest, TranslationResponse, LLMConfig } from '@/types/llm';

export class CustomOpenAIClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.config.baseUrl) {
        throw new Error('自定义API地址未配置');
      }

      const prompt = this.buildTranslationPrompt(request);
      
      // 构建请求URL，支持不同的端点格式
      const baseUrl = this.config.baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
      const endpoint = baseUrl.includes('/v1/chat/completions') 
        ? baseUrl 
        : `${baseUrl}/v1/chat/completions`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 添加认证头
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
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
          max_tokens: this.config.maxTokens || 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const providerName = this.config.customName || '自定义提供商';
        throw new Error(`${providerName} API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error(`${this.config.customName || '自定义提供商'} API返回空的翻译结果`);
      }

      return {
        translatedText,
        confidence: this.calculateConfidence(data.choices?.[0])
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

  private calculateConfidence(choice: any): number {
    if (!choice) return 0.5;
    
    // 基于完成原因计算置信度
    const finishReason = choice.finish_reason;
    switch (finishReason) {
      case 'stop':
        return 0.9;
      case 'length':
        return 0.8;
      case 'content_filter':
        return 0.6;
      default:
        return 0.7;
    }
  }

  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.model);
  }

  async validateConfig(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      const baseUrl = this.config.baseUrl!.replace(/\/$/, '');
      
      // 首先尝试访问模型列表端点
      try {
        const modelsEndpoint = baseUrl.includes('/v1/models') 
          ? baseUrl 
          : `${baseUrl}/v1/models`;
          
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await fetch(modelsEndpoint, { headers });
        if (response.ok) return true;
      } catch {
        // 如果模型端点失败，尝试聊天端点
      }

      // 尝试发送测试聊天请求
      const chatEndpoint = baseUrl.includes('/v1/chat/completions') 
        ? baseUrl 
        : `${baseUrl}/v1/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers,
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
