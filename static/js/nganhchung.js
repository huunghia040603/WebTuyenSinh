// Khai báo các biến và hằng số
const API_URL = 'https://webtimtruong.pythonanywhere.com/all_major_has_pagi/';
const majorsGrid = document.getElementById('majorsGrid');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageNumbersDiv = document.getElementById('pageNumbers');
const searchInput = document.getElementById('searchInput');

let currentPage = 1;
let totalPages = 1;
let currentSearchQuery = '';

// Hàm fetch dữ liệu từ API
async function fetchMajors(page = 1, search = '') {
    majorsGrid.innerHTML = `
    <style>

.modern-loader {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
min-height: 220px;
width: 100%;
margin: 0 auto;
 margin-left: 105%;
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
        const response = await fetch(`${API_URL}?page=${page}&search=${search}`);
        if (!response.ok) {
            throw new Error('Lỗi khi tải dữ liệu ngành.');
        }
        const data = await response.json();
        
        // Cập nhật các biến toàn cục
        currentPage = page;
        // Chỉnh lại tính toán totalPages cho chính xác
        totalPages = Math.ceil(data.count / 9); // Giả định mỗi trang có 9 kết quả
        
        // Hiển thị dữ liệu lên giao diện
        renderMajors(data.results);
        updatePagination(data.next, data.previous);

    } catch (error) {
        console.error('Lỗi:', error);
        majorsGrid.innerHTML = '<div class="error">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
}

// Hàm render dữ liệu ra giao diện
function renderMajors(majors) {
    majorsGrid.innerHTML = ''; // Xóa nội dung cũ
    if (majors.length === 0) {
        majorsGrid.innerHTML = '<div class="no-results">Không tìm thấy ngành học nào.</div>';
        return;
    }

    majors.forEach(major => {
        const majorCard = document.createElement('div');
        majorCard.classList.add('major-card');

        // Tạo thẻ ảnh
        const majorImageDiv = document.createElement('div');
        majorImageDiv.classList.add('major-image');
        const majorImage = document.createElement('img');
        majorImage.src = major.field.cover || '/static/images/default.png'; 
        majorImage.alt = major.name;
        majorImageDiv.appendChild(majorImage);

        // Tạo phần nội dung
        const majorContent = document.createElement('div');
        majorContent.classList.add('major-content');

        // Tạo tiêu đề
        const majorTitle = document.createElement('h3');
        majorTitle.classList.add('major-title');
        majorTitle.textContent = major.name;
        
        // Tạo mô tả
        const majorDescription = document.createElement('p');
        majorDescription.classList.add('major-description');
        majorDescription.textContent = major.short_description || 'Không có mô tả ngắn.';
        
        // Tạo các thông tin phụ
        const majorInfoDiv = document.createElement('div');
        majorInfoDiv.classList.add('major-info');

        const infoBoxesDiv = document.createElement('div');
        infoBoxesDiv.classList.add('info-boxes');

        // Hàng thông tin 1
        const infoRow1 = document.createElement('div');
        infoRow1.classList.add('info-row');
        
        const trainingDurationBox = document.createElement('div');
        trainingDurationBox.classList.add('info-box', 'small');
        trainingDurationBox.textContent = `Thời gian học: ${major.training_duration || 'Đang cập nhật'}`;
        
        const salaryBox = document.createElement('div');
        salaryBox.classList.add('info-box', 'small', 'vang');
        salaryBox.textContent = `Thu nhập: ${major.salary || 'Đang cập nhật'}`;
        
        infoRow1.appendChild(trainingDurationBox);
        infoRow1.appendChild(salaryBox);

        // Hàng thông tin 2
        const infoRow2 = document.createElement('div');
        infoRow2.classList.add('info-row');
        
        const tuitionFeeBox = document.createElement('div');
        tuitionFeeBox.classList.add('info-box', 'small');
        tuitionFeeBox.textContent = `Học phí: ${major.tuition_fee_per_year || 'Đang cập nhật'}`;
        
        const opportunitiesBox = document.createElement('div');
        opportunitiesBox.classList.add('info-box', 'small', 'vang');
        opportunitiesBox.textContent = `Điểm cơ hội: ${major.opportunities || 'Đang cập nhật'}`;
        opportunitiesBox.setAttribute('data-tooltip', `Điểm cơ hội việc làm ${major.opportunities || 'Đang cập nhật'}/100`);

        infoRow2.appendChild(tuitionFeeBox);
        infoRow2.appendChild(opportunitiesBox);

        infoBoxesDiv.appendChild(infoRow1);
        infoBoxesDiv.appendChild(infoRow2);

        const viewMoreButton = document.createElement('button');
        viewMoreButton.classList.add('view-more-btn');
        viewMoreButton.textContent = 'Xem Thêm';
        
        // Thêm event listener cho nút "Xem thêm"
        viewMoreButton.addEventListener('click', () => {
            // Chuyển hướng đến trang chi tiết ngành
            window.location.href = `/nganh/${major.all_major_id}`;
        });

        // Thêm các thành phần vào major-info
        majorInfoDiv.appendChild(infoBoxesDiv);
        majorInfoDiv.appendChild(viewMoreButton);

        // Thêm các thành phần vào major-content
        majorContent.appendChild(majorTitle);
        majorContent.appendChild(majorDescription);
        majorContent.appendChild(majorInfoDiv);

        // Thêm các thành phần vào major-card
        majorCard.appendChild(majorImageDiv);
        majorCard.appendChild(majorContent);
        
        // Thêm event listener cho toàn bộ card (ngoại trừ nút "Xem thêm")
        majorCard.addEventListener('click', (e) => {
            // Không chuyển hướng nếu click vào nút "Xem thêm"
            if (e.target.classList.contains('view-more-btn')) {
                return;
            }
            // Chuyển hướng đến trang chi tiết ngành
            window.location.href = `/nganh/${major.all_major_id}`;
        });

        majorsGrid.appendChild(majorCard);
    });
}

// Cập nhật phân trang
function updatePagination(nextUrl, previousUrl) {
    prevPageButton.disabled = !previousUrl;
    nextPageButton.disabled = !nextUrl;
    
    pageNumbersDiv.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = `Trang ${currentPage} / ${totalPages}`;
    pageNumbersDiv.appendChild(span);
}

// Xử lý sự kiện cho các nút phân trang
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchMajors(currentPage - 1, currentSearchQuery);
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchMajors(currentPage + 1, currentSearchQuery);
    }
});

// Xử lý tìm kiếm
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || searchInput.value === '') {
        const query = searchInput.value.trim();
        if (query !== currentSearchQuery) {
            currentSearchQuery = query;
            fetchMajors(1, currentSearchQuery);
        }
    }
});

// Gọi hàm fetch ban đầu để tải dữ liệu khi trang web được load
document.addEventListener('DOMContentLoaded', () => {
    fetchMajors();
});