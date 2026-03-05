# 🔧 D1 数据库绑定配置指南

## 🚨 问题发现

API 仍然报错的**真正原因**：`wrangler.jsonc` 中**缺少 D1 数据库绑定**！

---

## ✅ 立即修复

### 步骤 1: 获取你的 D1 数据库 ID

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 **D1 数据库** (Workers → D1)
3. 找到你的数据库（例如 `crepus-villa`）
4. 将鼠标悬停在数据库名称上，复制 **Database ID**

### 步骤 2: 更新 `wrangler.jsonc`

打开 `wrangler.jsonc` 文件，找到：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "crepus-villa",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

将 `YOUR_DATABASE_ID_HERE` 替换为你复制的数据库 ID（例如 `12345678-abcd-ef01-2345-6789abcdef01`）

完成后应该是：
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "crepus-villa",
    "database_id": "12345678-abcd-ef01-2345-6789abcdef01"
  }
]
```

---

## 🚀 重新部署

```bash
# 1. 构建
npm run build

# 2. 预览（可选）
npm run preview

# 3. 部署
wrangler deploy
```

---

## ✨ 验证修复

部署后，刷新浏览器并测试：

1. **提交表单** - https://crepus.asia/send/
   - 应该显示成功信息，而不是"网络错误"

2. **查看留言** - https://crepus.asia/reply/
   - 应该加载留言列表

3. **检查浏览器控制台（F12）**
   - 如果仍有错误，错误信息应该更明确（例如 SQL 错误等）

---

## 📌 如果仍有问题

如果仍然看到错误，可以尝试：

1. **检查数据库绑定是否正确**
   ```bash
   wrangler deploy --verbose
   ```

2. **查看 Cloudflare Workers 日志**
   ```bash
   wrangler tail
   ```

3. **确认 D1 数据库中存在 messages 表**
   - 在 Cloudflare Dashboard → D1 → SQL Editor 中运行：
   ```sql
   PRAGMA table_info(messages);
   ```

---

## 🎯 最可能的修复

**问题**: `env.DB` 为 undefined
**原因**: D1 数据库绑定未配置
**解决方案**: 按照上述步骤配置 `d1_databases`

这应该能彻底解决问题！
