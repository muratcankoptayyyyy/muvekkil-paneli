-- Murat Can Koptay kullanıcısını ekle
-- Şifre: password123 (bcrypt hash)

INSERT INTO users (
    email, 
    hashed_password, 
    full_name, 
    phone, 
    tc_kimlik, 
    user_type, 
    is_active, 
    is_verified,
    created_at
) VALUES (
    'muratcan@koptay.av.tr',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBxVzFe1p2', -- password123
    'Murat Can Koptay',
    '0532 111 2233',
    '16469655934',
    'individual',
    true,
    true,
    NOW()
) ON CONFLICT (tc_kimlik) DO NOTHING;

-- Mevcut kullanıcıları kontrol et
SELECT id, full_name, tc_kimlik, tax_number, user_type, is_active 
FROM users 
ORDER BY created_at DESC;
