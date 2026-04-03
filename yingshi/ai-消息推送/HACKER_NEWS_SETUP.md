# Hacker News 功能配置和使用指南

## 配置说明

### 1. GitHub Token 配置（可选）

如果需要更高的 GitHub API 速率限制，可以配置 GitHub Token：

#### 方式一：环境变量

在 `.env` 文件中添加：

```bash
RSSANT_GITHUB_TOKEN=your_github_token_here
```

#### 方式二：配置文件

在配置文件中设置：

```python
github_token = "your_github_token_here"
```

#### 获取 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 选择权限（至少需要 `public_repo` 权限）
4. 复制生成的 token

**注意**：不配置 Token 也可以使用，但 API 速率限制较低（每小时 60 次请求）。

### 2. AI 分类配置

默认启用 AI 分类，可以在配置中关闭：

```bash
RSSANT_HN_USE_AI_CLASSIFICATION=false
```

如果关闭 AI 分类，将只使用关键词匹配进行分类。

### 3. AI API 配置

Hacker News 的 AI 分析功能使用与 RSS 相同的 AI 配置：

```bash
RSSANT_AI_API_KEY=your_api_key
RSSANT_AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
RSSANT_AI_MODEL_CONFIG=glm-z1-flash,glm-z1-flash
```

## 测试功能

### 运行测试脚本

```bash
 cd /path/to/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
python scripts/test_hacker_news.py
```

测试脚本会：
1. 同步 10 篇 Hacker News 文章
2. 测试分类功能
3. 测试 GitHub 信息提取
4. 保存文章到数据库
5. 显示分类统计
6. 测试 GitHub 链接提取

### 手动同步文章

#### 通过 API

```bash
curl -X POST http://localhost:6789/api/hacker_news.story.sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 30}'
```

#### 通过前端

1. 访问 Hacker News 页面
2. 点击"同步文章"按钮
3. 等待同步完成

## 功能使用

### 1. 文章列表

- **分类筛选**：支持 12 种分类（aigc、大模型、agents、图像生成、视频生成、影视、编程语言、前端开发、后端开发、安全、开源项目、其他）
- **搜索**：支持标题和 URL 搜索
- **排序**：按最新、最热、最多评论排序
- **GitHub 信息**：自动显示 GitHub 仓库信息（Stars、Forks、语言等）

### 2. 个性化推荐

- 系统会根据您的浏览历史推荐相关内容
- 推荐基于您最常浏览的分类
- 如果没有浏览历史，会显示热门文章

### 3. 统计分析

- **分类统计**：各分类的文章数量、平均点赞数、平均评论数
- **GitHub 统计**：包含 GitHub 仓库的文章统计
- **热门文章**：按点赞数排序的 Top 10
- **热门 GitHub 仓库**：按 Stars 数排序的 Top 10

### 4. AI 分析

- 点击"AI 分析"按钮对文章进行分析
- 分析完成后可以查看：
  - 一句话摘要
  - 详细摘要
  - 主要观点
  - 关键引用
  - AI 评分
  - 标签

## 数据库迁移

如果还没有运行迁移，请执行：

```bash
python manage.py migrate rssant_api
```

迁移会创建以下表：
- `rssant_api_hackernewsstory`：文章表
- `rssant_api_hackernewsaianalysis`：AI 分析表
- `rssant_api_hackernewsaianalysissummary`：用户保存的总结表
- `rssant_api_hackernewsuseractivity`：用户活动记录表

## 定时任务

系统已配置每小时自动同步 Hacker News 文章。确保 Scheduler 服务正在运行：

```bash
python manage.py runserver --role=scheduler
```

## 常见问题

### 1. GitHub 信息没有显示

- 检查文章 URL 是否包含 GitHub 链接
- 检查 GitHub Token 是否配置（如果 API 速率限制）
- 查看日志确认是否有错误

### 2. 分类不准确

- 可以调整 `hacker_news_classifier.py` 中的关键词
- 启用 AI 分类可以提高准确性
- 检查 AI API 配置是否正确

### 3. 推荐内容为空

- 需要先浏览一些文章，系统才能学习您的偏好
- 如果没有浏览历史，会显示热门文章

### 4. 同步失败

- 检查网络连接
- 检查 Hacker News API 是否可访问
- 查看日志确认错误信息

## API 文档

### 获取文章列表

```http
POST /api/hacker_news.story.list
Content-Type: application/json

{
  "category": "aigc",
  "search": "AI",
  "orderBy": "-points",
  "limit": 20,
  "offset": 0
}
```

### 获取推荐文章

```http
POST /api/hacker_news.recommend
Content-Type: application/json

{
  "limit": 10
}
```

### 获取统计数据

```http
POST /api/hacker_news.stats
Content-Type: application/json

{
  "days": 7
}
```

### 记录用户活动

```http
POST /api/hacker_news.activity.record
Content-Type: application/json

{
  "story_id": 123,
  "activity_type": "click",
  "metadata": {}
}
```

活动类型：
- `view`：浏览
- `click`：点击
- `analyze`：分析
- `save`：保存
- `favorite`：收藏

## 性能优化

1. **数据库索引**：已为常用查询字段创建索引
2. **缓存**：GitHub 仓库信息会缓存，避免重复请求
3. **批量处理**：同步时批量处理文章，提高效率

## 安全注意事项

1. **GitHub Token**：不要将 Token 提交到代码仓库
2. **API 速率限制**：注意 GitHub API 的速率限制
3. **用户数据**：用户活动数据仅用于个性化推荐

## 更新日志

### 2025-11-16
- ✅ 添加 GitHub Token 配置支持
- ✅ 添加测试脚本
- ✅ 添加前端可视化统计
- ✅ 添加个性化推荐功能
- ✅ 添加用户活动记录

