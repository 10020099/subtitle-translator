import { LLMProvider, LLMConfig, LLMClient } from '@/types/llm';
import { OpenAIClient } from './openai-client';
import { ClaudeClient } from './claude-client';
import { GeminiClient } from './gemini-client';
import { CustomOpenAIClient } from './custom-openai-client';
import { LocalClient } from './local-client';

export class LLMFactory {
  /**
   * 创建LLM客户端实例
   */
  static createClient(config: LLMConfig): LLMClient {
    switch (config.provider) {
      case LLMProvider.OPENAI:
        return new OpenAIClient(config);

      case LLMProvider.CLAUDE:
        return new ClaudeClient(config);

      case LLMProvider.GEMINI:
        return new GeminiClient(config);

      case LLMProvider.CUSTOM_OPENAI:
        return new CustomOpenAIClient(config);

      case LLMProvider.LOCAL:
        return new LocalClient(config);

      default:
        throw new Error(`不支持的LLM提供商: ${config.provider}`);
    }
  }

  /**
   * 获取支持的模型列表
   */
  static getSupportedModels(provider: LLMProvider): string[] {
    switch (provider) {
      case LLMProvider.OPENAI:
        return [
          'gpt-4.1-2025-04-14',
          'o3-pro-2025-06-10',
          'o3-2025-04-16',
          'o3-mini-2025-04-16',
          'o1-pro-2024-12-17',
          'o1-2024-12-17',
          'gpt-4o-2024-11-20',
          'gpt-4o-mini-2024-07-18',
          'custom-model'
        ];

      case LLMProvider.CLAUDE:
        return [
          'claude-opus-4-20250514',
          'claude-sonnet-4-20250522',
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
          'custom-model'
        ];

      case LLMProvider.GEMINI:
        return [
          'gemini-2.5-pro-preview-06-05',
          'gemini-2.5-flash-preview-06-03',
          'gemini-2.0-flash-thinking-exp',
          'gemini-1.5-pro-002',
          'gemini-1.5-flash-002',
          'custom-model'
        ];

      case LLMProvider.CUSTOM_OPENAI:
        return [
          'deepseek-r1-distill-llama-70b',
          'deepseek-v3',
          'deepseek-reasoner',
          'glm-4-plus',
          'glm-4-flash',
          'moonshot-v1-128k',
          'yi-lightning',
          'qwen2.5-72b-instruct',
          'doubao-pro-32k',
          'custom-model'
        ];

      case LLMProvider.LOCAL:
        return [
          'llama3.3:70b',
          'llama3.2:3b',
          'qwen2.5-coder:32b',
          'qwen2.5:72b',
          'deepseek-coder-v2:236b',
          'phi4:14b',
          'gemma2:27b',
          'mistral-large:123b',
          'custom-model'
        ];

      default:
        return [];
    }
  }

  /**
   * 获取默认模型
   */
  static getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case LLMProvider.OPENAI:
        return 'gpt-4.1-2025-04-14';

      case LLMProvider.CLAUDE:
        return 'claude-sonnet-4-20250522';

      case LLMProvider.GEMINI:
        return 'gemini-2.5-flash-preview-06-03';

      case LLMProvider.CUSTOM_OPENAI:
        return 'deepseek-v3';

      case LLMProvider.LOCAL:
        return 'llama3.3:70b';

      default:
        throw new Error(`不支持的LLM提供商: ${provider}`);
    }
  }

  /**
   * 获取常用自定义模型建议
   */
  static getCustomModelSuggestions(provider: LLMProvider): string[] {
    switch (provider) {
      case LLMProvider.OPENAI:
        return [
          'o4-mini-2025-04-16',
          'o3-mini-2025-04-16',
          'gpt-4.1-nano-2025-04-14',
          'chatgpt-4o-latest',
          'gpt-4o-realtime-preview'
        ];

      case LLMProvider.CLAUDE:
        return [
          'claude-opus-4-latest',
          'claude-sonnet-4-latest',
          'claude-3-5-sonnet-latest',
          'claude-3-5-haiku-latest'
        ];

      case LLMProvider.GEMINI:
        return [
          'gemini-3.0-ultra-preview',
          'gemini-2.5-pro-latest',
          'gemini-2.5-flash-latest',
          'gemini-2.0-flash-thinking-exp'
        ];

      case LLMProvider.CUSTOM_OPENAI:
        return [
          'deepseek-r1-671b',
          'deepseek-v3-671b',
          'glm-5-plus',
          'moonshot-v2-8k',
          'yi-large-turbo',
          'qwen3-72b-instruct',
          'doubao-pro-256k'
        ];

      case LLMProvider.LOCAL:
        return [
          'llama4:8b',
          'qwen3:14b',
          'deepseek-r1:32b',
          'phi5:7b',
          'codestral2:34b'
        ];

      default:
        return [];
    }
  }

  /**
   * 获取提供商信息
   */
  static getProviderInfo(provider: LLMProvider): {
    name: string;
    description: string;
    requiresApiKey: boolean;
    requiresBaseUrl: boolean;
    supportsCustomName: boolean;
    apiKeyPlaceholder?: string;
    baseUrlPlaceholder?: string;
  } {
    switch (provider) {
      case LLMProvider.OPENAI:
        return {
          name: 'OpenAI',
          description: 'OpenAI GPT 模型，包括 GPT-4 和 GPT-3.5',
          requiresApiKey: true,
          requiresBaseUrl: false,
          supportsCustomName: false,
          apiKeyPlaceholder: '请输入 OpenAI API 密钥'
        };

      case LLMProvider.CLAUDE:
        return {
          name: 'Claude',
          description: 'Anthropic Claude 模型系列',
          requiresApiKey: true,
          requiresBaseUrl: false,
          supportsCustomName: false,
          apiKeyPlaceholder: '请输入 Claude API 密钥'
        };

      case LLMProvider.GEMINI:
        return {
          name: 'Google Gemini',
          description: 'Google Gemini 模型系列',
          requiresApiKey: true,
          requiresBaseUrl: false,
          supportsCustomName: false,
          apiKeyPlaceholder: '请输入 Gemini API 密钥'
        };

      case LLMProvider.CUSTOM_OPENAI:
        return {
          name: '自定义 OpenAI 兼容',
          description: '支持 OpenAI API 格式的第三方服务',
          requiresApiKey: true,
          requiresBaseUrl: true,
          supportsCustomName: true,
          apiKeyPlaceholder: '请输入第三方服务 API 密钥',
          baseUrlPlaceholder: 'https://api.example.com/v1/chat/completions'
        };

      case LLMProvider.LOCAL:
        return {
          name: '本地模型',
          description: '本地部署的模型服务（如 Ollama）',
          requiresApiKey: false,
          requiresBaseUrl: true,
          supportsCustomName: true,
          baseUrlPlaceholder: 'http://localhost:11434'
        };

      default:
        throw new Error(`不支持的LLM提供商: ${provider}`);
    }
  }

  /**
   * 验证配置是否有效
   */
  static async validateConfig(config: LLMConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const client = this.createClient(config);
      const isValid = await client.validateConfig();

      return {
        valid: isValid,
        error: isValid ? undefined : '配置验证失败，请检查API密钥和模型设置'
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '配置验证失败'
      };
    }
  }
}
