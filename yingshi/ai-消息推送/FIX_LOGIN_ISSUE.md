# 登录问题完整解决方案

## 当前状态

✅ 前端服务器: 运行在 5173 端口
✅ 后端 API: Docker 容器运行在 6789 端口  
✅ API Proxy: 已配置，自动转发 `/api` 请求

## 完整解决步骤

### 步骤 1: 清除浏览器所有缓存

**重要**: 必须完全清除缓存，否则会使用旧的 JavaScript 代码

1. 按 `Ctrl+Shift+Delete` (Windows/Linux) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"所有时间"
3. 勾选所有选项（特别是"缓存的图像和文件"）
4. 点击"清除数据"

或者使用无痕模式：
- `Ctrl+Shift+N` (Windows/Linux) 或 `Cmd+Shift+N` (Mac)

### 步骤 2: 访问正确的地址

**访问地址**: http://172.17.22.125:5173

**注意**: 如果看到端口 5174，说明 5173 被占用，请告诉我，我会修复。

### 步骤 3: 打开浏览器控制台验证

1. 按 `F12` 打开开发者工具
2. 切换到 **Console** 标签页
3. 刷新页面（`Ctrl+R` 或 `Cmd+R`）
4. 应该看到：`API Base URL: /api/v1 Env: undefined`

**如果看到 `Env: http://localhost:6788`**，说明缓存没有清除干净，请重复步骤 1。

### 步骤 4: 检查 Network 请求

1. 切换到 **Network** 标签页
2. 勾选 "Disable cache"（禁用缓存）
3. 尝试登录
4. 找到 `user/login/` 请求
5. 检查：
   - **请求 URL**: 应该是 `/api/v1/user/login/`（相对路径）
   - **不应该看到**: `http://localhost:6788` 或 `http://localhost:6789`

### 步骤 5: 使用测试账号登录

- **用户名**: `admin`
- **密码**: `admin`（或您设置的密码）

如果密码不对，重置密码：
```bash
docker exec -it rssant python manage.py changepassword admin
```

## 验证 API 连接

在浏览器控制台（Console）中运行：

```javascript
// 测试 API 连接
fetch('/api/v1/user/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({account: 'admin', password: 'admin'}),
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('API 响应:', data))
.catch(err => console.error('API 错误:', err))
```

如果看到用户信息，说明 API 连接正常。

## 常见问题排查

### 问题 1: 仍然请求 localhost:6788

**原因**: 浏览器缓存了旧的代码

**解决**:
1. 完全清除浏览器缓存（步骤 1）
2. 使用无痕模式测试
3. 检查控制台是否显示正确的 API Base URL

### 问题 2: ERR_CONNECTION_TIMED_OUT

**原因**: 前端服务器未运行或端口不对

**解决**:
```bash
# 检查服务器状态
ps aux | grep vite
netstat -tuln | grep 5173

# 如果未运行，启动服务器
cd /root/gongfan/rssant/frontend
./start-dev.sh
```

### 问题 3: 401 未授权

**原因**: 账号密码错误

**解决**:
- 确认账号密码正确
- 或重置密码（见步骤 5）

### 问题 4: CORS 错误

**原因**: 不应该出现，因为使用了 proxy

**解决**:
- 确认请求使用的是相对路径 `/api/v1/...`
- 不应该使用绝对路径

## 调试信息

打开浏览器控制台，应该看到：
```
API Base URL: /api/v1 Env: undefined
```

如果看到不同的值，说明配置有问题。

## 如果所有步骤都失败

请提供以下信息：

1. **浏览器控制台（Console）的完整输出**
2. **Network 标签页中 `user/login/` 请求的详细信息**:
   - Request URL
   - Request Method
   - Status Code
   - Response
3. **是否看到 `API Base URL: /api/v1` 的日志**

这样我可以更准确地定位问题。

