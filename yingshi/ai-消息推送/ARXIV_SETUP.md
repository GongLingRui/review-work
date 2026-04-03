# ArXiv 功能设置指南

## 快速开始

### 1. 安装依赖

ArXiv 功能需要 `arxiv` Python 包。已添加到 `requirements.in`，运行：

```bash
# 如果使用 pip-compile
pip-compile --no-emit-index-url --output-file=requirements.txt requirements.in

# 或者直接安装
pip install arxiv==1.4.8
```

### 2. 运行数据库迁移

创建 ArXiv 相关的数据库表：

```bash
python manage.py migrate
```

这将创建以下表：
- `rssant_api_arxivpaper` - 论文基本信息
- `rssant_api_arxivaianalysis` - AI 分析结果
- `rssant_api_arxivaianalysissummary` - 用户保存的分析总结
- `rssant_api_arxivreport` - 报告信息

### 3. 创建报告目录

报告文件将保存在 `data/arxiv_reports/` 目录，确保该目录存在：

```bash
mkdir -p data/arxiv_reports
```

### 4. 启动服务

启动后端和前端服务后，访问 `/arxiv` 页面即可使用。

## 功能使用

### 同步论文

1. 打开 ArXiv 页面 (`/arxiv`)
2. 点击"同步论文"按钮
3. 配置参数：
   - **搜索查询**（可选）：ArXiv 查询语法，如 `cat:cs.AI AND all:transformer`
   - **分类筛选**（可选）：选择要同步的分类
   - **天数**：同步最近几天的论文（默认 7 天）
   - **最大结果数**：最多同步多少篇论文（默认 50）
   - **使用 AI 分类**：是否使用 AI 进行分类（需要配置 AI API）

### 查看论文

- 使用分类筛选查看不同分类的论文
- 使用搜索框搜索论文标题、摘要、作者
- 点击论文卡片查看详细信息
- 点击"查看论文"链接跳转到 ArXiv 官网
- 点击"PDF"链接下载论文 PDF

### 生成报告

1. 切换到"报告"标签页
2. 点击"生成报告"按钮
3. 选择报告类型：
   - **分类报告**：选择分类，生成该分类的报告
   - **每日汇总报告**：生成所有分类的汇总报告
4. 点击"生成报告"按钮

### 查看报告

- 在报告列表中点击"查看报告"按钮
- 报告以 Markdown 格式显示
- 报告文件保存在 `data/arxiv_reports/` 目录

## 配置说明

### AI 分类配置

AI 分类功能需要配置 AI API（与系统其他 AI 功能共用）：

```bash
# 环境变量配置
export AI_API_KEY=your_api_key
export AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
export AI_MODEL_CONFIG=glm-4,glm-4
```

如果不配置 AI API，将仅使用关键词匹配进行分类。

### 报告生成配置

报告生成使用系统的 AI 服务：
- 如果 AI 服务可用，将生成专业的格式化报告
- 如果 AI 服务不可用，将生成简单格式的报告

## 分类说明

系统支持以下分类：

- **agent**: 智能体、多智能体系统、强化学习智能体、LLM智能体等
- **aigc**: AI生成内容、生成式AI、大语言模型、GPT、LLM、扩散模型等
- **视频生成**: 视频生成、视频合成、文本到视频、图像到视频等
- **图像生成**: 图像生成、图像合成、文本到图像、Stable Diffusion、DALL-E等
- **影视**: AI电影、AI视频制作、AI短片、AI影视创作等
- **其他**: 不属于以上类别的论文

## 常见问题

### 1. 同步失败

- 检查网络连接
- 检查 ArXiv API 是否可访问
- 检查查询语法是否正确

### 2. 分类不准确

- 启用 AI 分类（需要配置 AI API）
- 检查论文标题和摘要是否完整

### 3. 报告生成失败

- 检查是否有该分类的论文
- 检查 AI 服务是否配置正确
- 查看后端日志获取详细错误信息

## 后续优化

- [ ] 添加论文收藏功能
- [ ] 添加论文 AI 分析功能
- [ ] 添加论文推荐功能
- [ ] 支持导出报告为 PDF
- [ ] 添加定时同步任务
- [ ] 添加邮件通知功能

