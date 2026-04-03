# RSSant 数据库设计文档

## 数据库概述

本项目使用 **PostgreSQL** 数据库，基于 **Django ORM** 框架。所有表都包含基础字段 `_version`（乐观锁版本号）、`_created`（创建时间）、`_updated`（更新时间）。

---

## 1. 用户相关表

### 1.1 User (Django默认用户表)
**表名**: `auth_user`

Django框架默认的用户表，包含以下主要字段：
- `id`: 主键，自增整数
- `username`: 用户名（唯一）
- `email`: 邮箱
- `password`: 密码（加密存储）
- `is_active`: 是否激活
- `is_staff`: 是否管理员
- `is_superuser`: 是否超级用户
- `date_joined`: 注册时间
- `last_login`: 最后登录时间

---

## 2. Feed（订阅源）相关表

### 2.1 Feed - 订阅源主表
**表名**: `rssant_api_feed`

存储RSS/Atom订阅源的基本信息和状态。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `url` | Text | 供稿地址 | UNIQUE, NOT NULL |
| `reverse_url` | Text | 倒转URL（用于去重） | NULL |
| `status` | Char(20) | 状态 | NOT NULL, DEFAULT='pending'<br/>可选值: pending/updating/ready/error/discard |
| `title` | Char(200) | 标题 | NULL |
| `link` | Text | 网站链接 | NULL |
| `author` | Char(200) | 作者 | NULL |
| `icon` | Text | 网站Logo或图标 | NULL |
| `description` | Text | 描述或小标题 | NULL |
| `version` | Char(200) | 供稿格式（RSS/Atom） | NULL |
| `dt_updated` | DateTime | 更新时间 | NOT NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_checked` | DateTime | 最近一次检查同步时间 | NULL |
| `dt_synced` | DateTime | 最近一次同步时间 | NULL |
| `encoding` | Char(200) | 编码 | NULL |
| `etag` | Char(200) | HTTP响应头ETag | NULL |
| `last_modified` | Char(200) | HTTP响应头Last-Modified | NULL |
| `content_length` | Integer | 内容长度（字节） | NULL |
| `response_status` | Integer | HTTP响应状态码 | NULL |
| `monthly_story_count_data` | Binary(514) | 月度故事统计数据（压缩） | NULL |
| `dryness` | Integer | 订阅活跃度（数值越大更新越慢） | NULL, DEFAULT=0 |
| `dt_first_story_published` | DateTime | 最老的story发布时间 | NULL |
| `total_storys` | Integer | 故事总数 | NULL, DEFAULT=0 |
| `retention_offset` | Integer | 保留偏移量（stale story == offset < retention_offset） | NULL, DEFAULT=0 |
| `freeze_level` | Integer | 冻结级别（1:正常，N:减慢N倍） | NULL, DEFAULT=1 |
| `use_proxy` | Boolean | 是否使用代理 | NULL, DEFAULT=False |
| `checksum_data` | Binary(4096) | Feed校验和数据 | NULL |
| `warnings` | Text | 处理Feed时的警告信息 | NULL |
| `content_hash_base64` | Char(200) | 内容哈希值（base64） | NULL |
| `story_publish_period` | Integer | 故事发布周期（天，已废弃） | NULL, DEFAULT=30 |
| `offset_early_story` | Integer | 最老或18个月前发布的story的offset（已废弃） | NULL |
| `dt_early_story_published` | DateTime | 最老或18个月前发布的story的发布时间（已废弃） | NULL |
| `dt_latest_story_published` | DateTime | 最新的story发布时间 | NULL |

**索引**:
- `idx_feed_url`: `url`
- `idx_feed_reverse_url`: `reverse_url`

**状态说明**:
- `pending`: 待处理
- `updating`: 更新中
- `ready`: 就绪
- `error`: 错误
- `discard`: 已丢弃（合并到其他Feed）

---

### 2.2 RawFeed - 订阅原始数据表
**表名**: `rssant_api_rawfeed`

存储订阅源的原始HTTP响应数据（压缩存储）。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `feed_id` | Integer | Feed外键 | FOREIGN KEY → Feed(id), CASCADE |
| `url` | Text | 供稿地址 | NOT NULL |
| `encoding` | Char(200) | 编码 | NULL |
| `status_code` | Integer | HTTP状态码 | NULL |
| `etag` | Char(200) | HTTP响应头ETag | NULL |
| `last_modified` | Char(200) | HTTP响应头Last-Modified | NULL |
| `headers` | JSON | HTTP响应头（JSON对象） | NULL |
| `is_gzipped` | Boolean | 内容是否gzip压缩 | NULL, DEFAULT=False |
| `content` | Binary | 原始内容（可能压缩） | NULL |
| `content_length` | Integer | 内容长度 | NULL |
| `content_hash_base64` | Char(200) | 内容哈希值（base64） | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |

**索引**:
- `idx_rawfeed_feed_status_created`: `(feed_id, status_code, dt_created)`
- `idx_rawfeed_url_status_created`: `(url, status_code, dt_created)`

---

### 2.3 UserFeed - 用户订阅状态表
**表名**: `rssant_api_userfeed`

存储用户对订阅源的个性化设置和阅读进度。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `user_id` | Integer | 用户外键 | FOREIGN KEY → User(id), CASCADE |
| `feed_id` | Integer | Feed外键 | FOREIGN KEY → Feed(id), CASCADE, NULL |
| `title` | Char(200) | 用户设置的标题 | NULL |
| `group` | Char(200) | 用户设置的分组 | NULL |
| `story_offset` | Integer | 故事阅读偏移量（已读位置） | NULL, DEFAULT=0 |
| `is_from_bookmark` | Boolean | 是否从书签导入 | NULL, DEFAULT=False |
| `is_publish` | Boolean | 是否发布到公开页面 | NULL, DEFAULT=False |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_updated` | DateTime | 更新时间 | NULL |

