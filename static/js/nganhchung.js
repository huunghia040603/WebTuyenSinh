// Khai báo các biến và hằng số
const API_URL = 'https://timtruonghoc.pythonanywhere.com/all_major_has_pagi/';
const majorsGrid = document.getElementById('majorsGrid');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const pageNumbersDiv = document.getElementById('pageNumbers');


// Các trường input và dropdown
const nameSearchInput = document.getElementById('nameSearchInput');
const opportunitiesSearchSelect = document.getElementById('opportunitiesSearch');
const durationSearchSelect = document.getElementById('durationSearch');


const tuitionSortSelect = document.getElementById('tuitionSort'); // Biến mới cho sắp xếp
const searchButton = document.getElementById('searchButton');


let currentPage = parseInt(localStorage.getItem('nganhchung_currentPage')) || 1;
let totalPages = 1;
let currentSearchState = {}; // Lưu trữ trạng thái tìm kiếm hiện tại


// Hàm fetch dữ liệu từ API
async function fetchMajors(page = 1, params = {}) {
    majorsGrid.innerHTML = `
    <style>
        .modern-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; width: 100%; margin: 0 auto; margin-left: 105%; }
        .modern-loader-spinner { width: 84px; height: 84px; border-radius: 50%; border: 6px solid #e0e7ef; border-top: 6px solid #0a4191; border-right: 6px solid #ffa200; border-bottom: 6px solid #0c01ad; animation: modern-spin 1.1s linear infinite; box-shadow: 0 4px 24px #00e0ff33, 0 0 0 4px #fff8; margin-bottom: 18px; }
        @keyframes modern-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .modern-loader-text { font-size: 1.15rem; color: #0a4191; font-weight: 700; letter-spacing: 1px; text-align: center; text-shadow: 0 2px 12px #00e0ff22; }
    </style>
    <div class="modern-loader">
        <div class="modern-loader-spinner"></div>
        <div class="modern-loader-text">Tôi đang tải dữ liệu! <br/> Chờ tôi xíu nhé...</div>
    </div>
    `;


    try {
        const urlParams = new URLSearchParams(params);
        urlParams.set('page', page);
       
        const response = await fetch(`${API_URL}?${urlParams.toString()}`);
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


// Hàm render dữ liệu ra giao diện (không đổi)
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
        majorImage.src = major.field?.cover || '/static/images/default.png';
        majorImage.alt = major.name;
        majorImageDiv.appendChild(majorImage);


        const majorContent = document.createElement('div');
        majorContent.classList.add('major-content');


        const majorTitle = document.createElement('h3');
        majorTitle.classList.add('major-title');
        majorTitle.textContent = major.name;
       
        // Utility function để decode HTML entities và loại bỏ HTML tags
        function cleanHtmlText(text) {
            if (!text) return '';
            
            // Tạo một element tạm để decode HTML entities
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Lấy text content (loại bỏ HTML tags)
            let cleanText = tempDiv.textContent || tempDiv.innerText || '';
            
            // Loại bỏ các ký tự xuống dòng và khoảng trắng thừa
            cleanText = cleanText.replace(/\s+/g, ' ').trim();
            
            return cleanText;
        }

        const majorDescription = document.createElement('p');
        majorDescription.classList.add('major-description');
        console.log('🔍 Original short_description (nganhchung):', major.short_description);
        const cleanDescription = cleanHtmlText(major.short_description);
        console.log('✨ Cleaned short_description (nganhchung):', cleanDescription);
        majorDescription.textContent = cleanDescription || 'Không có mô tả ngắn.';
       
        const majorInfoDiv = document.createElement('div');
        majorInfoDiv.classList.add('major-info');


        const infoBoxesDiv = document.createElement('div');
        infoBoxesDiv.classList.add('info-boxes');


        const infoRow1 = document.createElement('div');
        infoRow1.classList.add('info-row');
       
        const trainingDurationBox = document.createElement('div');
        trainingDurationBox.classList.add('info-box', 'small');
        trainingDurationBox.innerHTML = `Thời gian học: ${major.training_duration || 'Đang cập nhật'} năm`;
       
        const salaryBox = document.createElement('div');
        salaryBox.classList.add('info-box', 'small', 'vang');
        salaryBox.innerHTML = `Thu nhập: ${major.salary || 'Đang cập nhật'}`;
       
        infoRow1.appendChild(trainingDurationBox);
        infoRow1.appendChild(salaryBox);


        const infoRow2 = document.createElement('div');
        infoRow2.classList.add('info-row');
       
        const tuitionFeeBox = document.createElement('div');
        tuitionFeeBox.classList.add('info-box', 'small');
        
        // Cập nhật hiển thị học phí từ model Major
        let tuitionDisplay = 'Đang cập nhật';
        
        // Debug: Log thông tin học phí
        console.log('Major tuition data (nganhchung):', {
            major_id: major.all_major_id,
            min_tuition: major.min_tuition_fee_per_year,
            max_tuition: major.max_tuition_fee_per_year,
            old_tuition: major.tuition_fee_per_year
        });
        
        // Ưu tiên thông tin học phí mới từ model Major
        if (major.min_tuition_fee_per_year && major.max_tuition_fee_per_year) {
            const min = major.min_tuition_fee_per_year;
            const max = major.max_tuition_fee_per_year;
            
            if (min === "0" && max === "0") {
                tuitionDisplay = 'Miễn phí';
            } else if (min === max) {
                tuitionDisplay = `${min} triệu/năm`;
            } else {
                tuitionDisplay = `${min} - ${max} triệu/năm`;
            }
        } else if (major.min_tuition_fee_per_year) {
            tuitionDisplay = `Từ ${major.min_tuition_fee_per_year} triệu/năm`;
        } else if (major.max_tuition_fee_per_year) {
            tuitionDisplay = `Đến ${major.max_tuition_fee_per_year} triệu/năm`;
        } else {
            // Fallback về thông tin học phí cũ nếu không có thông tin mới
            tuitionDisplay = major.tuition_fee_per_year || 'Đang cập nhật';
        }
        
        console.log('Final tuition display (nganhchung):', tuitionDisplay);
        tuitionFeeBox.innerHTML = `Học phí: ${tuitionDisplay}`;
       
        const opportunitiesBox = document.createElement('div');
        opportunitiesBox.classList.add('info-box', 'small', 'vang');
        opportunitiesBox.textContent = `Cơ hội  việc làm: ${major.opportunities || 'Đang cập nhật'}`;
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


// Cập nhật phân trang (giống ảnh)
function updatePagination(nextUrl, previousUrl) {
    prevPageButton.disabled = !previousUrl;
    nextPageButton.disabled = !nextUrl;
    
    // Style cho nút Trước/Sau
    prevPageButton.classList.toggle('disabled', !previousUrl);
    nextPageButton.classList.toggle('disabled', !nextUrl);
    prevPageButton.classList.add('pagination-nav-btn');
    nextPageButton.classList.add('pagination-nav-btn');
    prevPageButton.innerHTML = '&laquo; <b>Trước</b>';
    nextPageButton.innerHTML = '<b>Sau</b> &raquo;';

    // Xóa số trang cũ
    pageNumbersDiv.innerHTML = '';
    
    // Tính toán dải trang hiển thị
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Thêm nút trang đầu nếu cần
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.classList.add('page-number-button');
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            if (1 !== currentPage) {
                localStorage.setItem('nganhchung_currentPage', '1');
                fetchMajors(1, currentSearchState);
            }
        });
        pageNumbersDiv.appendChild(firstPageButton);
        
        // Thêm dấu ... nếu có khoảng trống
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            pageNumbersDiv.appendChild(ellipsis);
        }
    }
    
    // Thêm các nút trang chính
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-number-button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) {
                localStorage.setItem('nganhchung_currentPage', i.toString());
                fetchMajors(i, currentSearchState);
            }
        });
        pageNumbersDiv.appendChild(pageButton);
    }
    
    // Thêm nút trang cuối nếu cần
    if (endPage < totalPages) {
        // Thêm dấu ... nếu có khoảng trống
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('pagination-ellipsis');
            ellipsis.textContent = '...';
            pageNumbersDiv.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.classList.add('page-number-button');
        lastPageButton.textContent = totalPages;
        lastPageButton.addEventListener('click', () => {
            if (totalPages !== currentPage) {
                localStorage.setItem('nganhchung_currentPage', totalPages.toString());
                fetchMajors(totalPages, currentSearchState);
            }
        });
        pageNumbersDiv.appendChild(lastPageButton);
    }
}


