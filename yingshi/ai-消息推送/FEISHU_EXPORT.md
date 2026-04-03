# 飞书文档导出功能说明

## 功能概述

该功能允许用户将收藏的文章一键导出到飞书文档，支持单选或多选操作。

## 配置说明

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录并创建企业自建应用
3. 获取 **App ID** 和 **App Secret**
4. 在应用管理页面，申请以下权限：
   - `docx:document` - 查看、编辑和管理文档
   - `drive:drive` - 查看、编辑和管理云空间中的文件

### 2. 配置环境变量

在 `.env` 文件或环境变量中配置以下参数：

```bash
# 飞书应用配置
RSSANT_FEISHU_ENABLE=true
RSSANT_FEISHU_APP_ID=your_app_id
RSSANT_FEISHU_APP_SECRET=your_app_secret
RSSANT_FEISHU_FOLDER_TOKEN=your_folder_token  # 可选，指定导出文件夹
```

### 3. 配置说明

- `RSSANT_FEISHU_ENABLE`: 是否启用飞书文档导出功能（默认：false）
- `RSSANT_FEISHU_APP_ID`: 飞书应用的 App ID（必填）
- `RSSANT_FEISHU_APP_SECRET`: 飞书应用的 App Secret（必填）
- `RSSANT_FEISHU_FOLDER_TOKEN`: 飞书文件夹 Token（可选，不配置则导出到根目录）

## 使用方法

### 1. 访问收藏页面

在应用首页，点击"收藏"菜单项，进入收藏文章页面。

### 2. 选择文章

- 点击文章左侧的复选框选择单篇文章
- 点击页面顶部的"全选"复选框选择所有文章
- 选中的文章会显示蓝色边框

### 3. 导出到飞书文档

1. 选择要导出的文章（至少选择一篇）
2. 点击页面右上角的"导出到飞书文档"按钮
3. 等待导出完成
4. 导出成功后，会显示导出的文档链接

### 4. 查看导出结果

- 导出成功后，会在通知中显示导出的文档链接
- 点击链接即可在飞书文档中查看导出的文章
- 每篇文章会创建一个独立的飞书文档

## 技术实现

### 后端实现

1. **飞书服务类** (`rssant_api/feishu_service.py`)
   - 处理飞书API调用
   - 获取访问令牌
   - 创建文档
   - 添加内容块

2. **导出API** (`rssant_api/views/story.py`)
   - `story.export_to_feishu` - 导出文章到飞书文档
   - 支持批量导出
   - 返回导出结果和文档链接

### 前端实现

1. **API方法** (`frontend/src/lib/api.ts`)
   - `storyApi.exportToFeishu` - 调用导出API

2. **收藏页面** (`frontend/src/pages/FavoritesPage.tsx`)
   - 多选功能
   - 导出按钮
   - 导出进度显示

## 注意事项

1. **权限要求**：确保飞书应用已申请必要的权限
2. **API限制**：注意飞书API的调用频率限制
3. **错误处理**：导出失败时会显示错误信息
4. **内容格式**：文章内容会转换为Markdown格式后导入飞书文档

## 故障排除

### 1. 导出失败

- 检查飞书应用配置是否正确
- 检查飞书应用权限是否已申请
- 查看后端日志获取详细错误信息

### 2. 文档创建失败

- 检查飞书文件夹Token是否正确
- 检查是否有创建文档的权限
- 查看飞书API返回的错误信息

### 3. 内容添加失败

- 检查文章内容格式是否正确
- 检查Markdown转换是否正确
- 查看后端日志获取详细错误信息

## 更新日志

- 2025-01-XX: 初始版本，支持批量导出到飞书文档