**唯一约束**:
- `unique_user_feed`: `(user_id, feed_id)`

**索引**:
- `idx_userfeed_user_feed`: `(user_id, feed_id)`

---

### 2.4 FeedCreation - 订阅创建信息表
**表名**: `rssant_api_feedcreation`

存储用户创建订阅的请求和状态。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `user_id` | Integer | 用户外键 | FOREIGN KEY → User(id), CASCADE |
| `feed_id` | Integer | Feed外键 | FOREIGN KEY → Feed(id), CASCADE, NULL |
| `url` | Text | 用户输入的供稿地址 | NOT NULL |
| `is_from_bookmark` | Boolean | 是否从书签导入 | NULL, DEFAULT=False |
| `status` | Char(20) | 状态 | NOT NULL, DEFAULT='pending'<br/>可选值: pending/updating/ready/error/discard |
| `message` | Text | 查找订阅的日志信息 | NOT NULL |
| `title` | Char(200) | 用户设置的标题 | NULL |
| `group` | Char(200) | 用户设置的分组 | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_updated` | DateTime | 更新时间 | NULL |

**索引**:
- `idx_feedcreation_user_created`: `(user_id, dt_created)`

---

### 2.5 FeedUrlMap - Feed URL映射表
**表名**: `rssant_api_feedurlmap`

存储起始URL到Feed URL的映射关系，用于加速Feed查找。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `source` | Text | 起始地址 | NOT NULL |
| `target` | Text | 供稿地址 | NOT NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |

**索引**:
- `idx_feedurlmap_source_created`: `(source, dt_created)`

**特殊值**:
- `target = '#'`: 表示未找到Feed（NOT_FOUND）

---

### 2.6 FeedStoryStat - Feed统计信息表
**表名**: `rssant_api_feedstorystat`

存储Feed的统计数据和校验信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键（等于feed_id） | PRIMARY KEY |
| `monthly_story_count_data` | Binary(514) | 月度故事统计数据（压缩） | NULL |
| `checksum_data` | Binary(4096) | Feed校验和数据 | NULL |
| `unique_ids_data` | Binary(100KB) | 唯一ID数据（压缩） | NULL |

**说明**: 此表用于将Feed表中的大字段分离出来，优化查询性能。

---

## 3. Story（故事/文章）相关表

### 3.1 Story - 故事主表
**表名**: `rssant_api_story`

存储RSS/Atom订阅源中的文章/故事内容。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `feed_id` | Integer | Feed外键 | FOREIGN KEY → Feed(id), CASCADE |
| `offset` | Integer | Story在Feed中的位置 | NOT NULL |
| `unique_id` | Char(200) | 唯一标识符 | NOT NULL |
| `title` | Char(200) | 标题 | NOT NULL |
| `link` | Text | 文章链接 | NOT NULL |
| `author` | Char(200) | 作者 | NULL |
| `image_url` | Text | 图片链接 | NULL |
| `audio_url` | Text | 播客音频链接 | NULL |
| `iframe_url` | Text | 视频iframe链接 | NULL |
| `has_mathjax` | Boolean | 是否包含MathJax | NULL, DEFAULT=False |
| `is_user_marked` | Boolean | 是否有用户标记（收藏或已读） | NULL, DEFAULT=False |
| `dt_published` | DateTime | 发布时间 | NOT NULL |
| `dt_updated` | DateTime | 更新时间 | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_synced` | DateTime | 最近一次同步时间 | NULL |
| `summary` | Text | 摘要或较短的内容 | NULL |
| `content` | Text | 文章内容 | NULL |
| `sentence_count` | Integer | 句子数量 | NULL |
| `content_hash_base64` | Char(200) | 内容哈希值（base64） | NULL |

