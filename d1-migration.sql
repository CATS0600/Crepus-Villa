-- Cloudflare D1 数据库迁移脚本
-- 此脚本用于升级现有的 messages 表，添加邮件回复功能所需的新字段
-- 在 Cloudflare Dashboard D1 SQL Editor 中运行此脚本

-- 如果表已存在，添加缺失的列
ALTER TABLE messages ADD COLUMN reply_method TEXT DEFAULT 'web';
ALTER TABLE messages ADD COLUMN email TEXT;

-- v2 迁移：添加 title 和 status 列
ALTER TABLE messages ADD COLUMN title TEXT DEFAULT '';
ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'PENDING';

-- 验证迁移成功
-- 运行以下查询检查表结构
-- PRAGMA table_info(messages);
