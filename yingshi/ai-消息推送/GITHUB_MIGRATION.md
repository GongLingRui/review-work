# GitHub 功能迁移总结

本文档总结了从 GitHubSentinel 项目迁移到 rss-subscribe 项目的所有 GitHub 相关功能。

## 迁移状态

### ✅ 已完全迁移的功能

#### 1. **GitHub 客户端** (`github_client.py`)
- ✅ `fetch_updates()` - 获取仓库更新（commits、issues、PRs）
- ✅ `fetch_commits()` - 获取提交记录
- ✅ `fetch_issues()` - 获取问题列表
- ✅ `fetch_pull_requests()` - 获取拉取请求列表
- ✅ `export_daily_progress()` - 导出每日进度为 Markdown 文件
- ✅ `export_progress_by_date_range()` - 导出指定日期范围内的进度
- ✅ `extract_github_repo_from_url()` - 从 URL 中提取 GitHub 仓库路径（已存在）
- ✅ `get_repo_info()` - 获取仓库信息（已存在）

**位置**: `rss-subscribe/rssant_api/services/github_client.py`

#### 2. **报告生成服务** (`github_report_generator.py`)
- ✅ `generate_github_report()` - 生成 GitHub 项目进展报告
- ✅ `_preload_prompts()` - 预加载提示词文件（支持 OpenAI 和 Ollama）

**位置**: `rss-subscribe/rssant_api/services/github_report_generator.py`

#### 3. **邮件通知服务** (`github_notifier.py`)
- ✅ `notify_github_report()` - 发送 GitHub 报告邮件
- ✅ `_markdown_to_html()` - Markdown 转 HTML

**位置**: `rss-subscribe/rssant_api/services/github_notifier.py`

#### 4. **数据模型**
- ✅ `GitHubSubscription` - 仓库订阅模型
- ✅ `GitHubProgress` - 仓库进度记录模型
- ✅ `GitHubReport` - 仓库报告模型

**位置**: `rss-subscribe/rssant_api/models/github.py`

#### 5. **提示词文件**
- ✅ `github_openai_prompt.txt` - OpenAI 报告提示词
- ✅ `github_ollama_prompt.txt` - Ollama 报告提示词

**位置**: `rss-subscribe/prompts/`

#### 6. **定时任务**
- ✅ `harbor_rss.sync_github_repos` - 每小时同步仓库更新
- ✅ `harbor_rss.github_generate_reports` - 每天生成报告并发送邮件

**位置**: `rss-subscribe/rssant_scheduler/timer_task.py`

#### 7. **API 端点**
- ✅ `github.subscription.list` - 获取订阅列表
- ✅ `github.subscription.create` - 创建订阅
- ✅ `github.subscription.delete` - 删除订阅
- ✅ `github.repo.sync` - 同步仓库更新
- ✅ `github.repo.info` - 获取仓库信息
- ✅ `github.report.generate` - 生成报告
- ✅ `github.report.list` - 获取报告列表

**位置**: `rss-subscribe/rssant_api/views/github.py`

#### 8. **前端页面**
- ✅ `GitHubPage.tsx` - GitHub 仓库监控页面
- ✅ API 客户端封装 - `githubApi` 对象
- ✅ 路由注册 - `/github`
- ✅ 导航菜单项 - 添加到侧边栏

**位置**: 
- `rss-subscribe/frontend/src/pages/GitHubPage.tsx`
- `rss-subscribe/frontend/src/lib/api.ts`
- `rss-subscribe/frontend/src/App.tsx`
- `rss-subscribe/frontend/src/components/Layout.tsx`

## 功能对比

