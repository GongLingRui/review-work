# AI API Key 配置指南

## 问题说明

如果看到错误提示："AI API key未配置,无法进行真实AI分析"，需要配置 AI API Key。

## 配置步骤

### 1. 获取 API Key

#### 方式一：使用智谱AI（推荐，默认）

1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 在控制台获取 API Key

#### 方式二：使用 OpenRouter

1. 访问：https://openrouter.ai/
2. 注册/登录账号
3. 在控制台获取 API Key

### 2. 配置 API Key

编辑配置文件：

```bash
vi /root/gongfan/rrs-aigc/box/rssant.env
```

在配置文件中找到 `RSSANT_AI_API_KEY=` 这一行，填入你的 API Key：

```bash
# 智谱AI API Key
RSSANT_AI_API_KEY=your_api_key_here
```

### 3. 重启容器使配置生效

```bash
cd /root/gongfan/rrs-aigc/box
docker restart rssant
```

或者重新运行启动脚本：

```bash
cd /root/gongfan/rrs-aigc/box
docker stop rssant
docker rm rssant
bash run.sh
```

### 4. 验证配置

检查容器日志确认配置已加载：

```bash
docker logs rssant | grep -i "ai.*key\|RSSANT_AI"
```

如果看到类似以下输出，说明配置成功：
```
* RSSANT_AI_API_KEY loaded (length: XX)
AI服务初始化成功: 分析模型=glm-z1-flash, API Key已配置
```

## 高级配置（可选）

### 使用 OpenRouter 替代智谱AI

如果需要使用 OpenRouter，需要修改以下配置：

```bash
RSSANT_AI_API_KEY=your_openrouter_api_key
RSSANT_AI_API_BASE_URL=https://openrouter.ai/api/v1
RSSANT_AI_MODEL_CONFIG=openai/gpt-3.5-turbo,gpt-3.5-turbo
RSSANT_AI_API_HTTP_REFERER=https://your-domain.com
RSSANT_AI_API_APP_TITLE=华策AIGC平台
```

### 更换模型

默认使用 `glm-z1-flash`，如需更换：

```bash
# 使用智谱AI的 glm-4 模型
RSSANT_AI_MODEL_CONFIG=glm-4,glm-4

# 或使用 OpenRouter 的模型
RSSANT_AI_MODEL_CONFIG=openai/gpt-4,gpt-4
```

## 配置说明

- **RSSANT_AI_API_KEY**: AI API 密钥（必填）
- **RSSANT_AI_MODEL_CONFIG**: 模型配置，格式：`model_id,model_name`（可选）
- **RSSANT_AI_API_BASE_URL**: AI API 基础URL（可选）
- **RSSANT_AI_API_HTTP_REFERER**: HTTP Referer（OpenRouter 要求，可选）
- **RSSANT_AI_API_APP_TITLE**: 应用标题（OpenRouter 可选）

## 注意事项

1. ⚠️ **安全提示**：不要将 API Key 提交到代码仓库
2. ✅ 配置后需要重启容器才能生效
3. ✅ 建议使用智谱AI，对中文支持更好
4. ✅ API Key 配置错误会导致 AI 分析功能无法使用

## 故障排查

### 配置后仍然报错

1. 确认配置文件格式正确（没有多余空格）
2. 确认已重启容器
3. 检查容器日志：`docker logs rssant | grep -i ai`

### 获取更多帮助

查看配置文件位置：
```bash
cat /root/gongfan/rrs-aigc/box/rssant.env | grep RSSANT_AI
```

