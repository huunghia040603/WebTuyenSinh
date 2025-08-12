// Auto Login Script for Testing
class AutoLogin {
    constructor() {
        this.baseUrl = 'https://timtruonghoc.pythonanywhere.com';
        this.testCredentials = {
            email: 'test@example.com',
            password: '123456'
        };
    }

    async login() {
        try {
            console.log('🔄 Đang đăng nhập tự động...');
            
            const response = await fetch(`${this.baseUrl}/auth/simple-login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.testCredentials)
            });

            if (response.ok) {
                const data = await response.json();
                
                // Lưu tokens
                localStorage.setItem('access_token', data.tokens.access);
                localStorage.setItem('refresh_token', data.tokens.refresh);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                
                console.log('✅ Đăng nhập thành công!');
                console.log('👤 User:', data.user);
                console.log('🔑 Access Token:', data.tokens.access.substring(0, 50) + '...');
                
                // Reload page để cập nhật trạng thái
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
                return true;
            } else {
                const errorData = await response.json();
                console.error('❌ Đăng nhập thất bại:', errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ Lỗi đăng nhập:', error);
            return false;
        }
    }

    async logout() {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        // Reset chat state
        this.resetChatState();
        
        console.log('🚪 Đã đăng xuất');
        
        // Nếu đang ở trang /account thì chuyển về trang chủ
        if (window.location.pathname === '/account') {
            window.location.href = '/';
        } else {
            window.location.reload();
        }
    }
    
    resetChatState() {
        // Close chat modal if open
        const chatModal = document.getElementById('chatModalOverlay');
        if (chatModal) {
            chatModal.remove();
        }
        
        // Close login prompt if open
        const loginPrompt = document.getElementById('loginPromptOverlay');
        if (loginPrompt) {
            loginPrompt.remove();
        }
        
        // Reset chat notification badge
        const badge = document.getElementById('chatNotificationBadge');
        if (badge) {
            badge.style.display = 'none';
            badge.classList.remove('chat-badge-switch', 'urgent', 'has-new-message');
        }
        
        // Reset chat button effects
        const chatBtn = document.getElementById('chatBtn');
        const chatIcon = document.getElementById('chatIcon');
        if (chatBtn) {
            chatBtn.classList.remove('chat-btn-glow', 'has-unread');
        }
        if (chatIcon) {
            chatIcon.classList.remove('chat-icon-switch', 'has-unread');
        }
        
        // Clear chat data
        if (window.currentChatModal) {
            window.currentChatModal = null;
        }
        
        console.log('🔄 Đã reset trạng thái chat');
    }

    checkLoginStatus() {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
            console.log('✅ Đã đăng nhập');
            console.log('👤 User:', JSON.parse(userData));
            return true;
        } else {
            console.log('❌ Chưa đăng nhập');
            return false;
        }
    }
}

// Tạo instance global
window.AutoLogin = new AutoLogin();

// Auto-login nếu chưa đăng nhập (chỉ trong development)
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    setTimeout(() => {
        if (!window.AutoLogin.checkLoginStatus()) {
            console.log('🔄 Tự động đăng nhập...');
            window.AutoLogin.login();
        }
    }, 2000);
}

// Thêm event listener để tự động đăng nhập khi AuthHelper báo lỗi
window.addEventListener('DOMContentLoaded', () => {
    // Override AuthHelper để tự động đăng nhập khi cần
    if (window.AuthHelper) {
        const originalMakeRequest = window.AuthHelper.makeAuthenticatedRequest;
        window.AuthHelper.makeAuthenticatedRequest = async function(url, options = {}) {
            try {
                return await originalMakeRequest.call(this, url, options);
            } catch (error) {
                if (error.message.includes('No valid token available') || 
                    error.message.includes('Authentication failed')) {
                    console.log('🔄 Tự động đăng nhập do lỗi authentication...');
                    const loginSuccess = await window.AutoLogin.login();
                    if (loginSuccess) {
                        // Retry request sau khi đăng nhập
                        return await originalMakeRequest.call(this, url, options);
                    }
                }
                throw error;
            }
        };
    }
});

// Thêm buttons vào console để test
console.log(`
🔧 Debug Commands:
- AutoLogin.login() - Đăng nhập tự động
- AutoLogin.logout() - Đăng xuất
- AutoLogin.checkLoginStatus() - Kiểm tra trạng thái
`); 