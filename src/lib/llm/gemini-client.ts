import { LLMClient, TranslationRequest, TranslationResponse, LLMConfig } from '@/types/llm';

export class GeminiClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Gemini API密钥未配置');
      }

      const prompt = this.buildTranslationPrompt(request);
      
      // 构建 Gemini API URL
      const baseUrl = this.config.baseUrl || 'https://generativelanguage.googleapis.com';
      const model = this.config.model || 'gemini-1.5-flash';
      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: this.config.temperature || 0.3,
            maxOutputTokens: this.config.maxTokens || 1000,
            topP: 0.8,
            topK: 10
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // 解析 Gemini 响应
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Gemini API返回空的候选结果');
      }

      const content = candidates[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('Gemini API返回空的翻译结果');
      }

      const translatedText = content.trim();

      return {
        translatedText,
        confidence: this.calculateConfidence(candidates[0])
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
    
    let prompt = `你是一个专业的字幕翻译助手。请将以下${sourceLanguage}文本准确翻译成${targetLanguage}，保持原文的语气和风格。

原文: "${text}"`;
    
    if (context) {
      prompt += `\n\n上下文信息：${context}`;
    }
    
    prompt += '\n\n要求：\n1. 只返回翻译结果，不要包含其他内容\n2. 保持原文的语气和风格\n3. 确保翻译准确自然\n4. 不要添加解释或注释';
    
    return prompt;
  }

  private calculateConfidence(candidate: any): number {
    // 基于 Gemini 的安全评分和完成原因计算置信度
    const finishReason = candidate.finishReason;
    const safetyRatings = candidate.safetyRatings || [];
    
    if (finishReason === 'STOP') {
      // 正常完成，检查安全评分
      const hasHighRiskRating = safetyRatings.some((rating: any) => 
        rating.probability === 'HIGH' || rating.probability === 'MEDIUM'
      );
      return hasHighRiskRating ? 0.7 : 0.9;
    } else if (finishReason === 'MAX_TOKENS') {
      return 0.8; // 达到最大令牌数，但内容可能完整
    } else {
      return 0.6; // 其他原因（安全过滤等）
    }
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
      const baseUrl = this.config.baseUrl || 'https://generativelanguage.googleapis.com';
      const model = this.config.model || 'gemini-1.5-flash';
      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Hello'
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
