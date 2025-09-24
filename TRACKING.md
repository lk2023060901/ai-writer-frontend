# 埋点系统使用指南

本项目集成了一套轻量级的前端埋点系统，支持用户行为分析、性能监控和开发调试。

## 🚀 快速开始

埋点系统已自动集成到应用中，无需额外配置即可使用。

### 开发环境调试

1. **打开调试面板**：按 `Ctrl + Shift + D` 或点击右下角的 "Debug" 按钮
2. **查看实时事件**：所有用户交互都会实时显示在调试面板中
3. **过滤事件**：可以按事件类型、时间范围、搜索文本等过滤
4. **导出数据**：点击"导出"按钮下载完整的埋点数据

## 📊 已集成的埋点事件

### 聊天相关
- `chat_message_send` - 消息发送
- `chat_message_receive` - 消息接收
- `chat_message_copy` - 消息复制
- `chat_message_regenerate` - 消息重新生成
- `chat_conversation_clear` - 清空对话

### 模型相关
- `model_select` - 模型切换
- `model_modal_open` - 模型选择弹窗打开
- `model_modal_close` - 模型选择弹窗关闭

### 应用和导航
- `app_launcher_open` - 应用启动器打开
- `app_click` - 应用点击
- `tab_switch` - 标签页切换
- `tab_close` - 标签页关闭

### 界面操作
- `sidebar_toggle` - 侧边栏折叠/展开
- `chat_width_toggle` - 聊天宽度切换
- `toolbar_action` - 工具栏操作

### 组件生命周期
- `component_mount` - 组件挂载
- `component_unmount` - 组件卸载

## 🛠 在代码中使用

### 基础埋点

```typescript
import { useTracker } from '@/hooks/useTracking';

const { track } = useTracker();

// 发送自定义事件
track('button_click', {
  buttonName: 'submit',
  formType: 'contact'
});
```

### 业务埋点

```typescript
import { useChatTracking, useModelTracking } from '@/hooks/useTracking';

const chatTracking = useChatTracking();
const modelTracking = useModelTracking();

// 聊天消息发送
chatTracking.trackMessageSend(message, modelName);

// 模型切换
modelTracking.trackModelSwitch(fromModel, toModel);
```

### 组件埋点

```typescript
import { useComponentTracking } from '@/hooks/useTracking';

const MyComponent = () => {
  // 自动追踪组件生命周期
  useComponentTracking('MyComponent');

  return <div>组件内容</div>;
};
```

## 🔧 配置第三方服务

通过环境变量配置分析服务：

### Google Analytics 4

```bash
# .env
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Mixpanel

```bash
# .env
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

### 自定义Webhook

```bash
# .env
VITE_TRACKING_WEBHOOK=https://your-api.com/tracking
```

## 📱 调试面板功能

### 事件流
- 实时显示所有埋点事件
- 按时间倒序排列
- 支持搜索和过滤
- 彩色编码不同事件类型

### 统计信息
- 总事件数量
- 最近1分钟事件数
- 会话时长
- 热门事件排行

### 操作功能
- 清空事件数据
- 导出JSON格式数据
- 可拖拽移动面板
- 最小化/展开面板

## 📊 事件数据结构

```typescript
interface SimpleTrackingEvent {
  name: string;           // 事件名称
  props: object;          // 事件属性
  time: number;           // 时间戳
  session: string;        // 会话ID
  page: string;           // 页面标识
  url: string;            // 完整URL
}
```

## 🎯 最佳实践

### 命名规范
- 使用下划线分隔：`chat_message_send`
- 按功能分组：`chat_*`, `model_*`, `app_*`
- 动词在最后：`button_click`, `page_view`

### 属性设计
- 保持属性精简，避免发送敏感信息
- 使用标准化的属性名称
- 数值型属性便于后续分析

### 性能考虑
- 埋点代码不会阻塞主线程
- 本地缓存自动清理过期数据
- 批量上报减少网络请求

## 🔒 隐私保护

- 不收集用户输入的具体内容
- 不存储个人身份信息
- 支持用户选择退出埋点
- 遵循 GDPR 等隐私法规

## 🚨 故障排除

### 调试面板不显示
1. 检查是否在开发环境
2. 按 `Ctrl + Shift + D` 手动打开
3. 检查浏览器控制台是否有错误

### 事件没有发送
1. 检查网络连接
2. 验证第三方服务配置
3. 查看浏览器控制台的错误信息

### 数据丢失
- 埋点数据存储在 sessionStorage 中
- 刷新页面会保留当前会话数据
- 关闭标签页会清空数据

## 📈 扩展开发

### 添加新的埋点事件

1. 在 `useTracking.ts` 中定义事件类型
2. 创建专用的 Hook
3. 在组件中调用埋点方法

### 集成新的分析服务

1. 在 `analytics.ts` 中添加服务配置
2. 实现发送方法
3. 更新配置类型定义

### 自定义调试面板

调试面板支持自定义过滤器和显示格式，可以根据需要修改 `TrackingDebugPanel.tsx`。