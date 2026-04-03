# Hacker News 功能扩展总结

## 概述

本次重构大幅扩展了 Hacker News 功能，参考 GitHubSentinel 的设计理念，集成了 GitHub 仓库信息，扩展了分类系统，并添加了趋势分析和统计功能。

## 新增功能

### 1. 扩展分类系统

#### 新增分类（共 12 个分类）

- **aigc**: AI生成内容相关
- **大模型**: 大语言模型相关（GPT, Claude, Llama, Gemini 等）
- **agents**: AI智能体/代理相关
- **图像生成**: AI图像生成相关（Stable Diffusion, Midjourney, DALL-E 等）
- **视频生成**: AI视频生成相关（Sora, Runway, Pika 等）
- **影视**: 电影、电视剧、娱乐相关内容
- **编程语言**: 编程语言相关（Python, JavaScript, Rust 等）
- **前端开发**: 前端开发相关
- **后端开发**: 后端开发相关
- **安全**: 网络安全、隐私相关
- **开源项目**: 开源项目相关
- **其他**: 不属于以上分类

#### 分类方式

1. **关键词匹配**: 使用扩展的关键词库进行快速分类
2. **AI 分类**: 使用 AI 模型进行更准确的分类（可选）
3. **置信度评分**: 每个分类都有置信度评分（0-1）

### 2. GitHub 集成功能

#### 自动提取 GitHub 链接

- 从 Hacker News 文章 URL 中自动识别 GitHub 仓库链接
- 支持多种 GitHub URL 格式

#### GitHub 仓库信息获取

- **基本信息**: 仓库名称、描述、语言
- **统计数据**: Stars 数、Forks 数、Watchers 数
- **元数据**: 创建时间、更新时间、License
- **标签**: GitHub Topics
- **语言统计**: 仓库使用的编程语言分布

#### 数据存储

所有 GitHub 信息都存储在 `HackerNewsStory` 模型中：
- `github_repo`: 仓库路径（owner/repo）
- `github_stars`: Stars 数
- `github_forks`: Forks 数
- `github_language`: 主要编程语言
- `github_description`: 仓库描述
- `github_topics`: 标签列表
- `github_updated_at`: 最后更新时间

### 3. 趋势分析和统计功能

#### 统计数据 API (`hacker_news.stats`)

- **分类统计**: 各分类的文章数量、平均点赞数、平均评论数
- **GitHub 统计**: 包含 GitHub 仓库的文章统计
- **热门文章**: 按点赞数排序的热门文章 Top 10
- **热门 GitHub 仓库**: 按 Stars 数排序的热门仓库 Top 10

#### 趋势数据 API (`hacker_news.trends`)

- 按日期和分类统计文章数量
- 支持按分类筛选
- 支持自定义时间范围（1-365 天）

### 4. 增强的搜索和筛选

#### 多维度筛选

- **分类筛选**: 支持 12 种分类
- **关键词搜索**: 搜索标题和 URL
- **排序方式**:
  - 最新发布
  - 最多点赞
  - 最多评论
  - 最早发布

#### GitHub 相关筛选

- 可以筛选包含 GitHub 仓库的文章
- 可以按 GitHub Stars 数排序

### 5. AI 分析功能

#### 文章分析

- 使用现有的 AIService 进行文章分析
- 生成摘要、评分、标签等
- 支持强制刷新分析

#### 分析总结

- 用户可以保存 AI 分析结果为总结
- 支持收藏、标签管理
- 支持按分类、标签筛选总结

### 6. 报告生成功能

#### 小时主题报告

- 生成指定时间段的主题报告
- 分析热门话题和趋势

#### 每日汇总报告

- 聚合多小时的报告
- 生成每日技术趋势报告

## 技术实现

### 后端架构

1. **数据模型** (`rssant_api/models/hacker_news.py`)
   - `HackerNewsStory`: 文章主表
   - `HackerNewsAIAnalysis`: AI 分析结果表
   - `HackerNewsAIAnalysisSummary`: 用户保存的总结表

2. **服务层**
   - `HackerNewsClient`: Hacker News 爬取客户端
   - `HackerNewsClassifier`: 分类服务
   - `GitHubClient`: GitHub API 客户端
   - `AIService`: AI 分析服务（复用）

3. **API 层** (`rssant_api/views/hacker_news.py`)
   - 文章列表、详情、同步
   - AI 分析
   - 统计和趋势
   - 报告生成

