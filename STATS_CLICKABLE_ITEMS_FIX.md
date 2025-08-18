# 🖱️ STATS CLICKABLE ITEMS FIX

## 🎯 **Vấn đề đã phát hiện:**
Trong bảng thống kê, khi click vào tên trường hay ngành thì không chuyển đến trang chi tiết tương ứng.

## ✅ **Giải pháp đã thực hiện:**

### **1. Thêm class và data attributes cho tên trường:**
```javascript
// Trong loadTopSchools()
li.innerHTML = `
    <div class="rank ${rankClass}">${school.rank}</div>
    <div class="item-info ${outstandingClass}">
        <img src="${school.logo || '/static/images/logo/0.jpg'}" alt="${school.name_vn}" class="item-logo">
        <div class="item-details">
            <div class="item-name clickable" data-school-id="${school.id}" data-school-name="${school.name_vn}">
                ${school.name_vn}
                ${outstandingBadge}
            </div>
            <div class="item-school">${school.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'} • ${school.country || 'Việt Nam'}</div>
        </div>
    </div>
    <div class="item-views">
        <div class="views-number">${school.view_count.toLocaleString()}</div>
        <div class="views-label">lượt xem</div>
    </div>
`;
```

### **2. Thêm class và data attributes cho tên ngành:**
```javascript
// Trong loadTopMajors()
li.innerHTML = `
    <div class="rank ${rankClass}">${major.rank}</div>
    <div class="item-info ${itemClass}">
        <img src="${major.school_logo || '/static/images/logo/0.jpg'}" alt="${major.school_name}" class="item-logo">
        <div class="item-details">
            <div class="item-name clickable" data-major-id="${major.id}" data-major-name="${major.name}" data-school-name="${major.school_name}">
                ${major.name}
                ${badgeHtml}
            </div>
            <div class="item-school clickable" data-school-id="${major.school_id || ''}" data-school-name="${major.school_name}">
                ${major.school_name} • Mã: ${major.major_id}
            </div>
        </div>
    </div>
    <div class="item-views">
        <div class="views-number">${major.view_count.toLocaleString()}</div>
        <div class="views-label">lượt xem</div>
    </div>
`;
```

### **3. Thêm CSS cho clickable elements:**
```css
.clickable {
    cursor: pointer;
    transition: color 0.2s ease;
}

.clickable:hover {
    color: #667eea !important;
    text-decoration: underline;
}
```

### **4. Thêm event listeners cho tên trường:**
```javascript
// Thêm event listeners cho các tên trường clickable
const schoolNames = container.querySelectorAll('.item-name.clickable');
schoolNames.forEach(element => {
    element.addEventListener('click', function() {
        const schoolId = this.getAttribute('data-school-id');
        const schoolName = this.getAttribute('data-school-name');
        console.log('🖱️ Click vào trường:', schoolName, 'ID:', schoolId);
        
        if (schoolId) {
            // Chuyển đến trang chi tiết trường
            window.location.href = `/chitiet-dh?id=${schoolId}`;
        } else {
            console.warn('⚠️ Không có ID trường để chuyển hướng');
        }
    });
});
```

### **5. Thêm event listeners cho tên ngành và tên trường trong ngành:**
```javascript
// Thêm event listeners cho các tên ngành và tên trường clickable
const majorNames = container.querySelectorAll('.item-name.clickable');
const schoolNames = container.querySelectorAll('.item-school.clickable');

majorNames.forEach(element => {
    element.addEventListener('click', function() {
        const majorId = this.getAttribute('data-major-id');
        const majorName = this.getAttribute('data-major-name');
        console.log('🖱️ Click vào ngành:', majorName, 'ID:', majorId);
        
        if (majorId) {
            // Chuyển đến trang chi tiết ngành
            window.location.href = `/chitiet-nganh-rieng?id=${majorId}`;
        } else {
            console.warn('⚠️ Không có ID ngành để chuyển hướng');
        }
    });
});

schoolNames.forEach(element => {
    element.addEventListener('click', function() {
        const schoolId = this.getAttribute('data-school-id');
        const schoolName = this.getAttribute('data-school-name');
        console.log('🖱️ Click vào tên trường trong ngành:', schoolName, 'ID:', schoolId);
        
        if (schoolId) {
            // Chuyển đến trang chi tiết trường
            window.location.href = `/chitiet-dh?id=${schoolId}`;
        } else {
            console.warn('⚠️ Không có ID trường để chuyển hướng');
        }
    });
});
```

## 🔧 **Logic xử lý click:**

### **1. Click vào tên trường (Top Schools):**
- Lấy school ID từ data attribute
- Chuyển đến `/chitiet-dh?id=${schoolId}`
- Log thông tin click

### **2. Click vào tên ngành (Top Majors):**
- Lấy major ID từ data attribute
- Chuyển đến `/chitiet-nganh-rieng?id=${majorId}`
- Log thông tin click

### **3. Click vào tên trường trong ngành (Top Majors):**
- Lấy school ID từ data attribute
- Chuyển đến `/chitiet-dh?id=${schoolId}`
- Log thông tin click

### **4. Visual feedback:**
- Cursor pointer khi hover
- Màu sắc thay đổi khi hover
- Underline khi hover

## 🎯 **Kết quả mong đợi:**

### **Console logs sẽ hiển thị:**
```
🖱️ Click vào trường: Đại học Bách khoa Hà Nội ID: 1
🖱️ Click vào ngành: Công nghệ thông tin ID: 15
🖱️ Click vào tên trường trong ngành: Đại học Bách khoa Hà Nội ID: 1
```

### **Behavior mong đợi:**
- Tên trường có thể click → chuyển đến trang chi tiết trường
- Tên ngành có thể click → chuyển đến trang chi tiết ngành
- Tên trường trong ngành có thể click → chuyển đến trang chi tiết trường
- Visual feedback khi hover
- URL thay đổi theo đúng ID

## 🔄 **Các trường hợp được xử lý:**

### **1. Click tên trường trong Top Schools:**
- Chuyển đến `/chitiet-dh?id=${schoolId}`
- Hiển thị thông tin chi tiết trường

### **2. Click tên ngành trong Top Majors:**
- Chuyển đến `/chitiet-nganh-rieng?id=${majorId}`
- Hiển thị thông tin chi tiết ngành

### **3. Click tên trường trong Top Majors:**
- Chuyển đến `/chitiet-dh?id=${schoolId}`
- Hiển thị thông tin chi tiết trường

### **4. Không có ID:**
- Log warning
- Không chuyển hướng
- User có thể thử lại

**Fix này đảm bảo tên trường và ngành trong bảng thống kê có thể click để chuyển đến trang chi tiết tương ứng!** 🖱️ 