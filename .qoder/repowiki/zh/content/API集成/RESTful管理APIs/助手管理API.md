# 助手管理API

<cite>
**本文档引用的文件**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts)
- [index.ts](file://src/types/index.ts)
- [assistantSlice.ts](file://src/store/slices/assistantSlice.ts)
</cite>

## 目录
1. [简介](#简介)
2. [API端点详情](#api端点详情)
3. [助手类型定义](#助手类型定义)
4. [Hook使用示例](#hook使用示例)
5. [缓存与重新获取机制](#缓存与重新获取机制)
6. [权限控制建议](#权限控制建议)
7. [常见问题解决方案](#常见问题解决方案)

## 简介
助手管理API提供了一套完整的CRUD操作，用于管理AI助手。该API基于RTK Query实现，提供了高效的数据获取和缓存机制。通过这套API，用户可以创建、读取、更新和删除助手，同时支持实时数据同步和自动缓存更新。

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L87-L123)

## API端点详情

### 获取所有助手
- **HTTP方法**: GET
- **端点**: `/api/assistants`
- **Hook**: `useGetAssistantsQuery`
- **请求参数**: 无
- **响应格式**: `ApiResponse<Assistant[]>`
- **功能描述**: 获取所有可用的助手列表

### 获取单个助手
- **HTTP方法**: GET
- **端点**: `/api/assistants/{id}`
- **Hook**: `useGetAssistantQuery`
- **请求参数**: 助手ID（路径参数）
- **响应格式**: `ApiResponse<Assistant>`
- **功能描述**: 根据ID获取特定助手的详细信息

### 创建助手
- **HTTP方法**: POST
- **端点**: `/api/assistants`
- **Hook**: `useCreateAssistantMutation`
- **请求体**: `Partial<Assistant>`
- **响应格式**: `ApiResponse<Assistant>`
- **功能描述**: 创建一个新的助手

### 更新助手
- **HTTP方法**: PUT
- **端点**: `/api/assistants/{id}`
- **Hook**: `useUpdateAssistantMutation`
- **请求参数**: 
  - `id`: 助手ID（路径参数）
  - `assistant`: `Partial<Assistant>`（请求体）
- **响应格式**: `ApiResponse<Assistant>`
- **功能描述**: 更新指定ID的助手信息

### 删除助手
- **HTTP方法**: DELETE
- **端点**: `/api/assistants/{id}`
- **Hook**: `useDeleteAssistantMutation`
- **请求参数**: 助手ID（路径参数）
- **响应格式**: `ApiResponse<void>`
- **功能描述**: 删除指定ID的助手

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L87-L123)

## 助手类型定义
助手对象包含以下字段：

- **id**: `string` - 助手的唯一标识符
- **name**: `string` - 助手名称，必填字段
- **description**: `string` - 助手描述，必填字段
- **avatar**: `string` (可选) - 助手头像URL
- **model**: `string` - 使用的AI模型名称，必填字段
- **prompt**: `string` - 助手的系统提示词，必填字段
- **isDefault**: `boolean` - 是否为默认助手
- **createdAt**: `string` - 创建时间（ISO格式）
- **updatedAt**: `string` - 更新时间（ISO格式）

所有字符串字段不能为空，`isDefault`字段用于标识系统默认助手。

**Section sources**
- [index.ts](file://src/types/index.ts#L13-L23)

## Hook使用示例

### 获取助手列表
```typescript
const { data, error, isLoading } = useGetAssistantsQuery();
```

### 获取单个助手
```typescript
const { data, error, isLoading } = useGetAssistantQuery('assistant-123');
```

### 创建助手
```typescript
const [createAssistant, { isLoading }] = useCreateAssistantMutation();

const handleCreate = async () => {
  try {
    const result = await createAssistant({
      name: '新助手',
      description: '这是一个新创建的助手',
      model: 'gpt-4',
      prompt: '你是一个有用的助手',
      isDefault: false
    }).unwrap();
    console.log('助手创建成功:', result.data);
  } catch (error) {
    console.error('创建助手失败:', error);
  }
};
```

### 更新助手
```typescript
const [updateAssistant] = useUpdateAssistantMutation();

const handleUpdate = async () => {
  try {
    const result = await updateAssistant({
      id: 'assistant-123',
      assistant: {
        name: '更新后的助手名称',
        description: '更新后的描述'
      }
    }).unwrap();
    console.log('助手更新成功:', result.data);
  } catch (error) {
    console.error('更新助手失败:', error);
  }
};
```

### 删除助手
```typescript
const [deleteAssistant] = useDeleteAssistantMutation();

const handleDelete = async (assistantId: string) => {
  if (window.confirm('确定要删除这个助手吗？')) {
    try {
      await deleteAssistant(assistantId).unwrap();
      console.log('助手删除成功');
    } catch (error) {
      console.error('删除助手失败:', error);
    }
  }
};
```

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L272-L304)

## 缓存与重新获取机制

### 标签类型
API使用`tagTypes: ['Assistant']`来管理缓存，实现自动重新获取功能。

### 缓存策略
- **getAssistants**: 使用`providesTags: ['Assistant']`，当任何助手数据发生变化时，会自动重新获取助手列表
- **getAssistant**: 使用`providesTags: [{ type: 'Assistant', id }]`，为每个助手创建独立的缓存标签
- **createAssistant**: 使用`invalidatesTags: ['Assistant']`，创建新助手后会自动使所有助手列表缓存失效，触发重新获取
- **updateAssistant**: 使用`invalidatesTags: [{ type: 'Assistant', id }]`，更新特定助手后会使其缓存失效
- **deleteAssistant**: 使用`invalidatesTags: ['Assistant']`，删除助手后会刷新助手列表

这种机制确保了数据的一致性，当数据发生变化时，相关查询会自动重新获取最新数据。

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L87-L123)

## 权限控制建议
1. **身份验证**: 在`baseQuery`的`prepareHeaders`中添加认证token
2. **角色权限**: 根据用户角色限制对助手的CRUD操作
3. **数据隔离**: 确保用户只能访问和操作自己创建的助手
4. **敏感操作确认**: 对删除操作添加二次确认
5. **审计日志**: 记录所有助手的创建、更新和删除操作

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L70-L75)

## 常见问题解决方案

### 数据未及时更新
**问题**: 创建或更新助手后，列表数据没有立即更新
**解决方案**: 确保`invalidatesTags`正确配置，RTK Query会自动处理缓存失效和重新获取

### 并发修改冲突
**问题**: 多个用户同时修改同一个助手
**解决方案**: 在后端实现乐观锁或版本控制，前端处理409冲突错误

### 网络错误处理
```typescript
const [createAssistant] = useCreateAssistantMutation();

try {
  const result = await createAssistant(assistantData).unwrap();
  // 处理成功
} catch (error: any) {
  if (error.status === 401) {
    // 处理未授权
    console.log('请先登录');
  } else if (error.status === 403) {
    // 处理权限不足
    console.log('没有权限创建助手');
  } else if (error.status === 400) {
    // 处理请求错误
    console.log('请求数据无效');
  } else {
    // 处理其他错误
    console.log('操作失败，请重试');
  }
}
```

### 性能优化
1. 使用`skip`参数控制查询执行
2. 利用RTK Query的自动缓存减少网络请求
3. 对大型列表实现分页

**Section sources**
- [apiSlice.ts](file://src/store/slices/apiSlice.ts#L36-L41)