# ArXiv 论文爬取功能集成文档

## 概述

在 RSSHub 功能基础上，新增了 ArXiv 论文爬取功能，支持自动分类和格式化报告生成。

## 功能特性

### 1. 论文爬取
- 从 ArXiv 爬取论文元数据（标题、摘要、作者、分类等）
- 支持自定义查询和日期范围筛选
- 自动提取 ArXiv ID、PDF 链接等信息

### 2. 智能分类
- 支持以下分类：
  - **agent**: 智能体、多智能体系统、强化学习智能体等
  - **aigc**: AI生成内容、生成式AI、大语言模型、GPT、LLM等
  - **视频生成**: 视频生成、视频合成、文本到视频等
  - **图像生成**: 图像生成、图像合成、文本到图像、Stable Diffusion等
  - **影视**: AI电影、AI视频制作、AI短片、AI影视创作等
  - **其他**: 不属于以上类别的论文

- 分类方式：
  - 关键词匹配（快速、基础分类）
  - AI 分类（可选，更准确但需要 AI API）

### 3. 报告生成
- **分类报告**: 按分类生成报告，包含该分类下的重要论文
- **每日汇总报告**: 生成所有分类的每日汇总报告
- 报告格式：Markdown 格式，支持 AI 生成专业内容

## 数据采集策略

### 方法 A：官方 API / Atom Feed

