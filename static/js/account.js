


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
    
    // Debug: Kiểm tra dữ liệu từ AuthManager
    console.log('🔍 AuthManager.getUserData():', userData);
    console.log('🔍 localStorage userData:', localStorage.getItem('userData'));
    console.log('🔍 localStorage user_data:', localStorage.getItem('user_data'));
    console.log('🔍 localStorage access_token:', localStorage.getItem('access_token'));

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
    
    // Hàm fetch dữ liệu đầy đủ từ database
    const fetchCompleteUserData = async (userId) => {
        console.log('🔄 Đang fetch dữ liệu đầy đủ từ database cho user ID:', userId);
        
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error('❌ Không có access token');
            return;
        }
        
        try {
            const response = await axios.get(
                `https://timtruonghoc.pythonanywhere.com/users/${userId}/`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            console.log('✅ Dữ liệu đầy đủ từ database:', response.data);
            
            // Cập nhật localStorage với dữ liệu đầy đủ
            const completeUserData = {
                auth_token: {
                    ...response.data,
                    tokens: {
                        access: accessToken,
                        refresh: localStorage.getItem('refresh_token')
                    }
                }
            };
            
            AuthManager.setUserData(completeUserData);
            console.log('✅ Dữ liệu đầy đủ đã được lưu vào localStorage');
            
            // Cập nhật giao diện với dữ liệu đầy đủ
            updateUIWithFreshData(response.data);
            
            // Đăng ký lại event listener cho nút chỉnh sửa với dữ liệu mới
            registerEditButtonListener(response.data);
            
        } catch (error) {
            console.error('❌ Lỗi khi fetch dữ liệu từ database:', error);
            // Fallback: hiển thị dữ liệu local hiện có
            console.log('⚠️ Fallback: hiển thị dữ liệu local...');
        }
    };
    
    // Hàm đăng ký event listener cho nút chỉnh sửa
    const registerEditButtonListener = (userData) => {
        console.log('🔧 Đang đăng ký event listener cho nút chỉnh sửa với dữ liệu:', userData);
        
        const editBtn = document.getElementById('edit-btn');
        if (editBtn) {
            // Xóa event listener cũ nếu có
            editBtn.replaceWith(editBtn.cloneNode(true));
            const newEditBtn = document.getElementById('edit-btn');
            
            newEditBtn.addEventListener('click', () => {
                console.log('🖱️ Nút chỉnh sửa được click với dữ liệu mới');
                userInfoElement.style.display = 'none';
                editFormElement.style.display = 'block';

                // Kích hoạt chức năng thay đổi ảnh
                userPhotoContainer.style.cursor = 'pointer';
                userPhotoContainer.style.pointerEvents = 'auto';

                const fullName = `${userData.last_name || ''} ${userData.first_name || ''}`;
                document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
                
                // Debug: Kiểm tra email trong edit form
                const editEmailElement = document.getElementById('edit-email');
                if (editEmailElement) {
                    editEmailElement.textContent = userData.email || 'Chưa cập nhật';
                    console.log('✅ Edit email đã được set:', editEmailElement.textContent);
                } else {
                    console.error('❌ Không tìm thấy element #edit-email');
                }
                document.getElementById('edit-date').value = userData.date_of_birth || '';
                document.getElementById('edit-live').value = userData.living_place || '';
                document.getElementById('edit-sex').value = userData.sex || '';
                document.getElementById('edit-first-name').value = userData.first_name || '';
                document.getElementById('edit-last-name').value = userData.last_name || '';

                document.getElementById('edit-btn').style.display = 'none';
            });
            console.log('✅ Event listener cho nút chỉnh sửa đã được đăng ký lại');
        } else {
            console.error('❌ Không tìm thấy nút chỉnh sửa');
        }
    };
    
    // Hàm cập nhật giao diện với dữ liệu mới từ database
    const updateUIWithFreshData = (freshData) => {
        console.log('🎨 Đang cập nhật giao diện với dữ liệu mới...');
        
        // Cập nhật thông tin hiển thị
        const fullName = `${freshData.last_name || ''} ${freshData.first_name || ''}`;
        document.getElementById('profile-title-display').textContent = fullName.trim() || 'Chưa cập nhật';
        
        // Cập nhật email
        const emailElement = document.getElementById('email-value');
        if (emailElement) {
            emailElement.textContent = freshData.email || 'Chưa cập nhật';
            console.log('✅ Email đã được cập nhật:', emailElement.textContent);
        }
        
        // Cập nhật các thông tin khác
        document.getElementById('date-value').textContent = formatDate(freshData.date_of_birth);
        document.getElementById('sex-value').textContent = formatSex(freshData.sex);
        document.getElementById('live-value').textContent = freshData.living_place || 'Chưa cập nhật';
        
        // Cập nhật ảnh đại diện
        if (freshData.user_photo) {
            userPhotoElement.src = freshData.user_photo;
        }
        
        // Cập nhật form chỉnh sửa
        document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
        
        const editEmailElement = document.getElementById('edit-email');
        if (editEmailElement) {
            editEmailElement.textContent = freshData.email || 'Chưa cập nhật';
        }
        
        document.getElementById('edit-date').value = freshData.date_of_birth || '';
        document.getElementById('edit-live').value = freshData.living_place || '';
        document.getElementById('edit-sex').value = freshData.sex || '';
        document.getElementById('edit-first-name').value = freshData.first_name || '';
        document.getElementById('edit-last-name').value = freshData.last_name || '';
        
        // Chuyển về chế độ xem thông tin
        editFormElement.style.display = 'none';
        userInfoElement.style.display = 'block';
        document.getElementById('edit-btn').style.display = 'block';
        
        // Vô hiệu hóa chức năng thay đổi ảnh
        userPhotoContainer.style.cursor = 'default';
        userPhotoContainer.style.pointerEvents = 'none';
        
        console.log('✅ Giao diện đã được cập nhật với dữ liệu mới từ database');
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
        
        // Kiểm tra xem dữ liệu có đầy đủ không
        const hasCompleteData = userInfo.email && userInfo.first_name && userInfo.last_name;
        
        if (!hasCompleteData && userInfo.id) {
            console.log('⚠️ Dữ liệu local không đầy đủ, đang fetch từ database...');
            // Fetch dữ liệu đầy đủ từ database
            fetchCompleteUserData(userInfo.id);
            return; // Thoát để tránh hiển thị dữ liệu không đầy đủ
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

        // Debug: Log dữ liệu để kiểm tra
        console.log('🔍 Debug userInfo:', userInfo);
        console.log('📧 Email value:', email);
        console.log('👤 Full name:', `${last_name} ${first_name}`);

        const fullName = `${last_name} ${first_name}`;
        document.getElementById('profile-title-display').textContent = fullName.trim() || 'Chưa cập nhật';
        
        // Kiểm tra element có tồn tại không
        const emailElement = document.getElementById('email-value');
        if (emailElement) {
            emailElement.textContent = email || 'Chưa cập nhật';
            console.log('✅ Email đã được set:', emailElement.textContent);
        } else {
            console.error('❌ Không tìm thấy element #email-value');
        }
        document.getElementById('date-value').textContent = formatDate(date_of_birth);
        document.getElementById('sex-value').textContent = formatSex(sex);
        document.getElementById('live-value').textContent = living_place || 'Chưa cập nhật';
        userPhotoElement.src = user_photo || '/static/images/avatar.jpg';

        // Ẩn chức năng thay đổi ảnh khi chưa ở chế độ chỉnh sửa
        userPhotoContainer.style.cursor = 'default';
        userPhotoContainer.style.pointerEvents = 'none';
        
        // Lắng nghe sự kiện click vào nút "Chỉnh sửa"
        const editBtn = document.getElementById('edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('🖱️ Nút chỉnh sửa được click');
                userInfoElement.style.display = 'none';
                editFormElement.style.display = 'block';

                // Kích hoạt chức năng thay đổi ảnh
                userPhotoContainer.style.cursor = 'pointer';
                userPhotoContainer.style.pointerEvents = 'auto';

                document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
                
                // Debug: Kiểm tra email trong edit form
                const editEmailElement = document.getElementById('edit-email');
                if (editEmailElement) {
                    editEmailElement.textContent = email || 'Chưa cập nhật';
                    console.log('✅ Edit email đã được set:', editEmailElement.textContent);
                } else {
                    console.error('❌ Không tìm thấy element #edit-email');
                }
                document.getElementById('edit-date').value = date_of_birth;
                document.getElementById('edit-live').value = living_place || '';
                document.getElementById('edit-sex').value = sex || '';
                document.getElementById('edit-first-name').value = first_name;
                document.getElementById('edit-last-name').value = last_name;

                document.getElementById('edit-btn').style.display = 'none';
            });
            console.log('✅ Event listener cho nút chỉnh sửa đã được đăng ký');
        } else {
            console.error('❌ Không tìm thấy nút chỉnh sửa');
        }
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
    
    // Đăng ký event listeners bên ngoài block if để đảm bảo luôn được đăng ký
    console.log('🔧 Đang đăng ký event listeners...');
    
    // Lắng nghe sự kiện click vào nút "Hủy" trong form chỉnh sửa
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            console.log('🖱️ Nút hủy được click');
            editFormElement.style.display = 'none';
            userInfoElement.style.display = 'block';
            document.getElementById('edit-btn').style.display = 'block';

            // Vô hiệu hóa chức năng thay đổi ảnh
            userPhotoContainer.style.cursor = 'default';
            userPhotoContainer.style.pointerEvents = 'none';
        });
        console.log('✅ Event listener cho nút hủy đã được đăng ký');
    } else {
        console.error('❌ Không tìm thấy nút hủy');
    }

    // Lắng nghe sự kiện click vào container ảnh đại diện để mở hộp thoại chọn file
    if (userPhotoContainer) {
        userPhotoContainer.addEventListener('click', () => {
            console.log('🖱️ Container ảnh được click');
            userPhotoUpload.click();
        });
        console.log('✅ Event listener cho container ảnh đã được đăng ký');
    }
    
    // Lắng nghe sự kiện khi người dùng chọn file ảnh mới
    if (userPhotoUpload) {
        userPhotoUpload.addEventListener('change', (event) => {
            console.log('📁 File ảnh được chọn');
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    userPhotoElement.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        console.log('✅ Event listener cho file upload đã được đăng ký');
    }

    // Lắng nghe sự kiện submit của form
    if (profileForm) {
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
                user_photo: user_photo,
                email: email // Đảm bảo email luôn giữ nguyên giá trị cũ
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
            
            console.log('📧 Email gốc (không thay đổi):', email);
            console.log('Dữ liệu được gửi lên server:', updateData);

            // Kiểm tra ID có hợp lệ không
            if (!id || id === 'undefined' || id === 'null') {
                throw new Error('User ID không hợp lệ. Vui lòng đăng nhập lại.');
            }

            try {
                console.log('🔄 Đang gửi dữ liệu cập nhật lên database...');
                console.log('🆔 User ID:', id);
                console.log('📤 API URL:', `https://timtruonghoc.pythonanywhere.com/users/${id}/`);
                console.log('🔑 Access Token:', accessToken ? 'Có token' : 'Không có token');
                console.log('🔑 Token value:', accessToken ? accessToken.substring(0, 20) + '...' : 'Không có token');
                console.log('📝 Method: POST (với _method=PATCH)');
                
                // Thử POST method trước, nếu không được thì dùng PUT
                let response;
                try {
                    console.log('🔄 Thử POST method...');
                    response = await axios.post(
                        `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
                        updateData,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    console.log('✅ POST method thành công');
                } catch (postError) {
                    console.log('⚠️ POST method thất bại, thử PUT method...');
                    response = await axios.put(
                        `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
                        updateData,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    console.log('✅ PUT method thành công');
                }

                console.log("✅ Cập nhật thành công trên database:", response.data);
                console.log("📧 Email sau khi cập nhật (phải giữ nguyên):", email);
                                console.log("💾 Dữ liệu đã được lưu vào database với ID:", response.data.id);
                
                // Kiểm tra xem dữ liệu có thực sự được lưu vào database không
                try {
                    console.log('🔍 Đang kiểm tra dữ liệu đã lưu trong database...');
                    const verifyResponse = await axios.get(
                        `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        }
                    );
                    console.log('✅ Dữ liệu đã được xác nhận trong database:', verifyResponse.data);
                } catch (verifyError) {
                    console.warn('⚠️ Không thể xác nhận dữ liệu trong database:', verifyError.message);
                }
                
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
                        user_photo: response.data.user_photo,
                        email: email // Đảm bảo email luôn giữ nguyên giá trị cũ
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
                    updatedUserData.email = email; // Đảm bảo email luôn giữ nguyên giá trị cũ
                }
                
                // Lưu dữ liệu đã cập nhật vào localStorage
                console.log('💾 Đang lưu dữ liệu cập nhật vào localStorage...');
                AuthManager.setUserData(updatedUserData);
                console.log('✅ Dữ liệu đã được lưu vào localStorage');
                
                hideLoading(); // Ẩn loading sau khi cập nhật thành công
                
                // Hiển thị thông báo thành công đơn giản
                alert('Cập nhật thông tin thành công!');
                
                // Lấy dữ liệu mới từ database thay vì reload trang
                console.log('🔄 Đang lấy dữ liệu mới từ database...');
                try {
                    const freshDataResponse = await axios.get(
                        `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
                        {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        }
                    );
                    
                    console.log('✅ Dữ liệu mới từ database:', freshDataResponse.data);
                    
                    // Cập nhật giao diện với dữ liệu mới
                    updateUIWithFreshData(freshDataResponse.data);
                    
                    // Cập nhật localStorage với dữ liệu mới từ database
                    const freshUserData = {
                        ...userData,
                        auth_token: {
                            ...userData.auth_token,
                            ...freshDataResponse.data
                        }
                    };
                    
                    // Cũng cập nhật cấu trúc trực tiếp nếu không có auth_token
                    if (!userData.auth_token) {
                        Object.assign(freshUserData, freshDataResponse.data);
                    }
                    
                    console.log('💾 Cập nhật localStorage với dữ liệu mới từ database...');
                    AuthManager.setUserData(freshUserData);
                    console.log('✅ localStorage đã được cập nhật với dữ liệu mới');
                    
                } catch (fetchError) {
                    console.warn('⚠️ Không thể lấy dữ liệu mới từ database:', fetchError.message);
                    // Fallback: reload trang
                    console.log('🔄 Fallback: reload trang...');
                    window.location.reload();
                }

            } catch (error) {
                hideLoading(); // Ẩn loading nếu có lỗi cập nhật
                console.error("❌ Lỗi khi cập nhật thông tin:", error);
                console.error("❌ Response status:", error.response?.status);
                console.error("❌ Response data:", error.response?.data);
                console.error("❌ Response headers:", error.response?.headers);
                
                // Hiển thị thông báo lỗi chi tiết hơn
                let errorMessage = "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.";
                if (error.response) {
                    if (error.response.status === 405) {
                        errorMessage = "Method không được hỗ trợ. Vui lòng liên hệ admin.";
                    } else if (error.response.status === 401) {
                        errorMessage = "Token không hợp lệ. Vui lòng đăng nhập lại.";
                    } else if (error.response.status === 403) {
                        errorMessage = "Không có quyền cập nhật thông tin.";
                    } else if (error.response.data) {
                        if (typeof error.response.data === 'object') {
                            errorMessage = Object.values(error.response.data).flat().join('\n');
                        } else {
                            errorMessage = error.response.data;
                        }
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