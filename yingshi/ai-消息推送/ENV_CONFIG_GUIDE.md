# .env 文件配置指南

## 必需配置项

### 1. AI API 配置（必需）

```bash
# AI API 密钥（智谱AI或OpenRouter API Key）
# 用于AI总结、分析等功能
RSSANT_AI_API_KEY=your_ai_api_key_here
```

**如何获取：**
- 智谱AI：访问 https://open.bigmodel.cn/ 注册并获取 API Key
- OpenRouter：访问 https://openrouter.ai/ 注册并获取 API Key

### 2. 搜索 API 配置（用于AI影视和AIGC信息搜索）

#### Tavily API Key（推荐，用于AI影视和AIGC信息搜索）

```bash
# Tavily API Key
# 用于搜索AI影视和AIGC相关信息
RSSANT_TAVILY_API_KEY=your_tavily_api_key_here
```

**如何获取：**
- 访问 https://tavily.com/ 注册并获取 API Key

#### 百度搜索 API Key（可选，作为Tavily的备选）

```bash
# 百度搜索API Key
# 如果Tavily不可用，可以使用百度搜索
RSSANT_BAIDU_API_KEY=your_baidu_api_key_here
```

**如何获取：**
- 访问 https://cloud.baidu.com/ 注册并获取 API Key

## 可选配置项

### 3. 智谱AI API Key（可选）

```bash
# 智谱AI API Key（如果与ai_api_key不同可单独配置）
# 如果不配置，将自动使用 RSSANT_AI_API_KEY
RSSANT_ZHIPU_API_KEY=your_zhipu_api_key_here
```

**说明：**
- 如果 `RSSANT_AI_API_KEY` 已经是智谱AI的 Key，则无需单独配置
- 如果需要使用不同的智谱AI Key，可以单独配置此项

### 4. 飞书 Webhook URL（可选，用于测试）

```bash
# 飞书Webhook URL（用于测试飞书机器人功能）
# 生产环境建议通过数据库配置，而不是在这里配置
RSSANT_FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your_webhook_id
```

**如何获取：**
- 在飞书群中添加机器人，获取 Webhook URL
- 注意：生产环境建议通过前端界面配置，而不是在 `.env` 文件中

## 完整配置示例

创建一个 `.env` 文件在项目根目录，内容如下：

```bash
# ============================================
# AI API 配置（必需）
# ============================================
# AI API 密钥（智谱AI或OpenRouter API Key）
RSSANT_AI_API_KEY=[REDACTED]

# AI 模型配置（可选，默认：glm-z1-flash,glm-z1-flash）
RSSANT_AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# AI API 基础URL（可选，默认：https://open.bigmodel.cn/api/paas/v4）
# 如果使用OpenRouter，改为：https://openrouter.ai/api/v1
RSSANT_AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# ============================================
# 搜索 API 配置（用于AI影视和AIGC信息搜索）
# ============================================
# Tavily API Key（推荐）
RSSANT_TAVILY_API_KEY=[已隐藏]

# 百度搜索API Key（可选，作为Tavily的备选）
RSSANT_BAIDU_API_KEY=[已隐藏]

# ============================================
# 其他可选配置
# ============================================
# 智谱AI API Key（可选，如果不配置则使用 RSSANT_AI_API_KEY）
# RSSANT_ZHIPU_API_KEY=your_zhipu_api_key_here

# 飞书Webhook URL（可选，用于测试）
# RSSANT_FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx

# ============================================
# 数据库配置（如果使用默认值可省略）
# ============================================
# RSSANT_PG_HOST=localhost
# RSSANT_PG_PORT=5432
# RSSANT_PG_DB=rssant
# RSSANT_PG_USER=rssant
# RSSANT_PG_PASSWORD=rssant

# ============================================
# GitHub API 配置（可选，用于GitHub仓库同步）
# ============================================
# RSSANT_GITHUB_TOKEN=[已隐藏]

# ============================================
# 飞书应用配置（可选，用于飞书文档导出）
# ============================================
# RSSANT_FEISHU_APP_ID=[已隐藏]
# RSSANT_FEISHU_APP_SECRET=[已隐藏]
# RSSANT_FEISHU_FOLDER_TOKEN=[已隐藏]
# RSSANT_FEISHU_ENABLE=true
```

## 最小配置（仅必需项）

如果只想快速开始，最少需要配置：

```bash
# AI API 密钥（必需）
RSSANT_AI_API_KEY=your_ai_api_key_here

# Tavily API Key（用于AI影视和AIGC信息搜索）
RSSANT_TAVILY_API_KEY=your_tavily_api_key_here
```

## 配置验证

启动应用后，检查日志输出，确认配置是否加载成功：

```
* Load .env file at /path/to/.env
* Successfully loaded .env file
* RSSANT_AI_API_KEY loaded (length: 50)
```

如果看到警告信息，说明某些配置项未找到，请检查 `.env` 文件。

## 安全提示

1. **不要将 `.env` 文件提交到版本控制系统**
   - `.env` 文件已在 `.gitignore` 中
   - 确保 `.env` 文件不会被意外提交

2. **使用强密码和安全的 API Key**
   - 定期轮换 API Key
   - 不要分享 API Key 给他人

3. **生产环境建议使用环境变量**
   - 在服务器上直接设置环境变量
   - 或使用配置管理工具（如 Kubernetes Secrets）

