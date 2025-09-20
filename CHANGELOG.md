# 更新日志

所有值得注意的项目变更都会记录在此文件中。

## [1.0.1] - 2025-01-20

### 🐛 Bug修复
- **[重要]** 修复点击"清空消息"导致侧边栏标签页消失的问题
  - 修复了AppLayout中SidePanel组件重复渲染的问题
  - 修复了SidePanel高度被TopNavigation遮挡的布局问题
  - 确保标签页在任何操作后都保持可见
  - 详见：[docs/troubleshooting/sidebar-clear-messages-bug-final.md](./docs/troubleshooting/sidebar-clear-messages-bug-final.md)

### 🔧 技术改进
- 优化了AppLayout的条件渲染逻辑，确保组件实例的互斥性
- 改进了SidePanel的布局高度计算，避免固定导航栏遮挡
- 清理了调试代码，提升代码整洁性

### 📝 文档更新
- 新增详细的bug修复报告文档
- 记录了调试过程和解决方案
- 添加了预防措施和最佳实践

---

## 版本说明

- **修复版本**：包含bug修复和小的改进
- **功能版本**：包含新功能和向后兼容的API变更  
- **主要版本**：包含重大变更和可能的破坏性更新

## 贡献指南

如果您发现了bug或有改进建议，请：
1. 在GitHub Issues中报告问题
2. 提供详细的复现步骤
3. 如果可能，请提供修复建议

感谢您对项目的贡献！