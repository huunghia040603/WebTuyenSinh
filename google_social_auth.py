# # apptimtruonghoc/google_social_auth.py
# from google.auth.transport import requests
# from google.oauth2 import id_token
# import logging

# logger = logging.getLogger(__name__)

# class Google:
#     @staticmethod
#     def validate(auth_token):
#         try:
#             idinfo = id_token.verify_oauth2_token(
#                 auth_token,
#                 requests.Request())


#             # In ra để xem kết quả
#             logger.info(f"ID Token verification successful. User data: {idinfo}")

#             if 'accounts.google.com' in idinfo['iss']:
#                 return idinfo

#         except Exception as e:
#             # In ra lỗi cụ thể
#             logger.error(f"Error validating Google ID Token: {e}")
#             return "The token is either invalid or has expired"


# File: google.py (ví dụ)
from google.oauth2 import id_token
from google.auth.transport import requests


GOOGLE_CLIENT_ID='875195545395-kh54279ju4pea3h5n1b85uj3hohn0aih.apps.googleusercontent.com'


class Google:
    @staticmethod
    def validate(auth_token):
        try:
            print(f"🔍 Validating token with client ID: {GOOGLE_CLIENT_ID}")
            print(f"📏 Token length: {len(auth_token)}")
            print(f"🔑 Token starts with: {auth_token[:50]}...")
            print(f"🔑 Token ends with: ...{auth_token[-20:]}")
            
            # Kiểm tra token format
            if not auth_token or len(auth_token) < 100:
                raise ValueError("Token format invalid - too short")
            
            # Hàm này sẽ tự động xác minh và giải mã token.
            # Nếu token hết hạn hoặc không hợp lệ, nó sẽ ném ra ValueError.
            idinfo = id_token.verify_oauth2_token(
                auth_token,
                requests.Request(),
                GOOGLE_CLIENT_ID
            )
            
            # Kiểm tra thêm các trường quan trọng
            print(f"✅ Token validation successful!")
            print(f"📧 Email: {idinfo.get('email', 'N/A')}")
            print(f"👤 Name: {idinfo.get('name', 'N/A')}")
            print(f"🆔 Sub: {idinfo.get('sub', 'N/A')}")
            print(f"🎯 Aud: {idinfo.get('aud', 'N/A')}")
            print(f"⏰ Exp: {idinfo.get('exp', 'N/A')}")
            print(f"🌐 Iss: {idinfo.get('iss', 'N/A')}")
            
            # Kiểm tra client ID
            if idinfo.get('aud') != GOOGLE_CLIENT_ID:
                raise ValueError(f"Client ID mismatch. Expected: {GOOGLE_CLIENT_ID}, Got: {idinfo.get('aud')}")
            
            return idinfo
            
        except ValueError as e:
            # Xử lý trường hợp token không hợp lệ hoặc hết hạn.
            print(f"❌ Token validation error: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            raise ValueError(f"Token validation failed: {str(e)}")
        except Exception as e:
            # Xử lý các lỗi khác
            print(f"❌ Unexpected error: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            raise ValueError(f"Token validation failed: {str(e)}")