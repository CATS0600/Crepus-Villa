-- 1. 新成员计数表
CREATE TABLE IF NOT EXISTS site_counters (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    new_member_count INTEGER DEFAULT 0
);

-- 初始化计数器默认值
INSERT OR IGNORE INTO site_counters (id, new_member_count) VALUES (1, 0);

-- 2. 考试历史记录表
CREATE TABLE IF NOT EXISTS exam_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT NOT NULL,
    qqid INTEGER NOT NULL,
    exam_times INTEGER NOT NULL,
    exam_result INTEGER NOT NULL,
    achtung_notes TEXT,
    answers TEXT, -- 存储整套试卷的 JSON 答卷
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);