| 功能 | GitHubSentinel | rss-subscribe | 状态 |
|------|---------------|----------------|------|
| 获取仓库更新 | ✅ | ✅ | ✅ 已迁移 |
| 导出为 Markdown | ✅ | ✅ | ✅ 已迁移 |
| 生成项目报告 | ✅ | ✅ | ✅ 已迁移 |
| 邮件通知 | ✅ | ✅ | ✅ 已迁移 |
| 订阅管理 | ✅ | ✅ | ✅ 已迁移 |
| 定时任务 | ✅ | ✅ | ✅ 已迁移 |
| 数据库存储 | ❌ | ✅ | 🆕 新增功能 |
| Web 界面 | ❌ | ✅ | 🆕 新增功能 |
| 用户权限控制 | ❌ | ✅ | 🆕 新增功能 |

## 配置说明

### GitHub Token 配置

在 `.env` 文件中配置：

```bash
# GitHub Token（用于访问 GitHub API）
RSSANT_GITHUB_TOKEN=github_pat_xxx
```

或在环境变量中设置：

```bash
export RSSANT_GITHUB_TOKEN="github_pat_xxx"
```

### 邮件通知配置

在 `.env` 文件中配置：

```bash
# 邮件配置
RSSANT_SMTP_ENABLE=true
RSSANT_SMTP_HOST=smtp.example.com
RSSANT_SMTP_PORT=465
RSSANT_SMTP_USERNAME=your_email@example.com
RSSANT_SMTP_PASSWORD=your_password
RSSANT_SMTP_USE_SSL=true
RSSANT_ADMIN_EMAIL=admin@example.com  # 接收报告邮件的地址
```

### AI 配置

在 `.env` 文件中配置：

```bash
# AI分析功能配置（智谱AI）
RSSANT_AI_MODEL_CONFIG=glm-4,glm-4
RSSANT_AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
RSSANT_AI_API_KEY=your_api_key
```

## 定时任务说明

### 1. 仓库同步
- **频率**: 每小时
- **API**: `harbor_rss.sync_github_repos`
- **功能**: 同步所有激活订阅的仓库更新（commits、issues、PRs）
- **输出**: `github/{repo}/{date}.md`

### 2. 报告生成与邮件通知
- **频率**: 每天
- **API**: `harbor_rss.github_generate_reports`
- **功能**: 为所有激活订阅的仓库生成报告并发送邮件
- **输出**: `github/{repo}/{date}_report.md`

## 使用示例

### 手动同步仓库

```bash
curl -X POST http://localhost:6788/api/v1/github.repo.sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"repo": "microsoft/vscode", "days": 1}'
```

### 创建订阅

```bash
curl -X POST http://localhost:6788/api/v1/github.subscription.create \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "repo": "microsoft/vscode",
    "isActive": true,
    "frequencyDays": 1,
    "executionTime": "08:00"
  }'
```

### 生成报告

```bash
curl -X POST http://localhost:6788/api/v1/github.report.generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "repo": "microsoft/vscode",
    "modelType": "openai"
  }'
```

### 获取订阅列表

```bash
curl -X POST http://localhost:6788/api/v1/github.subscription.list \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"limit": 20, "offset": 0}'
```

## 数据库迁移

运行以下命令创建数据库表：

```bash
python manage.py makemigrations
python manage.py migrate
```

这将创建以下表：
- `rssant_api_githubsubscription` - 订阅表
- `rssant_api_githubprogress` - 进度记录表
- `rssant_api_githubreport` - 报告表

## 前端使用

1. 访问 `/github` 页面
2. 点击"添加订阅"按钮
3. 输入仓库路径（格式：owner/repo）
4. 配置更新频率和执行时间
5. 系统将自动同步更新并生成报告

## 总结

✅ **所有 GitHubSentinel 项目中的 GitHub 相关功能都已成功迁移到 rss-subscribe 项目**

此外，rss-subscribe 项目还增加了以下增强功能：
- 数据库持久化存储
- 完整的 Web 界面
- 用户权限控制和多用户支持
- 统一的 AI 服务集成
- 更好的错误处理和日志记录

所有功能都已集成并可以正常使用。

