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
    let currentLocationFilter = 'tphcm'; // Default selected in HTML
    let currentTypeFilter = '';
    let currentAdmissionScoreFilter = '';

    const tuitionMinInput = document.getElementById('tuitionMin');
    const tuitionMaxInput = document.getElementById('tuitionMax');
    const tuitionRangeValueDisplay = document.getElementById('tuitionRangeValue'); // Renamed for clarity
    const rangeFill = document.querySelector('.range-fill'); // Added for the fill between thumbs
    const rangeSliderContainer = document.querySelector('.range-slider'); // Added for overall slider dimensions

    let currentTuitionMin = parseInt(tuitionMinInput.value, 10);
    let currentTuitionMax = parseInt(tuitionMaxInput.value, 10); // Initialize with max value from HTML
    const MIN_TUITION = parseInt(tuitionMinInput.min, 10);
    const MAX_TUITION = parseInt(tuitionMaxInput.max, 10);

    // Function to update the appearance of the double-range slider
    function updateSliderStyles() {
        const minVal = parseInt(tuitionMinInput.value, 10);
        const maxVal = parseInt(tuitionMaxInput.value, 10);

        const range = MAX_TUITION - MIN_TUITION;
        const minPercent = ((minVal - MIN_TUITION) / range) * 100;
        const maxPercent = ((maxVal - MIN_TUITION) / range) * 100;

        // Set the fill style
        rangeFill.style.left = `${minPercent}%`;
        rangeFill.style.width = `${maxPercent - minPercent}%`;

        // Update the displayed value
        tuitionRangeValueDisplay.textContent = `${minVal} - ${maxVal} triệu`;

        // Position the value display dynamically (can be refined for more accuracy)
        // This is a simplified positioning based on the midpoint of the range
        const avgPercent = (minPercent + maxPercent) / 2;
        tuitionRangeValueDisplay.style.left = `${avgPercent}%`;
    }

    // Function to handle changes in either tuition slider
    function handleTuitionRangeChange() {
        let min = parseInt(tuitionMinInput.value, 10);
        let max = parseInt(tuitionMaxInput.value, 10);

        // Ensure min is always less than or equal to max
        if (min > max) {
            // If min tries to go above max, set max to min, and update max slider value
            tuitionMaxInput.value = min;
            max = min;
        }
        if (max < min) {
            // If max tries to go below min, set min to max, and update min slider value
            tuitionMinInput.value = max;
            min = max;
        }

        currentTuitionMin = min;
        currentTuitionMax = max;
        
        updateSliderStyles(); // Update visual styles and text display
        applyFiltersAndFetch(1);
    }
    
    tuitionMinInput.addEventListener('input', handleTuitionRangeChange);
    tuitionMaxInput.addEventListener('input', handleTuitionRangeChange);
    
    // Initial update of slider styles on load
    updateSliderStyles();

    // Function to fetch data from API with pagination and filters
    async function fetchUniversities(page = 1) {
        universitiesGrid.innerHTML = `
        <div class="modern-loader">
            <div class="modern-loader-spinner"></div>
            <div class="modern-loader-text">Tôi đang tải dữ liệu! <br/> Chờ tôi xíu nhé...</div>
        </div>
        `;
        currentPage = page;

        const baseUrl = 'https://timtruonghoc.pythonanywhere.com/schools/';
        const params = new URLSearchParams();

        // Add search term if present
        if (currentSearchTerm) {
            params.append('search', currentSearchTerm);
        }

        // Add filters
        // Only apply filters if search term is not active or if backend supports combining them
        // Based on user request, if search input is used, param is 'search'.
        // If filter boxes are used, params depend on the filter.
        // For simplicity, we'll send all applicable filters, assuming backend handles combination.
        if (currentLocationFilter) {
            params.append('country', currentLocationFilter);
        }
        if (currentTypeFilter) {
            params.append('school_type', currentTypeFilter);
        }
        
        // Add tuition range filters if they are not at their default min/max
        if (currentTuitionMin > MIN_TUITION) {
            params.append('start', currentTuitionMin);
        }
        if (currentTuitionMax < MAX_TUITION) { 
            params.append('end', currentTuitionMax);
        }
        
        // Admission score filter is currently client-side; not sent to API
        // if (currentAdmissionScoreFilter) {
        //     params.append('admission_score_range', currentAdmissionScoreFilter);
        // }

        params.append('page', currentPage);
        // Assuming a page_size of 12 for rendering in the grid
        params.append('page_size', 12); 

        const url = `${baseUrl}?${params.toString()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            let universities = data.results.map(uni => ({
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
                majors_data: uni.majors_data,
                start: uni.start, // Assuming this is a number (million VND)
                end: uni.end,   // Assuming this is a number (million VND)
                registration : uni.registration,
                acceptanceRate: 'N/A', // Placeholder
                studentCount: 'N/A', // Placeholder
                min_admission_score: uni.min_admission_score || null
            }));
            
            totalPages = data.total_pages;

            // Client-side filtering for admission score if backend doesn't support it directly
            if (currentAdmissionScoreFilter) {
                universities = universities.filter(uni => {
                    const score = parseFloat(uni.min_admission_score);
                    if (isNaN(score)) return false; // Exclude if score is not a number
                    if (currentAdmissionScoreFilter === 'low') return score >= 15 && score <= 18;
                    if (currentAdmissionScoreFilter === 'medium') return score > 18 && score <= 20;
                    if (currentAdmissionScoreFilter === 'high') return score > 20 && score <= 22;
                    if (currentAdmissionScoreFilter === 'veryhigh') return score > 22;
                    return true;
                });
            }

            renderUniversities(universities);
            updatePaginationControls();
        } catch (error) {
            console.error('Error fetching universities:', error);
            universitiesGrid.innerHTML = '<p>Không thể tải dữ liệu trường học. Vui lòng thử lại sau.</p>';
            totalPages = 1; // Reset total pages on error
            updatePaginationControls();
        }
    }

    // Render universities
    function renderUniversities(universities) {
        universitiesGrid.innerHTML = '';
        if (universities.length === 0) {
            universitiesGrid.innerHTML = '<p>Không tìm thấy trường học nào phù hợp với tiêu chí của bạn.</p>';
            return;
        }

        universities.forEach((university, index) => {
            const card = document.createElement('div');
            card.className = 'university-card';
            if (university.registration === true) {
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

            // Format tuition display
            let tuitionDisplay = 'Chưa có';
            if (typeof university.start === 'number' && typeof university.end === 'number') {
                if (university.start === 0 && university.end === 0) {
                    tuitionDisplay = `Miễn phí`;
                } else {
                    tuitionDisplay = `${university.start} - ${university.end} triệu`;
                }
            }


            card.innerHTML = `
                <div class="card-content">
                    
                    <div class="card-image">
                        <img src="${university.logo}" alt="${university.name_vn}" onerror="this.onerror=null;this.src='https://placehold.co/120x120/cccccc/333333?text=No+Logo';">
                    </div>
                    <div class="card-info">
                        <div>   ${university.registration ===true ? '<span class="info-tag tag-registration">NỔI BẬT</span>' : ''}
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

            // Sửa: chỉ hiện modal khi hover vào tên trường 3s mới hiện ra
            let hoverTimeout;
            const nameEl = card.querySelector('.university-name');
            nameEl.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => showModal(university, locationText, tuitionDisplay), 100);
            });
            nameEl.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
            });
            universitiesGrid.appendChild(card);
        });
    }

    // Update pagination controls (buttons and page numbers)
    function updatePaginationControls() {
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        pageNumbersContainer.innerHTML = ''; // Clear previous page numbers

        // Display a range of page numbers around the current page
        const maxPageButtons = 5; // Max number of page buttons to display
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        if (startPage === 1) {
            endPage = Math.min(totalPages, maxPageButtons);
        }


        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-number-button';
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                fetchUniversities(i);
                // Scroll to top of the grid after changing page
                universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            pageNumbersContainer.appendChild(pageButton);
        }
    }

    // Modal logic
    let modalTimeout;

    function showModal(university, locationText, tuitionDisplay) {
        clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            // Xử lý giới thiệu cắt ngắn + nút xem thêm
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
                        ${university.majors_data && university.majors_data.length > 0 ?
                            university.majors_data.map(major => `<li>${major.name}</li>`).join('') :
                            '<li>Không có thông tin ngành đào tạo chính.</li>'
                        }
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
                    <div style="width: 100%; height: 300px; overflow: hidden; border-radius: 10px;">
                        ${university.map_link}
                    </div>
                </div>` : ''}
            `;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Đổi màu border modal-content nếu là trường nổi bật
            if (university.registration === true) {
                modalContent.style.borderColor = '#ffc107'; 
                // vàng
                document.querySelector('.apply-btn').classList.add('highlight');
            } else {
                modalContent.style.borderColor = '#3b82f6'; // xanh mặc định
                document.querySelector('.apply-btn').classList.remove('highlight');
            }
            // Xử lý nút xem thêm
            const btn = document.getElementById('seeMoreBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    const introDiv = document.getElementById(introId);
                    introDiv.style.maxHeight = 'none';
                    btn.style.display = 'none';
                });
            }
        }, 500);
    }

    function hideModal() {
        clearTimeout(modalTimeout);
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.onclick = hideModal;
    modalOverlay.onclick = function (e) {
        if (e.target === this) hideModal();
    };
    modalContent.addEventListener('mouseleave', hideModal);

    // Filter and Pagination logic
    function applyFiltersAndFetch(page = 1) {
        currentSearchTerm = searchInput.value.trim().toLowerCase();
        currentLocationFilter = locationFilter.value.toLowerCase();
        currentTypeFilter = typeFilter.value.toLowerCase();
        currentAdmissionScoreFilter = admissionScoreFilter.value; // Stays client-side filter
        fetchUniversities(page);
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
    searchInput.addEventListener('input', debounce(() => applyFiltersAndFetch(1), 300)); // Debounce 300ms
    locationFilter.addEventListener('change', () => applyFiltersAndFetch(1));
    typeFilter.addEventListener('change', () => applyFiltersAndFetch(1));
    admissionScoreFilter.addEventListener('change', () => applyFiltersAndFetch(1));

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchUniversities(currentPage - 1);
            universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchUniversities(currentPage + 1);
            universitiesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Initial fetch and render
    applyFiltersAndFetch(); // Initial call to fetch universities with default filters
});