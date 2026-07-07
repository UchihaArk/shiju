-- 拾聚 D1 种子数据（仅成员，幂等）。事项由家人自行创建。
-- 重复执行不会报错；已存在的库重跑会刷新成员名字/生日/角色。

-- 成员（内置真实数据）
INSERT OR IGNORE INTO users (id, name, short_name, role, emoji, color, birthday_type, birthday_month, birthday_day) VALUES
('u_ba',  '爸爸 · 宇航', '宇航', '爸爸', '👨', 'orange', 'lunar', 7, 9),
('u_ma',  '妈妈 · 佳琪', '佳琪', '妈妈', '👩', 'rose',   'lunar', 9, 12),
('u_ye',  '爷爷 · 豪子', '豪子', '爷爷', '👴', 'amber', 'lunar', 10, 8),
('u_nai', '奶奶 · 梅子', '梅子', '奶奶', '👵', 'leaf',  'lunar', 1, 28),
('u_xm',  '晚辈 · 小满', '小满', '小满', '🧒', 'pink',  'solar', 6, 23),
('u_duole','宠物 · 多乐', '多乐', '宠物', '🐶', 'tan',   'solar', 5, 15);

-- 刷新成员名字/生日（已存在的库重跑时生效）
UPDATE users SET name='爸爸 · 宇航', short_name='宇航', role='爸爸', emoji='👨', color='orange', birthday_type='lunar', birthday_month=7,  birthday_day=9  WHERE id='u_ba';
UPDATE users SET name='妈妈 · 佳琪', short_name='佳琪', role='妈妈', emoji='👩', color='rose',   birthday_type='lunar', birthday_month=9,  birthday_day=12 WHERE id='u_ma';
UPDATE users SET name='爷爷 · 豪子', short_name='豪子', role='爷爷', emoji='👴', color='amber', birthday_type='lunar', birthday_month=10, birthday_day=8  WHERE id='u_ye';
UPDATE users SET name='奶奶 · 梅子', short_name='梅子', role='奶奶', emoji='👵', color='leaf',  birthday_type='lunar', birthday_month=1,  birthday_day=28 WHERE id='u_nai';
UPDATE users SET name='晚辈 · 小满', short_name='小满', role='小满', emoji='🧒', color='pink',  birthday_type='solar', birthday_month=6,  birthday_day=23 WHERE id='u_xm';
UPDATE users SET name='宠物 · 多乐', short_name='多乐', role='宠物', emoji='🐶', color='tan',   birthday_type='solar', birthday_month=5,  birthday_day=15 WHERE id='u_duole';
