# 字幕翻译器

一个基于 Next.js 和 AI 大语言模型的专业字幕翻译工具

## 功能特性

- 🎯 **多格式支持**: 支持 SRT、VTT、ASS 等常见字幕格式
- 🤖 **多 LLM 集成**: 支持 OpenAI、Claude、Gemini、本地模型等多种 AI 服务
- 🌍 **多语言翻译**: 支持 20+ 种语言之间的互译
- 📱 **用户友好**: 直观的拖拽上传界面和实时翻译进度
- ⚡ **高效处理**: 批量翻译和智能上下文理解
- 🎨 **现代界面**: 基于 Tailwind CSS 的响应式设计
- ⏸️ **翻译控制**: 支持暂停、恢复、取消翻译操作
- 🔧 **并发设置**: 可调节并发线程数和性能模式
- 🎯 **质量选择**: 快速/标准/精确三种翻译质量模式
- 📦 **批量处理**: 支持多文件同时处理
- 💾 **设置管理**: 自动保存用户偏好和翻译历史

## 技术栈

- **前端框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **类型安全**: TypeScript
- **状态管理**: React Context + useReducer
- **AI 集成**: OpenAI API、Claude API、本地模型支持

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 打开浏览器

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 使用指南

### 单文件翻译模式

#### 步骤 1: 上传字幕文件
- 拖拽或点击选择字幕文件（支持 .srt、.vtt、.ass 格式）
- 系统会自动解析并检测源语言

#### 步骤 2: 配置翻译设置
- 选择源语言和目标语言
- 配置 LLM API 设置（OpenAI、Claude、Gemini 或本地模型）
- 选择翻译质量模式（快速/标准/精确）
- 调整并发处理设置（性能模式和线程数）

#### 步骤 3: 开始翻译
- 点击"开始翻译"按钮
- 实时查看翻译进度和当前处理的字幕
- 可随时暂停、恢复或取消翻译

#### 步骤 4: 预览和下载
- 预览翻译结果，支持原文对照
- 选择输出格式并下载翻译后的字幕文件

### 批量处理模式
- 支持同时上传多个字幕文件
- 自动批量解析和处理
- 统一的翻译设置应用到所有文件
- 实时显示每个文件的处理状态

### 设置管理
- 自动保存用户偏好设置
- 支持设置的导入和导出
- 翻译历史记录保存
- 一键重置所有设置

## API 配置

