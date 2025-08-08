// document.addEventListener('DOMContentLoaded', () => {
//     const userInfoElement = document.getElementById('user-info');
//     const editFormElement = document.getElementById('edit-form');
//     const profileForm = document.getElementById('profile-form');
//     const userPhotoElement = document.getElementById('user-photo');
//     const userPhotoUpload = document.getElementById('user-photo-upload');

//     // Giả sử AuthManager.getUserData() trả về cấu trúc dữ liệu bạn đã cung cấp
//     const userData = AuthManager.getUserData();

//     const formatDate = (dateString) => {
//         if (!dateString) return 'Chưa cập nhật';
//         const [year, month, day] = dateString.split('-');
//         return `${day}/${month}/${year}`;
//     };

//     const formatSex = (sexString) => {
//         if (!sexString) return 'Chưa cập nhật';
//         if (sexString === 'male') return 'Nam';
//         if (sexString === 'female') return 'Nữ';
//         return sexString;
//     };

//     if (userData && userData.auth_token) {
//         const { id, first_name, last_name, email, date, live, user_photo, sex, tokens } = userData.auth_token;
//         const accessToken = tokens.access;

//         // Hiển thị tên người dùng trên trang
//         const fullName = `${last_name} ${first_name}`;
//         document.getElementById('profile-title-display').textContent = fullName.trim() || 'Chưa cập nhật';
        
//         // Hiển thị thông tin người dùng
//         document.getElementById('email-value').textContent = email;
//         document.getElementById('date-value').textContent = formatDate(date);
//         document.getElementById('sex-value').textContent = formatSex(sex);
//         document.getElementById('live-value').textContent = live || 'Chưa cập nhật';
//         userPhotoElement.src = user_photo || 'placeholder.jpg';

//         document.getElementById('edit-btn').addEventListener('click', () => {
//             userInfoElement.style.display = 'none';
//             editFormElement.style.display = 'block';

//             // Đổ dữ liệu vào form chỉnh sửa
//             document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
//             document.getElementById('edit-email').textContent = email;
//             document.getElementById('edit-date').value = date;
//             document.getElementById('edit-live').value = live || '';
//             document.getElementById('edit-sex').value = sex || '';
            
//             document.getElementById('edit-first-name').value = first_name;
//             document.getElementById('edit-last-name').value = last_name;

//             document.getElementById('edit-btn').style.display = 'none';
//         });

//         document.getElementById('cancel-edit-btn').addEventListener('click', () => {
//             editFormElement.style.display = 'none';
//             userInfoElement.style.display = 'block';
//             document.getElementById('edit-btn').style.display = 'block';
//         });

//         userPhotoElement.addEventListener('click', () => {
//              userPhotoUpload.click();
//         });
//         userPhotoUpload.addEventListener('change', (event) => {
//             const file = event.target.files[0];
//             if (file) {
//                 const reader = new FileReader();
//                 reader.onload = (e) => {
//                     userPhotoElement.src = e.target.result;
//                 };
//                 reader.readAsDataURL(file);
//             }
//         });

//         profileForm.addEventListener('submit', async (e) => {
//             e.preventDefault();

//             const date = document.getElementById('edit-date').value;
//             const live = document.getElementById('edit-live').value;
//             const sex = document.getElementById('edit-sex').value;
//             const photoFile = userPhotoUpload.files[0];

//             let userPhotoUrl = user_photo;

//             if (photoFile) {
//                 const formData = new FormData();
//                 formData.append('file', photoFile);
//                 formData.append('upload_preset', 'user_avatar'); 
//                 formData.append('folder', 'avatar'); 

//                 try {
//                     const cloudinaryResponse = await axios.post(
//                         'https://api.cloudinary.com/v1_1/deprdilqu/image/upload/user_avatar', 
//                         formData
//                     );
//                     userPhotoUrl = cloudinaryResponse.data.secure_url;
//                 } catch (error) {
//                     console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
//                     alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
//                     return;
//                 }
//             }
            
//             const updateData = {
//                 date_of_birth: date,
//                 living_place: live,
//                 sex: sex,
//                 user_photo: userPhotoUrl
//             };
            
//             try {
//                 console.log('accessToken',accessToken)
//                 console.log('id',id)
//                 const response = await axios.put(
//                     `https://timtruonghoc.pythonanywhere.com/users/${id}/`,
//                     updateData,
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${accessToken}`,
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 );

//                 console.log("Cập nhật thành công:", response.data);
//                 alert("Cập nhật thông tin thành công!");
                
//                 const updatedUserData = {
//                     ...userData,
//                     auth_token: {
//                         ...userData.auth_token,
//                         date: response.data.date_of_birth,
//                         live: response.data.living_place,
//                         sex: response.data.sex,
//                         user_photo: response.data.user_photo
//                     }
//                 };
//                 AuthManager.setUserData(updatedUserData);
//                 window.location.reload();

//             } catch (error) {
//                 console.error("Lỗi khi cập nhật thông tin:", error.response ? error.response.data : error.message);
//                 alert("Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.");
//             }
//         });
//     } else {
//         userInfoElement.innerHTML = `
//             <p>Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.</p>
//         `;
//         userPhotoElement.style.display = 'none';
//     }
// });






