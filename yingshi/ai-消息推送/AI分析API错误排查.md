# AI分析API (story.analyze_ai) 500错误排查指南

## 问题现象

调用 `POST /api/v1/story.analyze_ai` 接口时返回 **500 Internal Server Error**。

## 常见原因

根据代码分析，可能导致500错误的原因包括：

### 1. **返回类型不一致**（已修复）
- **问题**：`StoryNotFoundError` 异常处理返回 `Response` 对象，但函数签名要求返回 `dict`
- **状态**：✅ 已修复
- **修复内容**：统一所有异常处理返回 `dict` 格式

### 2. **AI服务配置问题**
- **API Key未配置**：如果 `RSSANT_AI_API_KEY` 未配置，会使用模拟数据，但某些情况下可能仍会出错
- **API Base URL配置错误**：`RSSANT_AI_API_BASE_URL` 配置不正确
- **模型配置错误**：`RSSANT_AI_MODEL_CONFIG` 格式不正确

### 3. **AI API调用失败**
- **网络连接问题**：无法连接到AI服务（智谱AI或OpenRouter）
- **API限流**：请求频率过高被限流
- **API服务异常**：AI服务本身返回错误
- **超时**：请求超时（默认120秒）

### 4. **数据库操作失败**
- **Story不存在**：文章不存在或已被删除
- **数据库连接问题**：无法连接数据库
- **数据保存失败**：保存分析结果时出错

### 5. **其他异常**
- **权限问题**：用户无权限访问该文章
- **数据格式错误**：AI返回的数据格式不符合预期
- **内存不足**：处理大文章时内存不足

## 快速排查步骤

### 步骤1：查看服务器日志

```bash
# 查看API服务日志
 cd /path/to/rss-subscribe
bash start-all-services.sh logs api

# 或直接查看screen会话
screen -r rssant-api

# 在日志中搜索 "AI分析" 或 "analyze_ai" 相关的错误信息
```

### 步骤2：检查AI服务配置

```bash
# 进入Python shell检查配置
 cd /path/to/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
python manage.py shell
```

在shell中执行：

```python
from rssant_config import CONFIG
from rssant_api.services.ai_service import AI_SERVICE

# 检查配置
print(f"API Key已配置: {bool(AI_SERVICE.api_key)}")
print(f"API Base URL: {AI_SERVICE.api_base_url}")
print(f"Model ID: {AI_SERVICE.model_id}")
print(f"Model Name: {AI_SERVICE.model_name}")
```

### 步骤3：测试AI服务连接

```python
# 在Python shell中测试
from rssant_api.services.ai_service import AI_SERVICE

# 创建一个测试story对象
class TestStory:
    def __init__(self):
        self.title = "测试文章"
        self.content = "这是一篇测试文章的内容。"
        self.summary = "测试摘要"

test_story = TestStory()

# 尝试调用AI分析（如果API key未配置，会返回模拟数据）
try:
    result = AI_SERVICE.analyze_story(test_story)
    print("AI分析成功:", result)
except Exception as e:
    print("AI分析失败:", e)
    import traceback
    traceback.print_exc()
```

### 步骤4：检查文章是否存在

```python
# 在Python shell中检查
from rssant_api.models import UnionStory, UnionFeed
from rssant_api.models.errors import StoryNotFoundError

# 替换为实际的feed_id和offset
feed_id = ...  # 你的feed_id
offset = ...   # 你的offset

try:
    union_story = UnionStory.get_by_feed_offset(feed_id, offset, detail=True)
    print("文章存在:", union_story._story.title)
except StoryNotFoundError:
    print("文章不存在")
except Exception as e:
    print("检查失败:", e)
```

## 解决方案

### 方案1：修复返回类型不一致（已完成）

已修复 `story_analyze_ai` 函数中的返回类型不一致问题：
- 将 `StoryNotFoundError` 异常处理从返回 `Response` 改为返回 `dict`
- 统一所有异常处理的返回格式

**重启API服务以应用修复**：

```bash
 cd /path/to/rss-subscribe
bash start-all-services.sh restart api
```

### 方案2：配置AI服务

如果AI服务未配置，需要配置相关环境变量：

```bash
# 编辑配置文件（.env 或环境变量）
export RSSANT_AI_API_KEY="your-api-key"
export RSSANT_AI_API_BASE_URL="https://open.bigmodel.cn/api/paas/v4"  # 智谱AI
# 或
export RSSANT_AI_API_BASE_URL="https://openrouter.ai/api/v1"  # OpenRouter

export RSSANT_AI_MODEL_CONFIG="glm-4,glm-4"  # 格式: model_id,model_name
```

然后重启API服务：

```bash
bash start-all-services.sh restart api
```

### 方案3：检查网络连接

```bash
# 测试AI服务连接
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 方案4：查看详细错误信息

在浏览器开发者工具中查看：
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 重新发送请求
4. 查看响应内容，通常包含详细的错误信息

或在服务器日志中查看：

```bash
# 实时查看日志
tail -f logs/api.log  # 如果有日志文件
# 或
screen -r rssant-api
```

## 错误信息解读

### 常见错误消息

1. **"文章不存在"**
   - 原因：指定的 `feed_id` 和 `offset` 对应的文章不存在
   - 解决：检查请求参数是否正确

2. **"AI API调用失败"**
   - 原因：无法连接到AI服务或API返回错误
   - 解决：检查网络连接、API配置、API服务状态

3. **"AI响应格式错误"**
   - 原因：AI返回的JSON格式不正确
   - 解决：检查AI服务是否正常，可能需要联系AI服务提供商

4. **"AI API key未配置"**
   - 原因：未配置 `RSSANT_AI_API_KEY`
   - 解决：配置API key（会使用模拟数据，但功能受限）

## 预防措施

1. **统一错误处理**
   - 所有API端点应统一返回格式
   - 使用 `dict` 而不是 `Response` 对象（除非必要）

2. **完善日志记录**
   - 记录详细的错误信息
   - 包含请求参数、错误堆栈等

3. **配置验证**
   - 启动时验证配置是否正确
   - 提供配置检查工具

4. **错误监控**
   - 设置错误监控和告警
   - 定期检查日志

## 相关文件

- `rssant_api/views/story.py` - API端点实现
- `rssant_api/services/ai_service.py` - AI服务实现
- `rssant_config/` - 配置文件
- `智谱AI配置说明.md` - AI服务配置说明

## 代码关键位置

如果需要进行深入排查，可以查看以下关键代码：

1. **API端点**: `rssant_api/views/story.py::story_analyze_ai` (第497行)
2. **AI服务**: `rssant_api/services/ai_service.py::AIService.analyze_story` (第202行)
3. **错误处理**: `rssant_api/views/story.py` (第605-625行)

## 验证修复

修复后，验证API是否正常工作：

1. **使用curl测试**：
```bash
curl -X POST http://localhost:5173/api/v1/story.analyze_ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "feed_id": "your_feed_id",
    "offset": 0,
    "force_refresh": false
  }'
```

2. **在前端测试**：
   - 打开前端页面
   - 尝试分析一篇文章
   - 检查是否返回成功响应

3. **查看日志**：
   - 确认没有500错误
   - 确认错误信息清晰明确

