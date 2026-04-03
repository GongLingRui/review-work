# CLI 管理工具使用说明

本文档说明如何使用 RSS 订阅系统的 CLI 管理工具。

## 目录

- [RSS 命令工具](#rss-命令工具-rsspy)
- [Feed 分析工具](#feed-分析工具-feed_analysispy)
- [用户留存分析工具](#用户留存分析工具-retain_analysispy)
- [邮件发送工具](#邮件发送工具-emailpy)
- [测试数据生成工具](#测试数据生成工具-mockpy)
- [SQL 脚本](#sql-脚本)

## 使用方式

所有 CLI 工具都需要在激活的虚拟环境中运行，并且需要 Django 环境已正确配置。

### 直接运行模块

```bash
# 激活虚拟环境
conda activate <your_env>

# 运行 RSS 命令
python -m rssant_cli.rss <command> [options]

# 运行 Feed 分析命令
python -m rssant_cli.feed_analysis <command> [options]

# 运行用户留存分析命令
python -m rssant_cli.retain_analysis [options]

# 运行邮件发送命令
python -m rssant_cli.email <command> [options]

# 运行测试数据生成命令
python -m rssant_cli.mock <command> [options]
```

### 通过 Django manage.py 运行（推荐）

可以通过 Django 的 `runscript` 命令来运行 CLI 工具：

```bash
python manage.py runscript rssant_cli.rss -- <command> [options]
```

## RSS 命令工具 (rss.py)

用于管理 RSS Feed 和 Story 数据的维护命令。

### 修复 Feed 文章总数

修复不正确的 Feed 文章总数统计。

```bash
# 查看需要修复的 Feed（不执行修复）
python -m rssant_cli.rss fix-feed-total-storys --dry-run

# 执行修复
python -m rssant_cli.rss fix-feed-total-storys
```

### 更新 Feed 月度文章计数

更新 Feed 的月度文章统计数据。

```bash
# 更新所有 Feed
python -m rssant_cli.rss update-feed-monthly-story-count

# 更新指定 Feed（ID 用逗号分隔）
python -m rssant_cli.rss update-feed-monthly-story-count --feeds 1,2,3
```

### 更新 Feed 干燥度

更新 Feed 的干燥度指标（基于月度文章数量计算）。

```bash
# 更新所有 Feed
python -m rssant_cli.rss update-feed-dryness

# 更新指定 Feed
python -m rssant_cli.rss update-feed-dryness --feeds 1,2,3
```

### 更新 Feed 首次文章发布日期

更新 Feed 的第一篇文章发布日期。

```bash
python -m rssant_cli.rss update-feed-dt-first-story-published --feeds 1,2,3
```

### 更新 Story 的 MathJax 标记

标记包含数学公式的文章。

```bash
# 更新所有 Story
python -m rssant_cli.rss update-story-has-mathjax

# 更新指定 Story（ID 用逗号分隔）
python -m rssant_cli.rss update-story-has-mathjax --storys 1,2,3
```

### 更新 Story 的用户标记状态

更新 Story 的用户标记（已读/收藏）状态。

```bash
python -m rssant_cli.rss update-story-is-user-marked
```

### 处理 Story 链接

处理 Story 内容中的链接。

```bash
# 处理所有 Story
python -m rssant_cli.rss process-story-links

# 处理指定 Story
python -m rssant_cli.rss process-story-links --storys 1,2,3
```

### 解码 UnionID

解码 UnionID 为 user_id, feed_id 等。

```bash
python -m rssant_cli.rss decode-unionid <unionid_text>
```

### 删除无效的 Feed

根据错误率删除无效的 Feed。

```bash
# 默认参数：最近 1 天，限制 100 个，阈值 99%
python -m rssant_cli.rss delete-invalid-feeds

# 自定义参数
python -m rssant_cli.rss delete-invalid-feeds --days 7 --limit 200 --threshold 95
```

### 修复用户 Story 偏移量

修复用户 Story 偏移量不一致的问题。

```bash
python -m rssant_cli.rss fix-user-story-offset
```

### 订阅更新日志 Feed

为所有用户订阅更新日志 Feed。

```bash
python -m rssant_cli.rss subscribe-changelog
```

### 更新 Feed 代理设置

检查并更新需要使用代理的 Feed。

```bash
python -m rssant_cli.rss update-feed-use-proxy
```

**注意**：需要先配置 `RSSANT_RSS_PROXY_ENABLE=true`。

### 删除 Feed

删除指定的 Feed。

```bash
# 通过 ID 删除
python -m rssant_cli.rss delete-feed 123

# 通过 URL 或标题关键字删除
python -m rssant_cli.rss delete-feed "example.com"
```

### 刷新 Feed

手动触发 Feed 刷新任务。

```bash
# 通过 Feed ID
python -m rssant_cli.rss refresh-feed --feeds 1,2,3

# 通过 Union Feed ID
python -m rssant_cli.rss refresh-feed --union-feeds 014064,0140be

# 通过 URL 或标题关键字
python -m rssant_cli.rss refresh-feed --key "example.com"

# 设置过期时间（小时）
python -m rssant_cli.rss refresh-feed --feeds 1,2,3 --expire 2
```

### 更新 Feed 反向 URL

更新 Feed 的反向 URL（用于去重）。

```bash
python -m rssant_cli.rss update-feed-reverse-url --feeds 1,2,3
```

## Feed 分析工具 (feed_analysis.py)

用于分析 Feed 的统计数据和生成报告。

### 生成快照

生成当前 Feed 状态的快照（压缩的 JSON 格式）。

```bash
# 输出到标准输出
python -m rssant_cli.feed_analysis snapshot

# 保存到文件
python -m rssant_cli.feed_analysis snapshot --output feeds_snapshot.json.gz
```

### 生成对比报告

对比两个快照并生成报告。

```bash
# 生成 HTML 报告
python -m rssant_cli.feed_analysis report \
    --snapshot1 snapshot1.json.gz \
    --snapshot2 snapshot2.json.gz \
    --output report.html \
    --output-type html

# 发送邮件报告
python -m rssant_cli.feed_analysis report \
    --snapshot1 snapshot1.json.gz \
    --snapshot2 snapshot2.json.gz \
    --output admin@example.com \
    --output-type email
```

**注意**：邮件功能需要配置 SMTP 设置。

## 用户留存分析工具 (retain_analysis.py)

用于分析用户留存率数据。

### 生成留存分析报告

```bash
# 生成 HTML 报告（默认最近 30 天）
python -m rssant_cli.retain_analysis \
    --output retain_report.html \
    --output-type html

# 生成 CSV 报告
python -m rssant_cli.retain_analysis \
    --output retain_report.csv \
    --output-type csv \
    --days 60 \
    --by week

# 发送邮件报告
python -m rssant_cli.retain_analysis \
    --output admin@example.com \
    --output-type email \
    --days 30 \
    --by day \
    --dt-end 2024-01-31
```

**参数说明**：
- `--days`: 分析的天数（默认：30）
- `--by`: 分组方式，可选 `day`、`week`、`month`（默认：`day`）
- `--dt-end`: 结束日期，格式 `YYYY-MM-DD`（默认：今天）
- `--output`: 输出文件路径或邮箱地址
- `--output-type`: 输出类型，可选 `html`、`csv`、`email`（默认：`html`）

## 邮件发送工具 (email.py)

用于发送召回邮件等邮件功能。

### 发送召回邮件

```bash
# 发送给指定邮箱列表
python -m rssant_cli.email send-recall \
    --receivers "user1@example.com
user2@example.com
user3@example.com"
```

### 定时发送召回邮件

从文件中读取邮箱列表，按指定时间间隔发送邮件。

```bash
python -m rssant_cli.email send-recall-timed \
    --receiver-file receivers.txt \
    --duration 5d
```

**说明**：
- `receivers.txt`: 每行一个邮箱地址
- `duration`: 发送总时长，如 `5d`（5天）、`2h`（2小时）
- 发送进度会保存在 `receivers.txt.done` 文件中

## 测试数据生成工具 (mock.py)

用于生成测试数据。

### 创建测试 Story

```bash
# 使用默认参数创建
python -m rssant_cli.mock story

# 自定义参数创建
python -m rssant_cli.mock story \
    --ident "test-001" \
    --title "测试文章标题" \
    --content "测试文章内容" \
    --summary "测试摘要" \
    --image-url "https://example.com/image.jpg"
```

**说明**：
- 测试 Feed URL: `https://test.rss.anyant.com/feed.xml`
- 如果未指定参数，将使用时间戳作为 ID 和默认内容

## SQL 脚本

### fix_user_story_feed_id.sql

修复 Feed 合并导致的用户 Story 数据不一致问题。

**使用方法**：

```bash
# 通过 psql 执行
psql -U rssant -d rssant -f rssant_cli/scripts/fix_user_story_feed_id.sql

# 或在 Django shell 中执行
python manage.py dbshell < rssant_cli/scripts/fix_user_story_feed_id.sql
```

## 注意事项

1. **环境配置**：确保已正确配置数据库连接和相关环境变量。

2. **权限**：某些命令需要数据库写入权限，请谨慎操作。

3. **备份**：在执行删除或修改数据的命令前，建议先备份数据库。

4. **邮件配置**：使用邮件功能前，需要在 `rssant.env` 或环境变量中配置 SMTP 设置：
   ```bash
   RSSANT_SMTP_ENABLE=true
   RSSANT_SMTP_HOST=smtp.example.com
   RSSANT_SMTP_PORT=465
   RSSANT_SMTP_USE_SSL=true
   RSSANT_SMTP_USERNAME=your_email@example.com
   RSSANT_SMTP_PASSWORD=your_password
   ```

5. **代理配置**：使用 `update-feed-use-proxy` 命令前，需要配置 RSS 代理：
   ```bash
   RSSANT_RSS_PROXY_ENABLE=true
   RSSANT_RSS_PROXY_URL=https://your-proxy.com
   RSSANT_RSS_PROXY_TOKEN=your_token
   ```

## 常用命令组合示例

### 定期维护任务

```bash
# 1. 修复 Feed 统计
python -m rssant_cli.rss fix-feed-total-storys

# 2. 更新月度统计
python -m rssant_cli.rss update-feed-monthly-story-count

# 3. 更新干燥度
python -m rssant_cli.rss update-feed-dryness

# 4. 清理无效 Feed
python -m rssant_cli.rss delete-invalid-feeds --days 7
```

### 数据分析和报告

```bash
# 1. 生成 Feed 快照
python -m rssant_cli.feed_analysis snapshot --output snapshot_$(date +%Y%m%d).json.gz

# 2. 生成用户留存报告
python -m rssant_cli.retain_analysis \
    --output retain_$(date +%Y%m%d).html \
    --output-type html \
    --days 30
```

## 故障排除

### 命令无法运行

1. 检查虚拟环境是否激活
2. 检查 Django 环境是否正确配置
3. 检查数据库连接是否正常

### 邮件发送失败

1. 检查 SMTP 配置是否正确
2. 检查网络连接
3. 查看日志获取详细错误信息

### 数据库操作失败

1. 检查数据库权限
2. 检查数据库连接
3. 确认数据表结构是否正确

## 更多帮助

查看具体命令的帮助信息：

```bash
python -m rssant_cli.rss --help
python -m rssant_cli.rss <command> --help
```


