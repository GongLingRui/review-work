# API测试说明

## 快速测试所有API

运行以下命令测试所有API端点：

```bash
python test_all_apis.py
```

## 前提条件

在运行测试之前，需要确保API服务正在运行：

### 检查服务状态
```bash
bash check-services.sh
```

### 启动API服务

如果API服务未运行，使用以下方法之一启动：

**方法1: 使用开发脚本**
```bash
bash rundev-api.sh
```

**方法2: 使用统一启动脚本**
```bash
bash start-all-services.sh start
```

**方法3: 直接运行Django服务器**
```bash
python manage.py runserver 0.0.0.0:6788
```

## 测试结果

测试脚本会：
1. 检查服务是否运行
2. 测试所有主要API端点
3. 生成测试报告 (`test_api_results.json`)

## 测试的API端点类别

- ✅ 健康检查端点
- 📰 Feed相关端点
- 📄 Story相关端点
- 💬 Hacker News相关端点
- 📚 ArXiv相关端点
- 🤖 AIGC相关端点
- 🎬 AI Entertainment相关端点
- 📱 Feishu Bot相关端点
- 🐙 GitHub相关端点
- 🔗 RSSHub相关端点
- 📊 ArXiv Trend相关端点
- 👤 User相关端点

## 注意事项

- 大部分API端点需要认证，测试时会显示"需要认证"的提示，这是正常的
- 如果服务未运行，所有测试都会失败并提示启动服务
- 测试结果会保存到 `test_api_results.json` 文件中

