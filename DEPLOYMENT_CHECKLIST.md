# 🚀 快速部署检查清单

## ✅ 部署前检查（Pre-Deployment）

### 1️⃣ 代码文件完整性检查

```bash
# 检查所有新文件是否存在
✓ src/pages/exam-admin.astro
✓ functions/exam/submit.js
✓ DATABASE_MIGRATION.md
✓ CHANGELOG_V3.md
✓ DEPLOYMENT_CHECKLIST.md (本文件)

# 检查修改文件
✓ src/pages/index.astro (Random Jump + V4 Icon)
✓ src/pages/send.astro (520+ 行新设计)
✓ src/pages/application/dpmbg.astro (回复方式选择器)
✓ functions/api/submit.js (邮箱验证)
✓ functions/api/exam/admin.js (密码认证)
```

### 2️⃣ 环境变量配置

**方式 A：通过 Wrangler CLI**
```bash
# 设置管理员密码
wrangler secret put ADMIN_PASSWORD

# 验证设置成功
wrangler secret list
```

**方式 B：通过 Cloudflare Dashboard**
1. 打开 Cloudflare 控制面板
2. 进入你的 Pages 项目
3. Settings → Environment/Secrets
4. 添加 Secret：
   - Name: `ADMIN_PASSWORD`
   - Value: `你的强密码`（建议12+字符）

**验证方法**
```javascript
// 在任意 API 文件中测试
console.log(context.env.ADMIN_PASSWORD ? '✅ Secret 已设置' : '❌ Secret 未设置');
```

### 3️⃣ 数据库迁移

**注意：数据库迁移需要在部署前完成**

**选项 A：Cloudflare D1 仪表板**
```
Dashboard → D1 数据库 → 你的数据库 → SQL Runner
```

在 SQL Runner 中执行：
```sql
-- messages 表迁移
ALTER TABLE messages ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE messages ADD COLUMN email TEXT;

-- exams 表迁移
ALTER TABLE exams ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE exams ADD COLUMN email TEXT;
```

**选项 B：Wrangler CLI**
```bash
# 执行迁移文件
wrangler d1 execute your-db-name --file ./migrations/add-reply-fields.sql

# 如果没有迁移文件，可在命令行执行
wrangler d1 execute your-db-name --remote
# 然后粘贴 SQL 命令
```

**验证迁移成功**
```bash
# 检查 messages 表结构
wrangler d1 execute your-db-name --remote
> PRAGMA table_info(messages);

# 检查 exams 表结构
> PRAGMA table_info(exams);
```

---

## 🧪 本地测试（Local Testing）

### 4️⃣ 启动开发服务器

```bash
# 安装依赖（如需要）
npm install

# 启动开发服务器
npm run dev

# 或者使用 wrangler pages dev
wrangler pages dev ./dist
```

### 5️⃣ 功能测试检查表

#### 🎨 UI 测试
```
首页 (/)
  □ Random Jump 按钮显示正确样式
  □ 按钮悬停时有特效
  □ 底部显示 Villa V4 Icon
  □ Icon 悬停时有缩放旋转效果

发送页面 (/send)
  □ 表单宽度为 95vw
  □ 文本框可动态扩展（250px-60vh）
  □ 字数计数器工作正常
  □ 回复方式下拉框显示正确
  □ 私密消息时，回复方式被禁用（强制网页）
  □ 选择邮件时，邮箱输入框显示
  □ 选择网页时，邮箱输入框隐藏
  □ 梯度文本头显示正确

申请页面 (/application/dpmbg)
  □ 表单显示新的回复方式选择器
  □ 邮箱字段条件显示工作正常
  □ 字数计数器计数正确
```

#### 🔐 功能测试
```
管理后台 (/exam-admin)
  □ 首次访问显示密码输入框
  □ 输入错误密码 → 提示错误
  □ 输入正确密码 → 显示申请列表
  □ 密码状态保存在 sessionStorage
  □ 刷新页面后密码仍然生效
  □ 新标签页需要重新输入密码

API 测试
  □ /api/exam/submit - 成功提交申请
  □ /api/exam/submit - 邮箱验证工作
  □ /api/exam/admin - 密码验证工作
  □ /api/exam/admin - 401 错误正确返回
  □ /api/submit - 支持新的 reply_method 字段
```

#### 📧 数据验证
```
提交表单后检查数据库
  □ 消息/申请正确保存
  □ reply_method 字段值正确（'web' 或 'email'）
  □ email 字段值正确（有效邮箱或 NULL）
  □ 私密消息的 reply_method 被转换为 'web'
```

