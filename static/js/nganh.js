console.log('📜 Script nganh.js được load');
console.log('📜 DOM ready state:', document.readyState);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded event fired');
    
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
    
    // Kiểm tra xem các filter element có tồn tại không
    console.log('🔍 Kiểm tra các filter element:');
    console.log('- searchForm:', !!searchForm);
    console.log('- searchInput:', !!searchInput);
    console.log('- tuitionFeeFilter:', !!tuitionFeeFilter);
    console.log('- educationLevelFilter:', !!educationLevelFilter);
    console.log('- locationFilter:', !!locationFilter);
    console.log('- admissionScoreFilter:', !!admissionScoreFilter);

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
            console.log('🚀 Bắt đầu fetch dữ liệu ngành học từ:', API_URL);
            let allResults = [];
            let page = 1;
            let hasMoreData = true;

            while (hasMoreData) {
                let url = new URL(API_URL);
                url.searchParams.set('page', page);
                url.searchParams.set('page_size', 100); // Lấy 100 items mỗi lần

                console.log(`📄 Đang fetch trang ${page}:`, url.toString());
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log(`📊 Response status: ${response.status}`);
                console.log(`📊 Response headers:`, response.headers);
                
                if (response.status === 404) {
                    // Không còn trang nào nữa
                    console.log('🔚 Không còn trang nào nữa');
                    hasMoreData = false;
                    break;
                }
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                let data;
                try {
                    data = await response.json();
                    console.log(`📋 Dữ liệu trang ${page}:`, data);
                } catch (jsonError) {
                    console.error('❌ Lỗi parse JSON:', jsonError);
                    console.log('📄 Response text:', await response.text());
                    throw jsonError;
                }
                const results = data.results || [];
                
                if (results.length === 0) {
                    console.log('📭 Không có dữ liệu trong trang này');
                    hasMoreData = false;
                } else {
                    allResults = allResults.concat(results);
                    console.log(`✅ Đã thêm ${results.length} ngành học từ trang ${page}`);
                    page++;
                }
            }

            console.log(`🎯 Đã tải tổng cộng ${allResults.length} ngành học`);
            return allResults;
        } catch (error) {
            console.error('❌ Lỗi khi fetch tất cả dữ liệu ngành học:', error);
            console.error('❌ Error details:', error.message);
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
        console.log('🎨 Bắt đầu renderMajorCards...');
        console.log('📊 Số ngành học cần render:', majors.length);
        
        if (!majorsGrid) {
            console.error('❌ majorsGrid không tồn tại');
            return;
        }
        
        majorsGrid.innerHTML = '';
        if (majors.length === 0) {
            console.log('📭 Không có ngành học nào để hiển thị');
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
            
            // Thêm click event cho toàn bộ card để chuyển hướng đến trang chi tiết ngành riêng
            majorCard.addEventListener('click', (e) => {
                // Không trigger nếu click vào favorite button
                if (e.target.closest('.major-fav-btn')) {
                    return;
                }
                
                // Navigate to major detail page (specific to this school)
                if (major.school && major.major_id) {
                    const majorId = major.major_id;
                    const schoolShortCode = major.school.short_code;
                    window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
                }
            });
            
            // Add event listener for favorite button
            const favBtn = majorCard.querySelector('.major-fav-btn');
            if (favBtn && major.school) {
                // Check favorite status from localStorage
                const favoriteKey = `favorite_${major.school.short_code}_${major.major_id}`;
                const isFavorite = localStorage.getItem(favoriteKey) === 'true';
                
                if (isFavorite) {
                    favBtn.classList.add('active');
                    const icon = favBtn.querySelector('i');
                    icon.className = 'fas fa-heart';
                    icon.style.color = '#ff4757';
                }
                
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleMajorFavoriteInNganh(major, favBtn);
                });
            }
            
            // Add event listener for major title (optional - for better UX)
            const majorTitle = majorCard.querySelector('.major-title');
            if (majorTitle) {
                majorTitle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Navigate to major detail page (specific to this school)
                    if (major.school && major.major_id) {
                        const majorId = major.major_id;
                        const schoolShortCode = major.school.short_code;
                        window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
                    }
                });
            }
            
            majorsGrid.appendChild(majorCard);
        });
        console.log('✅ renderMajorCards hoàn tất!');
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
        console.log('📄 Bắt đầu displayCurrentPage...');
        console.log('📍 currentPage:', currentPage);
        console.log('📏 PAGE_SIZE:', PAGE_SIZE);
        console.log('📊 filteredMajors.length:', filteredMajors.length);
        
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageData = filteredMajors.slice(startIndex, endIndex);
        
        console.log('🔢 startIndex:', startIndex);
        console.log('🔢 endIndex:', endIndex);
        console.log('📋 pageData.length:', pageData.length);
        console.log('📋 pageData:', pageData);
        
        renderMajorCards(pageData);
        renderPagination(filteredMajors);
        console.log('✅ displayCurrentPage hoàn tất!');
    }

    // Hàm cập nhật `currentFilters` từ các input/select trên giao diện
    function updateCurrentFilters() {
        currentFilters.search = searchInput ? searchInput.value.trim() : '';
        currentFilters.tuition = tuitionFeeFilter ? tuitionFeeFilter.value : 'all';
        currentFilters.level = educationLevelFilter ? educationLevelFilter.value : 'all';
        currentFilters.location = locationFilter ? locationFilter.value : 'all';
        currentFilters.admission = admissionScoreFilter ? admissionScoreFilter.value : 'all';
        
        console.log('🔍 Updated filters:', currentFilters);
    }

    // Hàm tải dữ liệu và cập nhật giao diện
    async function loadMajors() {
        console.log('🔄 Bắt đầu loadMajors...');
        console.log('📊 Số ngành học gốc:', allMajors.length);
        console.log('🔍 Filters hiện tại:', currentFilters);
        
        // Kiểm tra các element
        if (!loadingContainer || !majorsGrid || !paginationBar) {
            console.error('❌ Thiếu element trong loadMajors');
            return;
        }
        
        loadingContainer.style.display = 'flex';
        majorsGrid.style.display = 'none';
        paginationBar.style.display = 'none';

        // Lọc dữ liệu
        filteredMajors = filterMajors(allMajors, currentFilters);
        console.log('📋 Số ngành học sau khi lọc:', filteredMajors.length);
        currentPage = 1; // Reset về trang đầu

        loadingContainer.style.display = 'none';
        majorsGrid.style.display = '';
        paginationBar.style.display = '';

        displayCurrentPage();
        console.log('✅ loadMajors hoàn tất!');
    }

    // Hàm khởi tạo ban đầu
    async function initialize() {
        console.log('🎬 Bắt đầu khởi tạo trang ngành học...');
        
        // Kiểm tra các element trước khi sử dụng
        if (!loadingContainer || !majorsGrid || !paginationBar) {
            console.error('❌ Thiếu các element cần thiết:', {
                loadingContainer: !!loadingContainer,
                majorsGrid: !!majorsGrid,
                paginationBar: !!paginationBar
            });
            return;
        }
        
        loadingContainer.style.display = 'flex';
        majorsGrid.style.display = 'none';
        paginationBar.style.display = 'none';

        // Tải tất cả dữ liệu
        console.log('📥 Đang tải dữ liệu ngành học...');
        allMajors = await fetchAllMajors();
        console.log(`📊 Đã tải ${allMajors.length} ngành học`);
        
        // Cập nhật filters ban đầu
        updateCurrentFilters();
        
        // Hiển thị dữ liệu
        console.log('🖼️ Đang hiển thị dữ liệu...');
        await loadMajors();
        console.log('✅ Khởi tạo hoàn tất!');
    }

    // --- Xử lý sự kiện ---
    // Khi form tìm kiếm được submit (nhấn nút hoặc Enter)
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            updateCurrentFilters();
            loadMajors();
        });
    }

    // Khi bất kỳ bộ lọc select nào thay đổi
    if (tuitionFeeFilter) {
        tuitionFeeFilter.addEventListener('change', () => {
            updateCurrentFilters();
            loadMajors();
        });
    }

    if (educationLevelFilter) {
        educationLevelFilter.addEventListener('change', () => {
            updateCurrentFilters();
            loadMajors();
        });
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', () => {
            updateCurrentFilters();
            loadMajors();
        });
    }

    if (admissionScoreFilter) {
        admissionScoreFilter.addEventListener('change', () => {
            updateCurrentFilters();
            loadMajors();
        });
    }

    // ===== FAVORITE MANAGEMENT FUNCTIONS =====

    /**
     * Toggle favorite status for a major in nganh page
     */
    function toggleMajorFavoriteInNganh(major, favBtn) {
        if (!major.school) {
            showFavoriteToastInNganh('Không thể lưu ngành: thiếu thông tin trường', 'error');
            return;
        }
        
        const favoriteKey = `favorite_${major.school.short_code}_${major.major_id}`;
        const isFavorite = localStorage.getItem(favoriteKey) === 'true';
        const icon = favBtn.querySelector('i');
        
        if (isFavorite) {
            // Remove from favorites
            removeMajorFromFavoritesInNganh(major);
            favBtn.classList.remove('active');
            icon.className = 'far fa-heart';
            icon.style.color = '';
            showFavoriteToastInNganh(`Đã bỏ yêu thích "${major.name}"`, 'remove');
        } else {
            // Add to favorites
            addMajorToFavoritesInNganh(major);
            favBtn.classList.add('active');
            icon.className = 'fas fa-heart';
            icon.style.color = '#ff4757';
            showFavoriteToastInNganh(`Đã thêm "${major.name}" vào yêu thích`, 'add');
        }
        
        // Update favorites count using the new automatic system
        if (window.FooterFavoriteManager) {
            window.FooterFavoriteManager.updateFavoritesCount();
        } else if (window.FavoriteManager) {
            window.FavoriteManager.updateFavoritesCount();
        }
    }

    /**
     * Add major to favorites in nganh page
     */
    function addMajorToFavoritesInNganh(major) {
        const favoriteKey = `favorite_${major.school.short_code}_${major.major_id}`;
        const favoritesListKey = 'favorite_majors_list';
        
        // Mark as favorite
        localStorage.setItem(favoriteKey, 'true');
        
        // Add to favorites list
        let favoritesList = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
        
        // Check if already exists
        const existingIndex = favoritesList.findIndex(
            item => item.school_short_code === major.school.short_code && 
                   item.major_id === major.major_id
        );
        
        if (existingIndex === -1) {
            const favoriteItem = {
                major_id: major.major_id,
                major_name: major.name,
                school_short_code: major.school.short_code,
                school_name: major.school.name_vn,
                school_logo: major.school.logo,
                school_type: major.school.school_type,
                min_tuition: major.min_tuition_fee_per_year,
                max_tuition: major.max_tuition_fee_per_year,
                university_start: null, // Not available in nganh page
                university_end: null,   // Not available in nganh page
                location: major.school.country,
                tags: major.tags,
                status: major.status,
                added_date: new Date().toISOString()
            };
            
            favoritesList.push(favoriteItem);
            localStorage.setItem(favoritesListKey, JSON.stringify(favoritesList));
            
            console.log('✅ Added major to favorites from nganh page:', favoriteItem);
        }
    }

    /**
     * Remove major from favorites in nganh page
     */
    function removeMajorFromFavoritesInNganh(major) {
        const favoriteKey = `favorite_${major.school.short_code}_${major.major_id}`;
        const favoritesListKey = 'favorite_majors_list';
        
        // Remove favorite mark
        localStorage.removeItem(favoriteKey);
        
        // Remove from favorites list
        let favoritesList = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
        favoritesList = favoritesList.filter(
            item => !(item.school_short_code === major.school.short_code && 
                     item.major_id === major.major_id)
        );
        
        localStorage.setItem(favoritesListKey, JSON.stringify(favoritesList));
        
        console.log('✅ Removed major from favorites in nganh page:', major.name);
    }

    /**
     * Show favorite toast notification in nganh page
     */
    function showFavoriteToastInNganh(message, type = 'add') {
        // Remove existing toast
        const existingToast = document.querySelector('.favorite-toast-nganh');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'favorite-toast-nganh';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-heart" style="color: ${type === 'add' ? '#ff4757' : type === 'error' ? '#ffc107' : '#cbd5e0'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'add' ? '#10b981' : type === 'error' ? '#f59e0b' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // Style toast content
        const content = toast.querySelector('.toast-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 100);
        
        // Hide toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Export favorites to Excel function for nganh page
     */
    function exportFavoritesToExcelInNganh() {
        // Use the footer function if available
        if (window.exportFavoritesToExcel) {
            window.exportFavoritesToExcel();
            return;
        }
        
        // Fallback implementation
        const favoritesList = JSON.parse(localStorage.getItem('favorite_majors_list') || '[]');
        if (favoritesList.length === 0) {
            showFavoriteToastInNganh('Không có ngành yêu thích nào để xuất', 'error');
            return;
        }
        
        try {
            // Create Excel content as CSV format (compatible with Excel)
            let csvContent = '';
            
            // Add UTF-8 BOM for proper Vietnamese character display in Excel
            csvContent += '\uFEFF';
            
            // Header row
            const headers = [
                'STT',
                'Tên ngành',
                'Mã ngành', 
                'Tên trường',
                'Mã trường',
                'Loại trường',
                'Học phí tối thiểu',
                'Học phí tối đa',
                'Khu vực',
                'Tags',
                'Trạng thái',
                'Ngày thêm'
            ];
            csvContent += headers.join(',') + '\n';
            
            // Data rows
            favoritesList.forEach((favorite, index) => {
                const row = [
                    index + 1,
                    `"${(favorite.major_name || '').replace(/"/g, '""')}"`,
                    `"${favorite.major_id || ''}"`,
                    `"${(favorite.school_name || '').replace(/"/g, '""')}"`,
                    `"${favorite.school_short_code || ''}"`,
                    `"${favorite.school_type === 'public' ? 'Công lập' : favorite.school_type === 'private' ? 'Ngoài công lập' : (favorite.school_type || '')}"`,
                    `"${formatTuitionForExcelInNganh(favorite.min_tuition)}"`,
                    `"${formatTuitionForExcelInNganh(favorite.max_tuition)}"`,
                    `"${(favorite.location || '').replace(/"/g, '""')}"`,
                    `"${(favorite.tags || '').replace(/"/g, '""')}"`,
                    `"${(favorite.status || '').replace(/"/g, '""')}"`,
                    `"${formatDateForExcelInNganh(favorite.added_date)}"`
                ];
                csvContent += row.join(',') + '\n';
            });
            
            // Create blob and download
            const blob = new Blob([csvContent], { 
                type: 'text/csv;charset=utf-8;' 
            });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `nganh-yeu-thich-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showFavoriteToastInNganh('Đã xuất danh sách yêu thích dạng Excel (.csv)', 'add');
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showFavoriteToastInNganh('Có lỗi khi xuất file Excel', 'error');
        }
    }
    
    /**
     * Format tuition for Excel display in nganh page
     */
    function formatTuitionForExcelInNganh(tuition) {
        if (!tuition || tuition === '0' || tuition === 0) {
            return 'Miễn phí';
        }
        
        const numTuition = parseFloat(tuition);
        if (isNaN(numTuition)) {
            return tuition || '';
        }
        
        if (numTuition >= 1000000) {
            return `${(numTuition / 1000000).toFixed(1)} triệu`;
        } else if (numTuition >= 1000) {
            return `${(numTuition / 1000).toFixed(0)} nghìn`;
        } else {
            return `${numTuition} VNĐ`;
        }
    }
    
    /**
     * Format date for Excel display in nganh page
     */
    function formatDateForExcelInNganh(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    // ✨ Listen for favorite events from modal
    window.addEventListener('favoriteRemoved', function(event) {
        const { schoolShortCode, majorId } = event.detail;
        console.log(`🔄 Received favoriteRemoved event in nganh.js: ${majorId} from ${schoolShortCode}`);
        
        // Update heart buttons on current nganh page
        const heartButtons = document.querySelectorAll('.major-fav-btn');
        heartButtons.forEach(btn => {
            const card = btn.closest('.major-card');
            if (card) {
                // Try to find major data from the card or major list
                const majorTitle = card.querySelector('.major-title')?.textContent;
                const schoolName = card.querySelector('.major-school')?.textContent;
                
                // Find matching major in allMajors array
                const matchingMajor = allMajors.find(major => 
                    major.major_id === majorId && 
                    major.school && 
                    major.school.short_code === schoolShortCode
                );
                
                if (matchingMajor || 
                    (majorTitle && schoolName && 
                     allMajors.some(m => m.name === majorTitle && m.school?.name_vn === schoolName && m.major_id === majorId))) {
                    
                    const icon = btn.querySelector('i');
                    if (icon) {
                        btn.classList.remove('active');
                        icon.className = 'far fa-heart';
                        icon.style.color = '';
                        console.log(`✅ Updated heart button for ${majorId} in nganh page`);
                    }
                }
            }
        });
        
        // Update favorites count
        if (window.FooterFavoriteManager) {
            window.FooterFavoriteManager.updateFavoritesCount();
        }
    });
    
    window.addEventListener('allFavoritesCleared', function() {
        console.log(`🔄 Received allFavoritesCleared event in nganh.js`);
        
        // Update all heart buttons on current page
        const heartButtons = document.querySelectorAll('.major-fav-btn');
        heartButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                btn.classList.remove('active');
                icon.className = 'far fa-heart';
                icon.style.color = '';
            }
        });
        
        // Update favorites count
        if (window.FooterFavoriteManager) {
            window.FooterFavoriteManager.updateFavoritesCount();
        }
    });

    // Expose functions globally for cross-page compatibility
    window.NganhFavoriteManager = {
        toggleMajorFavoriteInNganh,
        addMajorToFavoritesInNganh,
        removeMajorFromFavoritesInNganh,
        showFavoriteToastInNganh,
        exportFavoritesToExcelInNganh
    };

    // Khởi tạo khi trang được tải
    console.log('Bắt đầu khởi tạo trang ngành học...');
    console.log('API_URL:', API_URL);
    console.log('PAGE_SIZE:', PAGE_SIZE);
    console.log('majorsGrid element:', majorsGrid);
    console.log('paginationBar element:', paginationBar);
    console.log('loadingContainer element:', loadingContainer);
    
    // Kiểm tra các element có tồn tại không
    if (!majorsGrid) {
        console.error('Không tìm thấy element majorsGrid!');
    }
    if (!paginationBar) {
        console.error('Không tìm thấy element paginationBar!');
    }
    if (!loadingContainer) {
        console.error('Không tìm thấy element loadingContainer!');
    }
    
    // Kiểm tra các filter element
    console.log('searchForm element:', searchForm);
    console.log('searchInput element:', searchInput);
    console.log('tuitionFeeFilter element:', tuitionFeeFilter);
    console.log('educationLevelFilter element:', educationLevelFilter);
    console.log('locationFilter element:', locationFilter);
    console.log('admissionScoreFilter element:', admissionScoreFilter);
    
    // Kiểm tra xem có phải đang ở trang ngành học không
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    // Chỉ khởi tạo nếu đang ở trang ngành học hoặc có element majors-grid
    console.log('🔍 Kiểm tra điều kiện khởi tạo:');
    console.log('- Pathname:', window.location.pathname);
    console.log('- majorsGrid tồn tại:', !!majorsGrid);
    console.log('- majorsGrid element:', majorsGrid);
    
    if (window.location.pathname === '/nganhchung' || majorsGrid) {
        console.log('✅ Điều kiện khởi tạo thỏa mãn, bắt đầu khởi tạo...');
        
        // Kiểm tra xem có phải đang ở trang chủ không
        if (window.location.pathname === '/') {
            console.log('📍 Đang ở trang chủ, kiểm tra element majors-grid');
            if (majorsGrid) {
                console.log('✅ Element majors-grid tồn tại, bắt đầu khởi tạo...');
                initialize().then(() => {
                    console.log('🎉 Khởi tạo trang ngành học hoàn tất!');
                }).catch(error => {
                    console.error('❌ Lỗi khi khởi tạo trang ngành học:', error);
                });
            } else {
                console.log('❌ Element majors-grid không tồn tại, bỏ qua khởi tạo');
            }
        } else {
            console.log('📍 Đang ở trang ngành học, bắt đầu khởi tạo...');
            initialize().then(() => {
                console.log('🎉 Khởi tạo trang ngành học hoàn tất!');
            }).catch(error => {
                console.error('❌ Lỗi khi khởi tạo trang ngành học:', error);
            });
        }
    } else {
        console.log('❌ Không thỏa mãn điều kiện khởi tạo');
        console.log('Pathname hiện tại:', window.location.pathname);
        console.log('Các pathname được hỗ trợ: /nganhchung hoặc có element majors-grid');
    }
});