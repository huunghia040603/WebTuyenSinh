# Backend Changes Summary

## Recent Changes (Latest)

### 1. **Trang Chi Tiết Ngành Riêng** (NEW)
- **File**: `templates/chitiet-nganh-rieng.html`
- **JavaScript**: `static/js/chitiet-nganh-rieng.js`
- **Route**: `index.py` - `/chitiet-nganh-rieng`
- **Mục đích**: Tạo trang chi tiết riêng cho ngành đào tạo của từng trường, thay vì phải chuyển qua trang chi tiết ngành chung

#### **Tính năng chính:**
- **Kết hợp dữ liệu**: Hiển thị cả thông tin ngành chung và ngành riêng của trường
- **Giao diện tương tự**: Thiết kế giống `chitiet-nganhchung.html` nhưng có logo trường và đặc điểm riêng
- **Thông tin trường**: Logo, tên trường, loại trường (công lập/ngoài công lập)
- **Học phí chính xác**: Ưu tiên học phí ngành riêng, fallback về học phí trường
- **Tags đặc biệt**: Hiển thị tags cho ngành chất lượng cao, nổi bật, chuyên nghiệp
- **Trường liên quan**: Hiển thị các trường khác có đào tạo ngành này

#### **Cấu trúc dữ liệu:**
```javascript
// URL Parameters
?major_id=123&school_short_code=DHQGHN

// Data Sources
- Major details: /majors/{id}/
- School info: /schools/by_short_code/{short_code}/
- General major: /all_major/?all_major_id={base_id}
- Related schools: /all_major/schools_by_major_id/?all_major_id={base_id}
```

#### **Cập nhật liên quan:**
- **`static/js/chitiet-dh.js`**: Thay đổi link click major card từ `/nganh/{id}` thành `/chitiet-nganh-rieng?major_id={id}&school_short_code={code}`
- **Format học phí**: Thêm từ "Khoảng" khi min = max trong modal và trang chi tiết

### 2. **Cải thiện Format Học Phí** (Updated)
- **File**: `static/js/chitiet-dh.js`
- **Thay đổi**: Thêm từ "Khoảng" khi min_tuition_fee_per_year = max_tuition_fee_per_year
- **Ví dụ**: "25 triệu/năm" → "Khoảng 25 triệu/năm"
- **Áp dụng**: Cả trong modal và trang chi tiết ngành riêng

### 3. **Cập nhật Modal Học Phí** (Fixed)
- **File**: `static/js/chitiet-dh.js`
- **Vấn đề**: Hiển thị sai format "300596000 triệu/năm"
- **Giải pháp**: Sử dụng hàm `formatCurrency()` để chuyển đổi thành "300.6 triệu/năm"
- **Áp dụng**: Trong hàm `showMajorModal()`

## Previous Changes

### 1. **SchoolViewSet.by_short_code** (Added)
- **File**: `views.py`
- **Purpose**: API tối ưu để lấy chi tiết 1 trường theo short_code
- **Endpoint**: `/schools/by_short_code/{short_code}/`
- **Optimization**: Sử dụng `.only()` để chỉ lấy trường cần thiết
- **Cache**: 15 phút với `@method_decorator(cache_page(60*15))`

### 2. **SchoolViewSet.all_majors** (Added)
- **File**: `views.py`
- **Purpose**: Trả về toàn bộ danh sách ngành của trường (không phân trang)
- **Endpoint**: `/schools/{id}/all_majors/`
- **Usage**: Để tải tất cả ngành 1 lần cho client-side search/pagination

### 3. **Cache cho SchoolViewSet.majors** (Added)
- **File**: `views.py`
- **Purpose**: Cache 10 phút cho action majors
- **Implementation**: `@method_decorator(cache_page(60*10))`

### 4. **Frontend Optimizations** (Updated)
- **File**: `static/js/chitiet-dh.js`
- **Changes**:
  - Lazy loading cho majors (500ms delay)
  - Client-side caching với localStorage (30 min cho university, 15 min cho majors)
  - Load tất cả majors 1 lần cho search/filter/pagination
  - Cập nhật search stats chính xác

### 5. **SchoolOptimizedSerializer** (Confirmed)
- **File**: `serializers.py`
- **Fields**: Đã xác nhận đúng với `.only()` query
- **Usage**: Cho API `by_short_code` để tối ưu performance

## Deployment Notes

### **Cần deploy lên PythonAnywhere:**
1. **Thêm route mới**: `/chitiet-nganh-rieng` trong `index.py`
2. **Tạo file template**: `templates/chitiet-nganh-rieng.html`
3. **Tạo file JavaScript**: `static/js/chitiet-nganh-rieng.js`
4. **Cập nhật link**: Trong `static/js/chitiet-dh.js` (đã thay đổi)

### **Backend APIs đã có sẵn:**
- ✅ `/schools/by_short_code/{short_code}/`
- ✅ `/majors/{id}/`
- ✅ `/all_major/?all_major_id={id}`
- ✅ `/all_major/schools_by_major_id/?all_major_id={id}`

### **Performance Benefits:**
- **UX**: Người dùng thấy thông tin trường ngay lập tức, tìm kiếm ngành mượt mà
- **Speed**: Cache và lazy loading giảm thời gian chờ
- **Accuracy**: Học phí hiển thị chính xác với format đúng
- **Navigation**: Không cần chuyển qua trang ngành chung, có trang riêng cho từng trường 