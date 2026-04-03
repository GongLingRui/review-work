# RSSHub 集成方案

## 概述

RSSHub 是一个开源的 RSS 生成器，可以为各种不提供 RSS 的网站生成 RSS 订阅源。本文档说明如何将 RSSHub 功能集成到 rss-subscribe 项目中。

## RSSHub 简介

RSSHub 通过路由规则为不同网站生成 RSS 源，例如：
- `/telegram/channel/:username` - Telegram 频道
- `/twitter/user/:id` - Twitter 用户
- `/bilibili/user/video/:uid` - Bilibili 用户视频
- `/github/repos/:owner/:repo` - GitHub 仓库
- 等等...

更多路由规则请参考：https://docs.rsshub.app/

## 集成方案

### 1. 配置 RSSHub 实例

在配置文件中添加 RSSHub 相关配置：

```bash
# RSSHub 配置
RSSANT_RSSHUB_BASE_URL=https://rsshub.app  # RSSHub 实例地址（可使用公共实例或自部署实例）
RSSANT_RSSHUB_ENABLE=true  # 是否启用 RSSHub 功能
RSSANT_RSSHUB_TIMEOUT=30  # 请求超时时间（秒）
```

### 2. RSSHub 客户端服务

创建 `rssant_api/services/rsshub_client.py`，提供以下功能：
- 调用 RSSHub API 获取路由列表
- 检查 URL 是否支持 RSSHub 路由
- 生成 RSSHub 订阅源 URL
- 验证 RSSHub 生成的 RSS 源

### 3. Feed 导入增强

在现有的 Feed 导入功能中：
- 当用户输入网站 URL 时，自动检查是否支持 RSSHub
- 如果支持，提供使用 RSSHub 生成订阅源的选项
- 支持直接输入 RSSHub 路由格式的 URL

### 4. 前端集成

在订阅导入页面添加：
- RSSHub 路由发现功能
- RSSHub 支持的网站列表
- 快速生成 RSSHub 订阅源的界面

## 功能特性

### ✅ 自动路由发现
- 当用户输入网站 URL 时，自动检查是否有对应的 RSSHub 路由
- 提供一键生成 RSSHub 订阅源的功能

### ✅ 路由列表管理
- 维护常用网站的 RSSHub 路由规则
- 支持搜索和浏览所有可用的 RSSHub 路由

### ✅ 订阅源验证
- 在添加 RSSHub 生成的订阅源前，验证其有效性
- 自动测试订阅源是否可以正常访问

### ✅ 配置管理
- 支持配置自定义 RSSHub 实例
- 支持切换公共实例和自部署实例

## 技术实现

### 后端实现

1. **RSSHub 客户端服务** (`rssant_api/services/rsshub_client.py`)
   - 封装 RSSHub API 调用
   - 提供路由匹配和订阅源生成功能

2. **Feed 导入增强** (`rssant_api/views/feed.py`)
   - 集成 RSSHub 客户端
   - 在 Feed 查找时优先尝试 RSSHub

3. **API 端点**
   - `GET /api/v1/rsshub/routes` - 获取所有可用路由
   - `GET /api/v1/rsshub/routes/search?q=<关键词>` - 搜索路由
   - `POST /api/v1/rsshub/generate` - 生成 RSSHub 订阅源 URL
   - `GET /api/v1/rsshub/check?url=<URL>` - 检查 URL 是否支持 RSSHub

### 前端实现

1. **RSSHub 发现组件**
   - 在导入订阅时显示 RSSHub 选项
   - 提供路由搜索和选择界面

2. **订阅源生成向导**
   - 引导用户输入必要的参数
   - 自动生成 RSSHub 订阅源 URL

## 使用示例

### 示例 1: 订阅 Telegram 频道

用户输入 Telegram 频道链接，系统自动检测并生成 RSSHub 订阅源：

```
输入: https://t.me/channelname
生成: https://rsshub.app/telegram/channel/channelname
```

### 示例 2: 订阅 Twitter 用户

用户输入 Twitter 用户链接，系统自动生成 RSSHub 订阅源：

```
输入: https://twitter.com/username
生成: https://rsshub.app/twitter/user/username
```

### 示例 3: 直接使用 RSSHub 路由

用户可以直接输入 RSSHub 路由格式的 URL，系统会自动识别并添加：

```
输入: /telegram/channel/channelname
转换为: https://rsshub.app/telegram/channel/channelname
```

## 配置说明

### 公共实例

使用 RSSHub 官方公共实例（推荐用于测试）：
```bash
RSSANT_RSSHUB_BASE_URL=https://rsshub.app
RSSANT_RSSHUB_ENABLE=true
```

