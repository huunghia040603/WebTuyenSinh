# apptimtruonghoc/utils.py

from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string

def get_tokens_for_user(user):
    """
    Tạo và trả về cặp access và refresh token cho người dùng.
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def generate_random_password(length=12):
    """
    Tạo một mật khẩu ngẫu nhiên.
    """
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(characters) for i in range(length))
    return password

def register_social_user(provider, user_id, email, name, user_photo):
    """
    Đăng ký hoặc đăng nhập người dùng thông qua social.
    """
    print(f"register_social_user called with: provider={provider}, user_id={user_id}, email={email}, name={name}")
    
    try:
        user = User.objects.get(email=email)
        print(f"User found: {user.email}")
        # Người dùng đã tồn tại, trả về token của họ
        tokens = get_tokens_for_user(user)
        print(f"Tokens generated: {tokens}")
        return {
            'email': user.email or '',
            'tokens': tokens,
            'role': user.role or 'regular_user',
            'id': user.id,
            'date_of_birth': str(user.date_of_birth) if user.date_of_birth else '',
            'living_place': user.living_place or '',
            'user_photo': user.user_photo or '',
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'sex': user.sex or '',
        }
        print(f"Returning result for existing user: {result}")
        return result
    except User.DoesNotExist:
        # Người dùng chưa tồn tại, tạo tài khoản mới
        print(f"User not found, creating new user...")
        
        if len(name.split()) > 1:
            first_name = name.split()[0]
            last_name = ' '.join(name.split()[1:])
        else:
            first_name = name
            last_name = ''

        password = generate_random_password()
        print(f"Generated password for new user")

        # SỬA LỖI Ở ĐÂY: Thêm trường username
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            # Thêm trường username. Sử dụng email làm username
            username=email,
            role='regular_user'
            # Bạn cũng có thể dùng user_id của Google làm username để đảm bảo duy nhất
            # username=f'{provider}_{user_id}',
        )
        print(f"New user created: {user.email}")
        
        if user_photo:
            user.user_photo = user_photo
            user.is_active = True
            user.save()
            print(f"User photo updated: {user_photo}")

        tokens = get_tokens_for_user(user)
        print(f"Tokens generated for new user: {tokens}")

        result = {
            'email': user.email or '',
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'tokens': tokens,
            'role': user.role or 'regular_user',
            'id': user.id,
            'date_of_birth': str(user.date_of_birth) if user.date_of_birth else '',
            'living_place': user.living_place or '',
            'user_photo': user.user_photo or '',
            'sex': user.sex or '',
        }
        print(f"Returning result: {result}")
        return result