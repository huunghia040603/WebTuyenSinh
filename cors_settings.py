# CORS Settings for Django
# Thêm vào settings.py trên PythonAnywhere

# Install: pip install django-cors-headers

INSTALLED_APPS = [
    # ... existing apps
    'corsheaders',
    # ... rest of apps
]

MIDDLEWARE = [
    # ... existing middleware
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5002",
    "http://localhost:5002",
    "https://timtruonghoc.pythonanywhere.com",
]

# Hoặc cho phép tất cả origins (chỉ dùng cho development)
CORS_ALLOW_ALL_ORIGINS = True

# Các headers được phép
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Các methods được phép
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]