# RSS订阅服务启动指南

## 快速开始

### 一键启动所有服务

```bash
cd /root/gongfan/rss-subscribe
bash start-all-services.sh start
```

### 启动包括 AsyncAPI 服务

```bash
bash start-all-services.sh start with-asyncapi
```

## 服务说明

系统需要运行以下核心服务：

1. **API 服务** (端口 6788)
   - 处理前端 HTTP 请求
   - 创建订阅、管理订阅等

2. **Worker 服务** (端口 6793)
   - 执行实际任务（抓取订阅源、解析内容等）

3. **Scheduler 服务** (端口 6790) ⚠️ **关键服务**
   - 从任务队列获取任务
   - 分发给 Worker 执行
   - **没有此服务，导入的订阅会一直处于"处理中"状态**

4. **AsyncAPI 服务** (可选)
   - 异步 API 服务

## 常用命令

### 查看服务状态

```bash
bash start-all-services.sh status
```

### 查看服务日志

```bash
# 查看 scheduler 日志
bash start-all-services.sh logs scheduler

# 查看 worker 日志
bash start-all-services.sh logs worker

# 查看 api 日志
bash start-all-services.sh logs api
```

**提示**: 在 screen 中按 `Ctrl+A` 然后按 `D` 退出日志查看

### 重启服务

```bash
# 重启 scheduler 服务
bash start-all-services.sh restart scheduler

# 重启 worker 服务
bash start-all-services.sh restart worker
```

### 停止服务

```bash
# 停止所有服务
bash start-all-services.sh stop

# 停止指定服务
bash start-all-services.sh stop scheduler
```

## 手动启动单个服务

如果需要手动启动单个服务：

### 启动 API 服务

```bash
cd /root/gongfan/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
bash rundev-api.sh
```

### 启动 Worker 服务

```bash
cd /root/gongfan/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
bash rundev-worker.sh
```

### 启动 Scheduler 服务

```bash
cd /root/gongfan/rss-subscribe
source $(conda info --base)/etc/profile.d/conda.sh
conda activate rssant
bash rundev-scheduler.sh
```

## 使用 Screen 管理服务

所有服务都在 screen 会话中运行，可以：

### 查看所有会话

```bash
screen -ls
```

### 连接到会话

```bash
# 连接到 scheduler 会话
screen -r rssant-scheduler

# 连接到 worker 会话
screen -r rssant-worker
```

### 退出 screen（服务继续运行）

在 screen 中按 `Ctrl+A` 然后按 `D`

### 强制断开 screen

如果 screen 会话被锁定，使用：

```bash
screen -D -r rssant-scheduler
```

## 检查服务是否运行

### 检查进程

```bash
ps aux | grep -E "runserver|run-scheduler|run-asyncapi" | grep -v grep
```

### 检查端口

```bash
# 检查所有服务端口
netstat -tuln | grep -E "6788|6790|6793"
```

### 检查 screen 会话

```bash
screen -ls | grep rssant
```

## 故障排查

### 问题：导入订阅后一直显示"处理中"

**原因**: Scheduler 服务未运行

**解决**:
```bash
# 检查 scheduler 是否运行
bash start-all-services.sh status

# 如果未运行，启动它
bash start-all-services.sh start
# 或单独启动
bash start-all-services.sh restart scheduler
```

### 问题：服务启动失败

1. 检查 conda 环境是否正确激活
2. 检查端口是否被占用
3. 查看服务日志：`bash start-all-services.sh logs <service>`

### 问题：无法连接到 screen 会话

```bash
# 强制断开并重新连接
screen -D -r rssant-scheduler
```

## 服务依赖关系

```
前端请求
    ↓
API 服务 (创建任务到数据库队列)
    ↓
Scheduler 服务 (从队列获取任务)
    ↓
Worker 服务 (执行任务)
    ↓
更新数据库 (任务完成)
    ↓
前端显示订阅
```

**重要**: 如果 Scheduler 服务未运行，任务会一直停留在队列中，不会被处理。

## 完整启动流程

1. 确保 conda 环境已激活
2. 启动所有服务：`bash start-all-services.sh start`
3. 检查服务状态：`bash start-all-services.sh status`
4. 查看日志确认服务正常：`bash start-all-services.sh logs scheduler`

## 帮助信息

查看所有可用命令：

```bash
bash start-all-services.sh help
```

