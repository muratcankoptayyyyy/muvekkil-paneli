# Demo Test Script
# Bu script yerel geliştirme ortamında temel fonksiyonları test eder

import asyncio
import requests
import json
from datetime import datetime

# Test configuration
API_BASE = "http://localhost:8000"
TEST_USER = {
    "email": "demo@koptay.com",
    "password": "DemoPassword123",
    "full_name": "Demo Kullanıcı",
    "user_type": "individual"
}

async def test_api_endpoints():
    """API endpoint'lerini test et"""
    
    print("🧪 Koptay Müvekkil Paneli - API Test Başlatılıyor...")
    print(f"📍 API Base URL: {API_BASE}")
    print("-" * 50)
    
    # 1. Health Check
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ Health Check: OK")
        else:
            print("❌ Health Check: FAIL")
    except Exception as e:
        print(f"❌ Health Check Error: {e}")
    
    # 2. User Registration
    try:
        response = requests.post(
            f"{API_BASE}/api/auth/register",
            json=TEST_USER
        )
        if response.status_code == 201:
            print("✅ User Registration: OK")
            user_data = response.json()
        else:
            print(f"❌ User Registration: FAIL ({response.status_code})")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ User Registration Error: {e}")
        return
    
    # 3. User Login
    try:
        login_data = {
            "username": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        response = requests.post(
            f"{API_BASE}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            print("✅ User Login: OK")
            token_data = response.json()
            access_token = token_data["access_token"]
        else:
            print(f"❌ User Login: FAIL ({response.status_code})")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ User Login Error: {e}")
        return
    
    # Auth header for subsequent requests
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    
    # 4. Get Current User
    try:
        response = requests.get(
            f"{API_BASE}/api/auth/me",
            headers=auth_headers
        )
        if response.status_code == 200:
            print("✅ Get Current User: OK")
        else:
            print(f"❌ Get Current User: FAIL ({response.status_code})")
    except Exception as e:
        print(f"❌ Get Current User Error: {e}")
    
    # 5. Create Case
    try:
        case_data = {
            "title": "Demo Dava",
            "description": "Test amaçlı oluşturulan demo dava",
            "case_type": "medeni",
            "priority": "medium"
        }
        response = requests.post(
            f"{API_BASE}/api/cases/",
            json=case_data,
            headers=auth_headers
        )
        if response.status_code == 201:
            print("✅ Create Case: OK")
            case_data = response.json()
            case_id = case_data["id"]
        else:
            print(f"❌ Create Case: FAIL ({response.status_code})")
            print(f"Response: {response.text}")
            case_id = None
    except Exception as e:
        print(f"❌ Create Case Error: {e}")
        case_id = None
    
    # 6. Get Cases
    try:
        response = requests.get(
            f"{API_BASE}/api/cases/",
            headers=auth_headers
        )
        if response.status_code == 200:
            print("✅ Get Cases: OK")
            cases = response.json()
            print(f"   📁 Toplam dava sayısı: {len(cases)}")
        else:
            print(f"❌ Get Cases: FAIL ({response.status_code})")
    except Exception as e:
        print(f"❌ Get Cases Error: {e}")
    
    # 7. Test Payment Cards Info
    try:
        response = requests.get(
            f"{API_BASE}/api/payments/test-cards",
            headers=auth_headers
        )
        if response.status_code == 200:
            print("✅ Test Payment Cards: OK")
            cards = response.json()
            print(f"   💳 Test kartları mevcut: {len(cards)} adet")
        else:
            print(f"❌ Test Payment Cards: FAIL ({response.status_code})")
    except Exception as e:
        print(f"❌ Test Payment Cards Error: {e}")
    
    print("-" * 50)
    print("🎉 Test tamamlandı!")
    print("\n📋 Sonraki adımlar:")
    print("1. Frontend'i başlatın: cd frontend && npm run dev")
    print("2. http://localhost:5173 adresinden test edin")
    print("3. Demo kullanıcı ile giriş yapın:")
    print(f"   Email: {TEST_USER['email']}")
    print(f"   Password: {TEST_USER['password']}")
    
    # Test kartı bilgileri
    print("\n💳 Test kartı bilgileri:")
    print("   Kart No: 5528790000000008")
    print("   CVV: 123")
    print("   Tarih: 12/2030")
    print("   Ad: Test User")

if __name__ == "__main__":
    print("⚡ Demo test başlatılıyor...")
    print("⚠️  Not: Backend'in çalıştığından emin olun (uvicorn main:app --reload)")
    print()
    
    asyncio.run(test_api_endpoints())