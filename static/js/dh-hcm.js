document.addEventListener('DOMContentLoaded', function () {
    const universitiesGrid = document.getElementById('universitiesGrid');
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const admissionScoreFilter = document.getElementById('admissionScoreFilter');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const modalDetail = document.getElementById('modalDetail');

    // Pagination elements
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageNumbersContainer = document.getElementById('pageNumbers');

    let currentPage = 1;
    let totalPages = 1;
    let currentSearchTerm = '';
    let currentLocationFilter = 'tphcm';
    let currentTypeFilter = '';
    let currentAdmissionScoreFilter = '';
    let allUniversities = []; // Lưu trữ tất cả dữ liệu trường
    let filteredUniversities = []; // Dữ liệu đã lọc
    const ITEMS_PER_PAGE = 12;
    const CACHE_KEY = 'universities_data';
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 8 giờ

    // Tuition filter elements
    const tuitionMinInput = document.getElementById('tuitionMin');
    const tuitionMaxInput = document.getElementById('tuitionMax');
    const tuitionRangeInputMin = document.getElementById('tuitionRangeInputMin');
    const tuitionRangeInputMax = document.getElementById('tuitionRangeInputMax');
    const tuitionRangeTrack = document.getElementById('tuitionRangeTrack');

    // Initial tuition values, with null checks for robustness
    let currentTuitionMin = tuitionMinInput ? parseInt(tuitionMinInput.value, 10) : 0;
    let currentTuitionMax = tuitionMaxInput ? parseInt(tuitionMaxInput.value, 10) : 100;
    const MIN_TUITION = tuitionMinInput ? parseInt(tuitionMinInput.min, 10) : 0;
    const MAX_TUITION = tuitionMaxInput ? parseInt(tuitionMaxInput.max, 10) : 100;

    let tuitionFilterActive = false;

    // Skeleton loading effect
    function renderSkeletonCards(count = 12) {
        if (!universitiesGrid) return;
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
            <div class="university-card skeleton-card">
                <div class="card-content">
                    <div class="card-image">
                        <div class="skeleton-thumb"></div>
                    </div>
                    <div class="card-info">
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="info-tags">
                            <div class="skeleton-line skeleton-tag"></div>
                            <div class="skeleton-line skeleton-tag"></div>
                            <div class="skeleton-line skeleton-tag"></div>
                        </div>
                        <div class="info-tags">
                            <div class="skeleton-line skeleton-tag short"></div>
                            <div class="skeleton-line skeleton-tag short"></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
        universitiesGrid.innerHTML = html;
    }

    // Debug function để kiểm tra dữ liệu
    function debugFilterData() {
        console.log('=== DEBUG FILTER DATA ===');
        console.log('Current filters:', {
            search: currentSearchTerm,
            location: currentLocationFilter,
            type: currentTypeFilter,
            admissionScore: currentAdmissionScoreFilter,
            tuitionMin: currentTuitionMin,
            tuitionMax: currentTuitionMax
        });
        console.log('Total universities:', allUniversities.length);
        console.log('Filtered universities:', filteredUniversities.length);
        console.log('Sample university data:', allUniversities[0]);
    }

    function updateTuitionSliderUI() {
        if (!tuitionMinInput || !tuitionMaxInput) return;

        let min = parseInt(tuitionMinInput.value, 10);
        let max = parseInt(tuitionMaxInput.value, 10);

        if (min > max) {
            tuitionMaxInput.value = min;
            max = min;
        }
        if (max < min) {
            tuitionMinInput.value = max;
            min = max;
        }
        currentTuitionMin = min;
        currentTuitionMax = max;

        // Update input number values
        if (tuitionRangeInputMin) tuitionRangeInputMin.value = min;
        if (tuitionRangeInputMax) tuitionRangeInputMax.value = max;

        // Update track fill
        if (tuitionRangeTrack) {
            const range = MAX_TUITION - MIN_TUITION;
            const minPercent = ((min - MIN_TUITION) / range) * 100;
            const maxPercent = ((max - MIN_TUITION) / range) * 100;
            tuitionRangeTrack.style.left = `${minPercent}%`;
            tuitionRangeTrack.style.width = `${maxPercent - minPercent}%`;
        }
    }

    // Add event listeners for tuition filters if elements exist
    if (tuitionMinInput) {
        tuitionMinInput.addEventListener('input', function() {
            tuitionFilterActive = true;
            updateTuitionSliderUI();
            applyFiltersAndFetch(1);
        });
    }
    if (tuitionMaxInput) {
        tuitionMaxInput.addEventListener('input', function() {
            tuitionFilterActive = true;
            updateTuitionSliderUI();
            applyFiltersAndFetch(1);
        });
    }
    if (tuitionRangeInputMin) {
        tuitionRangeInputMin.addEventListener('change', function() {
            tuitionFilterActive = true;
            let min = parseInt(tuitionRangeInputMin.value, 10);
            let max = tuitionRangeInputMax ? parseInt(tuitionRangeInputMax.value, 10) : MAX_TUITION;
            if (isNaN(min) || min < MIN_TUITION) min = MIN_TUITION;
            if (min > max) min = max;
            if (tuitionMinInput) tuitionMinInput.value = min;
            updateTuitionSliderUI();
            applyFiltersAndFetch(1);
        });
    }
    if (tuitionRangeInputMax) {
        tuitionRangeInputMax.addEventListener('change', function() {
            tuitionFilterActive = true;
            let min = tuitionRangeInputMin ? parseInt(tuitionRangeInputMin.value, 10) : MIN_TUITION;
            let max = parseInt(tuitionRangeInputMax.value, 10);
            if (isNaN(max) || max > MAX_TUITION) max = MAX_TUITION;
            if (max < min) max = min;
            if (tuitionMaxInput) tuitionMaxInput.value = max;
            updateTuitionSliderUI();
            applyFiltersAndFetch(1);
        });
    }

    // Initial UI update for tuition slider
    updateTuitionSliderUI();

    // Function to check if cached data is valid
    function isCacheValid() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return false;
            
            const { timestamp, data } = JSON.parse(cached);
            const now = Date.now();
            
            return (now - timestamp) < CACHE_EXPIRY && data && data.length > 0;
        } catch (error) {
            console.error('Error checking cache:', error);
            return false;
        }
    }

    // Function to get cached data
    function getCachedData() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data } = JSON.parse(cached);
                return data;
            }
        } catch (error) {
            console.error('Error getting cached data:', error);
        }
        return null;
    }

    // Function to save data to cache
    function saveToCache(data) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    // Function to fetch all universities data once
    async function fetchAllUniversities() {
        if (!universitiesGrid) return;

        // Kiểm tra cache trước
        if (isCacheValid()) {
            allUniversities = getCachedData();
            applyFiltersAndRender(1);
            return;
        }

        renderSkeletonCards(12);

        // API endpoint thông thường (đã hoạt động)
        const baseUrl = 'https://timtruonghoc.pythonanywhere.com/schools-optimized/';
        const params = new URLSearchParams();
        params.append('page_size', 1000); // Lấy tất cả dữ liệu

        const url = `${baseUrl}?${params.toString()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Tối ưu hóa: Sử dụng API schools-optimized không bao gồm majors_data
            // Dữ liệu ngành sẽ được tải riêng khi vào trang chi tiết trường
            allUniversities = data.results.map(uni => ({
                id: uni.id,
                name_en: uni.name_en,
                name_vn: uni.name_vn,
                short_code: uni.short_code,
                admission_code: uni.admission_code,
                logo: uni.logo,
                established_year: uni.established_year,
                school_type: uni.school_type,
                website_url: uni.website_url,
                quota_per_year: uni.quota_per_year,
                introduction: uni.introduction,
                phone_number: uni.phone_number,
                email: uni.email,
                country: uni.country,
                map_link: uni.map_link,
                // Tối ưu hóa: Bỏ majors_data để giảm kích thước dữ liệu
                // majors_data sẽ được tải riêng khi vào trang chi tiết trường
                start: uni.start,
                end: uni.end,
                registration: uni.registration,
                tag: uni.tag,
                acceptanceRate: 'N/A',
                studentCount: 'N/A',
                min_admission_score: uni.min_admission_score || null
            }));

            // Lưu vào cache
            saveToCache(allUniversities);
            applyFiltersAndRender(1);
        } catch (error) {
            console.error('Error fetching universities:', error);
            if (universitiesGrid) {
                universitiesGrid.innerHTML = '<p>Không thể tải dữ liệu trường học. Vui lòng thử lại sau.</p>';
            }
        }
    }

    // Function to apply filters and render universities
    function applyFiltersAndRender(page = 1) {
        currentPage = page;
        
        // Lọc dữ liệu theo các tiêu chí
        filteredUniversities = allUniversities.filter(uni => {
            // Lọc theo tìm kiếm
            if (currentSearchTerm) {
                const searchLower = currentSearchTerm.toLowerCase();
                const nameVn = uni.name_vn ? uni.name_vn.toLowerCase() : '';
                const nameEn = uni.name_en ? uni.name_en.toLowerCase() : '';
                const shortCode = uni.short_code ? uni.short_code.toLowerCase() : '';
                
                const nameMatch = nameVn.includes(searchLower) || 
                                nameEn.includes(searchLower) ||
                                shortCode.includes(searchLower);
                if (!nameMatch) return false;
            }

            // Lọc theo địa điểm
            if (currentLocationFilter) {
                const country = uni.country ? uni.country.toLowerCase() : '';
                const locationFilter = currentLocationFilter.toLowerCase();
                
                if (locationFilter === 'tphcm' && !country.includes('tphcm')) return false;
                if (locationFilter === 'tp.hà nội' && !country.includes('tp.hà nội')) return false;
                if (locationFilter === 'tp.đà nẵng' && !country.includes('tp.đà nẵng')) return false;
                if (locationFilter === 'other' && 
                    (country.includes('tphcm') || country.includes('tp.hà nội') || country.includes('tp.đà nẵng'))) return false;
            }

            // Lọc theo loại trường
            if (currentTypeFilter) {
                const schoolType = uni.school_type ? uni.school_type.toLowerCase() : '';
                const typeFilter = currentTypeFilter.toLowerCase();
                
                if (typeFilter === 'public' && schoolType !== 'public') return false;
                if (typeFilter === 'private' && schoolType !== 'private') return false;
                if (typeFilter === 'international' && schoolType !== 'international') return false;
            }

            // Lọc theo học phí
            if (tuitionFilterActive) {
                const tuitionStart = typeof uni.start === 'number' ? uni.start : 0;
                const tuitionEnd = typeof uni.end === 'number' ? uni.end : tuitionStart;
                if (tuitionStart < currentTuitionMin || tuitionEnd > currentTuitionMax) return false;
            }

            // Lọc theo điểm sàn
            if (currentAdmissionScoreFilter) {
                const score = parseFloat(uni.min_admission_score);
                if (isNaN(score)) return false;
                
                switch (currentAdmissionScoreFilter) {
                    case 'low':
                        if (score < 15 || score > 18) return false;
                        break;
                    case 'medium':
                        if (score <= 18 || score > 20) return false;
                        break;
                    case 'high':
                        if (score <= 20 || score > 22) return false;
                        break;
                    case 'veryhigh':
                        if (score <= 22) return false;
                        break;
                }
            }

            return true;
        });

        // Tính toán phân trang
        totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageUniversities = filteredUniversities.slice(startIndex, endIndex);

        renderUniversities(pageUniversities);
        updatePaginationControls();
        
        // Debug khi cần thiết (có thể comment out sau khi test xong)
        // debugFilterData();
    }

    function renderUniversities(universities) {
        if (!universitiesGrid) return;
        universitiesGrid.innerHTML = '';
        if (universities.length === 0) {
            universitiesGrid.innerHTML = '<p>Không tìm thấy trường học nào phù hợp với tiêu chí của bạn.</p>';
            return;
        }

        universities.forEach((university, index) => {
            const card = document.createElement('div');
            card.className = 'university-card';
            if (university.tag === 'outstanding') {
                card.classList.add('highlight');
            }
            card.style.animationDelay = `${index * 0.1}s`;

            let locationText = 'Khác';
            if (university.country && university.country.includes('TPHCM')) {
                locationText = 'TP. Hồ Chí Minh';
            } else if (university.country && university.country.includes('TP.Hà Nội')) {
                locationText = 'TP. Hà Nội';
            } else if (university.country && university.country.includes('TP.Đà Nẵng')) {
                locationText = 'TP. Đà Nẵng';
            }

            let tuitionDisplay = 'Chưa có';
            if (typeof university.start === 'number' && typeof university.end === 'number') {
                if (university.start === 0 && university.end === 0) {
                    tuitionDisplay = `Miễn phí`;
                } else {
                    tuitionDisplay = `${university.start} - ${university.end} triệu`;
                }
            }

            card.innerHTML = `
                <div class="card-content" data-university-id="${university.id}" data-university-code="${university.short_code}">
                    <div class="card-image">
                        <img src="${university.logo}" alt="${university.name_vn}" onerror="this.onerror=null;this.src='https://placehold.co/120x120/cccccc/333333?text=No+Logo';">
                    </div>
                    <div class="card-info">
                        <div>
                            ${university.tag === 'outstanding' ? '<span class="info-tag tag-registration">NỔI BẬT</span>' : ''}
                            <div class="university-name">${university.name_vn} <span class="university-code"> - (${university.short_code})</span></div>
                            <div class="info-tags">
                                <span class="info-tag tag-public">${university.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'}</span>
                                <span class="info-tag tag-quota">Chỉ tiêu: ${university.quota_per_year ? university.quota_per_year.toLocaleString() : 'N/A'}</span>
                                <span class="info-tag tag-year">Thành lập: ${university.established_year}</span>
                            </div>
                            <div class="info-tags">
                                <span class="info-tag tag-tuition">Học phí: ${tuitionDisplay}</span>
                                <span class="info-tag tag-location">${locationText}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            let hoverTimeout;
            const nameEl = card.querySelector('.university-name');
            if (nameEl) { // Check if element exists
                nameEl.addEventListener('mouseenter', () => {
                    hoverTimeout = setTimeout(() => showModal(university, locationText, tuitionDisplay), 300);
                });
                nameEl.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimeout);
                });
            }

            // Thêm sự kiện click cho card
            card.addEventListener('click', () => {
                const universityCode = card.querySelector('.card-content').getAttribute('data-university-code');
                if (universityCode) {
                    window.location.href = `/${universityCode.toLowerCase()}`;
                }
            });

            universitiesGrid.appendChild(card);
        });
    }

    function updatePaginationControls() {
        if (prevPageButton) prevPageButton.disabled = currentPage === 1;
        if (nextPageButton) nextPageButton.disabled = currentPage === totalPages;
        if (pageNumbersContainer) pageNumbersContainer.innerHTML = '';

        const maxPageButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        if (startPage === 1) {
            endPage = Math.min(totalPages, maxPageButtons);
        }

        // Thêm nút trang đầu nếu cần
        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.className = 'page-number-button';
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => {
                applyFiltersAndRender(1);
                if (universitiesGrid) universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            pageNumbersContainer.appendChild(firstPageButton);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }
        }

        // Các nút trang chính
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-number-button';
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                applyFiltersAndRender(i);
                if (universitiesGrid) universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            pageNumbersContainer.appendChild(pageButton);
        }

        // Thêm nút trang cuối nếu cần
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }
            const lastPageButton = document.createElement('button');
            lastPageButton.className = 'page-number-button';
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => {
                applyFiltersAndRender(totalPages);
                if (universitiesGrid) universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            pageNumbersContainer.appendChild(lastPageButton);
        }
    }

    // Modal logic
    let modalTimeout;

    function showModal(university, locationText, tuitionDisplay) {
        clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            const intro = university.introduction || 'Không có thông tin giới thiệu.';
            const introId = `intro-${university.id}`;
            const introShort = `<div id="${introId}" style="max-height:150px;overflow:hidden;position:relative;">${intro}</div>`;
            const seeMoreBtn = `<button id="seeMoreBtn" style="margin-top:8px;background:#e5e7eb;border:none;color:#065be2;font-weight:600;padding:6px 18px;border-radius:8px;cursor:pointer;">Xem thêm</button>`;
            const introHtml = `<div class="detailed-section"><h4 class="section-heading">Giới thiệu</h4><ul class="description-list"><li>${introShort}${intro.length > 300 ? seeMoreBtn : ''}</li></ul></div>`;
            modalDetail.innerHTML = `
                <div class="detailed-title">${university.name_vn}</div>
                ${introHtml}
                <div class="detailed-section">
                    <h4 class="section-heading">Ngành đào tạo chính</h4>
                    <ul class="description-list">
                        <li>Bấm xem chi tiết để xem</li>
                    </ul>
                </div>
                <div class="detailed-section">
                    <h4 class="section-heading">Thông tin khác</h4>
                    <ul class="description-list">
                        <li><strong>Mã trường:</strong> ${university.short_code || 'N/A'}</li>
                        <li><strong>Mã tuyển sinh:</strong> ${university.admission_code || 'N/A'}</li>
                        <li><strong>Loại hình:</strong> ${university.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'}</li>
                        <li><strong>Năm thành lập:</strong> ${university.established_year}</li>
                        <li><strong>Chỉ tiêu hàng năm:</strong> ${university.quota_per_year ? university.quota_per_year.toLocaleString() : 'N/A'}</li>
                        <li><strong>Học phí:</strong> ${tuitionDisplay}</li>
                        <li><strong>Địa điểm:</strong> ${locationText}</li>
                        ${university.min_admission_score ? `<li><strong>Điểm sàn xét tuyển:</strong> ${university.min_admission_score}</li>` : ''}
                    </ul>
                </div>
                <div class="detailed-section">
                    <h4 class="section-heading">Liên hệ</h4>
                    <ul class="description-list">
                        <li><strong>Điện thoại:</strong> ${university.phone_number || 'N/A'}</li>
                        <li><strong>Email:</strong> ${university.email || 'N/A'}</li>
                        <li><strong>Website:</strong> <a href="${university.website_url}" target="_blank">${university.website_url || 'N/A'}</a></li>
                    </ul>
                </div>
                 ${university.map_link ? `
                <div class="detailed-section">
                    <h4 class="section-heading">Bản đồ</h4>
                    <div id="mapBox" style="width: 100%; height: 300px; overflow: hidden; border-radius: 10px;"></div>
                </div>` : ''}
            `;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Đổi màu border modal-content và nút button nếu là trường nổi bật
            if (university.tag === 'outstanding') {
                modalContent.style.borderColor = '#ffc107'; // Viền vàng
                modalContent.style.borderWidth = '3px';
                const applyBtn = document.querySelector('.apply-btn');
                if (applyBtn) {
                    applyBtn.style.backgroundColor = '#ffc107';
                    applyBtn.style.color = '#000';
                    applyBtn.style.borderColor = '#ffc107';
                }
            } else if (university.registration === true) {
                modalContent.style.borderColor = '#ffc107'; 
                modalContent.style.borderWidth = '2px';
                document.querySelector('.apply-btn').classList.add('highlight');
            } else {
                modalContent.style.borderColor = '#3b82f6'; // xanh mặc định
                modalContent.style.borderWidth = '2px';
                const applyBtn = document.querySelector('.apply-btn');
                if (applyBtn) {
                    applyBtn.style.backgroundColor = '';
                    applyBtn.style.color = '';
                    applyBtn.style.borderColor = '';
                }
                document.querySelector('.apply-btn').classList.remove('highlight');
            }

            // Thêm nút "Xem chi tiết" vào modal
            const modalActions = document.querySelector('.modal-actions');
            if (modalActions) {
                const detailBtn = modalActions.querySelector('.detail-btn');
                if (detailBtn) {
                    detailBtn.onclick = () => {
                        const universityCode = university.short_code;
                        if (universityCode) {
                            window.location.href = `/${universityCode.toLowerCase()}`;
                        }
                    };
                }
            }

            const btn = document.getElementById('seeMoreBtn');
            if (btn) { // Check if element exists
                btn.addEventListener('click', function() {
                    const introDiv = document.getElementById(introId);
                    if (introDiv) {
                        introDiv.style.maxHeight = 'none';
                        btn.style.display = 'none';
                    }
                });
            }

            // Trích xuất src từ chuỗi <iframe ...> và gán vào src của <iframe>
            const mapBox = document.getElementById('mapBox');
            if (mapBox && university.map_link) {
                mapBox.innerHTML = university.map_link; // map_link là chuỗi <iframe ...>
            }
        }, 100); // Giảm thời gian hover xuống để trải nghiệm tốt hơn
    }

    function hideModal() {
        clearTimeout(modalTimeout);
        if (modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.onclick = hideModal;
    if (modalOverlay) {
        modalOverlay.onclick = function (e) {
            if (e.target === this) hideModal();
        };
        modalOverlay.addEventListener('mouseleave', hideModal);
    }

    // Filter and Pagination logic
    function applyFiltersAndFetch(page = 1) {
        currentSearchTerm = searchInput ? searchInput.value.trim() : '';
        currentLocationFilter = locationFilter ? locationFilter.value : '';
        currentTypeFilter = typeFilter ? typeFilter.value : '';
        currentAdmissionScoreFilter = admissionScoreFilter ? admissionScoreFilter.value : '';
        applyFiltersAndRender(page);
    }

    // Debounce helper
    function debounce(fn, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => applyFiltersAndFetch(1), 300));
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', () => applyFiltersAndFetch(1));
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', () => applyFiltersAndFetch(1));
    }
    if (admissionScoreFilter) {
        admissionScoreFilter.addEventListener('change', () => applyFiltersAndFetch(1));
    }
    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                applyFiltersAndRender(currentPage - 1);
                if (universitiesGrid) universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                applyFiltersAndRender(currentPage + 1);
                if (universitiesGrid) universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Initial fetch and render
    fetchAllUniversities();

    // Thêm nút refresh cache (cho admin/developer)
    const refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Làm mới dữ liệu';
    refreshButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0a4191;
        color: white;
        border: none;
        border-radius: 25px;
        padding: 10px 15px;
        font-size: 0.8rem;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    refreshButton.addEventListener('mouseenter', () => {
        refreshButton.style.background = '#065be2';
        refreshButton.style.transform = 'scale(1.05)';
    });
    refreshButton.addEventListener('mouseleave', () => {
        refreshButton.style.background = '#0a4191';
        refreshButton.style.transform = 'scale(1)';
    });
    refreshButton.addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY);
        fetchAllUniversities();
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...';
        setTimeout(() => {
            refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Làm mới dữ liệu';
        }, 2000);
    });
    document.body.appendChild(refreshButton);
});