# 快速启动指南

## 当前状态

✅ 开发服务器正在运行
✅ 端口 5173 已开放
✅ 服务器可正常访问

## 访问地址

### 如果在本机访问：
```
http://localhost:5173
```

### 如果从其他机器访问：
```
http://172.17.22.125:5173
```

## 启动/重启服务器

如果服务器未运行，使用以下命令启动：

```bash
cd /root/gongfan/rssant/frontend
./start-dev.sh
```

或者：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18
cd /root/gongfan/rssant/frontend
npm run dev
```

## 检查服务器状态

```bash
# 检查进程
ps aux | grep vite | grep -v grep

# 检查端口
lsof -i :5173

# 测试连接
curl http://localhost:5173
```

## 如果仍然无法访问

1. **确认服务器正在运行**
   ```bash
   ps aux | grep vite
   ```

2. **检查防火墙**
   ```bash
   sudo ufw status
   sudo iptables -L -n | grep 5173
   ```

3. **尝试使用 IP 地址而不是 localhost**
   - 如果从远程访问，使用：`http://172.17.22.125:5173`

4. **清除浏览器缓存**
   - 按 Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac) 强制刷新

5. **检查浏览器控制台**
   - 按 F12 打开开发者工具，查看 Console 标签页的错误信息

6. **查看服务器日志**
   - 查看运行 `npm run dev` 的终端输出，确认没有错误

## 环境配置

确保 `.env` 文件存在并配置正确：

```env
VITE_API_BASE_URL=http://localhost:6788
VITE_APP_TITLE=华策 AIGC 技术商业洞察站
```

## 后端 API

确保后端 API 服务正在运行：
```bash
# 检查后端是否运行在 6788 端口
curl http://localhost:6788/api/v1/
```

如果后端未运行，需要先启动后端服务。

