# 飞书机器人功能自动化测试

## 测试说明

本测试使用 Playwright 自动化测试飞书机器人的配置和发送功能。

## 测试功能

1. ✅ **配置名称** - 用户可以设置配置名称
2. ✅ **报告类型** - 可以选择 AI影视 或 AIGC
3. ✅ **Webhook URL** - 可以配置飞书群机器人的 Webhook URL
4. ✅ **发送频率** - 可以选择每天或每周发送
5. ✅ **发送时间** - 可以设置发送时间（支持多个时间，用逗号分隔）
6. ✅ **星期设置** - 每周发送时可以设置发送的星期
7. ✅ **启用/禁用** - 可以启用或禁用配置
8. ✅ **Webhook测试** - 可以测试 Webhook 是否正常工作
9. ✅ **编辑配置** - 可以编辑已有配置
10. ✅ **删除配置** - 可以删除配置

## 运行测试

### 前置条件

1. 确保前端服务正在运行（默认 http://localhost:5173）
2. 确保后端服务正在运行
3. 确保已安装 Playwright

### 安装依赖

```bash
# 激活conda环境
conda activate rssant

# 安装Playwright
pip install playwright

# 安装浏览器
playwright install chromium
```

### 运行测试

```bash
# 基本运行
python tests/test_feishu_bot_playwright.py

# 自定义前端URL
FRONTEND_URL=http://localhost:5173 python tests/test_feishu_bot_playwright.py

# 自定义登录信息
TEST_USERNAME=admin TEST_PASSWORD=admin python tests/test_feishu_bot_playwright.py
```

### 环境变量

- `FRONTEND_URL`: 前端服务地址（默认: http://localhost:5173）
- `TEST_USERNAME`: 测试用户名（默认: admin）
- `TEST_PASSWORD`: 测试密码（默认: admin）
- `WEBHOOK_URL`: 飞书Webhook URL（已在脚本中硬编码，可修改）

## 测试流程

1. **登录系统** - 使用测试账号登录
2. **导航到飞书机器人页面** - 访问 `/feishu-bot` 路由
3. **创建AI影视配置** - 测试每天发送的AI影视报告配置
4. **创建AIGC配置** - 测试每周发送的AIGC报告配置
5. **测试Webhook** - 测试Webhook发送功能
6. **编辑配置** - 修改配置名称和发送时间
7. **切换启用状态** - 测试启用/禁用功能
8. **删除配置** - 清理测试数据

## 注意事项

1. 测试会创建真实的配置数据，测试完成后会自动清理
2. Webhook测试会实际发送消息到飞书群，请确保Webhook URL有效
3. 测试使用无头浏览器模式，可以通过修改 `headless=False` 来观察测试过程
4. 如果测试失败，会自动截图保存错误信息

## 故障排查

### 测试失败

1. 检查前端服务是否正常运行
2. 检查后端服务是否正常运行
3. 检查登录凭据是否正确
4. 检查网络连接是否正常
5. 查看错误截图（保存在测试目录）

### Webhook测试失败

1. 检查Webhook URL是否正确
2. 检查飞书群机器人是否已启用
3. 检查网络是否可以访问飞书API
4. 查看飞书群是否收到测试消息

## 测试结果

测试完成后会输出：
- ✅ 成功步骤的确认信息
- ❌ 失败步骤的错误信息
- 📸 错误截图（如果测试失败）