### OpenAI
1. 获取 API 密钥：[OpenAI API Keys](https://platform.openai.com/api-keys)
2. 选择模型：
   - **最新推荐**: gpt-4.1-2025-04-14 (GPT-4.1 系列)
   - **推理模型**: o3-pro-2025-06-10, o3-2025-04-16, o3-mini-2025-04-16
   - **经典模型**: o1-pro-2024-12-17, gpt-4o-2024-11-20

### Claude
1. 获取 API 密钥：[Anthropic Console](https://console.anthropic.com/)
2. 选择模型：
   - **最新推荐**: claude-opus-4-20250514, claude-sonnet-4-20250522 (Claude 4 系列)
   - **经典模型**: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022

### Google Gemini
1. 获取 API 密钥：[Google AI Studio](https://makersuite.google.com/app/apikey)
2. 选择模型：
   - **最新推荐**: gemini-2.5-pro-preview-06-05, gemini-2.5-flash-preview-06-03 (Gemini 2.5 系列)
   - **实验模型**: gemini-2.0-flash-thinking-exp
   - **经典模型**: gemini-1.5-pro-002, gemini-1.5-flash-002

### 自定义 OpenAI 兼容
1. 配置第三方服务的 API 地址
2. **必须输入相应的 API 密钥**
3. 支持的服务和模型：
   - **DeepSeek**: deepseek-r1-671b, deepseek-v3-671b, deepseek-r1-distill-llama-70b
     - API地址: `https://api.deepseek.com/v1/chat/completions`
     - 获取密钥: [DeepSeek 控制台](https://platform.deepseek.com/api_keys)
   - **智谱AI**: glm-5-plus, glm-4-flash
     - API地址: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
     - 获取密钥: [智谱AI 开放平台](https://open.bigmodel.cn/usercenter/apikeys)
   - **月之暗面**: moonshot-v2-8k, moonshot-v1-128k
     - API地址: `https://api.moonshot.cn/v1/chat/completions`
     - 获取密钥: [Kimi 开放平台](https://platform.moonshot.cn/console/api-keys)
   - **零一万物**: yi-large-turbo, yi-lightning
     - API地址: `https://api.lingyiwanwu.com/v1/chat/completions`
     - 获取密钥: [零一万物平台](https://platform.lingyiwanwu.com/apikeys)
   - **硅基流动**: 多种模型聚合
     - API地址: `https://api.siliconflow.cn/v1/chat/completions`
     - 获取密钥: [硅基流动控制台](https://cloud.siliconflow.cn/account/ak)

### 本地模型
1. 部署兼容 OpenAI API 的本地服务（如 Ollama、LocalAI）
2. 配置 API 地址和模型名称
3. 推荐模型：
   - **Llama**: llama4:8b, llama3.3:70b, llama3.2:3b
   - **Qwen**: qwen3:14b, qwen2.5-coder:32b, qwen2.5:72b
   - **DeepSeek**: deepseek-r1:32b, deepseek-coder-v2:236b
   - **其他**: phi5:7b, gemma2:27b, mistral-large:123b, codestral2:34b

## 支持的语言

- 中文（简体/繁体）
- 英语
- 日语
- 韩语
- 法语
- 德语
- 西班牙语
- 意大利语
- 葡萄牙语
- 俄语
- 阿拉伯语
- 等 20+ 种语言

## 支持的字幕格式

### SRT (SubRip)
```
1
00:00:01,000 --> 00:00:04,000
这是第一条字幕
```

### VTT (WebVTT)
```
WEBVTT

00:00:01.000 --> 00:00:04.000
这是第一条字幕
```

### ASS (Advanced SubStation Alpha)
```
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,这是第一条字幕
```

## 开发

### 项目结构
```
src/
├── app/                 # Next.js App Router
├── components/          # React 组件
├── context/            # 状态管理
├── lib/                # 核心逻辑
│   ├── parsers/        # 字幕解析器
│   ├── llm/           # LLM 客户端
│   └── utils/         # 工具函数
└── types/             # TypeScript 类型定义
```

### 构建生产版本
```bash
npm run build
npm start
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v0.4.0 (2025-06-12) - 用户体验大幅优化
- ⏸️ **新增**: 翻译暂停/恢复/取消功能
- 🔧 **新增**: 并发处理设置（低/中/高性能模式）
- 🎯 **新增**: 翻译质量选择（快速/标准/精确模式）
- 📦 **新增**: 批量文件处理功能
- 💾 **新增**: 设置管理和历史记录保存
- 🎨 **优化**: 全新的导航界面和响应式设计
- 📊 **增强**: 详细的翻译进度显示和状态指示
- 🔔 **新增**: Toast 通知系统
- ⚙️ **新增**: 设置导入/导出功能
- 🎛️ **优化**: 自定义滑块和交互组件

### v0.3.0 (2025-06-12)
- 🚀 **重大更新**: 支持最新 2025 年模型
- 🧠 新增 OpenAI o3 系列推理模型 (o3-pro, o3, o3-mini)
- 🎯 新增 GPT-4.1 系列模型支持
- 🔥 新增 Claude 4 系列模型 (Opus 4, Sonnet 4)
- ⚡ 新增 Gemini 2.5 系列模型支持
- 🛠️ **修复**: 完全重构自定义模型输入功能
- 📋 新增预设/自定义模型切换选项
- 🎨 改进模型选择界面和用户体验
- 🌐 更新第三方服务商最新模型

### v0.2.0 (2025-06-12)
- 🚀 新增 Google Gemini 支持（包括 Gemini 2.0 Flash）
- 🔧 新增自定义 OpenAI 兼容提供商支持
- ⚡ 更新所有模型到最新版本（2024年12月）
- 🎯 支持 OpenAI o1 推理模型系列
- 💡 新增自定义模型输入功能
- 📋 新增模型建议和快速选择
- 🌐 支持更多第三方 AI 服务商

### v0.1.0 (2025-06-12)
- 初始版本发布
- 支持 SRT、VTT、ASS 格式解析
- 集成 OpenAI、Claude、本地模型
- 实现完整的翻译工作流程
