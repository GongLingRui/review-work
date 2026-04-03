## 阶段0：现状审计（CPU 环境可执行范围）

### 1. 系统与目录概览
- `backend_server`：FastAPI 单体，暴露业务 API，入口 `api_main.py`，端口 `8006`。子目录 `api/`（路由）、`service/`（业务逻辑）、`db/`（SQLAlchemy ORM）、`schema/`（Pydantic 模型）、`ossutils.py`（OSS 客户端）。
- `worker`：负责 `generate_all` 主流水线与 OSS 上传，入口 `worker_main.py`。依赖 `pipe_line.py`（编排）、`clients/`（AI/TTS 客户端）、`utils/`（字幕/上传工具）。
- `ai_image_gen`：Kafka 异步绘图服务，`api_service/main.py` 提交任务，`consumer_worker/` 拉取与推理。
- `flux_server`：本地直接绘图推理，`main.py` 暴露 HTTP 接口供 `backend_server` 与 `worker` 同步调用。
- `azure_tts_server`、`tts_seedvc_server`：分别封装 Azure/Edge/SeedVC 语音服务，`worker` 通过 `clients/azure_tts_client.py` 与 `clients/tts_seedvc_client.py` 调用。
- `new_batch_short`：用户新建目录（当前未使用，保持不变）。
- 文档：`重构文档.md`（业务约束）、`backend_server/doc/*.md`（接口细节）、`worker/README.md`。

### 2. 运行与依赖
- Conda 作为顶层环境管理，Python 版本 >=3.10；各子服务当前通过 `requirements.txt`/`pip install -r` 方式散落，需统一为 `pyproject.toml` 或 `uv` 但在阶段1执行。
- 公共依赖族：
  - Web 框架：FastAPI、Uvicorn。
  - ORM/DB：SQLAlchemy、mysqlclient（或 pymysql）、Alembic（尚未落地）。
  - 序列化：Pydantic v1。
  - 工具：requests, loguru/logging, python-dotenv。
  - 多媒体：moviepy/ffmpeg-python、PIL、opencv-python、pydub。
  - AI/TTS：transformers/diffusers（ai_image_gen）、edge-tts/azure sdk、自研模型依赖（`tts_seedvc_server/modules/*`）。
- 外部基础设施：
  - 数据库：MySQL（`DATABASE_URL`）。
  - 对象存储：阿里云 OSS（`OSS_*`）。
  - 消息队列：Kafka（ai_image_gen）。
  - 其他 HTTP 服务：`http://192.168.191.56:8308/human/generate`（数字人）、`BILLS_SERVICE_URL`（计费，默认关闭）。

### 3. 核心业务流程（CPU 可审计内容）
1. **后端 API 层**：`backend_server/api/*` 接收请求 → 调用 `service/*` 操作数据库 → 返回 Pydantic schema。JWT 鉴权由 `api/utils.py` 完成。
2. **任务创建**：`POST /jobs` 写入 Job，默认状态 `待处理`，内容与账号/语种/音色关联。
3. **Worker 拉取任务**：`worker/worker_main.py` 轮询数据库（或接口）获取 `待处理` Job，置为 `处理中`。
4. **generate_all 流水线**：
   - 文案切分与字幕生成。
   - 依据 `language.platform` 选择 Azure 或 Edge TTS。
   - 按 `topic.extra` 生成分镜描述，调度 `ai_image_gen` 或 `flux_server` 生成图片。
   - 生成每镜视频并按 `account.extra` 控制转场。
   - 依据标题包含“数字人”触发数字人拼接。
   - 合成字幕/Logo 视频，必要时执行横转竖。
   - 上传 OSS，构造 `job_result_key`。
5. **后端回传**：前端在 Job 详情与描述接口中消费 `job_result_key` 与签名链接，用户下载产物。

### 4. 数据与契约
- **数据库模型**：`backend_server/db/models.py` 定义 `User/Account/Language/Voice/Topic/Job` 等；字段语义详见 `重构文档.md`。
- **配置**：`backend_server/config.py` 与 `worker/config.py` 均通过 `pydantic-settings` 读取 `.env`，键包含 DB/OSS/路径/JWT。
- **OSS Key 约定**：`worker/worker_main.py` 中 `videos/{job.id}/logoed_xxx` 等命名需保持，后端按该结构签名。
- **Job.extra / Account.extra**：控制字幕、转场、数字人模式、横转竖等行为，禁止改变语义。