// Hàm xử lý tìm kiếm và sắp xếp
function handleSearch() {
    // Lấy giá trị từ các dropdown
    const nameQuery = nameSearchInput.value.trim();
    const opportunitiesQuery = opportunitiesSearchSelect.value;
    const durationQuery = durationSearchSelect.value;
   
    const sortQuery = tuitionSortSelect.value; // Lấy giá trị sắp xếp mới
   
    // Tạo đối tượng chứa các tham số
    const params = {};
    if (nameQuery) params.name = nameQuery;
    if (opportunitiesQuery) params.opportunities = opportunitiesQuery;
    if (durationQuery) params.all_training_duration = durationQuery;


   
   
    // Gán tham số sắp xếp
    if (sortQuery) {
        params.ordering = sortQuery;
    }


    const isSearchChanged = JSON.stringify(params) !== JSON.stringify(currentSearchState);


    if (isSearchChanged) {
        currentSearchState = params;
        fetchMajors(1, currentSearchState);
    }
}


// Xử lý sự kiện cho các nút phân trang
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        localStorage.setItem('nganhchung_currentPage', (currentPage - 1).toString());
        fetchMajors(currentPage - 1, currentSearchState);
    }
});


nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        localStorage.setItem('nganhchung_currentPage', (currentPage + 1).toString());
        fetchMajors(currentPage + 1, currentSearchState);
    }
});


