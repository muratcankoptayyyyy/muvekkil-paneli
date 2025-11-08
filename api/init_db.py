import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Vercel Postgres connection
DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def init_database():
        """Initialize database with tables and demo user"""
        db = SessionLocal()
        try:
            # Create users table
            db.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email TEXT UNIQUE,
                    full_name TEXT NOT NULL,
                    hashed_password TEXT NOT NULL,
                    user_type TEXT DEFAULT 'individual',
                    phone TEXT,
                    tc_kimlik TEXT UNIQUE,
                    tax_number TEXT UNIQUE,
                    company_name TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_verified BOOLEAN DEFAULT FALSE,
                    last_login TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                )
            """))
            
            # Check if user exists
            result = db.execute(text("SELECT COUNT(*) FROM users WHERE tc_kimlik = '16469655934'"))
            count = result.scalar()
            
            if count == 0:
                # Insert demo user
                db.execute(text("""
                    INSERT INTO users (email, full_name, hashed_password, user_type, tc_kimlik, phone, is_active, is_verified) 
                    VALUES (
                        'muratcan@koptay.av.tr', 
                        'Murat Can Koptay', 
                        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBxVzFe1p2', 
                        'individual', 
                        '16469655934', 
                        '0532 111 2233', 
                        true, 
                        true
                    )
                """))
            
            db.commit()
            print("✅ Database initialized successfully!")
            return True
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
            db.rollback()
            return False
        finally:
            db.close()

if __name__ == "__main__":
    init_database()
