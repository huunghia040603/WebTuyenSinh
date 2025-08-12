


// Đợi cho DOM được tải xong trước khi thực thi code
document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử HTML cần thiết bằng ID và class
    const userInfoElement = document.getElementById('user-info');
    const editFormElement = document.getElementById('edit-form');
    const profileForm = document.getElementById('profile-form');
    const userPhotoElement = document.getElementById('user-photo');
    const userPhotoUpload = document.getElementById('user-photo-upload');
    const userPhotoContainer = document.querySelector('.user-photo-container');
    const profileCard = document.querySelector('.profile-card');

    // Giả sử AuthManager.getUserData() trả về cấu trúc dữ liệu người dùng
    const userData = AuthManager.getUserData();

    // Hàm định dạng ngày tháng từ YYYY-MM-DD sang DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Hàm định dạng giới tính từ tiếng Anh sang tiếng Việt
    const formatSex = (sexString) => {
        if (!sexString) return 'Chưa cập nhật';
        if (sexString === 'male') return 'Nam';
        if (sexString === 'female') return 'Nữ';
        return sexString;
    };
    
    // Hàm hiển thị trạng thái loading
    const showLoading = () => {
        // Tạo loading container
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <style>
                .spinner-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border-left-color: #007bff;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            </style>
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    };

    // Hàm ẩn trạng thái loading
    const hideLoading = () => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    };

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (userData) {
        // Xử lý cả cấu trúc cũ và mới
        let userInfo;
        if (userData.auth_token) {
            // Cấu trúc cũ
            userInfo = userData.auth_token;
        } else {
            // Cấu trúc mới (từ Google Auth hoặc regular login)
            userInfo = userData;
        }
        
        // Đảm bảo các field có giá trị mặc định nếu không tồn tại
        userInfo = {
            id: userInfo.id || '',
            first_name: userInfo.first_name || '',
            last_name: userInfo.last_name || '',
            email: userInfo.email || '',
            date_of_birth: userInfo.date_of_birth || userInfo.date || '',
            living_place: userInfo.living_place || userInfo.live || '',
            user_photo: userInfo.user_photo || '',
            sex: userInfo.sex || ''
        };
        
        const { id, first_name, last_name, email, date_of_birth, living_place, user_photo, sex } = userInfo;
        const accessToken = localStorage.getItem('access_token');

        const fullName = `${last_name} ${first_name}`;
        document.getElementById('profile-title-display').textContent = fullName.trim() || 'Chưa cập nhật';
        
        document.getElementById('email-value').textContent = email;
        document.getElementById('date-value').textContent = formatDate(date_of_birth);
        document.getElementById('sex-value').textContent = formatSex(sex);
        document.getElementById('live-value').textContent = living_place || 'Chưa cập nhật';
        userPhotoElement.src = user_photo || '/static/images/avatar.jpg';

        // Ẩn chức năng thay đổi ảnh khi chưa ở chế độ chỉnh sửa
        userPhotoContainer.style.cursor = 'default';
        userPhotoContainer.style.pointerEvents = 'none';
        
        // Lắng nghe sự kiện click vào nút "Chỉnh sửa"
        document.getElementById('edit-btn').addEventListener('click', () => {
            userInfoElement.style.display = 'none';
            editFormElement.style.display = 'block';

            // Kích hoạt chức năng thay đổi ảnh
            userPhotoContainer.style.cursor = 'pointer';
            userPhotoContainer.style.pointerEvents = 'auto';

            document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
            document.getElementById('edit-email').textContent = email;
            document.getElementById('edit-date').value = date_of_birth;
            document.getElementById('edit-live').value = living_place || '';
            document.getElementById('edit-sex').value = sex || '';
            document.getElementById('edit-first-name').value = first_name;
            document.getElementById('edit-last-name').value = last_name;

            document.getElementById('edit-btn').style.display = 'none';
        });

        // Lắng nghe sự kiện click vào nút "Hủy" trong form chỉnh sửa
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            editFormElement.style.display = 'none';
            userInfoElement.style.display = 'block';
            document.getElementById('edit-btn').style.display = 'block';

            // Vô hiệu hóa chức năng thay đổi ảnh
            userPhotoContainer.style.cursor = 'default';
            userPhotoContainer.style.pointerEvents = 'none';
        });

        // Lắng nghe sự kiện click vào container ảnh đại diện để mở hộp thoại chọn file
        userPhotoContainer.addEventListener('click', () => {
             userPhotoUpload.click();
        });
        
        // Lắng nghe sự kiện khi người dùng chọn file ảnh mới
        userPhotoUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    userPhotoElement.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Lắng nghe sự kiện submit của form
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(); // Hiển thị loading ngay khi submit

            const newFirstName = document.getElementById('edit-first-name').value;
            const newLastName = document.getElementById('edit-last-name').value;
            const newDate = document.getElementById('edit-date').value;
            const newLive = document.getElementById('edit-live').value;
            const newSex = document.getElementById('edit-sex').value;
            const photoFile = userPhotoUpload.files[0];
            
            const updateData = {
                first_name: newFirstName,
                last_name: newLastName,
                date_of_birth: newDate,
                living_place: newLive,
                sex: newSex,
                user_photo: user_photo
            };
            
            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);
                formData.append('upload_preset', 'user_avatar'); 
                formData.append('folder', 'avatar'); 
                
                try {
                    const cloudinaryResponse = await axios.post(
                        'https://api.cloudinary.com/v1_1/deprdilqu/image/upload',
                        formData
                    );
                    updateData.user_photo = cloudinaryResponse.data.secure_url;
                } catch (error) {
                    hideLoading(); // Ẩn loading nếu có lỗi tải ảnh lên
                    console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
                    alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
                    return;
                }
            }
            
            console.log('Dữ liệu được gửi lên server:', updateData);

            try {
                const response = await axios.put(
                    `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
                    updateData,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Cập nhật thành công:", response.data);
               
                
                // Cập nhật dữ liệu người dùng với cấu trúc mới
                const updatedUserData = {
                    ...userData,
                    auth_token: {
                        ...userData.auth_token,
                        first_name: response.data.first_name,
                        last_name: response.data.last_name,
                        date_of_birth: response.data.date_of_birth,
                        living_place: response.data.living_place,
                        sex: response.data.sex,
                        user_photo: response.data.user_photo
                    }
                };
                
                // Cũng cập nhật cấu trúc trực tiếp nếu không có auth_token
                if (!userData.auth_token) {
                    updatedUserData.first_name = response.data.first_name;
                    updatedUserData.last_name = response.data.last_name;
                    updatedUserData.date_of_birth = response.data.date_of_birth;
                    updatedUserData.living_place = response.data.living_place;
                    updatedUserData.sex = response.data.sex;
                    updatedUserData.user_photo = response.data.user_photo;
                }
                
                // Lưu dữ liệu đã cập nhật
                AuthManager.setUserData(updatedUserData);
                
                hideLoading(); // Ẩn loading sau khi cập nhật thành công
                
                // Hiển thị thông báo thành công
                alert('Cập nhật thông tin thành công!');
                
                // Reload trang để hiển thị thông tin mới
                window.location.reload();

            } catch (error) {
                hideLoading(); // Ẩn loading nếu có lỗi cập nhật
                console.error("Lỗi khi cập nhật thông tin:", error.response ? error.response.data : error.message);
                
                // Hiển thị thông báo lỗi chi tiết hơn
                let errorMessage = "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.";
                if (error.response && error.response.data) {
                    if (typeof error.response.data === 'object') {
                        errorMessage = Object.values(error.response.data).flat().join('\n');
                    } else {
                        errorMessage = error.response.data;
                    }
                }
                alert(errorMessage);
            }
        });
    } else {
        // Trường hợp người dùng chưa đăng nhập
        userInfoElement.innerHTML = `
            <p>Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.</p>
        `;
        const userPhotoContainer = document.querySelector('.user-photo-container');
        if (userPhotoContainer) {
            userPhotoContainer.style.display = 'none';
        }
    }
});