-- Cloudflare D1 数据库初始化脚本
-- 在 Cloudflare Dashboard 中运行此脚本来创建入群申请考试表

-- 创建 exams 表（用于 DPMBG 和其他群组的申请）
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  social_id TEXT NOT NULL,
  answers TEXT NOT NULL,
  group_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_group_id ON exams(group_id);
CREATE INDEX IF NOT EXISTS idx_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON exams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_status ON exams(group_id, status);

-- （可选）添加示例数据用于测试
-- INSERT INTO exams (username, social_id, answers, group_id, status, created_at) VALUES
-- ('Test User', '@testuser', '这是一个测试申请', 'dpmbg', 'pending', datetime('now'));
