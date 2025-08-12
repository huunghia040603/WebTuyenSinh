# 🚀 Hướng dẫn sử dụng nhanh - Hệ thống Tracking

## ✅ Đã hoàn thành và test thành công!

### 🎯 Tính năng đã hoạt động:
- ✅ API tracking lượt xem trường và ngành
- ✅ Trang thống kê đẹp mắt với biểu đồ
- ✅ Mock data cho testing
- ✅ Responsive design
- ✅ Real-time updates

## 🚀 Cách sử dụng:

### 1. Khởi động server
```bash
cd /Users/huunghiakhach/Documents/GitHub/WebTuyenSinh
source venv/bin/activate
python index.py
```

### 2. Truy cập trang thống kê
```
http://localhost:5000/thongke
```

### 3. Test API (tùy chọn)
```bash
python test_tracking_api.py
```

## 📊 Trang thống kê bao gồm:

### Dashboard tổng quan:
- 📈 Tổng lượt xem trường: **1,500+**
- 📈 Tổng lượt xem ngành: **800+**
- 📈 Tổng lượt xem: **2,300+**
- 📅 Số ngày có dữ liệu: **7 ngày**

### Top Rankings:
- 🥇 **Đại học Bách khoa TP.HCM** - 1,500 lượt xem
- 🥈 **Đại học Kinh tế TP.HCM** - 1,200 lượt xem  
- 🥉 **Đại học Sư phạm TP.HCM** - 1,000 lượt xem

### Top Ngành:
- 🥇 **Khoa học máy tính** - 800 lượt xem
- 🥈 **Quản trị kinh doanh** - 700 lượt xem
- 🥉 **Giáo dục tiểu học** - 600 lượt xem

### Biểu đồ:
- 📈 Biểu đồ đường 7 ngày gần nhất
- 🎨 3 màu phân biệt: Trường, Ngành, Tổng
- 🔄 Tự động cập nhật mỗi 5 phút

## 🔧 API Endpoints:

### Tracking:
- `POST /tracking/increment-school-view/` - Tăng lượt xem trường
- `POST /tracking/increment-major-view/` - Tăng lượt xem ngành

### Thống kê:
- `GET /tracking/statistics/` - Thống kê tổng quan
- `GET /tracking/top-schools/` - Top trường
- `GET /tracking/top-majors/` - Top ngành

## 🎨 Giao diện:

### Desktop:
- Grid layout cho overview cards
- Side-by-side rankings
- Full-width chart

### Mobile:
- Stack layout cho cards
- Vertical rankings
- Responsive chart

## 🔄 Tự động tracking:

### Khi vào trang chi tiết trường:
```javascript
// Tự động gọi API
trackSchoolView(schoolId);
```

### Khi vào trang chi tiết ngành:
```javascript
// Tự động gọi API  
trackMajorView(majorId);
```

## 📱 Navigation:
- Menu Desktop: **Liên hệ > 📊 Thống kê**
- Menu Mobile: **Liên hệ > 📊 Thống kê**

## 🎯 Kết quả test:
```
✅ API increment school view: 200 OK
✅ API increment major view: 200 OK  
✅ API statistics: 200 OK
✅ API top schools: 200 OK
✅ API top majors: 200 OK
```

## 🚀 Sẵn sàng sử dụng!

Hệ thống đã hoàn toàn hoạt động và sẵn sàng để:
- 📊 Theo dõi lượt xem real-time
- 🏆 Hiển thị rankings
- 📈 Phân tích xu hướng
- 📱 Responsive trên mọi thiết bị

**Truy cập ngay:** `http://localhost:5000/thongke` 🎉 