**唯一约束**:
- `unique_feed_offset`: `(feed_id, offset)`
- `unique_feed_unique_id`: `(feed_id, unique_id)`

**索引**:
- `idx_story_feed_offset`: `(feed_id, offset)`
- `idx_story_feed_unique_id`: `(feed_id, unique_id)`

---

### 3.2 StoryInfo - 故事信息表（新版本）
**表名**: `rssant_api_storyinfo`

新版本的故事信息表，使用组合主键（feed_id和offset编码为BigInteger）。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | BigInteger | 主键（feed_id和offset的编码） | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `unique_id` | Char(200) | 唯一标识符 | NOT NULL |
| `title` | Char(200) | 标题 | NOT NULL |
| `link` | Text | 文章链接 | NOT NULL |
| `author` | Char(200) | 作者 | NULL |
| `image_url` | Text | 图片链接 | NULL |
| `audio_url` | Text | 播客音频链接 | NULL |
| `iframe_url` | Text | 视频iframe链接 | NULL |
| `has_mathjax` | Boolean | 是否包含MathJax | NULL |
| `is_user_marked` | Boolean | 是否有用户标记 | NULL |
| `dt_published` | DateTime | 发布时间 | NOT NULL |
| `dt_updated` | DateTime | 更新时间 | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL |
| `dt_synced` | DateTime | 最近一次同步时间 | NULL |
| `content_length` | Integer | 内容长度 | NULL |
| `summary` | Text | 摘要或较短的内容 | NULL |
| `content_hash_base64` | Char(200) | 内容哈希值（base64） | NULL |
| `sentence_count` | Integer | 句子数量 | NULL |

**说明**: 
- 此表不存储`content`字段，内容存储在PostgreSQL分片表中
- `id = StoryId.encode(feed_id, offset)`，通过编码将两个整数组合成一个BigInteger

---

### 3.3 UserStory - 用户故事关联表
**表名**: `rssant_api_userstory`

存储用户对故事的阅读状态、收藏状态等个性化信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `user_id` | Integer | 用户外键 | FOREIGN KEY → User(id), CASCADE |
| `story_id` | Integer | Story外键 | FOREIGN KEY → Story(id), CASCADE |
| `feed_id` | Integer | Feed外键 | FOREIGN KEY → Feed(id), CASCADE |
| `user_feed_id` | Integer | UserFeed外键 | FOREIGN KEY → UserFeed(id), CASCADE |
| `offset` | Integer | Story在Feed中的位置 | NOT NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `is_watched` | Boolean | 是否已读 | NOT NULL, DEFAULT=False |
| `dt_watched` | DateTime | 关注时间 | NULL |
| `is_favorited` | Boolean | 是否收藏 | NOT NULL, DEFAULT=False |
| `dt_favorited` | DateTime | 标星时间 | NULL |

**唯一约束**:
- `unique_user_story`: `(user_id, story_id)`
- `unique_user_feed_offset`: `(user_feed_id, offset)`
- `unique_user_feed_offset2`: `(user_id, feed_id, offset)`