### 5. 依赖与外部服务清单
- Kafka topic 与 ai_image_gen 的消费/生产脚本位于 `ai_image_gen/consumer_worker/`。
- `flux_server` 依赖本地模型权重（LoRA 配置在 `config/config.yaml`）。
- `azure_tts_server` 使用外部 Azure 网关；`tts_seedvc_server` 包含大体量自研模型代码，对 CPU 环境仅能做接口 mock。
- 数字人接口、BILLS 统计目前为硬编码 URL，后续需配置化但默认行为保持。

### 6. CPU / GPU / TTS 测试矩阵
| 模块 | CPU 环境可测试 | 需 GPU/TTS 资源 | 备注 |
| --- | --- | --- | --- |
| `backend_server` API/DB | ✅ | ❌ | 通过 SQLite 或 MySQL 容器即可 |
| `worker` 文案/字幕/视频管线（无真实推理） | ✅（mock TTS/图像/数字人） | ❌ | 使用占位音视频或轻量示例 |
| `worker` 调用真实 Azure/Edge/数字人 | ⚠️（视网络权限） | ❌ | 可替换为 stub |
| `ai_image_gen` Kafka 任务流 | ✅（mock 模型） | ⚠️（大模型推理需 GPU） | CPU 环境可跑瘦身模型或跳过推理 |
| `flux_server` 推理 | ⚠️（小图/低参数） | ✅（正式模型） | CPU 版仅验证 API 行为 |
| `azure_tts_server` | ⚠️（依赖真实 Azure） | ✅ | 可通过 mock 录音文件 |
| `tts_seedvc_server` | ❌ | ✅ | 推理依赖 GPU/Vocoder |
| end-to-end（任务→产物上传） | ✅（完全 mock） | ✅（真实推理） | CPU 场景注重流程、日志、状态机 |

### 7. 风险与待办（输入阶段1）
- 依赖分散、环境不可重复：需统一 `pyproject/uv`、`Makefile`。
- 没有共享 `shared/` 包与异常约束：阶段1建立通用库。
- 观测缺失：日志格式不统一，无 metrics/tracing。
- Alembic 未落地，数据库 schema 缺乏版本管理。

> 以上内容为阶段0产出，后续阶段将围绕配置统一、代码分层、任务协议等逐项推进，严格遵守“业务逻辑不变”的约束。

### 8. 阶段1实施计划（待执行）
1. **共享库 `shared/`**
   - 建立 `shared/config`, `shared/logging`, `shared/exceptions`, `shared/contracts`。
   - `pyproject.toml` 支持 `editable install`，被 `backend_server` 与 `worker` 共同引用。
2. **配置统一**
   - 采用 `pydantic-settings` + `config.yaml` + `.env` 三级结构。
   - 定义 `Settings(BaseSettings)` 基类，并在各服务注入环境 profile（`dev/test/prod`）。
3. **日志与观测**
   - 引入 `structlog` + 标准 `logging.config.dictConfig`，输出 JSON，字段包含 `trace_id/job_id`.
   - 集成 OpenTelemetry SDK（Console Exporter）以备后续 OTLP。
4. **异常与响应契约**
   - 定义 `BusinessError`, `ValidationError`, `ExternalServiceError` 等，并在 FastAPI `exception_handler` 与 Worker 主流程中统一捕获→结构化日志。
5. **依赖管理与质量**
   - 顶层 `conda` 仅提供基础 Python；各服务通过 `uv` 或 `poetry` 锁依赖。
   - 统一 `ruff`, `black`, `mypy`, `pytest`, `coverage` 配置，写入 `pyproject.toml`。
6. **自动化脚本**
   - 根目录 `Makefile` / `Justfile`，封装 `install`, `lint`, `test`, `run-backend`, `run-worker`.
7. **阶段输出**
   - 文档：`docs/stage1_plan.md`（实施 checklist + 配置样例）。
   - 代码：`shared/` 目录、配置模板、统一日志/异常、CI 检查脚本。

