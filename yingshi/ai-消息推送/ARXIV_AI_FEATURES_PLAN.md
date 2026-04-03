# ArXiv AI 功能增强计划

## 概述

基于参考项目 `arxiv_daily_aigc` 和 `paperscraper`，计划为 ArXiv 功能添加以下 AI 相关功能：

## 待实现功能列表

### 1. 多维度 AI 评分系统 ⭐⭐⭐

**参考**: `arxiv_daily_aigc/src/filter.py` 的 `rate_papers` 函数

**功能描述**:
- 对每篇论文进行多维度评分（1-10分）：
  - `relevance_score`: 与研究兴趣的相关性
  - `novelty_claim_score`: 新颖性声明程度
  - `clarity_score`: 摘要清晰度和完整性
  - `potential_impact_score`: 潜在影响力
  - `overall_priority_score`: 综合优先级评分
- 生成 TLDR（中英文版本）

**实现计划**:
1. 扩展 `ArXivAIAnalysis` 模型，添加评分字段
2. 在 `arxiv_report_generator.py` 中添加评分 prompt
3. 更新前端显示评分信息

### 2. 论文引用数获取 ⭐⭐

**参考**: `paperscraper/paperscraper/citations/citations.py`

**功能描述**:
- 通过 Semantic Scholar API 获取论文引用数
- 支持通过标题或 DOI 查询
- 缓存引用数据，避免重复查询

**实现计划**:
1. 创建 `rssant_api/services/arxiv_citation_service.py`
2. 添加 `citation_count` 字段到 `ArXivPaper` 模型
3. 提供 API 端点批量更新引用数
4. 前端显示引用数

### 3. 期刊影响因子查询 ⭐⭐

**参考**: `paperscraper/paperscraper/impact.py`

**功能描述**:
- 查询期刊影响因子
- 支持模糊搜索
- 支持按影响因子范围筛选

**实现计划**:
1. 创建 `rssant_api/services/journal_impact_service.py`
2. 添加 `journal_impact_factor` 字段到 `ArXivPaper` 模型（如果论文有期刊信息）
3. 提供查询接口

### 4. AI 主题筛选功能 ⭐⭐⭐

**参考**: `arxiv_daily_aigc/src/filter.py` 的 `filter_papers_by_topic` 函数

**功能描述**:
- 使用 AI 批量筛选特定主题的论文
- 支持自定义主题关键词
- 返回筛选结果和置信度

**实现计划**:
1. 在 `arxiv_classifier.py` 中增强 AI 分类功能
2. 添加批量筛选 API 端点
3. 前端添加主题筛选界面

### 5. 论文趋势分析和可视化 ⭐⭐

**参考**: `paperscraper/paperscraper/postprocessing.py` 和 `plotting.py`

**功能描述**:
- 按时间维度聚合论文数量
- 生成趋势图表（折线图、柱状图）
- 支持多分类对比
- 支持 Venn 图显示分类重叠

**实现计划**:
1. 创建 `rssant_api/services/arxiv_trend_analyzer.py`
2. 添加趋势分析 API 端点
3. 前端使用图表库（如 Chart.js 或 Recharts）展示

### 6. 论文相似度分析和推荐 ⭐⭐⭐

**功能描述**:
- 基于论文标题、摘要计算相似度
- 为每篇论文推荐相似论文
- 使用向量嵌入（如 OpenAI embeddings）进行语义相似度计算

**实现计划**:
1. 创建 `rssant_api/services/arxiv_similarity_service.py`
2. 添加 `similar_papers` 字段到 `ArXivAIAnalysis` 模型
3. 提供推荐 API 端点
4. 前端显示相似论文列表

### 7. 论文 PDF 下载和全文分析 ⭐⭐

**参考**: `paperscraper/paperscraper/pdf/`

**功能描述**:
- 下载论文 PDF
- 提取 PDF 全文
- 对全文进行 AI 分析（更深入的分析）

**实现计划**:
1. 创建 `rssant_api/services/arxiv_pdf_service.py`
2. 添加 PDF 存储字段
3. 扩展 AI 分析支持全文分析

### 8. 作者分析和追踪 ⭐⭐

**功能描述**:
- 分析作者的研究方向
- 追踪特定作者的新论文
- 作者影响力分析

**实现计划**:
1. 创建 `ArXivAuthor` 模型
2. 创建 `rssant_api/services/arxiv_author_service.py`
3. 提供作者追踪 API

## 优先级排序

### 高优先级（立即实现）
1. ✅ 多维度 AI 评分系统
2. ✅ AI 主题筛选功能
3. ✅ 论文相似度分析和推荐

### 中优先级（近期实现）
4. 论文引用数获取
5. 论文趋势分析和可视化
6. 期刊影响因子查询

### 低优先级（后续实现）
7. 论文 PDF 下载和全文分析
8. 作者分析和追踪

## 技术依赖

### 新增 Python 包
- `semanticscholar`: 获取引用数
- `impact-factor`: 期刊影响因子
- `scholarly`: 学术搜索（备用）
- `sentence-transformers` 或 `openai`: 论文相似度计算
- `PyPDF2` 或 `pdfplumber`: PDF 处理

### API 密钥需求
- Semantic Scholar API Key (可选，提高速率限制)
- OpenAI API Key (用于 embeddings，可选)

## 实现步骤

1. **第一步**: 实现多维度 AI 评分系统
   - 扩展数据库模型
   - 更新 AI 分析 prompt
   - 更新前端显示

2. **第二步**: 实现 AI 主题筛选
   - 增强分类器
   - 添加批量筛选 API

3. **第三步**: 实现论文相似度分析
   - 集成向量嵌入服务
   - 实现相似度计算
   - 添加推荐功能

4. **第四步**: 添加引用数和影响因子
   - 集成外部 API
   - 添加数据字段
   - 批量更新功能

5. **第五步**: 趋势分析和可视化
   - 实现数据聚合
   - 前端图表集成