document.addEventListener('DOMContentLoaded', () => {
    const userInfoElement = document.getElementById('user-info');
    const editFormElement = document.getElementById('edit-form');
    const profileForm = document.getElementById('profile-form');
    const userPhotoElement = document.getElementById('user-photo');
    const userPhotoUpload = document.getElementById('user-photo-upload');

    // Giả sử AuthManager.getUserData() trả về cấu trúc dữ liệu bạn đã cung cấp
    const userData = AuthManager.getUserData();

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatSex = (sexString) => {
        if (!sexString) return 'Chưa cập nhật';
        if (sexString === 'male') return 'Nam';
        if (sexString === 'female') return 'Nữ';
        return sexString;
    };

    if (userData && userData.auth_token) {
        const { id, first_name, last_name, email, date, live, user_photo, sex, tokens } = userData.auth_token;
        const accessToken = tokens.access;

        // Hiển thị tên người dùng trên trang
        const fullName = `${last_name} ${first_name}`;
        document.getElementById('profile-title-display').textContent = fullName.trim() || 'Chưa cập nhật';
        
        // Hiển thị thông tin người dùng
        document.getElementById('email-value').textContent = email;
        document.getElementById('date-value').textContent = formatDate(date);
        document.getElementById('sex-value').textContent = formatSex(sex);
        document.getElementById('live-value').textContent = live || 'Chưa cập nhật';
        userPhotoElement.src = user_photo || 'placeholder.jpg';

        document.getElementById('edit-btn').addEventListener('click', () => {
            userInfoElement.style.display = 'none';
            editFormElement.style.display = 'block';

            // Đổ dữ liệu vào form chỉnh sửa
            document.getElementById('profile-title-edit').textContent = fullName.trim() || 'Chưa cập nhật';
            document.getElementById('edit-email').textContent = email;
            document.getElementById('edit-date').value = date;
            document.getElementById('edit-live').value = live || '';
            document.getElementById('edit-sex').value = sex || '';
            
            document.getElementById('edit-first-name').value = first_name;
            document.getElementById('edit-last-name').value = last_name;

            document.getElementById('edit-btn').style.display = 'none';
        });

        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            editFormElement.style.display = 'none';
            userInfoElement.style.display = 'block';
            document.getElementById('edit-btn').style.display = 'block';
        });

        userPhotoElement.addEventListener('click', () => {
             userPhotoUpload.click();
        });
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

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const date = document.getElementById('edit-date').value;
            const live = document.getElementById('edit-live').value;
            const sex = document.getElementById('edit-sex').value;
            const photoFile = userPhotoUpload.files[0];

            let userPhotoUrl = user_photo;

            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);
                formData.append('upload_preset', 'user_avatar'); 
                formData.append('folder', 'avatar'); 

                try {
                    const cloudinaryResponse = await axios.post(
                        'https://api.cloudinary.com/v1_1/deprdilqu/image/upload/user_avatar', 
                        formData
                    );
                    userPhotoUrl = cloudinaryResponse.data.secure_url;
                } catch (error) {
                    console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
                    alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
                    return;
                }
            }
            
            const updateData = {
                first_name: first_name,
                last_name: last_name,
                date_of_birth: date,
                living_place: live,
                sex: sex,
                user_photo: userPhotoUrl
            };
            
            try {
                console.log('accessToken',accessToken)
                console.log('id',id)
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
                alert("Cập nhật thông tin thành công!");
                
                const updatedUserData = {
                    ...userData,
                    auth_token: {
                        ...userData.auth_token,
                        date: response.data.date_of_birth,
                        live: response.data.living_place,
                        sex: response.data.sex,
                        user_photo: response.data.user_photo
                    }
                };
                AuthManager.setUserData(updatedUserData);
                window.location.reload();

            } catch (error) {
                console.error("Lỗi khi cập nhật thông tin:", error.response ? error.response.data : error.message);
                alert("Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.");
            }
        });
    } else {
        userInfoElement.innerHTML = `
            <p>Bạn chưa đăng nhập. Vui lòng đăng nhập để xem thông tin.</p>
        `;
        userPhotoElement.style.display = 'none';
    }
});