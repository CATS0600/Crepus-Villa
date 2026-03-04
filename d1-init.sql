-- Cloudflare D1 数据库初始化脚本
-- 在 Cloudflare Dashboard 中运行此脚本来创建留言板表

-- 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  reply TEXT,
  is_public INTEGER DEFAULT 0,
  token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_is_public ON messages(is_public);
CREATE INDEX IF NOT EXISTS idx_token ON messages(token);
CREATE INDEX IF NOT EXISTS idx_created_at ON messages(created_at DESC);

-- 创建索引组合查询优化
CREATE INDEX IF NOT EXISTS idx_public_reply ON messages(is_public, reply);

-- （可选）添加示例数据用于测试
-- INSERT INTO messages (content, reply, is_public, token, created_at) VALUES
-- ('这是一条公开留言示例', '这是管理员的回复', 1, NULL, datetime('now')),
-- ('这是一条私密留言示例', '这是私密回复', 0, 'test1234', datetime('now'));
