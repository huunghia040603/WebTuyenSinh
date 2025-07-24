document.addEventListener('DOMContentLoaded', function () {
    const universitiesGrid = document.getElementById('universitiesGrid');
    const searchInput = document.getElementById('searchInput');
    const tuitionFilter = document.getElementById('tuitionFilter');
    const locationFilter = document.getElementById('locationFilter');
    const typeFilter = document.getElementById('typeFilter');
    const admissionScoreFilter = document.getElementById('admissionScoreFilter'); // New filter
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const modalDetail = document.getElementById('modalDetail');

    let allUniversities = []; // Store all fetched universities

    // Function to fetch data from API
    async function fetchUniversities() {
        try {
            const response = await fetch('https://timtruonghoc.pythonanywhere.com/schools/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allUniversities = data.map(uni => ({
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
                map_link: uni.map_link,
                majors_data: uni.majors_data,
                tuition_fee_ranges: uni.tuition_fee_ranges,
                // Assuming acceptance_rate and student_count would come from API if available
                // For now, using placeholders or deriving from other data if possible
                acceptanceRate: 'N/A', // Placeholder
                studentCount: 'N/A', // Placeholder
                min_admission_score: uni.min_admission_score || null // Assuming API might provide this
            }));
            filterAndRenderUniversities(); // Initial render after fetching
        } catch (error) {
            console.error('Error fetching universities:', error);
            universitiesGrid.innerHTML = '<p>Không thể tải dữ liệu trường học. Vui lòng thử lại sau.</p>';
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

            // Extract location from name_vn or assume based on common patterns
            let location = 'Khác';
            if (university.name_vn.includes('Hồ Chí Minh') || university.name_vn.includes('TP.HCM')) {
                location = 'TP. Hồ Chí Minh';
            } else if (university.name_vn.includes('Hà Nội')) {
                location = 'Hà Nội';
            } else if (university.name_vn.includes('Đà Nẵng')) {
                location = 'Đà Nẵng';
            }

            // Determine tuition display
            let tuitionDisplay = '';
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
                        <img src="${university.logo}" alt="${university.name_vn}">
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

            card.querySelector('.card-image').addEventListener('mouseenter', () => showModal(university, location, tuitionDisplay));
            universitiesGrid.appendChild(card);
        });
    }

    // Modal logic
    let modalTimeout;

    function showModal(university, location, tuitionDisplay) {
        clearTimeout(modalTimeout); // Clear any previous timeout
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
        }, 500); // 500ms delay
    }

    function hideModal() {
        clearTimeout(modalTimeout); // Clear timeout if modal is hidden before it appears
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.onclick = hideModal;
    modalOverlay.onclick = function (e) {
        if (e.target === this) hideModal();
    };
    modalContent.addEventListener('mouseleave', hideModal); // Hide on mouse leave from content

    // Filter universities
    function filterAndRenderUniversities() {
        const searchTerm = searchInput.value.toLowerCase();
        const tuitionFilterValue = tuitionFilter.value;
        const locationFilterValue = locationFilter.value.toLowerCase();
        const typeFilterValue = typeFilter.value.toLowerCase();
        const admissionScoreFilterValue = admissionScoreFilter.value;

        let filtered = allUniversities.filter(university => {
            // Search filter
            const matchesSearch = university.name_vn.toLowerCase().includes(searchTerm) ||
                (university.name_en && university.name_en.toLowerCase().includes(searchTerm)) ||
                university.short_code.toLowerCase().includes(searchTerm) ||
                university.admission_code.toLowerCase().includes(searchTerm);

            // Tuition filter
            let matchesTuition = true;
            if (tuitionFilterValue && university.tuition_fee_ranges && university.tuition_fee_ranges.length > 0) {
                const minTuitionAPI = Math.min(...university.tuition_fee_ranges.map(range => range.min_value));
                if (tuitionFilterValue === 'low' && minTuitionAPI >= 20000000) {
                    matchesTuition = false;
                } else if (tuitionFilterValue === 'medium' && (minTuitionAPI < 20000000 || minTuitionAPI > 40000000)) {
                    matchesTuition = false;
                } else if (tuitionFilterValue === 'high' && minTuitionAPI <= 40000000) {
                    matchesTuition = false;
                }
            }

            // Location filter
            let matchesLocation = true;
            if (locationFilterValue) {
                const universityLocation = university.name_vn.toLowerCase();
                if (locationFilterValue === 'ho chi minh' && !(universityLocation.includes('hồ chí minh') || universityLocation.includes('tp.hcm'))) {
                    matchesLocation = false;
                } else if (locationFilterValue === 'ha noi' && !universityLocation.includes('hà nội')) {
                    matchesLocation = false;
                } else if (locationFilterValue === 'da nang' && !universityLocation.includes('đà nẵng')) {
                    matchesLocation = false;
                } else if (locationFilterValue === 'other' && (universityLocation.includes('hồ chí minh') || universityLocation.includes('tp.hcm') || universityLocation.includes('hà nội') || universityLocation.includes('đà nẵng'))) {
                    matchesLocation = false;
                }
            }

            // Type filter
            const matchesType = !typeFilterValue || university.school_type.toLowerCase() === typeFilterValue;

            // Admission Score filter
            let matchesAdmissionScore = true;
            if (admissionScoreFilterValue && university.min_admission_score !== null) {
                const score = parseFloat(university.min_admission_score);
                if (isNaN(score)) { // If score is not a number, skip this filter
                    matchesAdmissionScore = true;
                } else if (admissionScoreFilterValue === 'low' && (score < 15 || score > 18)) {
                    matchesAdmissionScore = false;
                } else if (admissionScoreFilterValue === 'medium' && (score < 18 || score > 20)) {
                    matchesAdmissionScore = false;
                } else if (admissionScoreFilterValue === 'high' && (score < 20 || score > 22)) {
                    matchesAdmissionScore = false;
                } else if (admissionScoreFilterValue === 'veryhigh' && score <= 22) {
                    matchesAdmissionScore = false;
                }
            } else if (admissionScoreFilterValue && university.min_admission_score === null) {
                // If filter is active but no score data for university, it doesn't match
                matchesAdmissionScore = false;
            }


            return matchesSearch && matchesTuition && matchesLocation && matchesType && matchesAdmissionScore;
        });

        renderUniversities(filtered);
    }

    // Event listeners
    searchInput.addEventListener('input', filterAndRenderUniversities);
    tuitionFilter.addEventListener('change', filterAndRenderUniversities);
    locationFilter.addEventListener('change', filterAndRenderUniversities);
    typeFilter.addEventListener('change', filterAndRenderUniversities);
    admissionScoreFilter.addEventListener('change', filterAndRenderUniversities);

    // Initial fetch and render
    fetchUniversities();
});