# 🔄 API Switching Guide - Hướng Dẫn Chuyển Đổi API

## 🎯 Mục Đích
Hướng dẫn chuyển đổi giữa localhost (development) và PythonAnywhere (production) backend.

## 📍 Vị Trí Cần Thay Đổi

### **File: `templates/thongke.html`**
```javascript
// Dòng 374 - Thay đổi API_BASE_URL
const API_BASE_URL = 'http://localhost:5000'; // Development
// const API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'; // Production
```

## 🔄 Cách Chuyển Đổi

### **1. Development Mode (Localhost)**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```
**Sử dụng khi:**
- ✅ Testing local
- ✅ Development
- ✅ Mock data
- ✅ Flask server chạy trên port 5000

### **2. Production Mode (PythonAnywhere)**
```javascript
const API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com';
```
**Sử dụng khi:**
- ✅ Deploy production
- ✅ Real database
- ✅ PythonAnywhere backend đã sẵn sàng
- ✅ CORS đã được cấu hình

## 🚀 Quick Switch Commands

### **Chuyển sang Development:**
```bash
# Thay đổi API_BASE_URL trong templates/thongke.html
sed -i '' 's|https://timtruonghoc.pythonanywhere.com|http://localhost:5000|g' templates/thongke.html

# Start local server
python start_server.py
```

### **Chuyển sang Production:**
```bash
# Thay đổi API_BASE_URL trong templates/thongke.html
sed -i '' 's|http://localhost:5000|https://timtruonghoc.pythonanywhere.com|g' templates/thongke.html

# Deploy to PythonAnywhere
# (Upload files và restart server)
```

## 📊 Test Commands

### **Test Localhost APIs:**
```bash
# Statistics
curl http://localhost:5000/tracking/statistics/

# Top Schools
curl "http://localhost:5000/tracking/top-schools/?limit=5"

# Top Majors
curl "http://localhost:5000/tracking/top-majors/?limit=5"

# Increment View
curl -X POST -H "Content-Type: application/json" \
  -d '{"school_id": "1"}' \
  http://localhost:5000/tracking/increment-school-view/
```

### **Test PythonAnywhere APIs:**
```bash
# Statistics
curl https://timtruonghoc.pythonanywhere.com/tracking/statistics/

# Top Schools
curl "https://timtruonghoc.pythonanywhere.com/tracking/top-schools/?limit=5"

# Top Majors
curl "https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=5"

# Increment View
curl -X POST -H "Content-Type: application/json" \
  -d '{"school_id": "1"}' \
  https://timtruonghoc.pythonanywhere.com/tracking/increment-school-view/
```

## 🔍 Troubleshooting

### **Error: 500 Internal Server Error**
```javascript
// Lỗi: Failed to load resource: the server responded with a status of 500
// Nguyên nhân: Backend chưa deploy hoặc có lỗi
// Giải pháp: Chuyển về localhost để test
const API_BASE_URL = 'http://localhost:5000';
```

### **Error: CORS Policy**
```javascript
// Lỗi: Access to fetch has been blocked by CORS policy
// Nguyên nhân: CORS chưa được cấu hình trên PythonAnywhere
// Giải pháp: Cấu hình CORS trong Django settings
```

### **Error: Unexpected token '<'**
```javascript
// Lỗi: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
// Nguyên nhân: Server trả về HTML thay vì JSON
// Giải pháp: Kiểm tra backend API endpoints
```

## 📝 Current Status

### **✅ Development Ready:**
- ✅ Localhost API: `http://localhost:5000`
- ✅ Mock data: 500 lượt xem mặc định
- ✅ Real-time tracking: Tăng lượt xem khi click
- ✅ All APIs working: statistics, top-schools, top-majors

### **⏳ Production Pending:**
- ⏳ PythonAnywhere API: `https://timtruonghoc.pythonanywhere.com`
- ⏳ Django backend deployment
- ⏳ Database setup
- ⏳ CORS configuration

## 🎯 Next Steps

### **1. Test Local Development:**
```bash
# Đảm bảo đang dùng localhost
const API_BASE_URL = 'http://localhost:5000';

# Start server
python start_server.py

# Test trang thống kê
open http://localhost:5000/thongke
```

### **2. Deploy to Production:**
```bash
# 1. Upload code lên PythonAnywhere
# 2. Deploy Django tracking APIs
# 3. Test PythonAnywhere APIs
# 4. Chuyển API_BASE_URL sang production
const API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com';
```

### **3. Switch Between Environments:**
```bash
# Development
sed -i '' 's|https://timtruonghoc.pythonanywhere.com|http://localhost:5000|g' templates/thongke.html

# Production  
sed -i '' 's|http://localhost:5000|https://timtruonghoc.pythonanywhere.com|g' templates/thongke.html
```

## 📋 Checklist

### **Development Setup:**
- [ ] API_BASE_URL = 'http://localhost:5000'
- [ ] Flask server running on port 5000
- [ ] Mock data initialized (500 views each)
- [ ] All APIs responding correctly
- [ ] Frontend loading without errors

### **Production Setup:**
- [ ] Django backend deployed on PythonAnywhere
- [ ] Database models created and migrated
- [ ] CORS configured for frontend domain
- [ ] API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'
- [ ] All APIs tested and working

## 🎉 Summary

**Hiện tại đang sử dụng Development Mode với localhost:5000**
- ✅ Tất cả APIs hoạt động tốt
- ✅ Dữ liệu thật với 500 lượt xem mặc định
- ✅ Real-time tracking đã sẵn sàng
- ✅ Sẵn sàng chuyển sang Production khi cần

**Khi PythonAnywhere backend sẵn sàng, chỉ cần thay đổi 1 dòng code!** 🚀 