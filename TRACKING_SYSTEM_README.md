# 📊 Hệ thống Tracking Lượt Xem Trường và Ngành

## 🎯 Mục đích
Hệ thống này được thiết kế để theo dõi và thống kê lượt xem của các trường đại học và ngành học trên website, giúp hiểu rõ hơn về sự quan tâm của người dùng.

## 🏗️ Cấu trúc hệ thống

### 1. Models (models.py)
- **SchoolViewCount**: Lưu trữ lượt xem của từng trường
- **MajorViewCount**: Lưu trữ lượt xem của từng ngành
- **DailyViewStats**: Thống kê tổng hợp theo ngày

### 2. API Endpoints (views.py)
- `POST /tracking/increment-school-view/`: Tăng lượt xem trường
- `POST /tracking/increment-major-view/`: Tăng lượt xem ngành
- `GET /tracking/top-schools/`: Lấy top trường được xem nhiều nhất
- `GET /tracking/top-majors/`: Lấy top ngành được xem nhiều nhất
- `GET /tracking/statistics/`: Lấy thống kê tổng quan

### 3. Trang thống kê
- **URL**: `/thongke`
- **Template**: `templates/thongke.html`
- **Features**: 
  - Dashboard tổng quan
  - Top 10 trường được quan tâm nhất
  - Top 10 ngành được quan tâm nhất
  - Biểu đồ lượt xem 7 ngày gần nhất

## 🚀 Cách hoạt động

### Tracking tự động
1. **Khi vào trang chi tiết trường** (`/truongdaihoc/chitiet.html`):
   - Tự động gọi API `increment-school-view`
   - Tăng lượt xem cho trường đó

2. **Khi vào trang chi tiết ngành** (`/chitiet-nganh-rieng`):
   - Tự động gọi API `increment-major-view`
   - Tăng lượt xem cho ngành đó

### JavaScript Integration
- **chitiet-dh.js**: Thêm function `trackSchoolView()`
- **chitiet-nganh-rieng.js**: Thêm function `trackMajorView()`

## 📊 Dữ liệu được thu thập

### SchoolViewCount
```json
{
  "school": "ID trường",
  "view_count": "Số lượt xem",
  "last_viewed": "Lần xem cuối",
  "created_at": "Ngày tạo"
}
```

### MajorViewCount
```json
{
  "major": "ID ngành",
  "view_count": "Số lượt xem",
  "last_viewed": "Lần xem cuối",
  "created_at": "Ngày tạo"
}
```

### DailyViewStats
```json
{
  "date": "Ngày",
  "total_school_views": "Tổng lượt xem trường",
  "total_major_views": "Tổng lượt xem ngành"
}
```

## 🛠️ Cài đặt và sử dụng

### 1. Tạo bảng database
```bash
python create_tracking_tables.py
```

### 2. Khởi động server
```bash
python index.py
```

### 3. Truy cập trang thống kê
```
http://localhost:5000/thongke
```

## 📈 Tính năng trang thống kê

### Dashboard tổng quan
- Tổng lượt xem trường
- Tổng lượt xem ngành
- Tổng lượt xem
- Số ngày có dữ liệu

### Top Rankings
- **Top trường**: Hiển thị 10 trường được xem nhiều nhất
- **Top ngành**: Hiển thị 10 ngành được xem nhiều nhất
- **Ranking**: Vàng, Bạc, Đồng cho top 3

### Biểu đồ
- Biểu đồ đường thể hiện lượt xem 7 ngày gần nhất
- Phân biệt lượt xem trường và ngành
- Tự động cập nhật mỗi 5 phút

## 🔧 API Documentation

### Tăng lượt xem trường
```http
POST /tracking/increment-school-view/
Content-Type: application/json

{
  "school_id": 123
}
```

### Tăng lượt xem ngành
```http
POST /tracking/increment-major-view/
Content-Type: application/json

{
  "major_id": 456
}
```

### Lấy top trường
```http
GET /tracking/top-schools/?limit=10
```

### Lấy top ngành
```http
GET /tracking/top-majors/?limit=10
```

### Lấy thống kê tổng quan
```http
GET /tracking/statistics/
```

## 🎨 Giao diện

### Responsive Design
- Tương thích với desktop và mobile
- Grid layout cho overview cards
- Flexbox cho top rankings

### Visual Elements
- Gradient backgrounds
- Hover effects
- Loading animations
- Error handling

### Color Scheme
- Primary: #667eea (Blue)
- Secondary: #764ba2 (Purple)
- Success: #10b981 (Green)
- Warning: #f59e0b (Yellow)
- Error: #ef4444 (Red)

## 🔒 Bảo mật
- Tất cả API endpoints đều cho phép truy cập public (`AllowAny`)
- Không lưu trữ thông tin cá nhân người dùng
- Chỉ tracking lượt xem tổng hợp

## 📝 Ghi chú
- Hệ thống tự động tạo bản ghi mới khi lần đầu tracking
- Dữ liệu được cập nhật real-time
- Không có giới hạn số lượt xem
- Có thể mở rộng để thêm các metrics khác

## 🚀 Tương lai
- Thêm tracking theo thời gian thực
- Export dữ liệu ra Excel/CSV
- Thêm biểu đồ so sánh theo tháng/năm
- Tracking theo địa lý
- A/B testing cho các trang khác nhau 