### 前端架构

1. **页面组件**
   - `HackerNewsPage`: 主列表页面
   - `HackerNewsDetailPage`: 详情页面

2. **功能特性**
   - 分类筛选（12 种分类）
   - 搜索功能
   - GitHub 信息展示
   - AI 分析触发和展示
   - 响应式设计

### 定时任务

- 每小时自动同步 Hacker News 热门文章
- 自动提取 GitHub 链接并获取仓库信息
- 自动分类文章

## 数据库迁移

已创建并应用以下迁移：

1. `0037_add_hacker_news.py`: 创建 Hacker News 相关表
2. `0038_add_github_fields.py`: 添加 GitHub 相关字段

## 配置说明

### GitHub API Token（可选）

如果需要更高的 API 速率限制，可以在配置中添加 GitHub Token：

```python
# 在 rssant_config/env.py 或环境变量中
GITHUB_TOKEN = "your_github_token"
```

### AI 分类配置

```python
# 是否启用 AI 分类（默认启用）
HN_USE_AI_CLASSIFICATION = True

# AI API 配置（复用现有配置）
AI_API_KEY = "your_api_key"
AI_API_BASE_URL = "https://open.bigmodel.cn/api/paas/v4"
AI_MODEL_CONFIG = "glm-4,glm-4"
```

## 使用指南

### 1. 同步文章

- **自动同步**: Scheduler 服务每小时自动同步
- **手动同步**: 在前端页面点击"同步文章"按钮

### 2. 浏览和筛选

- 使用分类下拉菜单筛选特定分类
- 使用搜索框搜索关键词
- 选择排序方式（最新、最热等）

### 3. 查看 GitHub 信息

- 如果文章链接到 GitHub 仓库，会自动显示：
  - 仓库路径
  - Stars 数
  - Forks 数
  - 主要编程语言

### 4. AI 分析

- 点击"AI 分析"按钮对文章进行分析
- 分析完成后可以查看摘要、评分、标签等
- 可以保存为总结以便后续查看

### 5. 查看统计和趋势

- 调用 `hacker_news.stats` API 获取统计数据
- 调用 `hacker_news.trends` API 获取趋势数据

## 未来扩展建议

1. **数据可视化**
   - 添加图表展示分类分布
   - 趋势折线图
   - GitHub 仓库热度图

2. **推荐系统**
   - 基于用户浏览历史的个性化推荐
   - 相似文章推荐

3. **评论和互动**
   - 用户评论功能
   - 点赞、收藏等互动

4. **邮件推送**
   - 每日/每周热门文章摘要
   - 分类定制推送

5. **移动端优化**
   - 响应式设计优化
   - PWA 支持

6. **多语言支持**
   - 界面多语言
   - 内容翻译

## 相关文件

### 后端文件

- `rssant_api/models/hacker_news.py`: 数据模型
- `rssant_api/services/hacker_news_client.py`: Hacker News 客户端
- `rssant_api/services/hacker_news_classifier.py`: 分类服务
- `rssant_api/services/github_client.py`: GitHub 客户端
- `rssant_api/views/hacker_news.py`: API 视图
- `rssant_harbor/view.py`: Harbor API（同步功能）
- `rssant_scheduler/timer_task.py`: 定时任务配置

### 前端文件

- `frontend/src/pages/HackerNewsPage.tsx`: 主页面
- `frontend/src/pages/HackerNewsDetailPage.tsx`: 详情页面
- `frontend/src/lib/api.ts`: API 接口定义
- `frontend/src/components/Layout.tsx`: 导航菜单

### 数据库迁移

- `rssant_api/migrations/0037_add_hacker_news.py`
- `rssant_api/migrations/0038_add_github_fields.py`

## 总结

本次重构大幅扩展了 Hacker News 功能，不仅增加了更多分类（特别是大模型和影视相关），还集成了 GitHub 仓库信息，添加了趋势分析和统计功能。系统现在可以：

1. ✅ 自动爬取和分类 Hacker News 文章
2. ✅ 自动提取和展示 GitHub 仓库信息
3. ✅ 支持 12 种分类（包括大模型、影视等）
4. ✅ 提供 AI 分析和总结功能
5. ✅ 提供统计和趋势分析
6. ✅ 支持多维度搜索和筛选
7. ✅ 定时自动同步

所有功能已完整实现并集成到现有系统中。

