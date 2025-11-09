"""
Encryption Service - Hassas verilerin şifrelenmesi
TC Kimlik, Vergi No, Telefon gibi verileri güvenli saklar
"""

from cryptography.fernet import Fernet
from app.core.config import settings
import base64
import hashlib

class EncryptionService:
    """Veri şifreleme servisi"""
    
    def __init__(self):
        # SECRET_KEY'den Fernet key oluştur
        # Secret key'i hash'leyip 32 byte'a çeviriyoruz
        key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        self.fernet = Fernet(base64.urlsafe_b64encode(key))
    
    def encrypt(self, data: str) -> str:
        """
        Veriyi şifrele
        
        Args:
            data: Şifrelenecek metin
            
        Returns:
            Şifrelenmiş metin (string)
        """
        if not data:
            return None
        
        encrypted = self.fernet.encrypt(data.encode())
        return encrypted.decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """
        Şifreli veriyi çöz
        
        Args:
            encrypted_data: Şifrelenmiş metin
            
        Returns:
            Orijinal metin
        """
        if not encrypted_data:
            return None
        
        try:
            decrypted = self.fernet.decrypt(encrypted_data.encode())
            return decrypted.decode()
        except Exception as e:
            # Şifre çözme hatası
            print(f"Decryption error: {e}")
            return None
    
    def encrypt_tc_kimlik(self, tc: str) -> str:
        """TC Kimlik No şifrele"""
        return self.encrypt(tc)
    
    def decrypt_tc_kimlik(self, encrypted_tc: str) -> str:
        """TC Kimlik No çöz"""
        return self.decrypt(encrypted_tc)
    
    def encrypt_tax_number(self, tax_no: str) -> str:
        """Vergi No şifrele"""
        return self.encrypt(tax_no)
    
    def decrypt_tax_number(self, encrypted_tax: str) -> str:
        """Vergi No çöz"""
        return self.decrypt(encrypted_tax)
    
    def encrypt_phone(self, phone: str) -> str:
        """Telefon şifrele"""
        return self.encrypt(phone)
    
    def decrypt_phone(self, encrypted_phone: str) -> str:
        """Telefon çöz"""
        return self.decrypt(encrypted_phone)
    
    def mask_tc_kimlik(self, tc: str) -> str:
        """
        TC Kimlik'i maskele (gösterim için)
        Örnek: 12345678901 -> ***********01
        """
        if not tc or len(tc) < 11:
            return tc
        return "*" * 9 + tc[-2:]
    
    def mask_phone(self, phone: str) -> str:
        """
        Telefon numarasını maskele
        Örnek: 05551234567 -> 0555***4567
        """
        if not phone or len(phone) < 10:
            return phone
        return phone[:4] + "***" + phone[-4:]
    
    def mask_email(self, email: str) -> str:
        """
        Email'i maskele
        Örnek: user@example.com -> u**r@example.com
        """
        if not email or "@" not in email:
            return email
        
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            return email
        
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
        return f"{masked_local}@{domain}"

# Singleton instance
encryption_service = EncryptionService()
