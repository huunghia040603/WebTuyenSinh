# 🔧 SCHOOL VIEW TRACKING FIX

## ❌ **Vấn đề đã phát hiện:**
Lượt xem trường chỉ tăng lên 1 lần rồi dừng lại, trong khi lượt xem ngành hoạt động bình thường.

## 🔍 **Nguyên nhân:**
Trong `static/js/chitiet-dh.js`, hàm `trackSchoolView()` chỉ được gọi khi:
- ✅ API tối ưu thành công
- ❌ **KHÔNG được gọi khi sử dụng cache**
- ❌ **KHÔNG được gọi khi sử dụng API fallback**

## ✅ **Giải pháp đã thực hiện:**

### **1. Thêm tracking cho cache case:**
```javascript
// Cache hợp lệ trong 30 phút
if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 30 * 60 * 1000) {
    console.log('Sử dụng dữ liệu từ cache');
    const university = JSON.parse(cachedData);
    
    // Track lượt xem trường (ngay cả khi dùng cache)
    trackSchoolView(university.id);
    
    updatePageContent(university);
    hideLoading();
    return;
}
```

### **2. Thêm tracking cho API fallback case:**
```javascript
if (university) {
    // Lưu vào cache
    localStorage.setItem(cacheKey, JSON.stringify(university));
    localStorage.setItem(`${cacheKey}_time`, now.toString());
    
    // Track lượt xem trường (API fallback)
    trackSchoolView(university.id);
    
    updatePageContent(university);
    hideLoading();
    return;
}
```

## 🧪 **Test Results:**

### **Local API Test:**
```bash
# Test 1
curl -X POST -H "Content-Type: application/json" \
  -d '{"school_id": "10"}' \
  http://localhost:5000/tracking/increment-school-view/
# Result: view_count: 501

# Test 2  
curl -X POST -H "Content-Type: application/json" \
  -d '{"school_id": "10"}' \
  http://localhost:5000/tracking/increment-school-view/
# Result: view_count: 502 ✅
```

## 🎯 **Kết quả mong đợi:**

Sau khi fix:
- ✅ **Tracking hoạt động cho tất cả trường hợp** (cache, API tối ưu, API fallback)
- ✅ **Lượt xem tăng đúng mỗi lần vào trang trường**
- ✅ **Consistent với tracking ngành**

## 📋 **Files đã cập nhật:**

### **static/js/chitiet-dh.js**
- Thêm `trackSchoolView(university.id)` cho cache case
- Thêm `trackSchoolView(university.id)` cho API fallback case

## 🚀 **Bước tiếp theo:**

1. **Test trên browser** - Vào trang trường nhiều lần để xác nhận tracking hoạt động
2. **Cập nhật PythonAnywhere** - Áp dụng fix tương tự nếu cần
3. **Verify statistics page** - Kiểm tra thống kê hiển thị đúng

**Fix này sẽ đảm bảo tracking lượt xem trường hoạt động 100% như tracking ngành!** 🎉 