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
    let allMajors = []; // Lưu trữ tất cả dữ liệu ngành học
    let filteredMajors = []; // Dữ liệu đã lọc
    
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

    // Hàm lấy tất cả dữ liệu ngành học từ API
    async function fetchAllMajors() {
        try {
            let allResults = [];
            let page = 1;
            let hasMoreData = true;

            while (hasMoreData) {
                let url = new URL(API_URL);
                url.searchParams.set('page', page);
                url.searchParams.set('page_size', 100); // Lấy 22 items mỗi lần

                const response = await fetch(url.toString());
                
                if (response.status === 404) {
                    // Không còn trang nào nữa
                    hasMoreData = false;
                    break;
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const results = data.results || [];
                
                if (results.length === 0) {
                    hasMoreData = false;
                } else {
                    allResults = allResults.concat(results);
                    page++;
                }
            }

            console.log(`Đã tải tổng cộng ${allResults.length} ngành học`);
            return allResults;
        } catch (error) {
            console.error('Lỗi khi fetch tất cả dữ liệu ngành học:', error);
            return [];
        }
    }

    // Hàm lọc dữ liệu theo các bộ lọc
    function filterMajors(majors, filters) {
        return majors.filter(major => {
            // Lọc theo tìm kiếm
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const majorName = (major.name || '').toLowerCase();
                const schoolName = (major.school?.name_vn || '').toLowerCase();
                if (!majorName.includes(searchLower) && !schoolName.includes(searchLower)) {
                    return false;
                }
            }

            // Lọc theo học phí
            if (filters.tuition !== 'all') {
                const minFee = parseFloat(major.min_tuition_fee_per_year) || 0;
                const maxFee = parseFloat(major.max_tuition_fee_per_year) || 0;
                const avgFee = (minFee + maxFee) / 2;

                switch (filters.tuition) {
                    case 'free':
                        if (minFee !== 0 || maxFee !== 0) return false;
                        break;
                    case '10-30':
                        if (avgFee < 10000000 || avgFee > 30000000) return false;
                        break;
                    case '30-50':
                        if (avgFee < 30000000 || avgFee > 50000000) return false;
                        break;
                    case '50-80':
                        if (avgFee < 50000000 || avgFee > 80000000) return false;
                        break;
                    case '80-100':
                        if (avgFee < 80000000 || avgFee > 100000000) return false;
                        break;
                    case '100-plus':
                        if (avgFee < 100000000) return false;
                        break;
                }
            }

            // Có thể thêm các bộ lọc khác ở đây
            return true;
        });
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
                        ${majorLabelHtml}
                        <div class="major-title">${major.name}</div>
                        <div class="major-school">${major.school ? major.school.name_vn : 'Đang cập nhật'}</div>
                    </div>
                </div>
                <div class="major-info-row">
                    <span class="major-fee">${feeText}</span>
                    <span class="major-location">${major.school ? major.school.country : 'Đang cập nhật'}</span>
                </div>
                <button class="major-fav-btn" title="Yêu thích"><i class="far fa-heart"></i></button>
            `;
            majorsGrid.appendChild(majorCard);
        });
    }

    // Hàm render thanh phân trang (cập nhật để làm việc với dữ liệu local)
    function renderPagination(filteredData) {
        paginationBar.innerHTML = '';
        totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

        if (totalPages <= 1) {
            return;
        }

        const prevBtn = document.createElement('button');
        prevBtn.classList.add('pagination-btn');
        prevBtn.innerHTML = '&lt;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayCurrentPage();
            }
        });
        paginationBar.appendChild(prevBtn);

        // Hiển thị các nút số trang
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
                displayCurrentPage();
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
                displayCurrentPage();
            });
            paginationBar.appendChild(lastPageBtn);
        }
        
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('pagination-btn');
        nextBtn.innerHTML = '&gt;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayCurrentPage();
            }
        });
        paginationBar.appendChild(nextBtn);
    }

    // Hàm hiển thị trang hiện tại
    function displayCurrentPage() {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageData = filteredMajors.slice(startIndex, endIndex);
        
        renderMajorCards(pageData);
        renderPagination(filteredMajors);
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
    async function loadMajors() {
        loadingContainer.style.display = 'flex';
        majorsGrid.style.display = 'none';
        paginationBar.style.display = 'none';

        // Lọc dữ liệu
        filteredMajors = filterMajors(allMajors, currentFilters);
        currentPage = 1; // Reset về trang đầu

        loadingContainer.style.display = 'none';
        majorsGrid.style.display = '';
        paginationBar.style.display = '';

        displayCurrentPage();
    }

    // Hàm khởi tạo ban đầu
    async function initialize() {
        loadingContainer.style.display = 'flex';
        majorsGrid.style.display = 'none';
        paginationBar.style.display = 'none';

        // Tải tất cả dữ liệu
        allMajors = await fetchAllMajors();
        
        // Cập nhật filters ban đầu
        updateCurrentFilters();
        
        // Hiển thị dữ liệu
        await loadMajors();
    }

    // --- Xử lý sự kiện ---
    // Khi form tìm kiếm được submit (nhấn nút hoặc Enter)
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        updateCurrentFilters();
        loadMajors();
    });

    // Khi bất kỳ bộ lọc select nào thay đổi
    tuitionFeeFilter.addEventListener('change', () => {
        updateCurrentFilters();
        loadMajors();
    });

    educationLevelFilter.addEventListener('change', () => {
        updateCurrentFilters();
        loadMajors();
    });

    locationFilter.addEventListener('change', () => {
        updateCurrentFilters();
        loadMajors();
    });

    admissionScoreFilter.addEventListener('change', () => {
        updateCurrentFilters();
        loadMajors();
    });

    // Khởi tạo khi trang được tải
    initialize();
});