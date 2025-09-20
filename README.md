# AI Writer Frontend

一个基于 React + TypeScript + Vite 构建的 AI 写作工具前端项目，提供现代化、高性能的用户界面。

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm/yarn/pnpm

### 安装和运行
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 📚 项目文档

- [**故障排除指南**](./docs/troubleshooting/) - 常见问题的排查和解决方案
  - [侧边栏标签页消失问题修复](./docs/troubleshooting/sidebar-clear-messages-bug-final.md)
- [**更新日志**](./CHANGELOG.md) - 项目版本更新和bug修复记录

## 🛠️ 技术栈

- **前端框架**: React 18.3.1
- **类型系统**: TypeScript 5.8.3  
- **构建工具**: Vite 7.1.6
- **状态管理**: Redux Toolkit + React-Redux
- **UI 组件库**: Ant Design 5.27.4
- **样式方案**: Tailwind CSS + styled-components
- **路由**: React Router DOM 7.9.1

## 💬 核心功能

- **AI 聊天交互** - 支持流式响应和多模型切换
- **智能体管理** - 创建和管理不同的AI助手
- **知识库管理** - 文档上传、处理和检索
- **主题定制** - ChatGPT/Claude主题切换和深色模式
- **多标签页** - 支持多个会话同时进行

---

# React + TypeScript + Vite Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
