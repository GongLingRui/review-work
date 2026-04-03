# API 配置说明

## 问题

前端无法连接到后端 API，出现 `ERR_CONNECTION_REFUSED` 错误。

## 原因

1. **后端 API 服务器未运行** - 需要启动后端服务
2. **API 地址配置错误** - 浏览器中访问 `localhost:6788` 会尝试访问用户本地机器，而不是服务器

## 解决方案

### 1. 启动后端 API 服务器

后端应该运行在 `6788` 端口：

```bash
cd /root/gongfan/rssant
bash rundev-api.sh
```

或者：

```bash
cd /root/gongfan/rssant
python manage.py runserver 0.0.0.0:6788
```

### 2. 前端配置

前端已配置为使用相对路径，通过 Vite proxy 转发：

- **前端请求**: `http://172.17.22.125:5173/api/v1/...`
- **Vite Proxy 转发到**: `http://localhost:6788/api/v1/...`

这样浏览器只需要访问前端服务器，所有 `/api` 请求会自动转发到后端。

### 3. 验证后端是否运行

```bash
# 检查端口
lsof -i :6788

# 测试 API
curl http://localhost:6788/api/v1/
```

### 4. 如果后端运行在不同端口

如果后端运行在其他端口（如 8000），需要修改 `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000', // 修改为实际端口
    changeOrigin: true,
    secure: false,
    ws: true,
  },
}
```

然后重启前端服务器。

## 当前配置

- **前端地址**: http://172.17.22.125:5173
- **后端地址**: http://localhost:6788 (通过 proxy)
- **API 路径**: `/api/v1/...`

## 故障排除

1. **检查后端是否运行**
   ```bash
   ps aux | grep "runserver\|manage.py" | grep -v grep
   ```

2. **检查端口是否监听**
   ```bash
   netstat -tuln | grep 6788
   ```

3. **测试后端 API**
   ```bash
   curl http://localhost:6788/api/v1/
   ```

4. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Network 标签页，检查 API 请求的状态

5. **检查 Vite proxy 日志**
   - 查看运行 `npm run dev` 的终端输出
   - 查看是否有 proxy 错误信息

