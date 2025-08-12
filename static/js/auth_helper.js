// Authentication Helper Functions
class AuthHelper {
    constructor() {
        this.baseUrl = 'https://timtruonghoc.pythonanywhere.com';
        this.checkTokenExpiry();
    }

    // Kiểm tra token có hợp lệ không
    async checkTokenValidity() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return false;
        }

        try {
            // Kiểm tra token format trước
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.log('Invalid token format');
                return false;
            }

            // Kiểm tra token expiry
            try {
                const payload = JSON.parse(atob(parts[1]));
                const expiryTime = payload.exp * 1000;
                const currentTime = Date.now();
                
                if (currentTime >= expiryTime) {
                    console.log('Token expired, attempting refresh');
                    return await this.refreshToken();
                }
            } catch (parseError) {
                console.log('Error parsing token payload:', parseError);
                return false;
            }

            // Thử gọi API để kiểm tra token
            try {
                const response = await fetch(`${this.baseUrl}/auth/me/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401) {
                    // Token hết hạn, thử refresh
                    return await this.refreshToken();
                }

                return response.ok;
            } catch (apiError) {
                // Nếu endpoint không tồn tại, chỉ kiểm tra token expiry
                console.log('API endpoint not available, using token expiry check only');
                return true; // Token có vẻ hợp lệ dựa trên expiry
            }
        } catch (error) {
            console.error('Error checking token validity:', error);
            return false;
        }
    }

    // Refresh token
    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            this.clearAuth();
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                console.log('Token refreshed successfully');
                return true;
            } else {
                console.log('Failed to refresh token');
                this.clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.clearAuth();
            return false;
        }
    }

    // Lấy token hợp lệ (tự động refresh nếu cần)
    async getValidToken() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('No access token found');
            return null;
        }
        
        const isValid = await this.checkTokenValidity();
        if (isValid) {
            return token;
        }
        
        console.log('Token validation failed');
        return null;
    }

    // Xóa thông tin auth
    clearAuth() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        console.log('Auth cleared');
    }

    // Kiểm tra token có hết hạn sớm không
    checkTokenExpiry() {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;

            // Nếu token hết hạn trong 5 phút tới, refresh ngay
            if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                console.log('Token expiring soon, refreshing...');
                this.refreshToken();
            }
        } catch (error) {
            console.error('Error parsing token:', error);
        }
    }

    // Tạo request với auth header
    async makeAuthenticatedRequest(url, options = {}) {
        const token = await this.getValidToken();
        if (!token) {
            console.log('No valid token available, user needs to login');
            throw new Error('No valid token available. Please login first.');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                console.log('Token expired, attempting refresh...');
                // Token có thể đã hết hạn, thử refresh và retry
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = localStorage.getItem('access_token');
                    headers.Authorization = `Bearer ${newToken}`;
                    
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers
                    });
                    return retryResponse;
                } else {
                    console.log('Token refresh failed');
                    throw new Error('Authentication failed. Please login again.');
                }
            }

            return response;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    // Kiểm tra xem user đã đăng nhập chưa
    isLoggedIn() {
        return !!localStorage.getItem('access_token');
    }

    // Lấy thông tin user
    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }
}

// Tạo instance global
window.AuthHelper = new AuthHelper();

// Auto-check token expiry every 5 minutes
setInterval(() => {
    window.AuthHelper.checkTokenExpiry();
}, 5 * 60 * 1000);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHelper;
} 