### 6️⃣ 浏览器控制台检查

```javascript
// 打开浏览器开发者工具 (F12)
// Console 标签页，检查是否有错误

// 预期结果：
✅ 无 JavaScript 错误
✅ 无 404 资源错误
✅ 网络请求均返回 2xx 或 401

// 测试邮箱验证（控制台输入）
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
validateEmail('test@example.com');  // true
validateEmail('test@.com');         // false
```

---

## 📤 部署到生产环境（Production Deployment）

### 7️⃣ 代码提交

```bash
# 查看变更
git status

# 添加所有文件
git add -A

# 提交变更
git commit -m "feat: 第三阶段更新 - UI改进、密码认证、邮件回复系统

- 改进 Random Jump 按钮设计（梯度色 + 玻璃态）
- 添加 Villa V4 Icon 到首页
- 扩展 Send 表单到全屏宽度
- 实现管理员密码认证系统
- 添加网页/邮件回复方式选择
- 支持 DPMBG 申请页回复方式
"

# 推送到远程
git push origin main
```

### 8️⃣ 验证 Cloudflare Pages 部署

**自动部署触发**
- ✅ Cloudflare Pages 将自动检测 git push
- ✅ 自动构建项目（运行 npm run build）
- ✅ 自动部署到生产环境

**查看部署状态**
1. Cloudflare 控制面板 → Pages 项目
2. Deployments 标签页
3. 查看最新部署状态

**部署需要 3-10 分钟**

### 9️⃣ 生产环境验证

```bash
# 访问各个页面（替换为你的域名）
https://your-site.pages.dev/
https://your-site.pages.dev/send
https://your-site.pages.dev/application/dpmbg
https://your-site.pages.dev/exam-admin

# API 测试
curl -X POST https://your-site.pages.dev/api/exam/submit \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Test User",
    "social_id": "test@qq.com",
    "answers": "This is a test",
    "group_id": "dpmbg",
    "reply_method": "email",
    "email": "test@example.com"
  }'

# 管理后台测试
curl -H "X-Admin-Password: YourPassword" \
  https://your-site.pages.dev/api/exam/admin?group=dpmbg
```

---

## ⚠️ 常见问题解决

### 问题 1：501 错误 - 环境变量未加载

**症状：**
```
501 Bad Gateway
或
env.ADMIN_PASSWORD 未定义
```

**解决：**
1. 确认 Secret 已在 Cloudflare 中设置
2. 清除浏览器缓存
3. 等待 5 分钟（Secret 传播延迟）
4. 重新部署（Settings → Trigger deployment）

### 问题 2：数据库字段不存在

**症状：**
```
SQL Error: no such column: reply_method
```

**解决：**
1. 确认数据库迁移已执行
2. 使用 `PRAGMA table_info(messages);` 验证
3. 如需回滚：
```sql
ALTER TABLE messages DROP COLUMN reply_method;
ALTER TABLE messages DROP COLUMN email;
```

### 问题 3：邮箱验证总是失败

**症状：**
```
邮箱格式不正确
```

**检查：**
```javascript
// 验证正则表达式
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('your@email.com');
// 应返回 true

// 检查空格
const email = document.getElementById('email').value.trim();
```

### 问题 4：管理后台无法加载

**症状：**
```
加载中... (无响应)
或
401 Unauthorized
```

**检查清单：**
- [ ] 密码正确（检查大小写）
- [ ] ADMIN_PASSWORD Secret 已设置
- [ ] 网络连接正常
- [ ] 浏览器控制台是否有错误信息

---

## 📋 回滚方案（Rollback）

如果出现严重问题，可快速回滚：

```bash
# 查看提交历史
git log --oneline

# 回滚到上一个版本
git revert HEAD
git push origin main

# 或者重置到特定提交
git reset --hard <commit-hash>
git push origin main --force
```

**生产环境回滚**
- Cloudflare Pages 将自动检测新推送
- 部署 3-10 分钟完成

---

## ✨ 部署后 - 最终确认

### ✅ 最终检查表

```
部署完成后 24 小时内检查：

□ 所有页面正常加载（无 404）
□ 表单提交成功
□ 管理后台可访问
□ API 返回预期数据
□ 密码认证工作正常
□ 邮箱验证严格执行
□ 数据库保存回复方式信息
□ 用户汇报反馈意见

如发现问题，立即创建 GitHub Issue
```

---

## 📞 支持和反馈

- 🐛 发现 Bug：提交 GitHub Issue
- 💬 功能建议：讨论 GitHub Discussions
- 📧 紧急情况：发送邮件至管理员

---

**祝部署顺利！🎉**
