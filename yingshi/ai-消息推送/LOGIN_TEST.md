# 登录测试指南

## 测试账号信息

根据系统检查，存在以下用户：
- **用户名**: `admin`
- **邮箱**: `admin@localhost.com`
- **密码**: 需要确认（可能是 `admin` 或您设置的密码）

## 登录步骤

1. **清除浏览器缓存**
   - 按 `Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac) 强制刷新
   - 或者使用无痕模式

2. **打开浏览器控制台**
   - 按 `F12` 打开开发者工具
   - 查看 Console 标签页，应该看到：`API Base URL: /api/v1 Env: undefined`

3. **尝试登录**
   - 访问: http://172.17.22.125:5173
   - 输入账号: `admin`
   - 输入密码: `admin`（或您设置的密码）

4. **查看 Network 请求**
   - 在 Network 标签页中查看 `user/login/` 请求
   - 请求 URL 应该是: `/api/v1/user/login/`（相对路径）
   - 不应该看到 `http://localhost:6788`

## 如果仍然失败

### 检查 1: 查看浏览器控制台

打开 Console，应该看到：
```
API Base URL: /api/v1 Env: undefined
```

如果看到 `Env: http://localhost:6788`，说明环境变量没有正确清除。

### 检查 2: 查看 Network 请求

在 Network 标签页：
- 请求 URL 应该是 `/api/v1/user/login/`
- 如果看到 `http://localhost:6788/api/v1/user/login/`，说明代码没有更新

### 检查 3: 手动测试 API

```bash
# 测试直接访问后端
curl -X POST http://localhost:6789/api/v1/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin"}'

# 测试通过 proxy
curl -X POST http://localhost:5173/api/v1/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin"}'
```

### 检查 4: 重置密码（如果需要）

如果忘记密码，可以在 Docker 容器中重置：

```bash
docker exec -it rssant python manage.py changepassword admin
```

## 当前配置状态

✅ 前端服务器: 运行在 5173 端口
✅ 后端 API: Docker 容器运行在 6789 端口
✅ API Proxy: 已配置，自动转发 `/api` 请求
✅ 环境变量: `VITE_API_BASE_URL` 已清空（使用相对路径）

## 调试信息

我已经在代码中添加了调试日志。打开浏览器控制台（F12），应该能看到：
- API Base URL 配置
- 环境变量值
- API 错误详情

请按照上述步骤操作，如果还有问题，请提供浏览器控制台的具体错误信息。