### 自部署实例

使用自部署的 RSSHub 实例（推荐用于生产环境）：
```bash
RSSANT_RSSHUB_BASE_URL=http://localhost:1200
RSSANT_RSSHUB_ENABLE=true
```

## 部署 RSSHub 实例

### 前置要求

在开始部署之前，请确保您的系统已安装以下软件：

1. **Docker** (版本 20.10 或更高)
   ```bash
   # 检查 Docker 版本
   docker --version
   ```

2. **Docker Compose** (版本 1.29 或更高，或 Docker Compose V2)
   ```bash
   # 检查 Docker Compose 版本
   docker-compose --version
   # 或
   docker compose version
   ```

### 快速部署（推荐）

项目已提供完整的部署脚本，您可以直接使用：

#### 1. 启动 RSSHub 服务

```bash
# 进入项目根目录
cd rss-subscribe

# 启动 RSSHub（会自动创建必要的目录和配置）
./scripts/start_rsshub.sh
```

启动成功后，您将看到：
- RSSHub 服务地址: `http://localhost:1200`
- Redis 服务地址: `localhost:6379`

#### 2. 检查服务状态

```bash
# 检查 RSSHub 服务健康状态
./scripts/check_rsshub.sh
```

#### 3. 停止服务

```bash
# 停止 RSSHub 服务
./scripts/stop_rsshub.sh
```

### 手动部署

如果您想手动部署或自定义配置，可以按照以下步骤：

#### 1. 创建 docker-compose 配置文件

项目已提供 `docker-compose.rsshub.yml` 配置文件，包含以下服务：

- **rsshub**: RSSHub 主服务
- **redis**: Redis 缓存服务（用于提高性能和缓存）

#### 2. 启动服务

```bash
# 使用 docker-compose 启动
docker-compose -f docker-compose.rsshub.yml up -d

# 或使用 Docker Compose V2
docker compose -f docker-compose.rsshub.yml up -d
```

#### 3. 验证部署

```bash
# 检查容器状态
docker-compose -f docker-compose.rsshub.yml ps

# 测试 RSSHub 是否正常工作
curl http://localhost:1200

# 查看日志
docker-compose -f docker-compose.rsshub.yml logs -f
```

### 配置说明

#### 基本配置

RSSHub 的基本配置通过环境变量设置，主要配置项包括：

- `NODE_ENV`: 运行环境（production/development）
- `CACHE_TYPE`: 缓存类型（redis/memory）
- `REDIS_URL`: Redis 连接地址
- `LOG_LEVEL`: 日志级别（info/debug/error）
- `REQUEST_TIMEOUT`: 请求超时时间（毫秒）
- `TZ`: 时区设置

#### 高级配置

如果需要更高级的配置，可以修改 `docker-compose.rsshub.yml` 文件：

**启用 Puppeteer（用于需要浏览器渲染的路由）**：
```yaml
environment:
  PUPPETEER_WS_ENDPOINT: "ws://puppeteer:3000"
```

**配置访问控制**：
```yaml
environment:
  ACCESS_KEY: "your-secret-key"
```

**配置图片代理**：
```yaml
environment:
  IMAGE_PROXY: "https://your-image-proxy.com"
```

**配置 CORS**：
```yaml
environment:
  CORS_ALLOW_ORIGIN: "https://your-domain.com"
```

