# AI Chat Application

这是一个基于 **Next.js 16** 和 **LangChain** 构建的现代 AI 聊天应用。它通过 **LangGraph** 实现了有状态的对话管理，支持流式响应、多会话历史记录持久化以及 Markdown 内容渲染。

## ✨ 功能特性

- **💬 智能对话**: 集成 OpenAI 模型，支持自然语言交互。
- **🌊 流式响应**: 基于 Server-Sent Events (SSE) 实现打字机效果的实时流式输出。
- **💾 会话持久化**: 使用 SQLite 本地数据库保存完整的对话历史和上下文状态。
- **🗂️ 多会话管理**: 支持创建新会话、切换历史会话，侧边栏实时管理。
- **📝 Markdown 支持**: 完美渲染代码块、表格、列表等 Markdown 格式，并内置代码高亮。
- **🎨 现代 UI**: 采用 Tailwind CSS v4 构建的响应式界面，适配深色/浅色模式（基础架构已备）。

## 🛠️ 技术栈

- **前端框架**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **语言**: TypeScript
- **样式方案**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) (图标)
- **AI & Agent**:
  - [LangChain](https://js.langchain.com/) (SDK)
  - [LangGraph](https://langchain-ai.github.io/langgraphjs/) (状态机与工作流)
  - `@langchain/openai` (模型接入)
- **数据库**:
  - `better-sqlite3` (高性能本地 SQLite)
  - `@langchain/langgraph-checkpoint-sqlite` (LangGraph 状态持久化)
- **Markdown 渲染**: `react-markdown`, `remark-gfm`, `rehype-highlight`

## 🚀 快速开始

### 1. 环境准备

- **Node.js**: >= 20.0.0
- **包管理器**: pnpm (推荐)

### 2. 克隆项目

```bash
git clone <your-repo-url>
cd my-chat-app
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 环境变量配置

在项目根目录下创建一个 `.env` 文件，并添加以下配置：

```env
# OpenAI API Key (必填)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 模型名称 (可选，默认为 gpt-3.5-turbo 或 gpt-4)
OPENAI_MODEL_NAME=gpt-4o
```

> ⚠️ 注意：本项目使用 `better-sqlite3`，数据库文件 `chat_history.db` 会在运行时自动在项目根目录生成。

### 5. 运行开发服务器

```bash
pnpm dev
```

现在，打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可看到应用。

## 📂 目录结构

```
my-chat-app/
├── app/
│   ├── agent/           # AI 代理核心逻辑
│   │   ├── chatbot.ts   # LangGraph 工作流定义
│   │   ├── db.ts        # SQLite 数据库操作
│   │   └── index.ts     # 导出入口
│   ├── api/             # Next.js API 路由
│   │   └── chat/        # 处理聊天请求和会话管理
│   ├── components/      # React UI 组件
│   ├── hooks/           # 自定义 React Hooks
│   ├── utils/           # 工具函数
│   ├── layout.tsx       # 全局布局
│   └── page.tsx         # 主页面
├── public/              # 静态资源
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

## 📝 数据库说明

项目启动后会自动在根目录生成 `chat_history.db` SQLite 数据库文件。

- **sessions 表**: 存储会话元数据（ID、名称、创建时间）。
- **checkpoints 表**: 由 LangGraph 自动管理，存储对话的上下文快照。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

## 📄 许可证

[MIT](LICENSE)
