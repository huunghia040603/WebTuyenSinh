// Đặt toàn bộ code trong sự kiện DOMContentLoaded để đảm bảo các phần tử HTML đã được tải.
document.addEventListener('DOMContentLoaded', (event) => {
    // URL của API nhóm ngành
    const API_URL = 'https://webtimtruong.pythonanywhere.com/fieldgroups/';
    // URL của API ngành học chi tiết, sử dụng template literal để thêm field_id
    const MAJOR_API_URL = 'https://webtimtruong.pythonanywhere.com/all_major/?field_id=';

    // Lấy phần tử DOM nơi bạn muốn hiển thị các nhóm ngành
    const nhomnganhGrid = document.getElementById('nhomnganh-grid');

    // Các phần tử của modal
    const modal = document.getElementById('modal-nganh');
    const modalTitle = document.getElementById('modal-nganh-title');
    const modalDesc = document.getElementById('modal-nganh-desc');
    const modalList = document.getElementById('modal-nganh-list');
    const closeBtn = document.getElementById('modal-nganh-close');

    // Hàm lấy dữ liệu từ API và hiển thị lên trang
    async function fetchFieldGroups() {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu: ' + response.status);
            }
            
            const fieldGroups = await response.json();
            
            renderFieldGroups(fieldGroups);
        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
            nhomnganhGrid.innerHTML = '<p>Không thể tải dữ liệu nhóm ngành. Vui lòng thử lại sau.</p>';
        }
    }

    // Hàm tạo và hiển thị các box nhóm ngành dựa trên dữ liệu
    function renderFieldGroups(data) {
        nhomnganhGrid.innerHTML = '';
        
        data.forEach((item, index) => {
            const fieldGroupBox = document.createElement('div');
            const dynamicClass = `nhomnganh-bg-${index + 1}`;
            fieldGroupBox.className = `nhomnganh-box ${dynamicClass}`;
            fieldGroupBox.setAttribute('data-field-id', item.field_id);
            
            fieldGroupBox.innerHTML = `
                <div class="nhomnganh-name">${item.name}</div>
                <div class="nhomnganh-desc">${item.description}</div>
                <button class="nhomnganh-btn" data-field-id="${item.field_id}" data-name="${item.name}" data-desc="${item.description}">Ngành đào tạo <span>&rarr;</span></button>
            `;
            
            nhomnganhGrid.appendChild(fieldGroupBox);
        });
        
        addModalEventListeners();
    }

    // Hàm gán sự kiện click cho tất cả các nút "Ngành đào tạo"
    function addModalEventListeners() {
        document.querySelectorAll('.nhomnganh-btn').forEach(button => {
            button.onclick = function() {
                const fieldId = this.getAttribute('data-field-id');
                const fieldName = this.getAttribute('data-name');
                const fieldDesc = this.getAttribute('data-desc');

                modalTitle.textContent = fieldName;
                modalDesc.textContent = fieldDesc;
                
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                // Gọi hàm mới để fetch và render các ngành chi tiết
                fetchAndRenderMajors(fieldId);
            };
        });
        
        closeBtn.onclick = function() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            modalList.innerHTML = '';
        };
        
        modal.onclick = function(e) {
            if (e.target === modal) { 
                modal.style.display = 'none'; 
                document.body.style.overflow = '';
                modalList.innerHTML = '';
            }
        };
    }
    
    // Hàm mới: Fetch dữ liệu ngành chi tiết và hiển thị trong modal
    async function fetchAndRenderMajors(fieldId) {
        // Hiển thị thông báo đang tải
        modalList.innerHTML = `
        <style>

.modern-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 220px;
    width: 100%;
    margin: 0 auto;
     margin-left: 60%;
}
.modern-loader-spinner {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    border: 6px solid #e0e7ef;
    border-top: 6px solid #0a4191;
    border-right: 6px solid #ffa200;
    border-bottom: 6px solid #0c01ad;
    animation: modern-spin 1.1s linear infinite;
    box-shadow: 0 4px 24px #00e0ff33, 0 0 0 4px #fff8;
    margin-bottom: 18px;
}
@keyframes modern-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.modern-loader-text {
    font-size: 1.15rem;
    color: #0a4191;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
    text-shadow: 0 2px 12px #00e0ff22;
}
            
        </style>
        <div class="modern-loader">
            <div class="modern-loader-spinner"></div>
            <div class="modern-loader-text">Tôi đang tải dữ liệu! <br/> Chờ tôi xíu nhé...</div>
        </div>
    `;

        try {
            const response = await fetch(`${MAJOR_API_URL}${fieldId}`);
            
            if (!response.ok) {
                throw new Error('Lỗi khi lấy dữ liệu ngành: ' + response.status);
            }
            
            const majors = await response.json();
            
            if (majors.length > 0) {
                // Tạo chuỗi HTML từ dữ liệu majors
                const majorsHtml = majors.map(major => 
                    `<div class='modal-nganh-list-item'>${major.name}</div>`
                ).join('');
                modalList.innerHTML = majorsHtml;
            } else {
                modalList.innerHTML = '<p>Không có ngành học nào thuộc nhóm ngành này.</p>';
            }

        } catch (error) {
            console.error('Có lỗi xảy ra khi lấy dữ liệu ngành:', error);
            modalList.innerHTML = '<p>Không thể tải danh sách ngành. Vui lòng thử lại sau.</p>';
        }
    }

    // Chạy hàm chính khi trang web được tải
    fetchFieldGroups();
});