# 🔗 STATS URL FIX

## 🎯 **Vấn đề đã phát hiện:**
Các link trong bảng thống kê không đúng format URL thực tế:
- Link trường mẫu: `http://127.0.0.1:5000/rmit` (sử dụng short_code)
- Link ngành riêng: `http://127.0.0.1:5000/chitiet-nganh-rieng?major_id=7340301&school_short_code=RMIT`

## ✅ **Giải pháp đã thực hiện:**

### **1. Cập nhật data attributes cho trường:**
```javascript
// Thêm data-school-short-code
<div class="item-name clickable" data-school-id="${school.id}" data-school-name="${school.name_vn}" data-school-short-code="${school.short_code || ''}">
    ${school.name_vn}
    ${outstandingBadge}
</div>
```

### **2. Cập nhật data attributes cho ngành:**
```javascript
// Thêm data-school-short-code và sử dụng major_id thay vì id
<div class="item-name clickable" data-major-id="${major.major_id}" data-major-name="${major.name}" data-school-name="${major.school_name}" data-school-short-code="${major.school_short_code || ''}">
    ${major.name}
    ${badgeHtml}
</div>
<div class="item-school clickable" data-school-id="${major.school_id || ''}" data-school-name="${major.school_name}" data-school-short-code="${major.school_short_code || ''}">
    ${major.school_name} • Mã: ${major.major_id}
</div>
```

### **3. Cập nhật logic chuyển hướng cho trường:**
```javascript
element.addEventListener('click', function() {
    const schoolId = this.getAttribute('data-school-id');
    const schoolName = this.getAttribute('data-school-name');
    const schoolShortCode = this.getAttribute('data-school-short-code');
    console.log('🖱️ Click vào trường:', schoolName, 'ID:', schoolId, 'Short Code:', schoolShortCode);
    
    if (schoolShortCode) {
        // Chuyển đến trang chi tiết trường sử dụng short code
        window.location.href = `/${schoolShortCode}`;
    } else if (schoolId) {
        // Fallback: sử dụng ID nếu không có short code
        window.location.href = `/chitiet-dh?id=${schoolId}`;
    } else {
        console.warn('⚠️ Không có ID hoặc short code trường để chuyển hướng');
    }
});
```

### **4. Cập nhật logic chuyển hướng cho ngành:**
```javascript
element.addEventListener('click', function() {
    const majorId = this.getAttribute('data-major-id');
    const majorName = this.getAttribute('data-major-name');
    const schoolShortCode = this.getAttribute('data-school-short-code');
    console.log('🖱️ Click vào ngành:', majorName, 'Major ID:', majorId, 'School Short Code:', schoolShortCode);
    
    if (majorId && schoolShortCode) {
        // Chuyển đến trang chi tiết ngành sử dụng major_id và school_short_code
        window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
    } else if (majorId) {
        // Fallback: chỉ sử dụng major_id
        window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}`;
    } else {
        console.warn('⚠️ Không có major_id hoặc school_short_code để chuyển hướng');
    }
});
```

### **5. Cập nhật logic chuyển hướng cho tên trường trong ngành:**
```javascript
element.addEventListener('click', function() {
    const schoolId = this.getAttribute('data-school-id');
    const schoolName = this.getAttribute('data-school-name');
    const schoolShortCode = this.getAttribute('data-school-short-code');
    console.log('🖱️ Click vào tên trường trong ngành:', schoolName, 'ID:', schoolId, 'Short Code:', schoolShortCode);
    
    if (schoolShortCode) {
        // Chuyển đến trang chi tiết trường sử dụng short code
        window.location.href = `/${schoolShortCode}`;
    } else if (schoolId) {
        // Fallback: sử dụng ID nếu không có short code
        window.location.href = `/chitiet-dh?id=${schoolId}`;
    } else {
        console.warn('⚠️ Không có ID hoặc short code trường để chuyển hướng');
    }
});
```

## 🔧 **Logic chuyển hướng mới:**

### **1. Click tên trường (Top Schools):**
- **Ưu tiên:** `/${schoolShortCode}` (ví dụ: `/rmit`)
- **Fallback:** `/chitiet-dh?id=${schoolId}`

### **2. Click tên ngành (Top Majors):**
- **Ưu tiên:** `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`
- **Fallback:** `/chitiet-nganh-rieng?major_id=${majorId}`

### **3. Click tên trường trong ngành (Top Majors):**
- **Ưu tiên:** `/${schoolShortCode}` (ví dụ: `/rmit`)
- **Fallback:** `/chitiet-dh?id=${schoolId}`

## 🎯 **Kết quả mong đợi:**

### **Console logs sẽ hiển thị:**
```
🖱️ Click vào trường: RMIT University ID: 1 Short Code: rmit
🖱️ Click vào ngành: Công nghệ thông tin Major ID: 7340301 School Short Code: RMIT
🖱️ Click vào tên trường trong ngành: RMIT University ID: 1 Short Code: rmit
```

### **URLs sẽ được tạo:**
```
// Click tên trường
http://127.0.0.1:5000/rmit

// Click tên ngành
http://127.0.0.1:5000/chitiet-nganh-rieng?major_id=7340301&school_short_code=RMIT

// Click tên trường trong ngành
http://127.0.0.1:5000/rmit
```

## 🔄 **Các trường hợp được xử lý:**

### **1. Có đầy đủ thông tin:**
- Sử dụng short_code cho trường
- Sử dụng major_id + school_short_code cho ngành
- URL đúng format

### **2. Thiếu short_code:**
- Fallback về ID cho trường
- Fallback về chỉ major_id cho ngành
- Vẫn hoạt động được

### **3. Không có thông tin:**
- Log warning
- Không chuyển hướng
- User có thể thử lại

**Fix này đảm bảo các link trong bảng thống kê sử dụng đúng format URL thực tế!** 🔗 