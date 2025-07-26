// Khai báo các biến và hằng số
const API_URL = 'https://webtimtruong.pythonanywhere.com/all_major/';
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
    majorsGrid.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';
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

        infoRow2.appendChild(tuitionFeeBox);
        infoRow2.appendChild(opportunitiesBox);

        infoBoxesDiv.appendChild(infoRow1);
        infoBoxesDiv.appendChild(infoRow2);

        const viewMoreButton = document.createElement('button');
        viewMoreButton.classList.add('view-more-btn');
        viewMoreButton.textContent = 'Xem Thêm';

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