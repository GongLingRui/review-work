# 前端服务启动指南

## 问题诊断

如果遇到 `ERR_CONNECTION_REFUSED` 错误，通常是前端开发服务器未启动。

## 快速启动

### 方法 1: 使用启动脚本（推荐）

```bash
cd /root/gongfan/rss-subscribe/frontend
./check-and-start.sh
```

或：

```bash
cd /root/gongfan/rss-subscribe/frontend
bash check-and-start.sh
```

### 方法 2: 手动启动

```bash
cd /root/gongfan/rss-subscribe/frontend
npm run dev
```

## 检查服务状态

### 检查端口是否监听

```bash
# 检查 5173 端口
netstat -tlnp | grep 5173
# 或
ss -tlnp | grep 5173
# 或
lsof -i :5173
```

### 检查进程是否运行

```bash
ps aux | grep vite | grep -v grep
```

### 测试访问

```bash
# 本地测试
curl http://localhost:5173

# 远程测试
curl http://192.168.191.85:5173
```

## 访问地址

启动成功后，可以通过以下地址访问：

- **本地访问**: http://localhost:5173
- **远程访问**: http://192.168.191.85:5173

## 配置说明

前端服务配置在 `frontend/vite.config.ts` 中：

- **端口**: 5173
- **主机**: 0.0.0.0 (监听所有网络接口)
- **后端代理**: http://192.168.191.85:6788/api

## 常见问题

### 1. 端口被占用

如果 5173 端口已被占用，可以：

1. 找到占用端口的进程并停止它
2. 修改 `vite.config.ts` 中的端口号

```bash
# 查找占用端口的进程
lsof -i :5173
# 或
netstat -tlnp | grep 5173

# 停止进程（替换 PID 为实际进程ID）
kill <PID>
```

### 2. 依赖未安装

```bash
cd /root/gongfan/rss-subscribe/frontend
npm install
```

### 3. Node.js 未安装或版本不对

```bash
# 检查 Node.js 版本
node --version

# 需要 Node.js 16+ 版本
# 如果未安装，请先安装 Node.js
```

### 4. 后端服务未启动

确保后端服务正在运行：

```bash
# 检查后端服务（端口 6788）
netstat -tlnp | grep 6788
# 或
ps aux | grep "manage.py runserver" | grep -v grep
```

如果后端未运行，需要先启动后端服务。

## 后台运行

如果需要让前端服务在后台运行：

```bash
cd /root/gongfan/rss-subscribe/frontend
nohup npm run dev > vite.log 2>&1 &
```

查看日志：

```bash
tail -f /root/gongfan/rss-subscribe/frontend/vite.log
```

停止后台服务：

```bash
# 查找进程ID
ps aux | grep vite | grep -v grep

# 停止进程
kill <PID>
```

## 开发环境要求

- Node.js 16+ (推荐 18.x)
- npm 或 yarn
- 已安装项目依赖 (`npm install`)

## 启动顺序

正确的启动顺序：

1. **启动数据库** (如果需要)
2. **启动后端服务** (端口 6788)
   ```bash
   cd /root/gongfan/rss-subscribe
   python manage.py runserver 0.0.0.0:6788
   ```

3. **启动前端服务** (端口 5173)
   ```bash
   cd /root/gongfan/rss-subscribe/frontend
   npm run dev
   ```

## 验证服务正常运行

访问以下地址应该看到前端界面：

- http://192.168.191.85:5173

如果看到登录页面或应用界面，说明服务正常运行。

