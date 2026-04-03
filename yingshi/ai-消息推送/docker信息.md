$ chmod +x /root/gongfan/rrs-aigc/show-container-info.sh && bash /root/gongfan/rrs-aigc/show-container-info.sh
==========================================
Docker 容器服务信息
==========================================

1. 所有运行的容器:
----------------------------------------
NAMES                     IMAGE                                     STATUS          PORTS
rssant                    rssant:custom                             Up 11 minutes   5432/tcp, 6786/tcp, 6788/tcp, 6790/tcp, 6793/tcp, 9001/tcp, 0.0.0.0:6789->80/tcp, [::]:6789->80/tcp
batchshort-frontend       batchshort-frontend-batchshort-frontend   Up 29 hours     0.0.0.0:80->80/tcp, [::]:80->80/tcp
rssant-postgres           postgres:11.7                             Up 6 days       127.0.0.1:5432->5432/tcp
monitor-center-frontend   monitor-center-monitor-center-frontend    Up 13 days      0.0.0.0:8080->8080/tcp, [::]:8080->8080/tcp, 0.0.0.0:9090->9090/tcp, [::]:9090->9090/tcp, 80/tcp, 0.0.0.0:12315->12315/tcp, [::]:12315->12315/tcp

2. RSSant 生产环境容器详细信息:
----------------------------------------
容器名称: rssant
rssant-postgres
容器ID: a67af464fa8d
b0254f34b82b
镜像: rssant:custom
创建时间: 2025-11-20T13:40:22.025669753Z
运行状态: running
运行时长: 2025-11-20T13:40:22.070894402Z

端口映射:
  80/tcp -> 0.0.0.0:6789
  80/tcp -> [::]:6789

关键环境变量:
  RSSANT_DEBUG=0
  RSSANT_SECRET_KEY=SECRET
  RSSANT_ROOT_URL=http://8.217.15.229:6789
  RSSANT_CHECK_FEED_MINUTES=30
  RSSANT_GITHUB_CLIENT_ID=
  RSSANT_GITHUB_SECRET=
  RSSANT_ADMIN_EMAIL=
  RSSANT_SMTP_ENABLE=false
  RSSANT_SMTP_HOST=smtp.qq.com
  RSSANT_SMTP_PORT=465

Supervisor 管理的服务:
api                              RUNNING   pid 8, uptime 0:11:42
asyncapi                         RUNNING   pid 9, uptime 0:11:42
initdb                           EXITED    Nov 20 01:40 PM
nginx                            RUNNING   pid 12, uptime 0:11:42
postgres                         RUNNING   pid 13, uptime 0:11:42
scheduler                        RUNNING   pid 15, uptime 0:11:42
worker                           RUNNING   pid 17, uptime 0:11:42
  ⚠️  无法获取 supervisor 状态

容器内主要进程:
  UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
  root                759706              759681              0                   21:40               pts/0               00:00:00            /app/.venv/bin/python /app/.venv/bin/supervisord -c /etc/supervisord.conf
  root                759789              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-api.sh
  root                759790              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-asyncapi.sh
  root                759793              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-nginx.sh
  root                759794              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-postgres.sh
  root                759795              759789              0                   21:40               pts/0               00:00:00            /app/.venv/bin/python /app/.venv/bin/gunicorn -b 0.0.0.0:6788 --workers=1 --threads=50 --forwarded-allow-ips=* --reuse-port --timeout=300 --keep-alive=7200 --access-logfile=- --error-logfile=- --log-level=info rssant.wsgi
  root                759796              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-scheduler.sh
  root                759798              759706              0                   21:40               pts/0               00:00:00            /bin/bash /app/box/bin/start-worker.sh
  root                759800              759790              0                   21:40               pts/0               00:00:00            python /app/runserver.py

资源使用情况:
  CPU: 0.15%
  内存: 414.6MiB / 7.013GiB (5.8%)
  网络: 3.33MB / 1.31MB

==========================================
服务位置说明:
----------------------------------------
✅ 生产环境服务全部运行在 'rssant' 容器中

容器内包含以下服务:
  - Nginx (Web服务器 + 前端静态文件)
  - PostgreSQL (数据库)
  - Django API (Gunicorn)
  - AsyncAPI (异步API服务)
  - Scheduler (任务调度)

所有服务通过 Supervisor 统一管理
==========================================
$ 
