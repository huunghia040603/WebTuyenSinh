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
        
        currentPage = page;
        totalPages = Math.ceil(data.count / 9);
        
        renderMajors(data.results);
        updatePagination(data.next, data.previous);

    } catch (error) {
        console.error('Lỗi:', error);
        majorsGrid.innerHTML = '<div class="error">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
    }
}

// Hàm render dữ liệu ra giao diện
function renderMajors(majors) {
    majorsGrid.innerHTML = '';
    if (majors.length === 0) {
        majorsGrid.innerHTML = '<div class="no-results">Không tìm thấy ngành học nào.</div>';
        return;
    }

    majors.forEach(major => {
        const majorCard = document.createElement('div');
        majorCard.classList.add('major-card');

        const majorImageDiv = document.createElement('div');
        majorImageDiv.classList.add('major-image');
        const majorImage = document.createElement('img');
        majorImage.src = major.field.cover || '/static/images/default.png'; 
        majorImage.alt = major.name;
        majorImageDiv.appendChild(majorImage);

        const majorContent = document.createElement('div');
        majorContent.classList.add('major-content');

        const majorTitle = document.createElement('h3');
        majorTitle.classList.add('major-title');
        majorTitle.textContent = major.name;
        
        const majorDescription = document.createElement('p');
        majorDescription.classList.add('major-description');
        // Sửa: Sử dụng innerHTML để hiển thị nội dung RichTextField
        majorDescription.innerHTML = major.short_description || 'Không có mô tả ngắn.';
        
        const majorInfoDiv = document.createElement('div');
        majorInfoDiv.classList.add('major-info');

        const infoBoxesDiv = document.createElement('div');
        infoBoxesDiv.classList.add('info-boxes');

        const infoRow1 = document.createElement('div');
        infoRow1.classList.add('info-row');
        
        const trainingDurationBox = document.createElement('div');
        trainingDurationBox.classList.add('info-box', 'small');
        // Sửa: Sử dụng innerHTML cho các trường RichTextField
        trainingDurationBox.innerHTML = `Thời gian học: ${major.training_duration || 'Đang cập nhật'}`;
        
        const salaryBox = document.createElement('div');
        salaryBox.classList.add('info-box', 'small', 'vang');
        // Sửa: Sử dụng innerHTML cho các trường có thể chứa HTML
        salaryBox.innerHTML = `Thu nhập: ${major.salary || 'Đang cập nhật'}`;
        
        infoRow1.appendChild(trainingDurationBox);
        infoRow1.appendChild(salaryBox);

        const infoRow2 = document.createElement('div');
        infoRow2.classList.add('info-row');
        
        const tuitionFeeBox = document.createElement('div');
        tuitionFeeBox.classList.add('info-box', 'small');
        // Sửa: Sử dụng innerHTML cho các trường RichTextField
        tuitionFeeBox.innerHTML = `Học phí: ${major.tuition_fee_per_year || 'Đang cập nhật'}`;
        
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
        
        viewMoreButton.addEventListener('click', () => {
            window.location.href = `/nganh/${major.all_major_id}`;
        });

        majorInfoDiv.appendChild(infoBoxesDiv);
        majorInfoDiv.appendChild(viewMoreButton);

        majorContent.appendChild(majorTitle);
        majorContent.appendChild(majorDescription);
        majorContent.appendChild(majorInfoDiv);

        majorCard.appendChild(majorImageDiv);
        majorCard.appendChild(majorContent);
        
        majorCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-more-btn')) {
                return;
            }
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