**索引**:
- `idx_userstory_user_feed_offset`: `(user_id, feed_id, offset)`
- `idx_userstory_user_feed_story`: `(user_id, feed_id, story_id)`

---

## 4. 其他功能表

### 4.1 UserPublish - 用户发布配置表
**表名**: `rssant_api_userpublish`

存储用户订阅发布页面的配置信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `user_id` | Integer | 用户外键 | FOREIGN KEY → User(id), CASCADE |
| `is_enable` | Boolean | 是否启用 | NULL, DEFAULT=False |
| `root_url` | Char(255) | 访问地址 | NULL |
| `is_all_public` | Boolean | 是否全部公开 | NULL, DEFAULT=False |
| `website_title` | Char(255) | 网站标题 | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_updated` | DateTime | 更新时间 | NULL |

**唯一约束**:
- `unique_user`: `(user_id)`

**索引**:
- `idx_userpublish_user`: `user_id`
- `idx_userpublish_root_url`: `root_url`

---

### 4.2 ImageInfo - 图片信息表
**表名**: `rssant_api_imageinfo`

存储图片信息，用于检测防盗链和自动图片代理。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `url_root` | Char(120) | URL根路径（如: https://image.example.com/root-path） | NOT NULL |
| `sample_url` | Text | 示例图片URL | NULL |
| `user_agent` | Text | 请求示例图片时使用的user-agent | NULL |
| `referer` | Text | 请求示例图片时使用的referer | NULL |
| `status_code` | Integer | 请求示例图片时的响应状态码 | NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |

**索引**:
- `idx_imageinfo_url_root_created`: `(url_root, dt_created)`

---

### 4.3 WorkerTask - 任务队列表
**表名**: `rssant_api_workertask`

存储后台任务队列。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `key` | Char(255) | 唯一标识 | NOT NULL, UNIQUE |
| `priority` | Integer | 优先级 | NOT NULL, DEFAULT=0 |
| `api` | Char(255) | 任务API | NOT NULL |
| `data` | JSON | 任务数据（最大1MB） | NOT NULL |
| `dt_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `dt_expired` | DateTime | 过期时间 | NOT NULL |

**索引**:
- `idx_workertask_key`: `key`
- `idx_workertask_dt_expired`: `dt_expired`
- `idx_workertask_priority_created`: `(priority, dt_created)`

**优先级说明**:
- `FIND_FEED = 30`: 查找Feed
- `RETRY_FIND_FEED = 20`: 重试查找Feed
- `SYNC_FEED = 10`: 同步Feed
- `FETCH_STORY = 5`: 获取Story

---

### 4.4 Registery - 注册表
**表名**: `rssant_api_registery`

存储scheduler/worker的注册信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | Integer | 主键，自增 | PRIMARY KEY |
| `_version` | Integer | 乐观锁版本号 | NOT NULL |
| `_created` | DateTime | 创建时间 | NOT NULL, AUTO |
| `_updated` | DateTime | 更新时间 | NOT NULL, AUTO |
| `registery_node` | Char(200) | 注册节点名称 | NOT NULL, UNIQUE |
| `registery_node_spec` | JSON | 注册节点规格（JSON对象） | NOT NULL |
| `node_specs` | JSON | 节点规格列表（JSON对象） | NOT NULL |
| `dt_updated` | DateTime | 更新时间 | NOT NULL |

**索引**:
- `idx_registery_registery_node`: `registery_node`

---

## 5. 表关系图

```
User (auth_user)
  ├── UserFeed (1:N) - 用户的订阅
  │     └── Feed (N:1) - 订阅源
  │           ├── Story (1:N) - 故事
  │           │     └── UserStory (1:N) - 用户故事关联
  │           │           └── UserFeed (N:1)
  │           ├── RawFeed (1:N) - 原始数据
  │           └── FeedStoryStat (1:1) - 统计信息
  ├── UserStory (1:N) - 用户故事关联
  │     └── Story (N:1)
  ├── FeedCreation (1:N) - 订阅创建
  │     └── Feed (N:1)
  └── UserPublish (1:1) - 发布配置

FeedUrlMap - URL映射（独立表）
ImageInfo - 图片信息（独立表）
WorkerTask - 任务队列（独立表）
Registery - 注册表（独立表）
StoryInfo - 故事信息（新版本，独立表，通过编码ID关联Feed）
```

