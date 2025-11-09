from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
DATABASE_URL = os.getenv("DATABASE_URL", "")

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/api/health':
            response = {'status': 'healthy'}
        elif self.path == '/api/test-db':
            try:
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM users")
                count = cur.fetchone()[0]
                cur.close()
                conn.close()
                response = {'status': 'connected', 'users': count}
            except Exception as e:
                response = {'status': 'error', 'error': str(e)}
        else:
            response = {'message': 'Koptay API'}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        if self.path == '/api/auth/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = parse_qs(post_data.decode())
            
            username = params.get('username', [''])[0]
            password = params.get('password', [''])[0]
            
            try:
                # Database connection
                conn = psycopg2.connect(DATABASE_URL)
                cur = conn.cursor()
                
                # Find user by TC
                cur.execute(
                    "SELECT id, email, full_name, hashed_password, user_type, tc_kimlik, is_active FROM users WHERE tc_kimlik = %s",
                    (username,)
                )
                user = cur.fetchone()
                cur.close()
                conn.close()
                
                if not user:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'detail': 'Kullanıcı bulunamadı'}).encode())
                    return
                
                # Verify password
                if not pwd_context.verify(password, user[3]):
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'detail': 'Şifre hatalı'}).encode())
                    return
                
                # Create token
                access_token = jwt.encode(
                    {'sub': user[1], 'exp': datetime.utcnow() + timedelta(minutes=1440)},
                    SECRET_KEY,
                    algorithm='HS256'
                )
                
                response = {
                    'access_token': access_token,
                    'token_type': 'bearer',
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'full_name': user[2],
                        'user_type': user[4],
                        'tc_kimlik': user[5],
                        'is_active': user[6]
                    }
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'detail': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
