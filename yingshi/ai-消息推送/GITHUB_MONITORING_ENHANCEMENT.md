# GitHub 仓库监控增强与 AI 分析方案

> 目的：基于现有 `GitHubClient`、订阅模型与 AI 报告链路，扩展数据抓取维度、仓库统计能力，以及更高阶的智能洞察，打造覆盖“数据采集 → 指标沉淀 → 智能分析 → 可视化呈现”的闭环。

---

## 1. 现状速览

- `rssant_api/services/github_client.py` 已提供仓库元信息、commit/issue/PR 拉取、语言统计与 Markdown 导出能力，可作为爬取/同步层的基础：

```210:245:rssant_api/services/github_client.py
        return {
            'repo': repo,
            'name': data.get('name', ''),
            'full_name': data.get('full_name', ''),
            'description': data.get('description', ''),
            'stars': data.get('stargazers_count', 0),
            'forks': data.get('forks_count', 0),
            'watchers': data.get('watchers_count', 0),
            'language': data.get('language', ''),
            'languages_url': data.get('languages_url', ''),
            'html_url': data.get('html_url', ''),
            'homepage': data.get('homepage', ''),
            'created_at': data.get('created_at', ''),
            'updated_at': data.get('updated_at', ''),
            'pushed_at': data.get('pushed_at', ''),
            'open_issues': data.get('open_issues_count', 0),
            'license': data.get('license', {}).get('name', '') if data.get('license') else '',
            'topics': data.get('topics', []),
            'archived': data.get('archived', False),
            'fork': data.get('fork', False),
        }
```

- `GitHubSubscription / GitHubProgress / GitHubReport` 已落库；`github_report_generator` 与 AI prompt 可直接复用来产出更丰富的分析段落。

---

## 2. 外部调研速记

| 参考项目/文章 | 关键能力 | 可借鉴点 |
|---------------|----------|----------|
| TrendRadar（开源多平台热点监控） | 35 平台舆情聚合、AI 情感分析与趋势追踪、多渠道推送 | 可移植“多指标雷达 + 告警”交互形式，并引入对 GitHub 动态的 AI 风险提示 |
| GitHubTools 列表 | 持续整理热门开源工具、教程和资讯 | 可将爬取的仓库事件与“相关优秀项目/依赖”联动，提升报告深度 |
| GitHub 趋势日报（社区实践） | 每日 star 增长、语言占比、热点榜单 | 借鉴“趋势表 + 语言饼图 + 增长 TopN”版式 |
| Elastic Stack 监控 GitHub 案例 | 利用 Elasticsearch + Kibana 做开发效能分析 | 为我们设计“开发效率/质量”指标提供数据建模思路 |

---

## 3. 数据抓取与指标扩展

| 维度 | 指标示例 | 数据来源 | 说明 |
|------|----------|----------|------|
| 仓库元数据 | star/fork/watch 增量、license、topics、release 数 | REST `/repos`、GraphQL `repository` | 每次同步写入 `github_repo_stats`，支持同比/环比 |
| 活跃度 | commit 数、代码作者数、issue/PR 创建&关闭数、平均 Merge 时长 | REST `/commits`, `/issues`, `/pulls`; GraphQL timeline | 结合 `since/until`，沉淀到 `GitHubProgress` |
| 协作效率 | PR review 时长、issue 首次响应时间、CI 成功率 | GraphQL `pullRequests.timeline`, GitHub Checks API | 需要新增字段 `review_latency`, `ci_pass_rate` |
| 质量健康 | reopen issue 数、bug 标签占比、release 回滚数 | Issues 标签筛选、Release events | 结合标签聚类，支持风险提示 |
| 社区声量 | star/fork delta、外部引用（GH Archive）、讨论区活跃度 | GH Archive、Discussions API | 可在 AI 报告中生成“社区热度”段落 |

> **技术要点**：REST 适合增量同步；当需要高维统计（如 reviewer、discussion），可引入 GraphQL 批量查询，并在 `GitHubClient` 中增加 `execute_graphql(query, variables)` 辅助方法。

### 3.1 AIGC / Agent / AI Infra 仓库发现

- 新增 `GitHubRepoDiscovery` 表，存储每个热门仓库的星标、增量、topics、更新时间等结构化字段，支持 `aigc/agent/ai_infra/foundation/tooling` 五大分类。
- 服务层新增 `GitHubDiscoveryService`，定期调用 GitHub Search API + 详情接口，结合关键词和最小星标限制，筛出高热度项目。
- `harbor_rss.github_discover_ai_repos` 定时任务每 6 小时运行一次，并自动为管理员（或配置的用户）创建/更新订阅，打上 `ai_auto` 来源和分类标签。
- 新增配置项 `RSSANT_GITHUB_AUTO_SUBSCRIBE_USER_IDS`（逗号分隔用户ID），用于指定自动订阅接收者；若未配置则默认第一个超级管理员。
- API：
  - `github.discovery.list`：返回指定分类的热门仓库卡片（星标、语言、topics、增量等）。
  - `github.discovery.refresh`：强制刷新某一分类并同步订阅。
