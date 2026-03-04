# 🎭 Crepus Villa 匿名留言板系统

## 📋 功能概览

### 1. **提交留言** (`/send`)
- 用户可以发送匿名留言
- **公开模式**：留言内容对所有人可见
- **私密模式**：生成 8 位 Token，只有持有者可以查看
- 留言长度限制 1000 字

### 2. **查看留言**
- **公开留言** (`/reply`): 显示所有已有管理员回复的公开留言
- **私密留言** (`/reply/private`): 输入 Token 查看私密留言及其回复

### 3. **管理后台** (`/admin`)
- 查看所有留言（公开和私密都显示）
- 对留言进行回复
- 删除不合适的留言
- 显示 Token（便于管理员进行追踪）

### 4. **随机跳转** (`/jump` 或主页按钮)
- 在首页底部添加"Random Jump"按钮
- 随机跳转到预设的网站列表

## 🗄️ 数据库结构

使用 Cloudflare D1 数据库，表名 `messages`，包含以下字段：

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  reply TEXT,
  is_public INTEGER DEFAULT 0,
  token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ API 接口

### 1. `/api/submit` (POST)
**提交留言**

请求体：
```json
{
  "content": "留言内容",
  "is_public": 1  // 0 表示私密，1 表示公开
}
```

响应：
```json
{
  "success": true,
  "id": 1,
  "token": "abcd1234",  // 仅私密模式返回
  "is_public": 0
}
```

### 2. `/api/get-messages` (GET)
**获取留言**

参数：
- `token` (可选): 用于查询特定私密留言

返回：
- 不带 token: 返回所有公开、已回复的留言
- 带 token: 返回该 token 对应的私密留言

### 3. `/api/admin` (GET/PUT/DELETE)
**管理员操作**

**GET**: 获取所有留言
```json
{
  "success": true,
  "count": 10,
  "messages": [...]
}
```

**PUT**: 更新回复
```json
{
  "id": 1,
  "reply": "管理员的回复内容"
}
```

**DELETE**: 删除留言
```json
{
  "id": 1
}
```

## 📁 项目文件结构

```
/functions/
  /api/
    submit.js        # 提交留言API
    get-messages.js  # 获取留言API
    admin.js         # 管理后台API
  jump.js            # 随机跳转函数

/src/pages/
  send.astro         # 提交留言界面
  reply.astro        # 公开留言界面
  /reply/
    private.astro    # 私密留言查询界面
  admin.astro        # 管理后台界面
  index.astro        # 首页（已添加随机跳转按钮）
```

## 🚀 部署注意事项

### 1. Cloudflare Pages 配置
确保在 `wrangler.jsonc` 中正确配置 D1 数据库绑定：
```json
{
  "env": {
    "production": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "your_db_name",
          "database_id": "your_db_id"
        }
      ]
    }
  }
}
```

### 2. 环境变量
在 Cloudflare Pages 中设置环境变量（可选，根据需求）

### 3. CORS 配置
API 默认支持跨域请求，前端可以安全调用

## 🎨 首页修改说明

### 已添加的功能：
1. **源代码头部** 添加了网站列表 (`jumpWebsites`)
2. **Random Jump 按钮** 添加到底部（在 email 按钮下方，footer 上方）
3. **动画效果** 按钮 hover 时骰子图标旋转

### 自定义网站列表
编辑 `/src/pages/index.astro` 中的 `jumpWebsites` 数组：
```javascript
const jumpWebsites = [
    "https://example.com",
    "https://another-site.com",
    // 添加更多网站...
];
```

## 🔒 安全建议

1. **管理员认证**: 建议为 `/admin` 路由添加身份验证
2. **Token 长度**: 目前使用 8 位 UUID，可根据需要调整
3. **速率限制**: 建议在 Cloudflare Workers 中添加速率限制
4. **内容审核**: 在生产环境中添加内容过滤

## 📝 使用流程示例

1. 用户访问 `/send`，填写表单
2. 选择"公开"或保持私密模式
3. 点击"发送消息"
4. 如果选择私密，获得 Token（需妥善保管）
5. 管理员在 `/admin` 查看并回复留言
6. 用户在 `/reply` 或 `/reply/private` 查看回复

## 🐛 故障排除

| 问题 | 解决方案 |
|------|--------|
| 提交失败 | 检查 D1 数据库是否正确绑定 |
| 查不到留言 | 确认 Token 输入正确（不包含破折号） |
| API 返回 500 | 查看 Cloudflare Workers 日志 |
| 样式显示异常 | 清除浏览器缓存 |

## 📧 反馈与支持

如有任何问题，请联系 E-Crepuscular@outlook.com
