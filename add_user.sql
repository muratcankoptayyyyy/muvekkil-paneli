-- NOT: Bu dosyaya gerek yok! 
-- database_schema.sql dosyasını çalıştırın, kullanıcılar otomatik oluşturulur.

-- Eğer sadece kullanıcıları görmek isterseniz:
SELECT id, full_name, email, tc_kimlik, tax_number, user_type, is_active 
FROM users 
ORDER BY created_at DESC;
