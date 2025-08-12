# CORS Fix Instructions for PythonAnywhere

## 1. Install django-cors-headers
```bash
pip install django-cors-headers
```

## 2. Update settings.py on PythonAnywhere

Add to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps
    'corsheaders',
    # ... rest of apps
]
```

Add to MIDDLEWARE (at the top):
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]
```

Add CORS settings:
```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5002",
    "http://127.0.0.1:5002", 
    "https://timtruonghoc.pythonanywhere.com",
]

# Or for development only (allow all):
CORS_ALLOW_ALL_ORIGINS = True

# Allow headers
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

# Allow methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

## 3. Reload web app on PythonAnywhere