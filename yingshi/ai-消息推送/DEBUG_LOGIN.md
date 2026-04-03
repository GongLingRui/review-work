# 登录问题调试指南

## 当前配置

- **前端地址**: http://172.17.22.125:5173
- **后端 API**: http://localhost:6789 (Docker 容器)
- **API Proxy**: 通过 Vite proxy 自动转发 `/api` 请求

## 调试步骤

### 1. 检查浏览器控制台

按 F12 打开开发者工具，查看：
- **Console 标签页**: 查看错误信息和日志
- **Network 标签页**: 查看实际的 API 请求

### 2. 检查 API 请求

在 Network 标签页中：
- 找到 `user/login/` 请求
- 查看请求 URL（应该是 `/api/v1/user/login/`，不是 `http://localhost:6788`）
- 查看请求状态码
- 查看响应内容

### 3. 清除浏览器缓存

1. 按 `Ctrl+Shift+Delete` (Windows/Linux) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存的图像和文件"
3. 清除缓存
4. 或者使用无痕模式测试

### 4. 检查服务器状态

```bash
# 检查前端服务器
ps aux | grep vite

# 检查 Docker 容器
docker ps | grep rssant

# 测试 API
curl -X POST http://localhost:6789/api/v1/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin"}'
```

### 5. 测试 Proxy

```bash
# 通过前端 proxy 测试
curl -X POST http://localhost:5173/api/v1/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin"}'
```

## 常见问题

### 问题 1: 仍然请求 localhost:6788

**原因**: 浏览器缓存了旧的 JavaScript 代码

**解决**:
1. 强制刷新: `Ctrl+Shift+R` 或 `Cmd+Shift+R`
2. 清除缓存后重试
3. 检查浏览器控制台的 Console，应该看到 `API Base URL: /api/v1`

### 问题 2: ERR_CONNECTION_REFUSED

**原因**: 后端服务未运行或 proxy 配置错误

**解决**:
1. 检查 Docker 容器: `docker ps | grep rssant`
2. 检查端口: `netstat -tuln | grep 6789`
3. 重启前端服务器

### 问题 3: 401 未授权

**原因**: 账号密码错误或账号不存在

**解决**:
- 使用正确的账号密码
- 默认账号可能是 `admin` / `admin`（需要确认）

### 问题 4: CORS 错误

**原因**: 跨域请求被阻止

**解决**:
- 应该通过 Vite proxy 避免 CORS 问题
- 如果仍有问题，检查 `vite.config.ts` 中的 proxy 配置

## 测试账号

请确认您的测试账号信息。如果是新安装的系统，可能需要：
1. 创建管理员账号
2. 或者使用默认账号（如果有）

## 查看日志

```bash
# Docker 容器日志
docker logs rssant --tail 50

# 前端服务器日志
# 查看运行 npm run dev 的终端输出
```

