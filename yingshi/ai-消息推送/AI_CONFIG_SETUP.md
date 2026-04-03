# AI分析功能配置指南

## 功能概述

AI分析功能会自动为每篇文章生成：
- ✅ 一句话总结（50字以内）
- ✅ 详细摘要（200-300字）
- ✅ 主要内容点（3-5个）
- ✅ 文章金句（2-4个）
- ✅ AI评分（0-100分）
- ✅ 标签（3-5个）
- ✅ 相关阅读建议（可选）

## 配置步骤

### 1. 环境变量配置

在项目根目录的`.env`文件或系统环境变量中配置以下参数：

```bash
# AI模型配置（格式：model_id,model_name）
# 默认示例：glm-z1-flash
AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash

# AI API基础URL（可选）
# 例如：智谱 https://open.bigmodel.cn/api/paas/v4
#       OpenRouter https://openrouter.ai/api/v1
AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# AI API密钥（根据使用的服务填写）
AI_API_KEY=your_api_key_here

# OpenRouter 推荐附加信息（可选）
AI_API_HTTP_REFERER=https://your-domain.com
AI_API_APP_TITLE=RSS订阅助手
```

### 2. 验证配置

配置完成后，重启API服务：

```bash
cd /root/gongfan/rss-subscribe
bash start-all-services.sh restart api
```

### 3. 测试AI分析

1. 打开任意一篇文章详情页
2. 等待2秒，系统会自动触发AI分析
3. 或者在AI分析组件中点击"开始AI分析"按钮手动触发
4. 查看分析结果，应该包含：
   - 一句话总结
   - AI评分（带颜色标识）
   - 详细摘要
   - 主要内容列表
   - 文章金句
   - 标签
   - 相关阅读（如果有）

## 配置说明

### 模型配置

- **模型ID**: `glm-z1-flash`（或其他智谱官方模型代号）
- **模型名称**: `glm-z1-flash`
- **配置格式**: `model_id,model_name`

> **提示**：如果 `AI_API_BASE_URL` 指向智谱官方 `open.bigmodel.cn`，必须填写官方模型代号（如 `glm-z1-flash`、`glm-4`）。只有在接入 Dify/自建网关时才需要填写工作流 ID。

### API配置

#### OpenRouter平台配置

如果需要使用 OpenRouter（支持 Meta Llama 3.3 70B 等免费模型），按以下方式设置：

```bash
AI_MODEL_CONFIG=meta-llama/llama-3.3-70b-instruct,Meta Llama 3.3 70B
AI_API_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_API_HTTP_REFERER=https://your-domain.com   # 建议填写，可用部署域名
AI_API_APP_TITLE=GongFan RSS AI Analysis      # 建议填写，系统名称
```

> ⚠️ **安全提示**：不要把真实 `AI_API_KEY` 提交到仓库。可以在服务器 `.env` 或系统环境变量里设置，上述示例仅为格式说明。

#### 其他平台配置

系统默认使用 OpenAI 兼容接口，若要切换到其他服务（如智谱、Dify、自建模型网关），只需将 `AI_MODEL_CONFIG`、`AI_API_BASE_URL` 与 `AI_API_KEY` 修改为对应服务的参数即可，无需改动代码。

## 功能特性

### 自动分析

- ✅ 文章加载时，如果没有分析结果，会自动触发AI分析（延迟2秒）
- ✅ 避免影响页面加载性能
- ✅ 如果已有分析结果，直接显示，不重复分析

### 缓存机制

- ✅ 已分析的文章会缓存结果
- ✅ 避免重复分析，节省API调用成本
- ✅ 可通过"刷新"按钮强制重新分析

### 错误处理

- ✅ API调用失败时显示错误提示
- ✅ 解析失败时记录日志
- ✅ 没有配置API key时使用模拟数据（开发测试用）

## 注意事项

1. **API密钥安全**: 不要将API密钥提交到代码仓库，使用环境变量管理
2. **API调用成本**: AI分析会产生API调用成本，建议配置合理的缓存策略
3. **超时设置**: API请求超时设置为120秒，如果分析时间较长可能会超时
4. **内容长度**: 文章内容限制为8000字符，避免超出token限制
5. **评分标准**: AI评分基于文章质量、技术价值、信息完整性和写作水平综合评估

## 故障排查

### 问题：AI分析一直显示"分析中..."

**可能原因**:
1. API密钥未配置或配置错误
2. API服务不可用
3. 网络连接问题
4. API超时

**解决方法**:
1. 检查`.env`文件中的`AI_API_KEY`配置
2. 检查API服务是否正常运行
3. 查看API服务日志：`bash start-all-services.sh logs api`
4. 尝试手动刷新分析

### 问题：分析结果格式错误

**可能原因**:
1. AI返回的JSON格式不正确
2. Prompt设计问题

**解决方法**:
1. 查看日志中的错误信息
2. 检查AI返回的原始响应
3. 优化Prompt设计（参考`docs/AI_PROMPT_DESIGN.md`）

### 问题：自动分析不触发

**可能原因**:
1. 前端组件未正确加载
2. 已有分析结果，不需要重新分析

**解决方法**:
1. 检查前端组件是否正常加载
2. 手动点击"开始AI分析"按钮
3. 使用"刷新"按钮强制重新分析

## 开发测试

如果没有配置API密钥，系统会使用模拟数据（mock data）进行测试：

- 一句话总结：`{文章标题}的简要总结`
- 详细摘要：使用文章的summary或content的前200字符
- 主要内容：3个示例要点
- 文章金句：2个示例句子
- AI评分：75分（固定值）
- 标签：['技术', '开发', '编程']

这样可以方便开发和测试，不需要真实的API调用。

