# 修复日志

## [v1.0.1] - 2025-09-20

### 🐛 Bug 修复

#### 修复侧边栏切换导致顶部导航栏丢失问题
- **问题**: 左侧边栏切换标签页时，顶部导航栏出现闪烁或暂时消失
- **原因**: MainContent 组件中不必要的 useEffect 导致重渲染，CSS 层级不足
- **修复**: 
  - 移除 MainContent 中监听 `sidebarActiveTab` 的 useEffect
  - 强化 TopNavigation 的 CSS 样式（sticky定位、高z-index、边框阴影）
  - 清理未使用的状态变量
- **影响文件**:
  - `src/components/layout/MainContent.tsx`
  - `src/components/layout/TopNavigation.tsx`
- **测试状态**: ✅ 已验证修复

#### 修复聊天区域缩放按钮错误缩放问题
- **问题**: 点击缩放按钮后，实际缩放到 60% 或更小，而非预期的 80%
- **原因**: 使用了 `max-width: 80vw` (视口宽度) 而非 `max-width: 80%` (父容器宽度)
- **修复**: 
  - 将 MessageArea 和 InputArea 中的 `80vw` 修改为 `80%`
  - 确保缩放是相对于聊天容器而非整个视口
- **影响文件**:
  - `src/components/layout/MainContent.tsx`
- **测试状态**: ✅ 已验证修复

### 📚 文档更新
- 新增 `docs/troubleshooting/sidebar-navigation-disappearing-bug.md` - 详细问题分析文档
- 更新 `docs/CHANGELOG.md` - 修复记录

---

## 修复前后对比

### 修复前
```typescript
// MainContent.tsx - 问题代码
useEffect(() => {
  if (sidebarActiveTab !== previousSidebarTab) {
    setMessages([]);        // 导致重渲染
    setInputValue('');      // 导致重渲染
    // ...
  }
}, [sidebarActiveTab, previousSidebarTab, currentTopicId]);
```

### 修复后
```typescript
// MainContent.tsx - 优化后
useEffect(() => {
  if (currentTopicId !== currentTopicIdRef) {
    setMessages([]);        // 只在话题切换时清理
    setInputValue('');
    setCurrentTopicIdRef(currentTopicId);
  }
}, [currentTopicId, currentTopicIdRef]);
```

### CSS 强化
```css
/* TopNavigation.tsx - 新增样式 */
position: sticky;
top: 0;
z-index: 1001;
border-bottom: 1px solid var(--border-color);
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```

---

**修复人员**: AI Assistant  
**复查状态**: 已通过构建和功能测试  
**部署状态**: 可部署 ✅