document.addEventListener('DOMContentLoaded', function () {
    const universitiesGrid = document.getElementById('universitiesGrid');
    const searchInput = document.getElementById('searchInput');
    const tuitionFilter = document.getElementById('tuitionFilter');
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
    let currentTuitionFilter = '';
    let currentLocationFilter = '';
    let currentTypeFilter = '';
    let currentAdmissionScoreFilter = '';

    // Function to fetch data from API with pagination and filters
    async function fetchUniversities(page = 1) {
        universitiesGrid.innerHTML = '<p>Đang tải dữ liệu...</p>'; // Show loading message
        currentPage = page;

        const baseUrl = 'https://timtruonghoc.pythonanywhere.com/schools/';
        const params = new URLSearchParams();

        // Add search term
        if (currentSearchTerm) {
            params.append('search', currentSearchTerm);
        }

        // Add filters
        if (currentTuitionFilter) {
            // Note: Your backend tuition filter might need to be adjusted to match these values
            // For now, client-side filtering will handle this based on fetched data if backend doesn't support
            // If backend supports, uncomment and adjust:
            // params.append('tuition_range', currentTuitionFilter);
        }
        if (currentLocationFilter) {
            // Note: Your backend location filter might need to be adjusted
            // If backend supports, uncomment and adjust:
            // params.append('location', currentLocationFilter);
        }
        if (currentTypeFilter) {
            params.append('school_type', currentTypeFilter);
        }
        if (currentAdmissionScoreFilter) {
            // Note: Your backend admission score filter might need to be adjusted
            // If backend supports, uncomment and adjust:
            // params.append('admission_score_range', currentAdmissionScoreFilter);
        }

        // Add pagination parameters
        params.append('page', currentPage);
        // You can also add page_size if you want to control it from the frontend
        // params.append('page_size', 10); // Example: 10 items per page

        const url = `${baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Store total pages and count from the paginated response
            totalPages = data.total_pages;
            // The 'results' key holds the actual university data for the current page
            const universities = data.results.map(uni => ({
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
                tuition_fee_ranges: uni.tuition_fee_ranges,
                acceptanceRate: 'N/A', // Placeholder
                studentCount: 'N/A', // Placeholder
                min_admission_score: uni.min_admission_score || null
            }));

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
            card.style.animationDelay = `${index * 0.1}s`;

            let location = 'Khác';
            if (university.country.includes('TPHCM')) {
                location = 'TPHCM';
            } else if (university.country.includes('TP.Hà Nội')) {
                location = 'TP.Hà Nội';
            } else if (university.country.includes('TP.Đà Nẵng')) {
                location = 'TP.Đà Nẵng';
            }

            let tuitionDisplay = 'Chưa có';
            if (university.tuition_fee_ranges && university.tuition_fee_ranges.length > 0) {
                const minTuition = Math.min(...university.tuition_fee_ranges.map(range => range.min_value));
                const maxTuition = Math.max(...university.tuition_fee_ranges.map(range => range.max_value));
                if (minTuition && maxTuition) {
                    tuitionDisplay = `${(minTuition / 1000000).toFixed(0)}tr - ${(maxTuition / 1000000).toFixed(0)}tr`;
                } else if (minTuition) {
                    tuitionDisplay = `Từ ${(minTuition / 1000000).toFixed(0)}tr`;
                }
            }

            card.innerHTML = `
                <div class="card-content">
                    <div class="card-image">
                        <img src="${university.logo}" alt="${university.name_vn}" onerror="this.onerror=null;this.src='https://placehold.co/120x120/cccccc/333333?text=No+Logo';">
                    </div>
                    <div class="card-info">
                        <div>
                            <div class="university-name">${university.name_vn}</div>
                            <div class="info-tags">
                                <span class="info-tag tag-public">${university.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'}</span>
                                <span class="info-tag tag-quota">Chỉ tiêu: ${university.quota_per_year ? university.quota_per_year.toLocaleString() : 'N/A'}</span>
                                <span class="info-tag tag-year">Năm thành lập: ${university.established_year}</span>
                            </div>
                            <div class="info-tags">
                                <span class="info-tag tag-tuition">Học phí: ${tuitionDisplay}</span>
                                <span class="info-tag tag-location">${location}</span>
                            </div>
                        </div>
                        <div class="card-action">
                            <a href="${university.website_url}" target="_blank" class="see-more">>> Xem thêm</a>
                        </div>
                    </div>
                </div>
            `;

            // Sửa: chỉ hiện modal khi hover vào tên trường 3s mới hiện ra
            let hoverTimeout;
            const nameEl = card.querySelector('.university-name');
            nameEl.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => showModal(university, location, tuitionDisplay), 300);
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

    function showModal(university, location, tuitionDisplay) {
        clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            modalDetail.innerHTML = `
                <div class="detailed-title">${university.name_vn}</div>
                <div class="detailed-section">
                    <h4 class="section-heading">Giới thiệu</h4>
                    <ul class="description-list">
                        <li>${university.introduction || 'Không có thông tin giới thiệu.'}</li>
                    </ul>
                </div>
                <div class="detailed-section">
                    <h4 class="section-heading">Ngành đào tạo chính</h4>
                    <ul class="description-list">
                        ${university.majors_data && university.majors_data.length > 0 ?
                            university.majors_data.map(major => `<li>${major.name}</li>`).join('') :
                            '<li>Không có thông tin ngành đào tạo chính.</li>'
                        }
                    </ul>
                </div>
                <div class="detailed-stats">
                    <div class="stat-item">
                        <div class="stat-value">${university.acceptanceRate}</div>
                        <div class="stat-label">Tỷ lệ trúng tuyển</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${university.studentCount}</div>
                        <div class="stat-label">Sinh viên</div>
                    </div>
                </div>
                <div class="detailed-section">
                    <h4 class="section-heading">Thông tin khác</h4>
                    <ul class="description-list">
                        <li><strong>Mã tuyển sinh:</strong> ${university.admission_code || 'N/A'}</li>
                        <li><strong>Loại hình:</strong> ${university.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'}</li>
                        <li><strong>Năm thành lập:</strong> ${university.established_year}</li>
                        <li><strong>Chỉ tiêu hàng năm:</strong> ${university.quota_per_year ? university.quota_per_year.toLocaleString() : 'N/A'}</li>
                        <li><strong>Học phí:</strong> ${tuitionDisplay}</li>
                        <li><strong>Địa điểm:</strong> ${location}</li>
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
        currentSearchTerm = searchInput.value.toLowerCase();
        currentTuitionFilter = tuitionFilter.value;
        currentLocationFilter = locationFilter.value.toLowerCase();
        currentTypeFilter = typeFilter.value.toLowerCase();
        currentAdmissionScoreFilter = admissionScoreFilter.value;
        fetchUniversities(page);
    }

    // Event listeners
    searchInput.addEventListener('input', () => applyFiltersAndFetch(1)); // Reset to page 1 on search
    tuitionFilter.addEventListener('change', () => applyFiltersAndFetch(1)); // Reset to page 1 on filter change
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
    fetchUniversities();
});
