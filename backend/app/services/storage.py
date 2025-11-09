"""
Storage Service - Dosya yükleme/indirme/silme işlemleri
MinIO veya Supabase Storage kullanır
"""
from supabase import create_client, Client
from app.core.config import settings
import uuid
import mimetypes
from typing import Optional, BinaryIO
from datetime import datetime, timedelta
import logging
import os

logger = logging.getLogger(__name__)

# MinIO için
try:
    from minio import Minio
    from minio.error import S3Error
    MINIO_AVAILABLE = True
except ImportError:
    MINIO_AVAILABLE = False

class SupabaseStorageService:
    """Supabase Storage ile dosya yönetimi"""
    
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase credentials not configured")
            
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
    
    def upload_document(self, 
                       file_content: bytes, 
                       filename: str, 
                       case_id: str,
                       user_id: str) -> dict:
        """
        Dosyayı Supabase Storage'a yükle
        
        Args:
            file_content: Dosya içeriği (bytes)
            filename: Orijinal dosya adı
            case_id: Dava ID'si
            user_id: Yükleyen kullanıcı ID'si
        
        Returns:
            dict: {file_path, filename, size, mime_type}
        """
        try:
            # Güvenli dosya adı oluştur
            file_extension = filename.split('.')[-1] if '.' in filename else ''
            safe_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            # Klasör yapısı: cases/{case_id}/{user_id}/{filename}
            file_path = f"cases/{case_id}/{user_id}/{safe_filename}"
            
            # MIME type belirle
            mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            
            # Dosyayı yükle
            result = self.supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={
                    "content-type": mime_type,
                    "upsert": False  # Aynı isimde dosya varsa hata ver
                }
            )
            
            if hasattr(result, 'error') and result.error:
                logger.error(f"Supabase upload error: {result.error}")
                raise Exception(f"Upload failed: {result.error}")
            
            return {
                "file_path": file_path,
                "filename": safe_filename,
                "original_filename": filename,
                "size": len(file_content),
                "mime_type": mime_type
            }
            
        except Exception as e:
            logger.error(f"Document upload error: {str(e)}")
            raise Exception(f"Dosya yükleme hatası: {str(e)}")
    
    def get_download_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Dosya için güvenli indirme URL'i oluştur
        
        Args:
            file_path: Supabase'deki dosya yolu
            expires_in: URL geçerlilik süresi (saniye)
        
        Returns:
            str: İndirme URL'i
        """
        try:
            result = self.supabase.storage.from_(self.bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            if hasattr(result, 'error') and result.error:
                logger.error(f"Signed URL error: {result.error}")
                raise Exception(f"URL creation failed: {result.error}")
                
            return result.get('signedURL') or result.get('signed_url')
            
        except Exception as e:
            logger.error(f"Download URL error: {str(e)}")
            raise Exception(f"İndirme URL'i oluşturulamadı: {str(e)}")
    
    def delete_document(self, file_path: str) -> bool:
        """
        Dosyayı sil
        
        Args:
            file_path: Silinecek dosya yolu
            
        Returns:
            bool: Silme işlemi başarılı mı
        """
        try:
            result = self.supabase.storage.from_(self.bucket_name).remove([file_path])
            
            if hasattr(result, 'error') and result.error:
                logger.error(f"Delete error: {result.error}")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"Document deletion error: {str(e)}")
            return False
    
    def list_documents(self, case_id: str, user_id: str) -> list:
        """
        Kullanıcının belirli bir davadaki dosyalarını listele
        
        Args:
            case_id: Dava ID'si
            user_id: Kullanıcı ID'si
            
        Returns:
            list: Dosya listesi
        """
        try:
            folder_path = f"cases/{case_id}/{user_id}"
            result = self.supabase.storage.from_(self.bucket_name).list(folder_path)
            
            if hasattr(result, 'error') and result.error:
                logger.error(f"List error: {result.error}")
                return []
                
            return result or []
            
        except Exception as e:
            logger.error(f"Document listing error: {str(e)}")
            return []
    
    def get_storage_usage(self, user_id: str) -> dict:
        """
        Kullanıcının storage kullanımını hesapla
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            dict: {total_size, file_count}
        """
        try:
            # Tüm dosyaları listele (user_id pattern'i ile)
            result = self.supabase.storage.from_(self.bucket_name).list("cases")
            
            total_size = 0
            file_count = 0
            
            # Bu basit bir implementasyon, production'da daha optimize edilmeli
            # Gerçek uygulamada bu bilgiyi database'de tutmak daha iyi
            
            return {
                "total_size": total_size,
                "file_count": file_count,
                "limit_gb": 1  # Supabase free tier limit
            }
            
        except Exception as e:
            logger.error(f"Storage usage calculation error: {str(e)}")
            return {"total_size": 0, "file_count": 0, "limit_gb": 1}


# Singleton instance
storage_service = None

def get_storage_service() -> SupabaseStorageService:
    """Storage service singleton"""
    global storage_service
    if storage_service is None:
        if settings.STORAGE_PROVIDER == "supabase":
            storage_service = SupabaseStorageService()
        else:
            # Gelecekte MinIO service burada olabilir
            raise NotImplementedError("Only Supabase storage is implemented")
    return storage_service