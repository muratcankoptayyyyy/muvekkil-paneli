"""
İyzico Payment Service
Ücretsiz test ortamında ödeme işlemleri
"""
import iyzipay
from app.core.config import settings
from typing import Dict, Any
import logging
import uuid

logger = logging.getLogger(__name__)

class PaymentService:
    """İyzico ile ödeme işlemleri"""
    
    def __init__(self):
        self.options = {
            'api_key': settings.IYZICO_API_KEY,
            'secret_key': settings.IYZICO_SECRET_KEY,
            'base_url': settings.IYZICO_BASE_URL  # Test: sandbox-api.iyzipay.com
        }
        
        # Test environment kontrolü
        self.is_test = "sandbox" in settings.IYZICO_BASE_URL
        
        if self.is_test:
            logger.info("İyzico TEST modunda çalışıyor")
    
    def create_payment(self, 
                      amount: float,
                      case_id: str,
                      user_data: Dict[str, Any],
                      card_data: Dict[str, str]) -> Dict[str, Any]:
        """
        Ödeme işlemi başlat
        
        Args:
            amount: Tutar (TL)
            case_id: Dava ID'si
            user_data: Kullanıcı bilgileri
            card_data: Kart bilgileri
        
        Returns:
            dict: Ödeme sonucu
        """
        try:
            conversation_id = f"case_{case_id}_{uuid.uuid4().hex[:8]}"
            
            request = {
                'locale': iyzipay.Locale.TR.value,
                'conversationId': conversation_id,
                'price': str(amount),
                'paidPrice': str(amount),
                'currency': iyzipay.Currency.TRY.value,
                'installment': '1',
                'basketId': f'B{case_id}',
                'paymentChannel': iyzipay.PaymentChannel.WEB.value,
                'paymentGroup': iyzipay.PaymentGroup.PRODUCT.value,
                'paymentCard': {
                    'cardHolderName': card_data['card_holder'],
                    'cardNumber': card_data['card_number'].replace(' ', ''),
                    'expireMonth': card_data['expire_month'],
                    'expireYear': card_data['expire_year'],
                    'cvc': card_data['cvc'],
                    'registerCard': '0'  # Kartı kaydetme
                },
                'buyer': {
                    'id': str(user_data['user_id'])[:11],  # Max 11 karakter
                    'name': user_data.get('first_name', 'Ad'),
                    'surname': user_data.get('last_name', 'Soyad'),
                    'gsmNumber': user_data.get('phone', '+905555555555'),
                    'email': user_data['email'],
                    'identityNumber': user_data.get('identity_number', '11111111111'),
                    'lastLoginDate': '2024-01-01 00:00:00',
                    'registrationDate': '2024-01-01 00:00:00',
                    'registrationAddress': user_data.get('address', 'Test Adres'),
                    'ip': user_data.get('ip_address', '127.0.0.1'),
                    'city': user_data.get('city', 'İstanbul'),
                    'country': 'Turkey',
                    'zipCode': user_data.get('zip_code', '34000')
                },
                'shippingAddress': {
                    'contactName': f"{user_data.get('first_name', 'Ad')} {user_data.get('last_name', 'Soyad')}",
                    'city': user_data.get('city', 'İstanbul'),
                    'country': 'Turkey',
                    'address': user_data.get('address', 'Test Adres'),
                    'zipCode': user_data.get('zip_code', '34000')
                },
                'billingAddress': {
                    'contactName': f"{user_data.get('first_name', 'Ad')} {user_data.get('last_name', 'Soyad')}",
                    'city': user_data.get('city', 'İstanbul'),
                    'country': 'Turkey',
                    'address': user_data.get('address', 'Test Adres'),
                    'zipCode': user_data.get('zip_code', '34000')
                },
                'basketItems': [
                    {
                        'id': f'BI{case_id}',
                        'name': 'Hukuki Danışmanlık Hizmeti',
                        'category1': 'Hukuk',
                        'category2': 'Danışmanlık',
                        'itemType': iyzipay.BasketItemType.VIRTUAL.value,
                        'price': str(amount)
                    }
                ]
            }
            
            # Test modunda özel değerler
            if self.is_test:
                request['buyer']['identityNumber'] = '11111111111'
                request['buyer']['gsmNumber'] = '+905555555555'
            
            payment = iyzipay.Payment().create(request, self.options)
            
            response = {
                'success': payment.status == 'success',
                'payment_id': payment.payment_id if hasattr(payment, 'payment_id') else None,
                'conversation_id': conversation_id,
                'status': payment.status,
                'error_message': payment.error_message if hasattr(payment, 'error_message') else None,
                'fraud_status': payment.fraud_status if hasattr(payment, 'fraud_status') else None,
                'amount': amount,
                'currency': 'TRY',
                'is_test': self.is_test
            }
            
            if payment.status == 'success':
                logger.info(f"Payment successful: {payment.payment_id}")
            else:
                logger.error(f"Payment failed: {payment.error_message}")
            
            return response
            
        except Exception as e:
            logger.error(f"Payment error: {str(e)}")
            return {
                'success': False,
                'error_message': f'Ödeme işlemi sırasında hata oluştu: {str(e)}',
                'is_test': self.is_test
            }
    
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Ödeme durumunu sorgula
        
        Args:
            payment_id: İyzico payment ID
            
        Returns:
            dict: Ödeme durumu
        """
        try:
            request = {
                'paymentId': payment_id,
                'locale': iyzipay.Locale.TR.value
            }
            
            payment = iyzipay.Payment().retrieve(request, self.options)
            
            return {
                'success': True,
                'status': payment.status if hasattr(payment, 'status') else 'unknown',
                'amount': payment.price if hasattr(payment, 'price') else None,
                'currency': payment.currency if hasattr(payment, 'currency') else None,
                'payment_id': payment_id
            }
            
        except Exception as e:
            logger.error(f"Payment status query error: {str(e)}")
            return {
                'success': False,
                'error_message': str(e)
            }
    
    def refund_payment(self, payment_transaction_id: str, amount: float, reason: str = "") -> Dict[str, Any]:
        """
        Ödeme iadesi (test modunda)
        
        Args:
            payment_transaction_id: İşlem ID'si
            amount: İade tutarı
            reason: İade sebebi
            
        Returns:
            dict: İade sonucu
        """
        try:
            request = {
                'paymentTransactionId': payment_transaction_id,
                'price': str(amount),
                'currency': iyzipay.Currency.TRY.value,
                'reason': reason or 'Kullanıcı talebi',
                'description': f'Müvekkil paneli iade - {reason}',
                'locale': iyzipay.Locale.TR.value
            }
            
            refund = iyzipay.Refund().create(request, self.options)
            
            return {
                'success': refund.status == 'success',
                'refund_id': refund.payment_id if hasattr(refund, 'payment_id') else None,
                'status': refund.status,
                'error_message': refund.error_message if hasattr(refund, 'error_message') else None,
                'amount': amount,
                'is_test': self.is_test
            }
            
        except Exception as e:
            logger.error(f"Refund error: {str(e)}")
            return {
                'success': False,
                'error_message': str(e),
                'is_test': self.is_test
            }
    
    @staticmethod
    def get_test_cards() -> Dict[str, Dict[str, str]]:
        """
        Test kartları bilgileri
        
        Returns:
            dict: Test kartları
        """
        return {
            'success_card': {
                'card_number': '5528790000000008',
                'expire_month': '12',
                'expire_year': '2030',
                'cvc': '123',
                'card_holder': 'Test User'
            },
            'insufficient_funds': {
                'card_number': '5406670000000009',
                'expire_month': '12',
                'expire_year': '2030',
                'cvc': '123',
                'card_holder': 'Test User'
            },
            'do_not_honor': {
                'card_number': '4111111111111129',
                'expire_month': '12',
                'expire_year': '2030',
                'cvc': '123',
                'card_holder': 'Test User'
            }
        }


# Singleton instance
payment_service = None

def get_payment_service() -> PaymentService:
    """Payment service singleton"""
    global payment_service
    if payment_service is None:
        payment_service = PaymentService()
    return payment_service