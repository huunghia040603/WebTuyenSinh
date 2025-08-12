// // /static/js/auth.js

// // Lớp (hoặc đối tượng) để quản lý dữ liệu người dùng
// const AuthManager = {
//     // Tên key dùng để lưu trữ dữ liệu trong localStorage
//     STORAGE_KEY: 'userData',

//     /**
//      * Lưu trữ dữ liệu người dùng vào localStorage.
//      * @param {Object} userData - Đối tượng dữ liệu người dùng (email, tokens, role, etc.).
//      */
//     saveUserData(userData) {
//         try {
//             // Chuyển đổi đối tượng thành chuỗi JSON và lưu vào localStorage
//             localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
//             console.log('Dữ liệu người dùng đã được lưu vào localStorage.');
//         } catch (e) {
//             console.error('Lỗi khi lưu dữ liệu vào localStorage:', e);
//         }
//     },

//     /**
//      * Lấy dữ liệu người dùng từ localStorage.
//      * @returns {Object|null} - Đối tượng dữ liệu người dùng hoặc null nếu không tồn tại.
//      */
//     getUserData() {
//         try {
//             const userDataString = localStorage.getItem(this.STORAGE_KEY);
//             if (userDataString) {
//                 // Parse chuỗi JSON thành đối tượng và trả về
//                 const userData = JSON.parse(userDataString);
//                 console.log('Dữ liệu người dùng đã được tải từ localStorage.');
//                 return userData;
//             }
//         } catch (e) {
//             console.error('Lỗi khi tải dữ liệu từ localStorage:', e);
//         }
//         return null;
//     },

//     /**
//      * Xóa dữ liệu người dùng khỏi localStorage (đăng xuất).
//      */
//     clearUserData() {
//         localStorage.removeItem(this.STORAGE_KEY);
//         console.log('Dữ liệu người dùng đã được xóa khỏi localStorage.');
//     },

//     /**
//      * Kiểm tra xem người dùng đã đăng nhập chưa.
//      * @returns {boolean} - true nếu đã đăng nhập, ngược lại là false.
//      */
//     isLoggedIn() {
//         const userData = this.getUserData();
//         // Kiểm tra xem có token truy cập hay không
//         return userData && userData.auth_token && userData.auth_token.tokens && userData.auth_token.tokens.access;
//     },

//     /**
//      * Lấy access token.
//      * @returns {string|null} - Access token hoặc null.
//      */
//     getAccessToken() {
//         const userData = this.getUserData();
//         return userData?.auth_token?.tokens?.access || null;
//     },

//     /**
//      * Lấy refresh token.
//      * @returns {string|null} - Refresh token hoặc null.
//      */
//     getRefreshToken() {
//         const userData = this.getUserData();
//         return userData?.auth_token?.tokens?.refresh || null;
//     }
// };



// /static/js/auth.js

// Lớp (hoặc đối tượng) để quản lý dữ liệu người dùng
const AuthManager = {
    // Tên key dùng để lưu trữ dữ liệu trong localStorage
    STORAGE_KEY: 'userData',

    /**
     * Lưu trữ dữ liệu người dùng vào localStorage.
     * @param {Object} userData - Đối tượng dữ liệu người dùng (email, tokens, role, etc.).
     */
    saveUserData(userData) {
        try {
            // Chuyển đổi đối tượng thành chuỗi JSON và lưu vào localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
            console.log('Dữ liệu người dùng đã được lưu vào localStorage.');
        } catch (e) {
            console.error('Lỗi khi lưu dữ liệu vào localStorage:', e);
        }
    },

    // Thêm hàm setUserData để tương thích với file account.js
    setUserData(userData) {
        this.saveUserData(userData);
    },

    /**
     * Lấy dữ liệu người dùng từ localStorage.
     * @returns {Object|null} - Đối tượng dữ liệu người dùng hoặc null nếu không tồn tại.
     */
    getUserData() {
        try {
            // Thử đọc từ key chính
            let userDataString = localStorage.getItem(this.STORAGE_KEY);
            
            // Nếu không có, thử key backup từ Google Auth
            if (!userDataString) {
                userDataString = localStorage.getItem('user_data');
            }
            
            if (userDataString) {
                // Parse chuỗi JSON thành đối tượng và trả về
                const userData = JSON.parse(userDataString);
                console.log('Dữ liệu người dùng đã được tải từ localStorage:', userData);
                return userData;
            }
        } catch (e) {
            console.error('Lỗi khi tải dữ liệu từ localStorage:', e);
        }
        console.log('Không tìm thấy dữ liệu người dùng trong localStorage');
        return null;
    },

    /**
     * Xóa dữ liệu người dùng khỏi localStorage (đăng xuất).
     */
    clearUserData() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('Dữ liệu người dùng đã được xóa khỏi localStorage.');
    },

    /**
     * Kiểm tra xem người dùng đã đăng nhập chưa.
     * @returns {boolean} - true nếu đã đăng nhập, ngược lại là false.
     */
    isLoggedIn() {
        const userData = this.getUserData();
        // Kiểm tra xem có token truy cập hay không
        return userData && userData.auth_token && userData.auth_token.tokens && userData.auth_token.tokens.access;
    },

    /**
     * Lấy access token.
     * @returns {string|null} - Access token hoặc null.
     */
    getAccessToken() {
        const userData = this.getUserData();
        return userData?.auth_token?.tokens?.access || null;
    },

    /**
     * Lấy refresh token.
     * @returns {string|null} - Refresh token hoặc null.
     */
    getRefreshToken() {
        const userData = this.getUserData();
        return userData?.auth_token?.tokens?.refresh || null;
    }
};