- 前端 `GitHubPage` 新增“AI/AIGC 热门仓库实时雷达”模块，支持切换分类、查看 topics、直接一键订阅。

---

## 4. 数据存储与调度设计

1. **结构化表扩展**
   - `GitHubRepoStats`（新表）：`subscription_id`、`snapshot_date`、`stars_delta`、`forks_delta`、`open_prs`、`release_count`、`ci_pass_rate`、`language_breakdown (JSONB)`、`contributors_active` 等。
   - `GitHubContributorSnapshot`：存储近 7/30 天的核心贡献者、提交数、审阅数，支撑“关键人物”卡片。
   - `GitHubAlert`：记录 AI 或规则引擎产生的风险/机会事件，字段包含 `category`（如“质量风险”、“增长爆发”）、`severity`、`evidence`.

2. **任务编排**
   - **小时级**：同步 commits/issues/PRs，更新 `GitHubProgress`。
   - **日级**：计算统计指标 → 写入 `RepoStats`、`ContributorSnapshot`。
   - **周级**：生成趋势图所需的聚合缓存（例如 8 周窗口）。
   - 使用现有 `rssant_scheduler/timer_task.py` 注册新任务，例如 `harbor_rss.github_collect_repo_stats`、`harbor_rss.github_generate_ai_insights`。

3. **对象存储**：保留 Markdown/HTML 报告，但建议同时将结构化结论落库，以便前端组件二次渲染。

---

## 5. AI 内容分析升级

在 `github_report_generator` 基础上拆分 Prompt 模块，生成多段结构化洞察：

1. **变更脉络总结**：针对近 24h/7d 的 commits & merged PR，归纳“新增特性 / 性能优化 / bug 修复”。
2. **风险预警**：识别 reopen issues、CI 失败、review 超时，输出影响面与建议行动。
3. **路线图推演**：结合 release note 与 milestone，预测下一个版本的关键工作。
4. **贡献者画像**：列出 Top N 贡献者的活跃度、负责模块，辅助团队管理。
5. **社区反馈洞察**：聚合 Discussions、issue comment 中的高频诉求，与 `language_topics` 做关联。

### Prompt 模板示例

```text
你是资深开源情报分析师，请基于提供的仓库结构化数据输出：
1. 关键变化摘要（<=150 字）
2. 风险/阻塞项（若无请写“暂无”）
3. 机会点或增长信号
4. 下周期建议（列出 2-3 条可执行事项）
```

输出格式建议 JSON，字段如 `summary`, `risks`, `opportunities`, `next_actions`，便于前端组件加载。

---

## 6. 前端展示 & 报告形态

- **指标概览卡片**：星标增长、活跃贡献者、CI 通过率、平均响应时间；支持自定义时间窗口。
- **趋势图**：`stars/forks/watchers` 折线、`commit/issue/PR` 堆叠面积、`language` 旭日图。
- **贡献者雷达**：以“提交数/审阅数/讨论回复/issue 处理”绘制多维雷达。
- **AI 洞察面板**：展示结构化 AI JSON 的各字段，支持一键推送（邮件/Slack/飞书）。
- **事件时间轴**：混合 release、alert、AI 建议，帮助快速回顾历史。
- **数据下载**：提供 CSV/Markdown 导出，以及 webhook 触发 AI 报告。

---

## 7. 实施路径

1. **阶段 1：数据补全**
   - 扩展 `GitHubClient` 支持 GraphQL/Checks API。
   - 新增 RepoStats/ContributorSnapshot 模型与迁移。
   - 定时任务落地，验证指标计算。
2. **阶段 2：AI 模块细化**
   - 将报告拆成多段 Prompt；产出结构化 JSON。
   - 引入风险规则引擎（如 reopen>threshold 则触发）。
3. **阶段 3：前端与推送**
   - GitHub 页面增加仪表盘、AI 面板、导出/推送入口。
   - 支持邮件 + 企业微信/飞书/Slack 通知模版。
4. **阶段 4：性能与多仓规模化**
   - 引入任务并发限流、API 速率控制。
   - 若订阅数大，可对长周期指标使用异步批处理 + 缓存。

---

## 8. 下一步建议

- 先选 2~3 个核心仓库跑通“增量指标 + AI 洞察”闭环，形成样板。
- 结合调研成果，引入“趋势榜 / 异常告警”增强用户对 GitHub 监控的粘性。
- 将报告结果同步到 `data/github_reports/` 目录，并自动生成日报/周报 Markdown，保持与现有 `ai_entertainment_reports` 一致的归档体验。

> 完成以上增强后，GitHub 监控将从“简单同步”升级至“指标齐全 + 智能洞察 + 多终端推送”的成体系方案，可与 TrendRadar 等业界工具比肩。

