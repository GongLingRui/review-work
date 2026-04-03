# RSSHub 自部署快速指南

本文档提供 RSSHub 自部署的快速参考指南。

## 快速开始

### 一键启动

```bash
# 进入项目根目录
cd rss-subscribe

# 启动 RSSHub
./scripts/start_rsshub.sh
```

### 检查状态

```bash
./scripts/check_rsshub.sh
```

### 停止服务

```bash
./scripts/stop_rsshub.sh
```

## 配置 rss-subscribe

编辑 `box/rssant.env` 文件，取消注释并配置 RSSHub：

```bash
# 使用自部署的 RSSHub
RSSANT_RSSHUB_BASE_URL=http://localhost:1200
RSSANT_RSSHUB_ENABLE=true
RSSANT_RSSHUB_TIMEOUT=30
```

然后重启 rss-subscribe 服务。

## 验证部署

1. **测试 RSSHub 是否运行**：
   ```bash
   curl http://localhost:1200
   ```

2. **测试生成 RSS 源**：
   ```bash
   # 示例：生成 Telegram 频道的 RSS
   curl http://localhost:1200/telegram/channel/example
   ```

3. **在 rss-subscribe 中添加订阅**：
   - 访问 rss-subscribe 前端
   - 添加订阅时，输入 RSSHub 路由格式的 URL
   - 例如：`/telegram/channel/your-channel`

## 常见问题

### 端口被占用

如果 1200 端口被占用，修改 `docker-compose.rsshub.yml`：

```yaml
ports:
  - "1201:1200"  # 改为其他端口
```

然后更新 `box/rssant.env` 中的 `RSSANT_RSSHUB_BASE_URL`。

### 容器无法启动

查看详细日志：

```bash
docker-compose -f docker-compose.rsshub.yml logs
```

### Redis 连接失败

检查 Redis 容器：

```bash
docker-compose -f docker-compose.rsshub.yml ps redis
docker-compose -f docker-compose.rsshub.yml logs redis
```

## 更多信息

详细部署说明请参考：[RSSHUB_INTEGRATION.md](./RSSHUB_INTEGRATION.md)

