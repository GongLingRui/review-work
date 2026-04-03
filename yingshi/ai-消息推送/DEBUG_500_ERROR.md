# 登录 500 错误调试指南

## 问题描述

登录时出现 500 Internal Server Error，这通常是后端服务器内部错误。

## 常见原因和解决方案

### 1. Token 表未创建（最常见）

**问题**: `rest_framework.authtoken` 的 Token 表可能没有创建。

**解决方案**:

```bash
# 进入 Docker 容器
docker exec -it rssant bash

# 运行数据库迁移
python manage.py migrate

# 或者只迁移 authtoken
python manage.py migrate authtoken
```

### 2. 数据库连接问题

**检查数据库连接**:

```bash
# 进入容器
docker exec -it rssant bash

# 测试数据库连接
python manage.py dbshell

# 如果连接失败，检查数据库配置
```

### 3. 查看后端日志

**查看 Docker 容器日志**:

```bash
# 查看实时日志
docker logs -f rssant

# 查看最近100行日志
docker logs --tail 100 rssant
```

**在日志中查找错误信息**:
- 查找 `Error creating token`
- 查找 `Error encoding user id`
- 查找 `Error serializing user`
- 查找完整的堆栈跟踪

### 4. 检查用户是否存在

```bash
# 进入容器
docker exec -it rssant bash

# 进入 Django shell
python manage.py shell

# 检查用户
from django.contrib.auth.models import User
users = User.objects.all()
for u in users:
    print(f"Username: {u.username}, Email: {u.email}, Active: {u.is_active}")
```

### 5. 手动测试登录 API

**使用 curl 测试**:

```bash
curl -X POST http://localhost:6789/api/v1/user/login/ \
  -H "Content-Type: application/json" \
  -d '{"account": "admin", "password": "admin"}'
```

**使用 Python 测试**:

```python
import requests

response = requests.post(
    'http://localhost:6789/api/v1/user/login/',
    json={'account': 'admin', 'password': 'admin'}
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

### 6. 检查依赖项

确保所有必要的 Python 包都已安装：

```bash
docker exec -it rssant pip list | grep -E "django|rest|allauth"
```

### 7. 重新启动服务

如果以上都不行，尝试重启 Docker 容器：

```bash
# 停止容器
docker stop rssant

# 启动容器
docker start rssant

# 或者使用 docker-compose
cd /path/to/rss-subscribe
docker-compose restart
```

## 快速修复步骤

1. **运行数据库迁移**:
   ```bash
   docker exec -it rssant python manage.py migrate
   ```

2. **检查日志**:
   ```bash
   docker logs --tail 50 rssant
   ```

3. **测试 API**:
   ```bash
   curl -X POST http://localhost:6789/api/v1/user/login/ \
     -H "Content-Type: application/json" \
     -d '{"account": "admin", "password": "admin"}'
   ```

4. **如果还是失败，查看完整错误堆栈**:
   - 查看 Docker 日志中的完整堆栈跟踪
   - 检查是否有数据库连接错误
   - 检查是否有配置错误

## 错误日志位置

- **Docker 日志**: `docker logs rssant`
- **Django 日志**: 通常在容器内的 `/var/log/` 或配置的日志目录
- **系统日志**: `journalctl -u docker` (如果使用 systemd)

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. Docker 日志的完整输出
2. 数据库迁移的输出
3. API 测试的响应
4. 错误发生的具体时间

