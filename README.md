# WebTuyenSinh - Hệ Thống Tư Vấn Hướng Nghiệp

Hệ thống web tư vấn hướng nghiệp với tính năng thống kê trường và ngành được quan tâm nhất.

## 🚀 Tính Năng Chính

- 📊 **Dashboard thống kê** với biểu đồ real-time
- 🏆 **Top trường và ngành** được quan tâm nhất
- 📈 **Tracking system** theo dõi lượt xem
- 🎨 **Modern UI** với Chart.js
- 📱 **Responsive design** cho mọi thiết bị

## 🛠️ Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd WebTuyenSinh
```

### 2. Tạo Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# hoặc
venv\Scripts\activate     # Windows
```

### 3. Cài Đặt Dependencies

#### Development (khuyến nghị)
```bash
pip install -r requirements-dev.txt
```

#### Production
```bash
pip install -r requirements-prod.txt
```

#### Chỉ cài core dependencies
```bash
pip install -r requirements.txt
```

## 🚀 Chạy Ứng Dụng

### Development Server
```bash
python start_server.py
```

### Hoặc chạy trực tiếp
```bash
python index.py
```

### Production Server (với gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 index:app
```

## 🌐 Truy Cập

- **Trang chủ**: http://localhost:5000
- **Thống kê**: http://localhost:5000/thongke
- **Test API**: http://localhost:5000/test-thongke

## 📊 API Endpoints

### Tracking System
- `GET /tracking/statistics/` - Thống kê tổng quan
- `GET /tracking/top-schools/?limit=10` - Top trường
- `GET /tracking/top-majors/?limit=10` - Top ngành
- `POST /tracking/increment-school-view/` - Tăng lượt xem trường
- `POST /tracking/increment-major-view/` - Tăng lượt xem ngành

### Test API
```bash
# Test statistics
curl http://localhost:5000/tracking/statistics/

# Test top schools
curl http://localhost:5000/tracking/top-schools/?limit=5

# Test top majors
curl http://localhost:5000/tracking/top-majors/?limit=5
```

## 🏗️ Cấu Trúc Dự Án

```
WebTuyenSinh/
├── static/
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   ├── images/       # Images và assets
│   └── mp3/          # Audio files
├── templates/        # HTML templates
├── index.py          # Flask app chính
├── start_server.py   # Script khởi động server
├── requirements.txt  # Core dependencies
├── requirements-dev.txt  # Development dependencies
└── requirements-prod.txt # Production dependencies
```

## 🔧 Cấu Hình

### Environment Variables (optional)
Tạo file `.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
HOST=0.0.0.0
```

### CORS Configuration
CORS đã được cấu hình cho:
- `http://localhost:5000`
- `http://127.0.0.1:5000`

## 🧪 Testing

### Chạy tests
```bash
pytest
```

### Test coverage
```bash
pytest --cov=.
```

## 📦 Deployment

### PythonAnywhere
1. Upload code lên PythonAnywhere
2. Cài đặt dependencies: `pip install -r requirements-prod.txt`
3. Cấu hình WSGI file
4. Restart web app

### Local Production
```bash
pip install -r requirements-prod.txt
gunicorn -w 4 -b 0.0.0.0:5000 index:app
```

## 🐛 Troubleshooting

### Port 5000 bị chiếm (macOS)
```bash
# Tắt AirPlay Receiver
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.airplay.receiver.plist

# Hoặc kill process
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
- Đảm bảo `flask-cors` đã được cài đặt
- Kiểm tra CORS configuration trong `index.py`

### ModuleNotFoundError
```bash
# Kích hoạt virtual environment
source venv/bin/activate

# Cài đặt lại dependencies
pip install -r requirements.txt
```

## 📝 Changelog

### v1.0.0
- ✅ Tracking system cho trường và ngành
- ✅ Dashboard thống kê với Chart.js
- ✅ CORS support
- ✅ Mock API endpoints
- ✅ Responsive design

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub. 