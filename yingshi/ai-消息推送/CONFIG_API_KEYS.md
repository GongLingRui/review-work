# API Key 配置说明

本文档说明如何配置项目中的各种 API Key。

## 配置方式

项目使用统一的配置管理系统，所有 API Key 通过 `.env` 文件或环境变量配置。

### 配置文件位置

1. **项目根目录的 `.env` 文件**（推荐）
   - 在项目根目录创建 `.env` 文件
   - 配置会自动加载

2. **通过环境变量 `RSSANT_CONFIG` 指定配置文件路径**
   ```bash
   export RSSANT_CONFIG=/path/to/your/config.env
   ```

## 配置项说明

### AI API 配置

```bash
# AI API 密钥（智谱AI或OpenRouter API Key）
RSSANT_AI_API_KEY=your_ai_api_key_here

# AI 模型配置（格式：model_id,model_name）
RSSANT_AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# AI API 基础URL（默认智谱AI，可配置为OpenRouter）
RSSANT_AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

### AI 搜索和娱乐信息 API 配置

```bash
# Tavily API Key（用于AI影视和AIGC信息搜索）
RSSANT_TAVILY_API_KEY=your_tavily_api_key_here

# 百度搜索API Key（用于AI影视和AIGC信息搜索）
RSSANT_BAIDU_API_KEY=your_baidu_api_key_here

# 智谱AI API Key（如果与ai_api_key不同可单独配置）
# 如果不配置，将使用 RSSANT_AI_API_KEY
RSSANT_ZHIPU_API_KEY=your_zhipu_api_key_here

# 飞书Webhook URL（用于测试，生产环境建议通过数据库配置）
RSSANT_FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your_webhook_id
```

### GitHub API 配置

```bash
# GitHub API Token（用于获取仓库信息，提高API速率限制）
RSSANT_GITHUB_TOKEN=your_github_token_here
```

### 飞书应用配置

```bash
# 飞书应用 App ID
RSSANT_FEISHU_APP_ID=your_feishu_app_id

# 飞书应用 App Secret
RSSANT_FEISHU_APP_SECRET=your_feishu_app_secret

# 飞书文件夹 Token（可选）
RSSANT_FEISHU_FOLDER_TOKEN=your_feishu_folder_token

# 是否启用飞书文档导出功能
RSSANT_FEISHU_ENABLE=true
```

## 配置示例

创建 `.env` 文件：

```bash
# AI API 配置
RSSANT_AI_API_KEY=[REDACTED]
RSSANT_AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# 搜索 API 配置
RSSANT_TAVILY_API_KEY=[已隐藏]
RSSANT_BAIDU_API_KEY=[已隐藏]

# GitHub 配置
RSSANT_GITHUB_TOKEN=[已隐藏]

# 飞书配置
RSSANT_FEISHU_APP_ID=[已隐藏]
RSSANT_FEISHU_APP_SECRET=[已隐藏]
RSSANT_FEISHU_ENABLE=true
```

## 配置优先级

1. **直接传入的参数**（最高优先级）
2. **CONFIG 对象中的配置**（从 `.env` 文件或环境变量加载）
3. **环境变量**（作为后备方案）

## 安全建议

1. **不要将 `.env` 文件提交到版本控制系统**
   - `.env` 文件已在 `.gitignore` 中
   - 使用 `.env.example` 作为模板（不包含真实密钥）

2. **生产环境使用环境变量**
   - 在服务器上直接设置环境变量
   - 或使用配置管理工具（如 Kubernetes Secrets）

3. **定期轮换 API Key**
   - 定期更新 API Key 以提高安全性

4. **最小权限原则**
   - 只授予必要的 API 权限

## 验证配置

启动应用后，检查日志输出，确认配置是否加载成功：

```
* Load .env file at /path/to/.env
* Successfully loaded .env file
* RSSANT_AI_API_KEY loaded (length: 50)
```

如果看到警告信息，说明某些配置项未找到，请检查 `.env` 文件。

