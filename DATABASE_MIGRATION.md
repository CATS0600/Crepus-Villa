# Crepus Villa - 数据库迁移指南

## 📋 新功能概述

本次更新为以下系统添加了回复方式支持：
- 📬 **Send Anything** - 匿名留言板（邮件/网页回复）
- 📋 **DPMBG 申请** - 群组入申请（邮件/网页回复）
- 🔐 **管理后台** - 考试申请管理（密码保护）

## 🗄️ 数据库迁移步骤

### 1️⃣ messages 表迁移

**新增字段：**
```sql
ALTER TABLE messages ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE messages ADD COLUMN email TEXT;
```

**字段说明：**
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `reply_method` | TEXT | 回复方式 | `'web'` 或 `'email'` |
| `email` | TEXT | 邮箱地址（仅当 reply_method='email' 时） | `user@example.com` |

### 2️⃣ exams 表迁移

**新增字段：**
```sql
ALTER TABLE exams ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE exams ADD COLUMN email TEXT;
```

**字段说明：**
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `reply_method` | TEXT | 回复方式 | `'web'` 或 `'email'` |
| `email` | TEXT | 邮箱地址（仅当 reply_method='email' 时） | `user@example.com` |

## 🔐 环境变量配置

### Cloudflare Secret Store

在你的 Cloudflare Workers 项目配置中添加管理员密码：

**通过 Wrangler CLI：**
```bash
wrangler secret put ADMIN_PASSWORD
# 输入你的管理员密码（建议至少12字符）
```

**通过 Cloudflare Dashboard：**
1. 前往 **Settings → General → Environment variables**
2. 添加 Secret：
   - **Variable name:** `ADMIN_PASSWORD`
   - **Value:** 你的管理员密码

**密码建议：**
- 长度：12+ 字符
- 包含：大小写字母、数字、符号
- 示例：`MySecurePass2024!`

## 📱 API 变更

### 消息提交 API (`/api/submit`)

**请求体（新增字段）：**
```json
{
  "content": "Hello world",
  "is_public": true,
  "reply_method": "email",      // ✨ 新字段
  "email": "user@example.com"   // ✨ 新字段
}
```

**回复方式逻辑：**
- `reply_method = 'web'`：评论者将在评论页面看到回复
- `reply_method = 'email'`：需要提供有效的邮箱地址，管理员可通过邮件回复
- **特殊规则**：`is_public = false` 时，强制使用 `reply_method = 'web'`

**邮箱验证：**
- 格式：`^[^\s@]+@[^\s@]+\.[^\s@]+$`
- 示例：`user@example.com` ✅ | `invalid@.com` ❌ | `test@domain` ❌

### 考试申请 API (`/api/exam/submit`)

**请求体（新增字段）：**
```json
{
  "username": "用户名",
  "social_id": "QQ:12345678",
  "answers": "我的申请文本",
  "group_id": "dpmbg",
  "reply_method": "email",      // ✨ 新字段
  "email": "user@example.com"   // ✨ 新字段
}
```

### 管理 API (`/api/exam/admin`)

**认证方式 - X-Admin-Password 头：**
```javascript
// 请求示例
fetch('/api/exam/admin?group=dpmbg', {
  headers: {
    'X-Admin-Password': 'YourAdminPassword123'
  }
})
```

**响应体（包含新字段）：**
```json
{
  "applications": [
    {
      "id": "app_123",
      "username": "申请者",
      "email": "user@example.com",
      "reply_method": "email",
      "status": "pending"
    }
  ]
}
```

## 🎯 管理后台使用

### 访问路径
```
https://your-site.pages.dev/exam-admin
```

### 登录流程
1. 输入管理员密码（存储在 Cloudflare Secret Store）
2. 密码通过 `X-Admin-Password` 头验证
3. 登录状态保留在当前浏览会话中

### 管理功能
- 📋 查看所有申请（按群组筛选）
- ✅ 批准申请
- ❌ 拒绝申请
- ⏳ 设回待审状态
- 📧 查看申请者邮箱（如提供）

## 🛡️ 安全注意事项

1. **ADMIN_PASSWORD**
   - 定期更换密码
   - 避免在代码中硬编码
   - 使用强密码

2. **邮箱字段**
   - 仅在 `reply_method = 'email'` 时保存
   - 建议添加单独的邮件系统处理用户回复
   - 考虑 GDPR 合规性

3. **API 调用**
   - 使用 HTTPS 传输密码
   - 限制管理后台访问 IP（可选）
   - 记录管理员操作日志

## 📝 SQL 迁移脚本

如果使用 Cloudflare D1 CLI，可使用以下完整脚本：

```sql
-- 为 messages 表添加新字段
ALTER TABLE messages ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE messages ADD COLUMN email TEXT;

-- 为 exams 表添加新字段
ALTER TABLE exams ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE exams ADD COLUMN email TEXT;

-- 验证迁移
SELECT sql FROM sqlite_master WHERE type='table' AND name='messages';
SELECT sql FROM sqlite_master WHERE type='table' AND name='exams';
```

## ✅ 迁移验证

完成迁移后，验证以下内容：

```bash
# 1. 检查 messages 表结构
curl -H "X-Admin-Password: YourPassword" \
  https://your-site.pages.dev/api/admin

# 2. 检查 exams 表结构
curl -H "X-Admin-Password: YourPassword" \
  https://your-site.pages.dev/api/exam/admin?group=dpmbg

# 3. 测试新的提交功能
curl -X POST https://your-site.pages.dev/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message",
    "is_public": true,
    "reply_method": "email",
    "email": "test@example.com"
  }'
```

## 🆘 常见问题

**Q：如何重置管理员密码？**
A：通过 Cloudflare Dashboard 更新 Secret Store 中的 `ADMIN_PASSWORD` 值

**Q：如果用户选择邮件回复但没有提供邮箱怎么办？**
A：前端和后端都会验证，拒绝没有邮箱的邮件回复请求

**Q：Messages 表中没有邮箱的旧数据会怎样？**
A：`email` 字段为 NULL，回复默认使用网页方式

**Q：能否同时使用两个表格？**
A：可以，Messages 用于 Send Anything，Exams 用于 DPMBG 申请

---

📚 **相关文件**
- `/src/pages/exam-admin.astro` - 管理后台页面
- `/functions/api/exam/admin.js` - 考试管理 API
- `/functions/exam/submit.js` - 考试提交 API
- `/functions/api/submit.js` - 消息提交 API（已更新）
