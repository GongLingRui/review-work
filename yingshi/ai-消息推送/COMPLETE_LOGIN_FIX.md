# 登录问题完整解决方案

## ✅ 服务器状态（已验证正常）

- ✅ 前端服务器: 运行在 5173 端口
- ✅ 后端 API: Docker 容器运行在 6789 端口
- ✅ API Proxy: 正常工作
- ✅ API 测试: 返回正常响应

## 🔍 诊断步骤

### 步骤 1: 使用测试页面验证 API

我创建了一个测试页面，请访问：

**http://172.17.22.125:5173/test-api.html**

这个页面可以：
1. 测试后端直接连接
2. 测试 Proxy 连接
3. 测试登录功能

### 步骤 2: 在浏览器控制台直接测试

1. 访问: http://172.17.22.125:5173
2. 按 `F12` 打开开发者工具
3. 在 Console 中运行以下代码：

```javascript
// 测试登录
fetch('/api/v1/user/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    account: 'admin',
    password: 'admin'
  }),
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('✅ 登录响应:', data);
  if (data.token) {
    console.log('✅ 登录成功！Token:', data.token);
  } else {
    console.log('❌ 登录失败:', data.message);
  }
})
.catch(err => {
  console.error('❌ 请求失败:', err);
});
```

### 步骤 3: 检查控制台日志

打开 Console，应该看到：
```
API Base URL: /api/v1 Env: undefined
```

**如果看到 `Env: http://localhost:6788`**，说明：
1. 浏览器缓存了旧代码
2. 需要完全清除缓存

### 步骤 4: 完全清除浏览器缓存

**方法 1: 清除所有数据**
1. 按 `Ctrl+Shift+Delete`
2. 选择"所有时间"
3. 勾选所有选项
4. 清除数据

**方法 2: 使用无痕模式**
- `Ctrl+Shift+N` (Windows/Linux)
- `Cmd+Shift+N` (Mac)

**方法 3: 硬刷新**
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)
- 同时勾选开发者工具中的 "Disable cache"

### 步骤 5: 检查 Network 请求

1. 打开 Network 标签页
2. 勾选 "Disable cache"
3. 尝试登录
4. 查看 `user/login/` 请求：
   - **Request URL**: 应该是 `/api/v1/user/login/`
   - **不应该看到**: `http://localhost:6788` 或 `http://localhost:6789`
   - **Status Code**: 应该是 200（成功）或 401（密码错误）

## 🔧 如果仍然失败

### 方案 A: 重置 admin 密码

```bash
docker exec -it rssant python manage.py changepassword admin
```

然后使用新密码登录。

### 方案 B: 创建新用户

```bash
docker exec -it rssant python manage.py createsuperuser
```

### 方案 C: 检查浏览器控制台完整错误

请提供：
1. Console 标签页的**所有**错误信息
2. Network 标签页中 `user/login/` 请求的**完整**信息：
   - Headers (Request Headers 和 Response Headers)
   - Payload (请求体)
   - Preview/Response (响应内容)

## 📋 当前配置确认

- **前端地址**: http://172.17.22.125:5173
- **API Base URL**: `/api/v1` (相对路径)
- **Proxy 目标**: `http://localhost:6789`
- **环境变量**: `VITE_API_BASE_URL=` (空，使用相对路径)

## 🎯 快速测试命令

在浏览器控制台运行：

```javascript
// 1. 检查 API 配置
console.log('API Base URL:', '/api/v1');

// 2. 测试 API 连接
fetch('/api/v1/user/login/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({account: 'admin', password: 'admin'}),
  credentials: 'include'
}).then(r => r.json()).then(console.log).catch(console.error);
```

## 💡 重要提示

1. **必须清除浏览器缓存** - 这是最常见的问题
2. **使用无痕模式测试** - 可以排除缓存问题
3. **检查控制台日志** - 应该看到 `API Base URL: /api/v1`
4. **检查 Network 请求** - URL 应该是相对路径

请按照上述步骤操作，特别是**步骤 1 的测试页面**和**步骤 2 的控制台测试**，这样可以快速定位问题。

