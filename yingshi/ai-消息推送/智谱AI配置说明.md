# 智谱AI配置说明

## 已完成的配置

项目已成功配置智谱AI大模型，用于文章AI分析功能和翻译功能。

### 配置信息

 - **API Key**: `[REDACTED]`
- **模型ID**: `glm-z1-flash`
- **模型名称**: `glm-z1-flash`
- **API Base URL**: `https://open.bigmodel.cn/api/paas/v4`

### 配置文件

配置已添加到项目根目录的 `.env` 文件中：

```bash
# AI分析功能配置（智谱AI）
# AI模型配置：格式 model_id,model_name
RSSANT_AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# AI API基础URL（智谱AI）
RSSANT_AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

 # AI API密钥（智谱AI）
 RSSANT_AI_API_KEY=[REDACTED]
```

## 如何生效

### 1. 重启服务

配置完成后，需要重启 API 服务使配置生效：

```bash
 cd /path/to/rss-subscribe
bash start-all-services.sh restart api
```

### 2. 验证配置

配置生效后，可以：

1. **查看日志**确认配置已加载：
   ```bash
   bash start-all-services.sh logs api
   ```

2. **测试AI分析功能**：
   - 打开任意一篇文章详情页
   - 等待2秒，系统会自动触发AI分析
   - 或在AI分析组件中点击"开始AI分析"按钮手动触发
   - 查看分析结果，应该包含：
     - 一句话总结
     - AI评分（带颜色标识）
     - 详细摘要
     - 主要内容列表
     - 文章金句
     - 标签
     - 相关阅读（如果有）

## 配置说明

### 环境变量命名规则

项目的环境变量使用 `RSSANT_` 前缀，配置项名称为大写：

- `RSSANT_AI_MODEL_CONFIG`: AI模型配置
- `RSSANT_AI_API_BASE_URL`: AI API基础URL
- `RSSANT_AI_API_KEY`: AI API密钥

### AI模型配置格式

`RSSANT_AI_MODEL_CONFIG` 格式：`model_id,model_name`

- `model_id`: 模型ID，用于API调用（例如：`glm-z1-flash`、`glm-4-flash`）
- `model_name`: 模型名称，用于显示（`glm-z1-flash`）

### 配置位置

- **本地开发**: 项目根目录的 `.env` 文件
- **生产环境**: 可通过系统环境变量或指定配置文件路径设置 `RSSANT_CONFIG` 环境变量

## 功能说明

### AI分析功能

AI分析功能会自动为每篇文章生成：

- ✅ **一句话总结**（50字以内）
- ✅ **详细摘要**（200-300字）
- ✅ **主要内容点**（3-5个）
- ✅ **文章金句**（2-4个）
- ✅ **AI评分**（0-100分）
- ✅ **标签**（3-5个）
- ✅ **相关阅读建议**（可选）

### AI翻译功能

AI翻译功能可以将英文文章翻译成中文：

- ✅ **自动识别语言**：系统会自动识别文章是否为英文
- ✅ **翻译标题和内容**：同时翻译文章标题和正文内容
- ✅ **保持格式**：保留原文的Markdown格式
- ✅ **流畅自然**：翻译结果流畅自然，专业术语准确
- ✅ **实时翻译**：点击"AI翻译"按钮即可实时翻译
- ✅ **切换显示**：可以在原文和翻译之间切换查看

### 使用场景

**AI分析功能**:
1. **自动分析**: 文章加载时，如果没有分析结果，会自动触发AI分析（延迟2秒）
2. **手动分析**: 在AI分析组件中点击"开始AI分析"按钮
3. **刷新分析**: 使用"刷新"按钮强制重新分析

**AI翻译功能**:
1. **手动翻译**: 在文章详情页点击"AI翻译"按钮
2. **实时翻译**: 系统会调用智谱AI模型进行翻译
3. **切换显示**: 翻译完成后可以在原文和翻译之间切换查看

### 缓存机制

- ✅ 已分析的文章会缓存结果
- ✅ 避免重复分析，节省API调用成本
- ✅ 可通过"刷新"按钮强制重新分析

## 安全提示

⚠️ **重要**: `.env` 文件已添加到 `.gitignore`，确保 API key 不会被提交到代码仓库。

请不要将包含真实 API key 的 `.env` 文件提交到版本控制系统。

## 故障排查

### 问题：AI分析一直显示"分析中..."

**可能原因**:
1. API密钥未配置或配置错误
2. API服务不可用
3. 网络连接问题
4. API超时

**解决方法**:
1. 检查 `.env` 文件中的 `RSSANT_AI_API_KEY` 配置是否正确
2. 检查API服务是否正常运行（智谱AI服务）
3. 查看API服务日志：`bash start-all-services.sh logs api`
4. 尝试手动刷新分析

### 问题：配置未生效

**解决方法**:
1. 确认 `.env` 文件在项目根目录
2. 重启API服务：`bash start-all-services.sh restart api`
3. 检查环境变量是否正确加载：查看启动日志

### 问题：API调用失败

**可能原因**:
1. API key 无效或过期
2. 模型名称错误
3. API base URL 不正确

**解决方法**:
1. 验证 API key 是否有效
2. 确认模型ID `glm-z1-flash`（或其他智谱官方模型代号）和模型名称 `glm-z1-flash` 是否正确
3. 检查 API base URL 是否为 `https://open.bigmodel.cn/api/paas/v4`

### 问题：翻译功能无法使用

**可能原因**:
1. API密钥未配置或配置错误
2. 模型ID配置错误
3. 文章内容为空

**解决方法**:
1. 检查 `.env` 文件中的 `RSSANT_AI_API_KEY` 和 `RSSANT_AI_MODEL_CONFIG` 配置
2. 确认模型配置格式为 `model_id,model_name`
3. 确保文章有内容（content或summary）
4. 查看API服务日志：`bash start-all-services.sh logs api`

## 相关文档

- `docs/AI_CONFIG_SETUP.md` - AI配置详细指南
- `docs/AI_ANALYSIS.md` - AI分析功能说明
- `docs/AI_PROMPT_DESIGN.md` - Prompt设计文档

## 代码位置

- **AI服务**: `rssant_api/services/ai_service.py`
  - `analyze_story()`: AI分析方法
  - `translate_story()`: AI翻译方法
- **配置定义**: `rssant_config/env.py` (第90-95行)
- **API端点**: `rssant_api/views/story.py`
  - `story.analyze_ai`: AI分析端点
  - `story.translate`: AI翻译端点
- **前端组件**: 
  - `frontend/src/components/StoryAIAnalysis.tsx`: AI分析组件
  - `frontend/src/pages/StoryDetailPage.tsx`: 文章详情页（包含翻译按钮）

