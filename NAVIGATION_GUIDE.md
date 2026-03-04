# 🗺️ 匿名留言板 - 快速导航指南

## 👥 用户视角

### 核心路由
| 路由 | 功能 | 描述 |
|------|------|------|
| `/send` | 📝 写留言 | 提交新的匿名留言或公开留言 |
| `/reply` | 👁️ 看公开 | 浏览所有公开留言和其回复 |
| `/reply/private` | 🔐 看私密 | 输入 Token 查看私密留言 |
| `/` | 🏠 首页 | 新增"Random Jump"按钮 |

### 用户流程
```
首页 (/) 
  ↓
点击链接 → /send (填表并选择公开/私密)
  ↓
如果私密 → 收到 Token
  ↓
点击 /reply 看公开回复
或
点击 /reply/private 输入 Token 看私密回复
```

## 👨‍💼 管理员视角

### 管理后台
| 路由 | 功能 |
|------|------|
| `/admin` | 📊 查看所有留言、回复、删除 |

### 管理流程
```
/admin
  ↓
查看所有留言（包括未回复的）
  ↓
在每条留言下输入回复内容
  ↓
点击"保存回复"
  ↓
用户可在 /reply 或 /reply/private 看到回复
```

## 🎲 首页新功能

### Random Jump 按钮
- **位置**: 首页底部，邮件按钮下方
- **功能**: 随机跳转到预设的网站列表
- **自定义**: 编辑 `/src/pages/index.astro` 中的 `jumpWebsites` 数组

## 🔌 API 调用方式

### 前端调用示例

#### 1. 提交留言
```javascript
const response = await fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "我的留言内容",
    is_public: 1  // 0=私密, 1=公开
  })
});
const data = await response.json();
console.log(data.token); // 私密模式会返回 Token
```

#### 2. 获取公开留言
```javascript
const response = await fetch('/api/get-messages');
const data = await response.json();
console.log(data.messages); // 获取所有公开且已回复的留言
```

#### 3. 获取私密留言
```javascript
const response = await fetch(`/api/get-messages?token=abcd1234`);
const data = await response.json();
console.log(data.messages); // 获取该 Token 的留言
```

#### 4. 获取管理员列表
```javascript
const response = await fetch('/api/admin');
const data = await response.json();
console.log(data.messages); // 所有留言（包括未回复的）
```

#### 5. 添加回复
```javascript
const response = await fetch('/api/admin', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    reply: "管理员的回复"
  })
});
```

#### 6. 删除留言
```javascript
const response = await fetch('/api/admin', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 })
});
```

## 📊 数据库字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 主键，自动递增 |
| `content` | TEXT | 用户提交的留言内容 |
| `reply` | TEXT | 管理员的回复内容 |
| `is_public` | INTEGER | 0=私密，1=公开 |
| `token` | TEXT | 私密留言的 8 位 Token |
| `created_at` | DATETIME | 创建时间戳 |

## 🎨 页面特色

### `/send` - 提交页面
- ✅ 实时字数统计（1000 字限制）
- ✅ 复选框选择公开/私密
- ✅ 成功后显示 Token（私密模式）
- ✅ 错误提示

### `/reply` - 公开留言
- ✅ 卡片式布局
- ✅ 显示留言内容和管理员回复
- ✅ 时间戳和 ID
- ✅ 导航链接

### `/reply/private` - 私密查询
- ✅ Token 输入框（8 位，不区分大小写）
- ✅ 自动大写转换
- ✅ 查询结果显示

### `/admin` - 管理后台
- ✅ 所有留言（公开+私密）
- ✅ 状态标签（🔓公开/🔐私密，✓已回复/✗未回复）
- ✅ 在线编辑回复
- ✅ 删除功能

## 🚀 部署前检查清单

- [ ] D1 数据库已创建，表 `messages` 已初始化
- [ ] `wrangler.jsonc` 中配置了 `DB` 绑定
- [ ] 所有 `.js` 文件在 `/functions` 目录
- [ ] 所有 `.astro` 文件在 `/src/pages` 目录
- [ ] CSS 样式正确（深色模式支持）
- [ ] 管理后台已添加身份验证（推荐）

## 💡 使用建议

1. **为 `/admin` 添加密钥验证** - 防止无权限访问
2. **定期备份数据库** - Cloudflare D1 支持备份
3. **监控 API 使用量** - 设置 Cloudflare 告警
4. **自定义随机跳转网站** - 定期更新列表
5. **添加内容过滤** - 防止垃圾留言

---

有任何问题，请参考 MESSAGEBOARD_README.md 或联系开发团队！