- **HTTP 接口**：优先走 `https://export.arxiv.org/api/query`，通过 `search_query`、`start`、`max_results` 等参数完成检索（示例：`http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=10`）。官方文档明确说明输入参数、返回格式（Atom XML）与分页方式，结果稳定且延迟低。详见 [arXiv API Basics](https://info.arxiv.org/help/api/basics.html?utm_source=chatgpt.com)。
- **SDK & Feed 双通道**：项目中的 `ArXivClient` 先调用官方 `python-arxiv` SDK；当 SDK 出错或受限时，自动退化到 `feedparser` 解析 Atom Feed，依旧遵守 API 速率限制（官方建议不少于 3 秒/次请求）。
- **请求规范**：必须携带自定义 `User-Agent` 并遵守频控；分页时控制 `start`+`max_results`（官方单次最多 100 条）。返回的 Atom Entry 中包含 `id`, `title`, `summary`, `author`, `category term` 等字段，可直接映射到 `ArXivPaper` 模型。
- **优势**：正规合规、字段完备（包含 DOI、版本号、时间戳）、可复用官方排序（`submittedDate`/`relevance`）并减少 HTML 解析开销。

### 方法 B：按类别分页抓取（兜底）

- 借鉴 [Medium 教程](https://medium.com/%40bargadyahmed/web-scraping-and-data-collection-from-arxiv-articles-3d3f3e2532ec) 的流程，先基于 `ARXIV_FIELDS` 定义重点学科（如 `math`、`cs`、`astro-ph` 等），再按 `https://arxiv.org/list/{category}/pastweek?skip=0&show=25` 的分页模式遍历。
- 页面结构固定在 `<dl>` 列表中，`<dt>` 标签包含 `href="/abs/2312.06599"` 的 Abstract 链接，可解析出 ArXiv ID。项目可以复用此策略作为“临时补齐”手段，用于：
  1. 官方 API 短期故障或响应异常；
  2. 需要采集 `pastweek` 页面上的排序视图时；
  3. 小批量类目巡检（例如一次性补齐 8 个大类的头部论文）。
- 抓取后仍建议走同一套解析/存储逻辑，确保模型字段和报告生成保持一致。

> 推荐流程：**优先方法 A（官方 API）→ 兜底方法 B（HTML 抓取）**。这样既能符合 arXiv 使用规范，又能在特殊情况下保证数据可用性。

## 技术实现

### 后端

#### 数据模型 (`rssant_api/models/arxiv.py`)
- `ArXivPaper`: 论文基本信息
- `ArXivAIAnalysis`: AI 分析结果
- `ArXivAIAnalysisSummary`: 用户保存的分析总结
- `ArXivReport`: 报告信息

#### 服务层
- `ArXivClient` (`rssant_api/services/arxiv_client.py`): ArXiv API 客户端
- `ArXivClassifier` (`rssant_api/services/arxiv_classifier.py`): 论文分类器
- `ArXivReportGenerator` (`rssant_api/services/arxiv_report_generator.py`): 报告生成器

#### API 端点 (`rssant_api/views/arxiv.py`)
- `arxiv.paper.list`: 获取论文列表
- `arxiv.paper.get`: 获取单篇论文
- `arxiv.paper.sync`: 同步论文
- `arxiv.paper.analyze`: AI 分析论文
- `arxiv.report.generate_category`: 生成分类报告
- `arxiv.report.generate_daily`: 生成每日报告
- `arxiv.report.list`: 获取报告列表
- `arxiv.report.get`: 获取单份报告

### 前端

#### 页面组件 (`frontend/src/pages/ArXivPage.tsx`)
- 论文列表展示
- 分类筛选和搜索
- 同步论文功能
- 报告生成和查看

#### API 接口 (`frontend/src/lib/api.ts`)
- `arxivApi`: 完整的 ArXiv API 封装

## 使用说明

### 1. 数据库迁移

首次使用需要创建数据库表：

```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. 安装依赖

确保已安装 `arxiv` Python 包：

```bash
pip install arxiv
```

### 3. 同步论文

1. 打开 ArXiv 页面 (`/arxiv`)
2. 点击"同步论文"按钮
3. 配置同步参数：
   - 搜索查询（可选，ArXiv 查询语法）
   - 分类筛选（可选）
   - 天数（默认 7 天）
   - 最大结果数（默认 50）
   - 是否使用 AI 分类
4. 点击"开始同步"

### 4. 查看论文

- 使用分类筛选查看不同分类的论文
- 使用搜索框搜索论文标题、摘要、作者
- 点击论文卡片查看详细信息
- 点击"查看论文"链接跳转到 ArXiv 官网
- 点击"PDF"链接下载论文 PDF

### 5. 生成报告

1. 切换到"报告"标签页
2. 点击"生成报告"按钮
3. 选择报告类型：
   - **分类报告**: 选择分类，生成该分类的报告
   - **每日汇总报告**: 生成所有分类的汇总报告
4. 点击"生成报告"按钮

### 6. 查看报告

- 在报告列表中点击"查看报告"按钮
- 报告以 Markdown 格式显示
- 报告文件保存在 `data/arxiv_reports/` 目录

## 配置说明

### AI 分类配置

AI 分类功能需要配置 AI API（与系统其他 AI 功能共用）：
- 在环境变量中配置 `AI_API_KEY`、`AI_API_BASE_URL` 等
- 如果不配置，将仅使用关键词匹配分类

### 报告生成配置

报告生成使用系统的 AI 服务：
- 如果 AI 服务可用，将生成专业的格式化报告
- 如果 AI 服务不可用，将生成简单格式的报告

## 文件结构

```
rssant_api/
├── models/
│   └── arxiv.py                    # ArXiv 数据模型
├── services/
│   ├── arxiv_client.py             # ArXiv API 客户端
│   ├── arxiv_classifier.py         # 论文分类器
│   └── arxiv_report_generator.py   # 报告生成器
└── views/
    └── arxiv.py                    # ArXiv API 视图

frontend/src/
├── pages/
│   └── ArXivPage.tsx               # ArXiv 页面组件
└── lib/
    └── api.ts                      # API 接口定义（已更新）

data/
└── arxiv_reports/                  # 报告文件存储目录
```

## 注意事项

1. **ArXiv API 限制**: ArXiv API 有请求频率限制，建议不要过于频繁地同步
2. **AI 分类**: AI 分类需要 API Key，如果未配置将仅使用关键词匹配
3. **报告生成**: 报告生成可能需要较长时间，特别是包含大量论文时
4. **数据存储**: 论文数据存储在数据库中，报告文件存储在 `data/arxiv_reports/` 目录

## 后续优化建议

1. 添加论文收藏功能
2. 添加论文 AI 分析功能（类似 Hacker News）
3. 添加论文推荐功能
4. 支持导出报告为 PDF
5. 添加定时同步任务
6. 添加邮件通知功能