// Xử lý sự kiện tìm kiếm
searchButton.addEventListener('click', handleSearch);


// Gán sự kiện 'keyup' cho ô input và 'change' cho các dropdown
nameSearchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});


opportunitiesSearchSelect.addEventListener('change', handleSearch);
durationSearchSelect.addEventListener('change', handleSearch);


tuitionSortSelect.addEventListener('change', handleSearch); // Gán sự kiện change cho dropdown sắp xếp


// Thêm style cho nút chuyển trang nhỏ gọn hơn
const style = document.createElement('style');
style.innerHTML = `
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 18px;
    padding: 8px;
    border-radius: 12px;
}
.pagination-nav-btn {
    padding: 7px 18px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    background: #f9fafb;
    color: #3b82f6;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px #0a419111;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pagination-nav-btn.disabled, .pagination-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #e0e0e0;
    color: #888;
    border-color: #ccc;
}
.pagination-nav-btn:not(.disabled):hover {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
    box-shadow: 0 4px 12px #3b82f633;
    transform: translateY(-2px);
}
.page-number-button {
    padding: 7px 13px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    color: #222;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0 1px;
}
.page-number-button.active {
    background: #388bff;
    color: #fff;
    border-color: #388bff;
    box-shadow: 0 2px 8px #388bff33;
    transform: translateY(-2px);
}
.page-number-button:hover:not(.active) {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #388bff;
    transform: translateY(-1px);
}
.pagination-ellipsis {
    color: #6b7280;
    font-weight: 600;
    font-size: 1rem;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
}`;
document.head.appendChild(style);


// Gọi hàm fetch ban đầu để tải dữ liệu khi trang web được load
document.addEventListener('DOMContentLoaded', () => {
    fetchMajors(currentPage, currentSearchState);
});