更多配置选项请参考 [RSSHub 官方文档](https://docs.rsshub.app/zh/install/)。

### 数据持久化

RSSHub 的数据会持久化到以下目录：

- `./rsshub-data`: RSSHub 应用数据
- `./rsshub-redis-data`: Redis 数据

这些目录会在首次启动时自动创建。

### 网络配置

RSSHub 服务运行在独立的 Docker 网络中（`rsshub-network`），如果需要与其他服务通信，可以：

1. **连接到同一网络**：
   ```bash
   docker network connect rsshub-network your-container-name
   ```

2. **使用主机网络**（不推荐）：
   修改 `docker-compose.rsshub.yml`，将端口映射改为使用主机网络

### 与 rss-subscribe 集成

部署完成后，需要在 rss-subscribe 的配置文件中设置 RSSHub 地址：

编辑 `box/rssant.env` 文件，添加或修改以下配置：

```bash
# RSSHub 配置
RSSANT_RSSHUB_BASE_URL=http://localhost:1200  # 如果 RSSHub 在同一主机
# 或
RSSANT_RSSHUB_BASE_URL=http://your-server-ip:1200  # 如果 RSSHub 在远程主机
RSSANT_RSSHUB_ENABLE=true
RSSANT_RSSHUB_TIMEOUT=30
```

如果 rss-subscribe 也在 Docker 容器中运行，需要确保两个容器在同一网络中，或使用主机网络。

### 故障排查

#### 问题 1: RSSHub 无法启动

**检查步骤**：
1. 检查 Docker 是否正常运行：`docker ps`
2. 查看 RSSHub 日志：`docker-compose -f docker-compose.rsshub.yml logs rsshub`
3. 检查端口是否被占用：`netstat -tuln | grep 1200`

**解决方案**：
- 如果端口被占用，修改 `docker-compose.rsshub.yml` 中的端口映射
- 检查 Docker 日志中的错误信息

#### 问题 2: Redis 连接失败

**检查步骤**：
1. 检查 Redis 容器是否运行：`docker-compose -f docker-compose.rsshub.yml ps redis`
2. 测试 Redis 连接：`docker exec rsshub-redis redis-cli ping`

**解决方案**：
- 重启 Redis 容器：`docker-compose -f docker-compose.rsshub.yml restart redis`
- 检查 Redis 日志：`docker-compose -f docker-compose.rsshub.yml logs redis`

#### 问题 3: RSSHub 响应慢

**可能原因**：
- 缓存未生效
- 网络问题
- 资源不足

**解决方案**：
- 确保 Redis 正常运行
- 检查服务器资源使用情况
- 考虑增加 RSSHub 实例数量（需要负载均衡）

#### 问题 4: 某些路由无法使用

**可能原因**：
- 需要 Puppeteer 支持的路由未配置浏览器
- 需要 API Key 的路由未配置密钥

**解决方案**：
- 参考 RSSHub 文档配置相应的环境变量
- 检查路由是否需要特殊配置

### 性能优化

1. **启用 Redis 缓存**：已默认启用，可显著提高性能
2. **调整缓存时间**：根据需求调整 `HTTP_CACHE_TTL`
3. **使用 CDN**：如果 RSSHub 需要对外提供服务，建议使用 CDN
4. **负载均衡**：对于高并发场景，可以部署多个 RSSHub 实例

### 安全建议

1. **访问控制**：生产环境建议设置 `ACCESS_KEY`
2. **HTTPS**：使用反向代理（如 Nginx）配置 HTTPS
3. **防火墙**：限制 RSSHub 端口的访问来源
4. **定期更新**：定期更新 RSSHub 镜像以获取安全补丁

### 更新 RSSHub

```bash
# 停止服务
./scripts/stop_rsshub.sh

# 拉取最新镜像
docker-compose -f docker-compose.rsshub.yml pull

# 重新启动
./scripts/start_rsshub.sh
```

### 备份和恢复

**备份数据**：
```bash
# 备份 Redis 数据
docker exec rsshub-redis redis-cli SAVE
cp -r rsshub-redis-data rsshub-redis-data-backup

# 备份 RSSHub 数据
cp -r rsshub-data rsshub-data-backup
```

**恢复数据**：
```bash
# 停止服务
./scripts/stop_rsshub.sh

# 恢复数据
rm -rf rsshub-redis-data rsshub-data
cp -r rsshub-redis-data-backup rsshub-redis-data
cp -r rsshub-data-backup rsshub-data

# 重新启动
./scripts/start_rsshub.sh
```

## 注意事项

1. **速率限制**: RSSHub 公共实例有速率限制，建议自部署用于生产环境
2. **路由变更**: RSSHub 路由规则可能会更新，需要定期同步路由列表
3. **错误处理**: 当 RSSHub 实例不可用时，应该优雅降级，不影响正常订阅功能
4. **缓存策略**: RSSHub 生成的订阅源可以被正常缓存，与普通 RSS 源处理方式相同
5. **资源消耗**: RSSHub 需要一定的内存和 CPU 资源，建议至少 512MB 内存
6. **网络要求**: 某些路由可能需要访问外部 API，确保服务器网络畅通
7. **数据持久化**: 定期备份 Redis 数据，避免缓存丢失

## 未来优化

- [ ] 缓存 RSSHub 路由列表，减少 API 调用
- [ ] 支持自定义 RSSHub 路由规则
- [ ] 集成更多 RSSHub 高级功能（如参数配置）
- [ ] 提供 RSSHub 路由规则管理界面
- [ ] 支持批量检测 URL 是否支持 RSSHub

## 相关链接

- RSSHub 官方文档: https://docs.rsshub.app/
- RSSHub GitHub: https://github.com/DIYgod/RSSHub
- RSSHub 路由列表: https://docs.rsshub.app/routes/

