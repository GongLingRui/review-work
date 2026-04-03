# AI API密钥配置说明

## 当前配置状态

✅ **已配置项**:
- AI模型配置：`glm-z1-flash,glm-z1-flash`
- AI API基础URL：`https://open.bigmodel.cn/api/paas/v4`
- 启动脚本已更新：自动加载`.env`文件

⚠️ **需要配置**:
- AI API密钥：请在`.env`文件中设置`RSSANT_AI_API_KEY`

## 如何设置API密钥

### 方法1：编辑.env文件（推荐）

编辑项目根目录的`.env`文件：

```bash
cd /root/gongfan/rss-subscribe
nano .env
```

或者使用vim：

```bash
vim .env
```

找到这一行：
```
RSSANT_AI_API_KEY=
```

替换为您的实际API密钥，例如（如果使用Dify平台）：
```
RSSANT_AI_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
```

保存文件后，重启API服务：

```bash
bash start-all-services.sh restart api
```

### 方法2：使用sed命令快速设置

```bash
cd /root/gongfan/rss-subscribe
sed -i 's/^RSSANT_AI_API_KEY=$/RSSANT_AI_API_KEY=your_api_key_here/' .env
```

然后重启服务：
```bash
bash start-all-services.sh restart api
```

## 验证配置

配置完成后，可以查看服务日志验证配置是否正确加载：

```bash
# 查看API服务日志
bash start-all-services.sh logs api
```

在日志中查找以下信息：
- `AI模型配置: glm-z1-flash,glm-z1-flash`
- 如果看到"AI API key未配置，返回模拟数据"的警告，说明API密钥未正确设置

## API密钥格式

### 智谱AI
 - 格式：`{32位hex}.{16位字母或数字}`（示例：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx`）
 - 获取方式：登录智谱控制台，在「API Key管理」中创建

### Dify或其他平台
- 如果 `AI_API_BASE_URL` 指向 Dify/自建网关，请按照对应平台的要求填写（例如 Dify 的 `app-xxxx`）。此时模型配置应使用工作流 ID，而非智谱模型代号。

## 注意事项

1. **安全性**：不要将API密钥提交到代码仓库
2. **权限**：确保`.env`文件有适当的访问权限（建议：600）
3. **重启服务**：修改`.env`文件后，必须重启API服务才能生效

## 测试AI分析功能

配置完成后，可以测试AI分析功能：

1. 打开任意一篇文章详情页
2. 等待2秒，系统会自动触发AI分析
3. 或者在AI分析组件中点击"开始AI分析"按钮
4. 查看是否生成分析结果

如果仍然显示"分析中..."或错误，请检查：
- API密钥是否正确
- API服务是否可访问
- 网络连接是否正常
- 查看API服务日志排查问题

