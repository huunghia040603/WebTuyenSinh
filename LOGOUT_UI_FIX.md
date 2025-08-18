# 🚪 LOGOUT UI FIX

## 🎯 **Vấn đề đã phát hiện:**
Sau khi bấm đăng xuất, thông tin người dùng vẫn còn hiển thị và chưa hiện lại nút đăng ký, đăng nhập. UI không được cập nhật đúng cách sau khi logout.

## ✅ **Giải pháp đã thực hiện:**

### **1. Tạo hàm updateAuthUI() trong header.html:**
```javascript
// Hàm cập nhật UI dựa trên trạng thái đăng nhập
function updateAuthUI() {
    const userData = AuthManager.getUserData();
    
    if (userData) {
        // Người dùng đã đăng nhập
        userProfileActions.style.display = 'flex';
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        
        // Cập nhật thông tin người dùng nếu có
        if (userData.first_name || userData.email) {
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = userData.first_name || userData.email;
            }
        }
    } else {
        // Người dùng chưa đăng nhập
        userProfileActions.style.display = 'none';
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
    }
}
```

### **2. Cải thiện AuthManager.getUserData():**
```javascript
getUserData: () => {
    // Thử lấy từ nhiều nguồn khác nhau
    let userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        userData = JSON.parse(localStorage.getItem('user_data'));
    }
    if (!userData) {
        userData = JSON.parse(localStorage.getItem('access_token'));
    }
    return userData;
}
```

### **3. Cải thiện AuthManager.clearUserData():**
```javascript
clearUserData: () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('accessToken');
}
```

### **4. Cập nhật AutoLogin.logout():**
```javascript
async logout() {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('userData');
    
    // Reset chat state
    this.resetChatState();
    
    console.log('🚪 Đã đăng xuất');
    
    // Cập nhật UI ngay lập tức nếu có hàm updateAuthUI
    if (window.updateAuthUI && typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
    }
    
    // Nếu đang ở trang /account thì chuyển về trang chủ
    if (window.location.pathname === '/account') {
        window.location.href = '/';
    } else {
        window.location.reload();
    }
}
```

### **5. Cập nhật logic logout trong header.html:**
```javascript
logoutBtn.addEventListener('click', () => {
    // Sử dụng AutoLogin.logout() để có logic chuyển hướng đúng
    if (window.AutoLogin && typeof window.AutoLogin.logout === 'function') {
        window.AutoLogin.logout();
    } else {
        // Fallback nếu AutoLogin không có sẵn
        AuthManager.clearUserData();
        
        // Reset chat state before reload
        if (window.AutoLogin && typeof window.AutoLogin.resetChatState === 'function') {
            window.AutoLogin.resetChatState();
        } else if (typeof resetChatState === 'function') {
            resetChatState();
        }
        
        // Cập nhật UI ngay lập tức
        updateAuthUI();
        
        // Nếu đang ở trang /account thì chuyển về trang chủ
        if (window.location.pathname === '/account') {
            window.location.href = '/';
        } else {
            window.location.reload();
        }
    }
});
```

## 🔧 **Logic hoạt động:**

### **Khi bấm đăng xuất:**
1. **Clear dữ liệu**: Xóa tất cả token và user data khỏi localStorage
2. **Reset chat state**: Đóng modal chat, reset notification badge
3. **Cập nhật UI ngay lập tức**: Gọi `updateAuthUI()` để ẩn thông tin user và hiện nút đăng nhập/đăng ký
4. **Chuyển hướng**: Chuyển về trang chủ nếu đang ở `/account`, hoặc reload trang hiện tại

### **Hàm updateAuthUI():**
- **Nếu có userData**: Hiển thị user profile, ẩn nút đăng nhập/đăng ký
- **Nếu không có userData**: Ẩn user profile, hiển thị nút đăng nhập/đăng ký

## 🎯 **Kết quả mong đợi:**
- ✅ Khi bấm đăng xuất → UI cập nhật ngay lập tức
- ✅ Thông tin người dùng biến mất
- ✅ Nút đăng nhập/đăng ký hiện lại
- ✅ Nếu đang ở `/account` → Chuyển về trang chủ `/`
- ✅ Nếu ở trang khác → Reload trang hiện tại
- ✅ Clear tất cả dữ liệu người dùng

## 🔄 **Các dữ liệu được xóa:**
- `userData`
- `user_data`
- `access_token`
- `refresh_token`
- `accessToken`

**Tính năng này đảm bảo UI được cập nhật đúng cách sau khi logout!** 🎉 