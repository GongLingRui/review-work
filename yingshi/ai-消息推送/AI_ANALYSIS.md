# AI文章分析和评分功能

## 功能概述

本功能使用AI模型对RSS文章进行深度分析和评分，包括：
- 一句话总结
- 详细摘要
- 主要内容提取
- 文章金句提取
- AI评分（0-100分）
- 标签提取
- 相关阅读推荐

## 配置说明

### 环境变量配置

在 `.env` 文件或环境变量中配置以下参数：

```bash
# AI模型配置（格式：model_id,model_name）
AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# AI API基础URL（根据使用的AI平台调整）
AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# AI API密钥
AI_API_KEY=your_api_key_here
```

### 支持的AI平台

#### 1. 智谱AI（默认）

```bash
AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_API_KEY=[REDACTED]  # 示例
```

- 接口：`POST /chat/completions`
- 参数：`model` 填写 `glm-z1-flash`、`glm-4` 等官方模型代号，`messages` 按 OpenAI 兼容协议传入
- 注意：不要在直连智谱接口时填写 Dify 工作流 ID，否则会返回 400 “模型不存在”

#### 2. Dify平台（可选）

如果使用Dify平台，配置如下：

```bash
AI_API_BASE_URL=https://api.dify.ai/v1
AI_API_KEY=app-xxxxx  # Dify应用API Key
```

API调用格式：
- 端点：`POST /chat-messages`
- 请求体：
```json
{
  "inputs": {},
  "query": "prompt内容",
  "response_mode": "blocking",
  "conversation_id": "",
  "user": "user_id"
}
```

#### 2. 自定义AI API

如果需要使用其他AI平台，需要修改 `rssant_api/services/ai_service.py` 中的 `analyze_story` 方法，调整API调用格式。

## Prompt设计

### 主要Prompt结构

AI分析的Prompt包含以下部分：

1. **文章信息**：标题和内容
2. **输出格式要求**：JSON格式，包含所有分析字段
3. **字段说明**：每个字段的具体要求

### Prompt示例

```
请对以下文章进行深度分析和评分。

文章标题：{title}

文章内容：
{content}

请按照以下格式输出分析结果（必须使用JSON格式）：

{
    "one_sentence_summary": "一句话总结（50字以内）",
    "summary": "详细摘要（200-300字）",
    "main_points": [
        "主要内容点1（50字以内）",
        "主要内容点2（50字以内）",
        "主要内容点3（50字以内）"
    ],
    "key_quotes": [
        "文章金句1（原文引用，30字以内）",
        "文章金句2（原文引用，30字以内）",
        "文章金句3（原文引用，30字以内）"
    ],
    "ai_score": 85,
    "tags": ["标签1", "标签2", "标签3"],
    "related_readings": [
        {"title": "相关阅读标题1", "description": "描述1"},
        {"title": "相关阅读标题2", "description": "描述2"}
    ]
}

要求：
1. one_sentence_summary：用一句话概括文章核心内容，50字以内
2. summary：详细摘要，200-300字，涵盖文章的主要观点和结论
3. main_points：提取3-5个主要内容点，每个50字以内，用列表形式
4. key_quotes：提取2-4个文章中的精彩句子或观点，必须是原文引用
5. ai_score：根据文章质量、深度、价值等综合评分，0-100分
6. tags：提取3-5个关键词标签
7. related_readings：提供2-3个相关阅读建议（可选，如果没有可以不填）

请确保输出的是有效的JSON格式，不要包含任何markdown代码块标记。
```

## 数据库迁移

首次使用需要创建数据库表：

```bash
cd /root/gongfan/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
python manage.py makemigrations
python manage.py migrate
```

## 使用说明

### 前端使用

1. 打开任意文章详情页
2. 在文章内容上方会显示"AI分析"组件
3. 点击"开始AI分析"按钮
4. 等待AI分析完成（通常需要10-30秒）
5. 分析结果会自动显示，包括：
   - 一句话总结
   - AI评分（带颜色标识）
   - 详细摘要
   - 主要内容
   - 文章金句
   - 标签
   - 相关阅读

### API使用

#### 分析文章

```bash
POST /api/v1/story.analyze_ai
{
  "feed_id": "feed_unionid",
  "offset": 0,
  "force_refresh": false  # 可选，是否强制重新分析
}
```

#### 获取分析结果

```bash
POST /api/v1/story.get_ai_analysis
{
  "feed_id": "feed_unionid",
  "offset": 0
}
```

## 评分标准

AI评分（0-100分）参考标准：

- **90-100分**：优秀文章，内容深度高，价值大
- **80-89分**：良好文章，内容质量较高
- **70-79分**：中等文章，内容质量一般
- **60-69分**：普通文章，内容质量较低
- **0-59分**：较差文章，内容质量差

## 注意事项

1. **API调用限制**：注意AI平台的API调用频率限制
2. **内容长度**：文章内容过长时会截取前5000字符进行分析
3. **缓存机制**：分析结果会保存到数据库，避免重复分析
4. **错误处理**：如果AI分析失败，会显示错误提示，可以重试

## 故障排查

### 问题：AI分析一直失败

1. 检查API密钥是否正确配置
2. 检查API URL是否正确
3. 查看后端日志：`bash start-all-services.sh logs api`
4. 确认网络连接正常

### 问题：分析结果格式错误

1. 检查AI模型是否支持JSON输出
2. 可能需要调整Prompt格式
3. 查看日志中的AI响应内容

### 问题：分析速度慢

1. 检查AI平台的响应速度
2. 考虑使用更快的模型
3. 检查网络延迟

## 自定义开发

### 修改Prompt

编辑 `rssant_api/services/ai_service.py` 中的 `_get_analysis_prompt` 方法。

### 修改评分标准

编辑 `rssant_api/services/ai_service.py` 中的Prompt，调整评分说明。

### 添加新字段

1. 修改 `rssant_api/models/story_ai_analysis.py` 添加新字段
2. 运行数据库迁移
3. 更新 `StoryAIAnalysisSchema`
4. 修改Prompt包含新字段
5. 更新前端组件显示新字段

