-- 拾聚 D1 种子数据（幂等：INSERT OR IGNORE + 末尾 UPDATE 名字/生日）
-- 重复执行不会报错；已存在的库重跑会刷新成员名字与生日。

-- 成员（内置真实数据）
INSERT OR IGNORE INTO users (id, name, short_name, role, emoji, color, birthday_type, birthday_month, birthday_day) VALUES
('u_ba',  '爸爸 · 宇航', '宇航', '爸爸', '👨', 'orange', 'lunar', 7, 9),
('u_ma',  '妈妈 · 佳琪', '佳琪', '妈妈', '👩', 'rose',   'lunar', 9, 12),
('u_ye',  '爷爷 · 豪子', '豪子', '爷爷', '👴', 'amber', 'lunar', 10, 8),
('u_nai', '奶奶 · 梅子', '梅子', '奶奶', '👵', 'leaf',  'lunar', 1, 28),
('u_xm',  '小满 · 小满', '小满', '小满', '🧒', 'pink',  'solar', 6, 23);

-- 事项
INSERT OR IGNORE INTO events (id, title, note, date, recurrence, created_by, color) VALUES
('e_outing',    '全家郊游踏青',     '带上野餐垫和水壶，目的地：植物园', '2026-06-28', 'once',    'u_ma', 'leaf'),
('e_laundry',   '换洗床单被罩',     NULL,                              '2026-07-03', 'monthly', 'u_ma', 'orange'),
('e_meeting',   '小满家长会',       '下午 4 点，三年级 (2) 班',         '2026-07-05', 'once',    'u_ba', 'amber'),
('e_xiaoshu',   '小暑 · 煲绿豆汤',  '节气养生，全家降火',               '2026-07-07', 'yearly',  'u_nai','leaf'),
('e_mamabday',  '妈妈生日聚会',     '今年一起在家吃长寿面 🎂',          '2026-07-09', 'once',    'u_ba', 'pink'),
('e_familymtg', '月度家庭会议',     NULL,                              '2026-07-12', 'monthly', 'u_ba', 'rose'),
('e_ac',        '空调清洗',         NULL,                              '2026-07-25', 'once',    'u_ma', 'orange'),
('e_property',  '缴物业费 + 宽带续费', NULL,                            '2026-06-20', 'monthly', 'u_ba', 'rose'),
('e_grandpa',   '爷爷复诊',         '心内科，记得带医保卡',             '2026-08-15', 'once',    'u_ma', 'amber'),
('e_hometown',  '全家回老家',       NULL,                              '2026-08-20', 'once',    'u_ye', 'leaf');

-- 子任务
INSERT OR IGNORE INTO tasks (id, event_id, title, assignee_id, status, claimed_at, done_at) VALUES
('t_outing_1',    'e_outing',    '准备野餐食物', 'u_ma', 'done',      NULL,                       '2026-06-27T20:00:00.000Z'),
('t_outing_2',    'e_outing',    '开车接送',     'u_ba', 'done',      NULL,                       '2026-06-27T21:00:00.000Z'),
('t_laundry_1',   'e_laundry',   '拆洗床单被罩', NULL,   'unclaimed', NULL,                       NULL),
('t_laundry_2',   'e_laundry',   '晾晒收纳',     'u_ba', 'claimed',   '2026-07-02T22:00:00.000Z', NULL),
('t_meeting_1',   'e_meeting',   '去学校开家长会', NULL, 'unclaimed', NULL,                       NULL),
('t_xiaoshu_1',   'e_xiaoshu',   '煲一锅绿豆汤', NULL,   'unclaimed', NULL,                       NULL),
('t_mamabday_1',  'e_mamabday',  '预订生日蛋糕', 'u_ye', 'claimed',   '2026-07-01T10:00:00.000Z', NULL),
('t_mamabday_2',  'e_mamabday',  '布置客厅气球', NULL,   'unclaimed', NULL,                       NULL),
('t_familymtg_1', 'e_familymtg', '记录会议要点', NULL,   'unclaimed', NULL,                       NULL),
('t_ac_1',        'e_ac',        '联系清洗师傅', NULL,   'unclaimed', NULL,                       NULL),
('t_ac_2',        'e_ac',        '擦拭空调外壳', NULL,   'unclaimed', NULL,                       NULL),
('t_property_1',  'e_property',  '线上缴费',     'u_ba', 'done',      NULL,                       '2026-06-20T09:00:00.000Z'),
('t_grandpa_1',   'e_grandpa',   '开车陪诊',     'u_ba', 'claimed',   '2026-07-02T08:00:00.000Z', NULL),
('t_hometown_1',  'e_hometown',  '买高铁票',     NULL,   'unclaimed', NULL,                       NULL);

-- 刷新成员名字 + 生日（已存在的库重跑时生效）
UPDATE users SET name='爸爸 · 宇航', short_name='宇航', birthday_type='lunar', birthday_month=7,  birthday_day=9  WHERE id='u_ba';
UPDATE users SET name='妈妈 · 佳琪', short_name='佳琪', birthday_type='lunar', birthday_month=9,  birthday_day=12 WHERE id='u_ma';
UPDATE users SET name='爷爷 · 豪子', short_name='豪子', birthday_type='lunar', birthday_month=10, birthday_day=8  WHERE id='u_ye';
UPDATE users SET name='奶奶 · 梅子', short_name='梅子', birthday_type='lunar', birthday_month=1,  birthday_day=28 WHERE id='u_nai';
UPDATE users SET name='小满 · 小满', short_name='小满', birthday_type='solar', birthday_month=6,  birthday_day=23 WHERE id='u_xm';
