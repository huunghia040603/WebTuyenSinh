document.addEventListener('DOMContentLoaded', () => {
    const majorsGrid = document.getElementById('majors-grid');
    const paginationBar = document.getElementById('pagination-bar');
    const loadingContainer = document.getElementById('loadingContainer'); // Đã đổi tên

    // Lấy tham chiếu đến các phần tử từ index.html
    const searchForm = document.getElementById('major-search-form'); // Form tìm kiếm
    const searchInput = document.getElementById('major-search-input'); // Input tìm kiếm

    const tuitionFeeFilter = document.getElementById('tuition-fee-filter');
    const educationLevelFilter = document.getElementById('education-level-filter');
    const locationFilter = document.getElementById('location-filter');
    const admissionScoreFilter = document.getElementById('admission-score-filter');

    const API_URL = 'https://timtruonghoc.pythonanywhere.com/majors-outstanding/'; 

    const PAGE_SIZE = 15;
    let currentPage = 1;
    let totalPages = 1;
    // Lưu trữ các giá trị lọc hiện tại
    let currentFilters = {
        search: '',
        tuition: 'all',
        level: 'all',
        location: 'all',
        admission: 'all'
    };

    // Hàm định dạng số tiền (giữ nguyên)
    function formatCurrency(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0) {
            return "Miễn phí";
        }
        const amountInMillions = numAmount / 1000000;
        if (amountInMillions % 1 === 0) {
            return `${parseInt(amountInMillions)} triệu`; 
        } else {
            return `${amountInMillions.toFixed(1)} triệu`; 
        }
    }

    // Hàm lấy dữ liệu ngành học từ API
    // Bây giờ nhận một object filters thay vì chỉ searchQuery
    async function fetchMajors(page, filters) {
        try {
            let url = new URL(API_URL);
            url.searchParams.set('page', page);
            url.searchParams.set('page_size', PAGE_SIZE); // Giới hạn 15 ngành/trang

            if (filters.search) {
                url.searchParams.set('search', filters.search);
            }
            
            // --- XỬ LÝ LỌC HỌC PHÍ MỚI ---
            if (filters.tuition !== 'all') {
                switch (filters.tuition) {
                    case 'free': // Miễn phí
                        url.searchParams.set('min_tuition_fee_gte', 0);
                        url.searchParams.set('max_tuition_fee_lte', 0);
                        break;
                    case '10-30': // 10 triệu - 30 triệu
                        url.searchParams.set('min_tuition_fee_gte', 10000000);
                        url.searchParams.set('max_tuition_fee_lte', 30000000);
                        break;
                    case '30-50': // 30 triệu - 50 triệu
                        url.searchParams.set('min_tuition_fee_gte', 30000000);
                        url.searchParams.set('max_tuition_fee_lte', 50000000);
                        break;
                    case '50-80': // 50 triệu - 80 triệu
                        url.searchParams.set('min_tuition_fee_gte', 50000000);
                        url.searchParams.set('max_tuition_fee_lte', 80000000);
                        break;
                    case '80-100': // 80 triệu - 100 triệu
                        url.searchParams.set('min_tuition_fee_gte', 80000000);
                        url.searchParams.set('max_tuition_fee_lte', 100000000);
                        break;
                    case '100-plus': // Hơn 100 triệu
                        url.searchParams.set('min_tuition_fee_gte', 100000000);
                        // Không đặt max_tuition_fee_lte để lấy tất cả các khoản lớn hơn 100 triệu
                        break;
                }
            }
            // --- KẾT THÚC XỬ LÝ LỌC HỌC PHÍ MỚI ---

            if (filters.level !== 'all') {
                // Ví dụ: url.searchParams.set('school__school_level', filters.level);
                // Bạn cần ánh xạ giá trị level từ dropdown sang tên trường lọc thực tế nếu có
            }
            if (filters.location !== 'all') {
                // Ví dụ: url.searchParams.set('school__country', filters.location);
                // Bạn cần ánh xạ giá trị location từ dropdown sang tên trường lọc thực tế nếu có
            }
            if (filters.admission !== 'all') {
                // Ví dụ: url.searchParams.set('admission_scores__score__gte', 15);
                // Bạn cần ánh xạ giá trị admission từ dropdown sang tên trường lọc thực tế nếu có
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu ngành học:', error);
            majorsGrid.innerHTML = '<p>Không thể tải dữ liệu ngành học. Vui lòng thử lại sau.</p>';
            paginationBar.innerHTML = '';
            return null;
        }
    }

    // Hàm render các thẻ ngành học (giữ nguyên)
    function renderMajorCards(majors) {
        majorsGrid.innerHTML = '';
        if (majors.length === 0) {
            majorsGrid.innerHTML = '<p>Không tìm thấy ngành học nào phù hợp.</p>';
            return;
        }
        majors.forEach(major => {
            const majorCard = document.createElement('div');
            majorCard.classList.add('major-card');

            let feeText = '';
            if (major.min_tuition_fee_per_year === "0" && major.max_tuition_fee_per_year === "0") {
                feeText = 'Miễn phí';
            } else if (major.min_tuition_fee_per_year && major.max_tuition_fee_per_year && major.min_tuition_fee_per_year !== major.max_tuition_fee_per_year) {
                feeText = `${formatCurrency(major.min_tuition_fee_per_year)} - ${formatCurrency(major.max_tuition_fee_per_year)}`;
            } else if (major.min_tuition_fee_per_year) {
                feeText = formatCurrency(major.min_tuition_fee_per_year);
            } else {
                feeText = 'Đang cập nhật';
            }

            let majorLabelHtml = '';
            
            if (major.school) {
                if (major.school.school_type === 'public') {
                    majorLabelHtml += `<span class="major-label conglap">Công lập</span>`;
                } else if (major.school.school_type === 'private') {
                    majorLabelHtml += `<span class="major-label ngoaiconglap">Ngoài công lập</span>`;
                }
            }

            if (major.tags && major.tags.toLowerCase() === 'outstanding') {
                majorLabelHtml += `<span class="major-label noibat">Nổi bật</span>`;
            } else if (major.tags && major.tags.toLowerCase() === 'pro') {
                majorLabelHtml += `<span class="major-label pro">Pro</span>`;
            } else if (major.tags && major.tags.toLowerCase() !== 'none' && major.tags.toLowerCase() !== 'outstanding' && major.tags !== '') {
                if (major.tags.toLowerCase().includes('top')) {
                    majorLabelHtml += `<span class="major-label top">TOP</span>`;
                } else if (major.tags.toLowerCase() === 'pro') {
                    majorLabelHtml += `<span class="major-label pro">Pro</span>`;
                } else {
                    majorLabelHtml += `<span class="major-label">${major.tags}</span>`;
                }
            }

            majorCard.innerHTML = `
                <div class="major-card-header">
                    <img src="${major.school ? major.school.logo : ''}" class="major-logo" alt="logo trường">
                    <div>
                        <div class="major-title">${major.name}</div>
                        <div class="major-school">${major.school ? major.school.name_vn : 'Đang cập nhật'}</div>
                    </div>
                </div>
                <div class="major-info-row">
                    <span class="major-fee">${feeText}</span>
                    <span class="major-location">${major.school ? major.school.country : 'Đang cập nhật'}</span>
                    ${majorLabelHtml}
                </div>
                <button class="major-fav-btn" title="Yêu thích"><i class="far fa-heart"></i></button>
            `;
            majorsGrid.appendChild(majorCard);
        });
    }

    // Hàm render thanh phân trang (giữ nguyên, nhưng truyền filters)
    function renderPagination(count, next, previous) {
        paginationBar.innerHTML = '';
        totalPages = Math.ceil(count / PAGE_SIZE);

        const prevBtn = document.createElement('button');
        prevBtn.classList.add('pagination-btn');
        prevBtn.innerHTML = '&lt;';
        prevBtn.disabled = !previous;
        prevBtn.addEventListener('click', () => {
            if (previous) {
                currentPage--;
                loadMajors(currentPage, currentFilters);
            }
        });
        paginationBar.appendChild(prevBtn);

        // Hiển thị các nút số trang, luôn đúng tổng số trang
        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('pagination-btn');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('pagination-current');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadMajors(currentPage, currentFilters);
            });
            paginationBar.appendChild(pageBtn);
        }
        if (endPage < totalPages) {
            const ellipsis = document.createElement('span');
            ellipsis.style.color = '#aaa';
            ellipsis.textContent = '...';
            paginationBar.appendChild(ellipsis);
            const lastPageBtn = document.createElement('button');
            lastPageBtn.classList.add('pagination-btn');
            lastPageBtn.textContent = totalPages;
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                loadMajors(currentPage, currentFilters);
            });
            paginationBar.appendChild(lastPageBtn);
        }
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('pagination-btn');
        nextBtn.innerHTML = '&gt;';
        nextBtn.disabled = !next;
        nextBtn.addEventListener('click', () => {
            if (next) {
                currentPage++;
                loadMajors(currentPage, currentFilters);
            }
        });
        paginationBar.appendChild(nextBtn);
    }

    // Hàm cập nhật `currentFilters` từ các input/select trên giao diện
    function updateCurrentFilters() {
        currentFilters.search = searchInput.value.trim();
        currentFilters.tuition = tuitionFeeFilter.value;
        currentFilters.level = educationLevelFilter.value;
        currentFilters.location = locationFilter.value;
        currentFilters.admission = admissionScoreFilter.value;
    }

    // Hàm tải dữ liệu và cập nhật giao diện
    async function loadMajors(page, filters) {
        majorsGrid.innerHTML = '';
        paginationBar.innerHTML = '';
        loadingContainer.style.display = 'flex';
        majorsGrid.style.display = 'none';
        paginationBar.style.display = 'none';

        const data = await fetchMajors(page, filters);

        loadingContainer.style.display = 'none';
        majorsGrid.style.display = '';
        paginationBar.style.display = '';

        if (data) {
            renderMajorCards(data.results);
            renderPagination(data.count, data.next, data.previous);
        }
    }

    // --- Xử lý sự kiện ---
    // Khi form tìm kiếm được submit (nhấn nút hoặc Enter)
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Ngăn chặn form submit gây tải lại trang
        currentPage = 1;
        updateCurrentFilters(); // Cập nhật các bộ lọc hiện tại
        loadMajors(currentPage, currentFilters);
    });

    // Khi bất kỳ bộ lọc select nào thay đổi
    tuitionFeeFilter.addEventListener('change', () => {
        currentPage = 1;
        updateCurrentFilters();
        loadMajors(currentPage, currentFilters);
    });

    educationLevelFilter.addEventListener('change', () => {
        currentPage = 1;
        updateCurrentFilters();
        loadMajors(currentPage, currentFilters);
    });

    locationFilter.addEventListener('change', () => {
        currentPage = 1;
        updateCurrentFilters();
        loadMajors(currentPage, currentFilters);
    });

    admissionScoreFilter.addEventListener('change', () => {
        currentPage = 1;
        updateCurrentFilters();
        loadMajors(currentPage, currentFilters);
    });

    // Tải dữ liệu lần đầu khi trang được tải
    // Đảm bảo khởi tạo currentFilters ban đầu
    updateCurrentFilters(); // Lấy giá trị mặc định khi tải trang
    loadMajors(currentPage, currentFilters);
});