---

## 6. 重要设计说明

### 6.1 乐观锁机制
所有表都包含 `_version` 字段，用于实现乐观锁，避免并发更新冲突。

### 6.2 内容哈希
`Feed` 和 `Story` 表都包含 `content_hash_base64` 字段，用于检测内容是否发生变化。

### 6.3 分片存储
- `StoryInfo` 表用于新版本的故事存储，内容存储在PostgreSQL分片表中
- `FeedStoryStat` 表将Feed的大字段分离，优化查询性能

### 6.4 冻结机制
`Feed` 表包含 `freeze_level` 字段，用于控制Feed的更新频率：
- `1`: 正常更新
- `N`: 减慢N倍更新频率

### 6.5 保留策略
- `Feed.retention_offset`: 保留偏移量，小于此值的story可能被清理
- `Story.is_user_marked`: 标记用户收藏或已读的story不会被清理

### 6.6 状态流转
Feed状态流转：
1. `pending` → `updating` → `ready` (成功)
2. `pending` → `updating` → `error` (失败)
3. `discard` (合并到其他Feed后标记)

---

## 7. 索引优化

### 7.1 主要查询索引
- **Feed查询**: `url`, `reverse_url`
- **Story查询**: `(feed_id, offset)`, `(feed_id, unique_id)`
- **UserFeed查询**: `(user_id, feed_id)`
- **UserStory查询**: `(user_id, feed_id, offset)`, `(user_id, feed_id, story_id)`

### 7.2 时间索引
- `FeedUrlMap`: `(source, dt_created)` - 用于查找最新映射
- `ImageInfo`: `(url_root, dt_created)` - 用于查找最新检测结果
- `WorkerTask`: `(priority, dt_created)` - 用于任务队列排序

---

## 8. 数据清理策略

### 8.1 FeedUrlMap
- `NOT_FOUND` 记录保留3分钟
- 正常记录保留100年（实际通过定期清理）

### 8.2 ImageInfo
- 正状态码记录保留7天
- 负状态码记录保留12小时

### 8.3 WorkerTask
- 根据 `dt_expired` 自动清理过期任务

### 8.4 FeedCreation
- 根据状态和创建时间清理旧记录

### 8.5 Story清理
- 根据 `retention_offset` 清理旧story
- 保留用户标记的story（`is_user_marked=True`）

---

## 9. 特殊字段说明

### 9.1 StoryId编码
`StoryInfo.id` 使用 `StoryId.encode(feed_id, offset)` 将两个整数编码为一个BigInteger：
- 编码方式：`id = (feed_id << 32) | offset`
- 解码方式：`feed_id = id >> 32`, `offset = id & 0xFFFFFFFF`

### 9.2 压缩存储
- `RawFeed.content`: 大于1KB的内容使用gzip压缩
- `Feed.monthly_story_count_data`: 月度统计数据压缩存储
- `FeedStoryStat.unique_ids_data`: 唯一ID列表压缩存储

### 9.3 JSON字段
- `RawFeed.headers`: HTTP响应头（JSON对象）
- `WorkerTask.data`: 任务数据（JSON对象，最大1MB）
- `Registery.registery_node_spec`: 节点规格（JSON对象）
- `Registery.node_specs`: 节点规格列表（JSON对象）

---

## 10. 数据库版本

- **数据库**: PostgreSQL
- **ORM框架**: Django ORM
- **迁移系统**: Django Migrations
- **乐观锁**: django-optimistic-lock
- **密封模型**: django-seal

---

## 11. 注意事项

1. **外键级联**: 所有外键都使用 `CASCADE` 删除策略
2. **NULL字段**: 大部分字段允许NULL，使用 `optional` 字典统一管理
3. **时间字段**: 使用Django的 `timezone.now()` 确保时区正确
4. **唯一约束**: 多个字段组合唯一约束，避免重复数据
5. **索引优化**: 根据查询模式创建合适的索引
6. **数据迁移**: 新版本使用 `StoryInfo` 表，旧版本使用 `Story` 表，两者并存

---

**文档生成时间**: 2024年
**项目**: RSSant - RSS订阅服务
**数据库**: PostgreSQL


