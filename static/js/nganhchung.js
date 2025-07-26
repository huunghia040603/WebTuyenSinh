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
        totalPages = Math.ceil(data.count / data.results.length); // Giả định mỗi trang có 10 kết quả
        
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
        majorImage.src = major.field.cover || 'N/A'; // Sử dụng ảnh từ field, nếu không có thì dùng ảnh mặc định
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
        
        const salaryBox = document.createElement('div');
        salaryBox.classList.add('info-box');
        salaryBox.textContent = `Mức lương TB: ${major.salary || 'Đang cập nhật'}`;
        
        const opportunityBox = document.createElement('div');
        opportunityBox.classList.add('info-box');
        opportunityBox.textContent = `Điểm cơ hội: ${major.opportunities || 'Đang cập nhật'}`;

        infoBoxesDiv.appendChild(salaryBox);
        infoBoxesDiv.appendChild(opportunityBox);

        const viewMoreButton = document.createElement('button');
        viewMoreButton.classList.add('view-more-btn');
        viewMoreButton.textContent = 'Xem Thêm';
        // Thêm event listener cho nút xem thêm nếu cần
        // viewMoreButton.addEventListener('click', () => {
        //     window.location.href = `/major-details/${major.all_major_id}`;
        // });

        majorInfoDiv.appendChild(infoBoxesDiv);
        majorInfoDiv.appendChild(viewMoreButton);

        majorContent.appendChild(majorTitle);
        majorContent.appendChild(majorDescription);
        majorContent.appendChild(majorInfoDiv);

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