// Đợi DOM load hoàn toàn
window.addEventListener('load', function () {
    console.log('Window loaded for chitiet-nganhchung');
    
    // Lấy mã ngành từ URL
    const pathSegments = window.location.pathname.split('/');
    const majorId = pathSegments[pathSegments.length - 1];
    
    console.log('Path segments:', pathSegments);
    console.log('Major ID:', majorId);
    
    if (!majorId) {
        console.error('Không tìm thấy mã ngành trong URL');
        return;
    }

    // API endpoint
    const baseUrl = 'https://timtruonghoc.pythonanywhere.com/all_major/';
    
    // Load dữ liệu ngành học
    async function loadMajorData() {
        try {
            console.log('Bắt đầu load dữ liệu cho mã ngành:', majorId);
            
            showLoading();
            
            const apiUrl = `${baseUrl}?all_major_id=${majorId}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (Array.isArray(data) && data.length > 0) {
                const major = data[0];
                updatePageContent(major);
                hideLoading();
            } else if (data.results && data.results.length > 0) {
                const major = data.results[0];
                updatePageContent(major);
                hideLoading();
            } else {
                showError('Không tìm thấy thông tin ngành học');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showError(`Có lỗi xảy ra khi tải dữ liệu ngành học: ${error.message}`);
        }
    }

    function showLoading() {
        const container = document.querySelector('.chitiet-container');
        const loadingContainer = document.getElementById('loadingContainer');
        
        if (container) {
            container.style.display = 'none';
        }
        if (loadingContainer) {
            loadingContainer.style.display = 'flex';
        }
    }

    function hideLoading() {
        const container = document.querySelector('.chitiet-container');
        const loadingContainer = document.getElementById('loadingContainer');
        
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        if (container) {
            container.style.display = 'block';
        }
    }

    function showError(message) {
        hideLoading();
        alert(message);
    }
    
    function updatePageContent(major) {
        console.log('Bắt đầu cập nhật nội dung trang');
        
        try {
            updateHeader(major);
            updateMajorInfo(major);
            updateMajorDescription(major);
            updateMajorSuitable(major);
            updateMajorProgram(major);
            updateMajorJobs(major);
            updateMajorNote(major);
            updateOpportunityStats(major);
            
            initializeSlider();
            
            console.log('Cập nhật nội dung hoàn tất');
        } catch (error) {
            console.error('Lỗi khi cập nhật nội dung:', error);
        }
    }

    // Hàm chung để xử lý và gán nội dung HTML
    function setInnerHTMLOrText(elementId, content, fallbackText = 'N/A') {
        const element = document.getElementById(elementId);
        if (element) {
            // Sử dụng innerHTML để render các thẻ HTML
            if (content) {
                element.innerHTML = content;
            } else {
                element.textContent = fallbackText;
            }
        }
    }

    function updateHeader(major) {
        setInnerHTMLOrText('majorName', major.name, 'Tên ngành');
        setInnerHTMLOrText('majorCode', `Mã ngành: ${major.all_major_id || 'N/A'}`);
    }

    function updateMajorInfo(major) {
        setInnerHTMLOrText('majorId', major.all_major_id);
        setInnerHTMLOrText('majorField', major.field?.name);
        
        // training_duration và tuition_fee_per_year là RichTextField nên cần dùng innerHTML
        setInnerHTMLOrText('majorDuration', major.training_duration + ' năm');
        
        // Cập nhật hiển thị học phí từ model Major
        let tuitionDisplay = 'Chưa có thông tin';
        
        // Debug: Log thông tin học phí
        console.log('Major tuition data:', {
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
            tuitionDisplay = major.tuition_fee_per_year || 'Chưa có thông tin';
        }
        
        console.log('Final tuition display:', tuitionDisplay);
        setInnerHTMLOrText('majorTuition', tuitionDisplay);
        
        setInnerHTMLOrText('majorSalary', major.salary);

        const majorTag = document.getElementById('majorTag');
        if (majorTag) {
            const tagText = major.tag === 'hot' ? 'Ngành hot' : 
                            major.tag === 'find' ? 'Ngành đang thiếu nhân lực' :
                            major.tag === 'grown' ? 'Ngành có phát triển' :
                            major.tag === 'push' ? 'Đẩy mạnh' : 'Bình thường';
            majorTag.textContent = tagText;
        }
    }

    function updateMajorDescription(major) {
        setInnerHTMLOrText('majorDescription', major.short_description, 'Không có thông tin mô tả');
    }

    function updateMajorSuitable(major) {
        const majorSuitable = document.getElementById('majorSuitable');
        if (majorSuitable) {
            if (major.suitable) {
                // Tách dữ liệu theo dấu phẩy và tạo các ô
                const qualities = major.suitable.split(',').map(item => item.trim()).filter(item => item);
                
                if (qualities.length > 0) {
                    let html = '<div class="chitiet-qualities">';
                    qualities.forEach(quality => {
                        // Chỉ viết hoa chữ cái đầu của từ đầu tiên
                        const words = quality.split(' ');
                        const capitalizedQuality = words.map((word, index) => {
                            if (index === 0) {
                                // Từ đầu tiên: viết hoa chữ cái đầu
                                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                            } else {
                                // Các từ khác: giữ nguyên
                                return word;
                            }
                        }).join(' ');
                        html += `<div class="chitiet-quality-item"><strong>${capitalizedQuality}</strong></div>`;
                    });
                    html += '</div>';
                    majorSuitable.innerHTML = html;
                } else {
                    majorSuitable.textContent = 'Không có thông tin tố chất phù hợp';
                }
            } else {
                majorSuitable.textContent = 'Không có thông tin tố chất phù hợp';
            }
        }
    }

    function updateMajorProgram(major) {
        const majorProgram = document.getElementById('majorProgram');
        if (majorProgram) {
            if (major.program) {
                // Xử lý format cho chương trình học
                let formattedProgram = major.program;
                
                // Xuống dòng sau dấu : và dấu . (nhưng không xuống dòng nếu đang trong dấu ngoặc)
                formattedProgram = formattedProgram.replace(/[:.](?![^()]*\))/g, '$&<br>');
                
                // In đậm các tiêu đề chính (Kiến thức đại cương, Kiến thức cơ sở nghiệp vụ, Kiến thức chuyên sâu, v.v.)
                formattedProgram = formattedProgram.replace(/(Kiến thức [^:]*):/g, '<strong>$1:</strong>');
                formattedProgram = formattedProgram.replace(/(Chương trình [^:]*):/g, '<strong>$1:</strong>');
                majorProgram.innerHTML = formattedProgram;
            } else {
                majorProgram.textContent = 'Không có thông tin chương trình học';
            }
        }
    }

    function updateMajorJobs(major) {
        const majorJobs = document.getElementById('majorJobs');
        if (majorJobs) {
            if (major.job) {
                console.log('Raw job data:', major.job);
                
                // Xử lý dữ liệu HTML nếu có
                let jobText = major.job;
                if (jobText.includes('<p>') || jobText.includes('<br>')) {
                    // Loại bỏ HTML tags
                    jobText = jobText.replace(/<[^>]*>/g, '');
                }
                
                // Thay thế các dấu phân cách khác bằng dấu phẩy
                jobText = jobText.replace(/[.;]/g, ',');
                
                // Xử lý trường hợp có "và" hoặc "and"
                jobText = jobText.replace(/\s+và\s+/gi, ',');
                jobText = jobText.replace(/\s+and\s+/gi, ',');
                
                // Tách dữ liệu theo dấu phẩy, tạo các ô
                const jobs = jobText.split(',').map(item => item.trim()).filter(item => item && item.length > 2);
                
                console.log('Parsed jobs:', jobs);
                
                if (jobs.length > 0) {
                    let html = '<div class="chitiet-jobs">';
                    jobs.forEach(job => {
                        // Loại bỏ các ký tự đặc biệt không cần thiết
                        let cleanJob = job.replace(/[()]/g, '').trim();
                        
                        // Viết hoa chữ cái đầu của từ đầu tiên
                        const words = cleanJob.split(' ');
                        const capitalizedJob = words.map((word, index) => {
                            if (index === 0) {
                                // Từ đầu tiên: viết hoa chữ cái đầu
                                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                            } else {
                                // Các từ khác: giữ nguyên
                                return word;
                            }
                        }).join(' ');
                        
                        // Chỉ hiển thị nếu job có ý nghĩa
                        if (capitalizedJob.length > 3) {
                            html += `<div class="chitiet-job-item">${capitalizedJob}</div>`;
                        }
                    });
                    html += '</div>';
                    majorJobs.innerHTML = html;
                } else {
                    majorJobs.textContent = 'Không có thông tin việc làm';
                }
            } else {
                majorJobs.textContent = 'Không có thông tin việc làm';
            }
        }
    }

    function updateMajorNote(major) {
        const majorNote = document.getElementById('majorNote');
        if (majorNote) {
            if (major.note) {
                // Xử lý note để tự động xuống dòng và không có khoảng trắng quá nhiều
                let formattedNote = major.note;
                
                // Thay thế nhiều khoảng trắng liên tiếp bằng một khoảng trắng
                formattedNote = formattedNote.replace(/\s+/g, ' ');
                
                // Thay thế dấu . và : bằng xuống dòng
                formattedNote = formattedNote.replace(/[:.]/g, '$&<br>');
                
                // Wrap note content in demo-highlight div
                majorNote.innerHTML = `<div class="demo-highlight"><strong>Điểm nổi bật: </strong>${formattedNote}</div>`;
            } else {
                majorNote.textContent = 'Không có thông tin điểm nổi bật';
            }
        }
    }

    function updateOpportunityStats(major) {
        // Các trường này không phải RichTextField nên chỉ cần textContent
        setInnerHTMLOrText('opportunityScore', major.opportunities ? `${major.opportunities}/100` : '--');
        setInnerHTMLOrText('salaryRange', major.salary);

        const demandLevel = document.getElementById('demandLevel');
        if (demandLevel) {
            if (major.opportunities) {
                if (major.opportunities >= 90) demandLevel.textContent = 'Rất Cao';
                else if (major.opportunities >= 80) demandLevel.textContent = 'Cao';
                else if (major.opportunities >= 65) demandLevel.textContent = 'Trung bình';
                else demandLevel.textContent = 'Thấp';
            } else {
                demandLevel.textContent = '--';
            }
        }

        const growthRate = document.getElementById('growthRate');
        if (growthRate) {
            const tag = major.tag || '';
            let growthText = 'Ổn định';
            if (tag === 'hot') growthText = 'Tăng nhanh';
            else if (tag === 'find' || tag === 'grown' || tag === 'push') growthText = 'Tăng trưởng';
            growthRate.textContent = growthText;
        }
        
        // Load danh sách trường có dạy ngành này
        console.log('Calling loadSchoolsTeachingMajor with major ID:', major.all_major_id);
        loadSchoolsTeachingMajor(major.all_major_id);
    }

    // Thêm biến toàn cục cho phân trang trường học
    let currentSchoolPage = 1;
    const schoolsPerPage = 9;
    let allSuggestedSchools = [];

    function renderSuggestedSchoolsPagination(totalSchools) {
        const paginationContainer = document.getElementById('suggestedSchoolsPagination');
        if (!paginationContainer) return;
        const totalPages = Math.ceil(totalSchools / schoolsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let html = '';
        // Nút Trước
        html += `<button class="school-page-btn page-nav" ${currentSchoolPage === 1 ? 'disabled' : ''} data-page="prev">&laquo; Trước</button>`;
        // Logic hiển thị số trang và dấu ...
        let pageList = [];
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pageList.push(i);
        } else {
            if (currentSchoolPage <= 4) {
                pageList = [1,2,3,4,5,'...',totalPages];
            } else if (currentSchoolPage >= totalPages - 3) {
                pageList = [1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
            } else {
                pageList = [1,'...',currentSchoolPage-1,currentSchoolPage,currentSchoolPage+1,'...',totalPages];
            }
        }
        for (let i = 0; i < pageList.length; i++) {
            const p = pageList[i];
            if (p === '...') {
                html += `<span class="school-page-ellipsis">...</span>`;
            } else {
                html += `<button class="school-page-btn${p === currentSchoolPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
            }
        }
        // Nút Sau
        html += `<button class="school-page-btn page-nav" ${currentSchoolPage === totalPages ? 'disabled' : ''} data-page="next">Sau &raquo;</button>`;
        paginationContainer.innerHTML = html;
        // Gán sự kiện
        Array.from(paginationContainer.querySelectorAll('.school-page-btn')).forEach(btn => {
            btn.onclick = function() {
                let page = this.getAttribute('data-page');
                if (page === 'prev') page = currentSchoolPage - 1;
                else if (page === 'next') page = currentSchoolPage + 1;
                else page = parseInt(page);
                if (page >= 1 && page <= totalPages) {
                    currentSchoolPage = page;
                    updateSuggestedSchools(allSuggestedSchools);
                }
            };
        });
    }

    // Sửa lại updateSuggestedSchools để phân trang
    function updateSuggestedSchools(schools) {
        console.log('updateSuggestedSchools called with:', schools);
        
        if (!schools || schools.length === 0) {
            console.log('No schools provided to updateSuggestedSchools');
            showNoSchoolsMessage();
            return;
        }
        
        // Sắp xếp outstanding lên đầu
        const outstanding = schools.filter(s => s.tag === 'outstanding');
        const normal = schools.filter(s => s.tag !== 'outstanding');
        const sortedSchools = outstanding.concat(normal);
        allSuggestedSchools = sortedSchools;
        
        console.log('Sorted schools:', sortedSchools);
        
        const suggestedSchoolsContainer = document.getElementById('suggestedSchools');
        if (!suggestedSchoolsContainer) {
            console.error('suggestedSchools container not found');
            return;
        }
        // Phân trang
        const totalSchools = sortedSchools.length;
        const totalPages = Math.ceil(totalSchools / schoolsPerPage);
        if (currentSchoolPage > totalPages) currentSchoolPage = 1;
        const startIdx = (currentSchoolPage - 1) * schoolsPerPage;
        const endIdx = startIdx + schoolsPerPage;
        const schoolsToShow = sortedSchools.slice(startIdx, endIdx);
        let html = '';
        schoolsToShow.forEach((school, index) => {
            const schoolType = school.school_type === 'public' ? 'Công lập' : 'Ngoài công lập';
            const location = school.country || 'Đang cập nhật';
            const scoreText = school.admission_score ? `${school.admission_score} (${school.score_year})` : 'Chưa có';
            function getInt(str) {
                if (!str) return null;
                const match = String(str).match(/\d{1,2}/);
                return match ? match[0] : null;
            }
            let tuitionText = 'Chưa có';
            const min = getInt(school.tuition_min);
            const max = getInt(school.tuition_max);
            if (min && max) {
                if (min === "0" && max === "0") {
                    tuitionText = 'Miễn phí';
                } else if (min === max) {
                    tuitionText = `${min} triệu/năm`;
                } else {
                    tuitionText = `${min} - ${max} triệu/năm`;
                }
            } else if (min) {
                tuitionText = `Từ ${min} triệu/năm`;
            } else if (max) {
                tuitionText = `Đến ${max} triệu/năm`;
            }
            const featuredTag = school.tag === 'outstanding' ? '<span class="chitiet-school-tag featured">NỔI BẬT</span>' : '';
            const highlightClass = school.tag === 'outstanding' ? 'highlight' : '';
            html += `
                <div class="chitiet-school-item ${highlightClass}" onclick="window.location.href='/${school.short_code.toLowerCase()}'">
                    <div class="chitiet-school-content">
                        <div class="chitiet-school-logo-section">
                            <img src="${school.logo || '/static/images/logo/0.jpg'}" alt="${school.name}" onerror="this.src='/static/images/logo/0.jpg'">
                        </div>
                        <div class="chitiet-school-info">
                            <div>
                                <div class="chitiet-school-tags">
                                    ${featuredTag}
                                    <span class="chitiet-school-tag ${school.school_type === 'public' ? 'public' : 'private'}">${schoolType}</span>
                                </div>
                                <div class="chitiet-school-name">${school.name} <span class="chitiet-school-code"> - (${school.short_code})</span></div>
                                <div class="chitiet-school-tags">
                                    <span class="chitiet-school-tag quota">Chỉ tiêu: 5.000</span>
                                    <span class="chitiet-school-tag established">Thành lập: 1990</span>
                                </div>
                                <div class="chitiet-school-tags">
                                    <span class="chitiet-school-tag tuition">Học phí: ${tuitionText}</span>
                                    <span class="chitiet-school-tag location">${location}</span>
                                </div>
                            </div>
                            <div class="chitiet-school-score">Điểm: ${scoreText}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        suggestedSchoolsContainer.innerHTML = html;
        renderSuggestedSchoolsPagination(totalSchools);
    }

    function showNoSchoolsMessage() {
        const suggestedSchoolsContainer = document.getElementById('suggestedSchools');
        if (suggestedSchoolsContainer) {
            suggestedSchoolsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 1.2rem; margin-bottom: 8px;">Chưa có thông tin trường đào tạo</div>
                    <div style="font-size: 0.9rem;">Thông tin sẽ được cập nhật sớm nhất</div>
                </div>
            `;
        }
    }

    function initializeSlider() {
        const slider = document.querySelector('.chitiet-slider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.chitiet-slide');
        const navBtns = slider.querySelectorAll('.chitiet-nav-btn');
        const dots = slider.querySelectorAll('.chitiet-dot');
        
        let currentSlide = 0;
        let autoSlideInterval;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            navBtns.forEach(btn => btn.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            if (slides[index]) {
                slides[index].classList.add('active');
                navBtns[index].classList.add('active');
                dots[index].classList.add('active');
            }
            
            currentSlide = index;
        }
        
        function nextSlide() {
            const next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }
        
        function startAutoSlide() {
            stopAutoSlide(); // Ensure no multiple intervals running
            autoSlideInterval = setInterval(nextSlide, 2000);
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        }
        
        navBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                showSlide(index);
                startAutoSlide();
            });
        });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                startAutoSlide();
            });
        });
        
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        
        if (slides.length > 0) {
            showSlide(0);
            startAutoSlide();
        }
    }

    // Đảm bảo loadSchoolsTeachingMajor nằm ở ngoài cùng
    async function loadSchoolsTeachingMajor(majorId) {
        currentSchoolPage = 1;
        try {
            console.log('Loading schools teaching major:', majorId);
            
            // Sử dụng API schools để lấy tất cả trường và lọc theo ngành
            const apiUrl = `https://timtruonghoc.pythonanywhere.com/schools/`;
            console.log('API URL for schools:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('All schools data:', data);
            
            // Xử lý cấu trúc pagination
            const schools = data.results || data;
            console.log('Schools array:', schools);
            
            // Lọc các trường có ngành học tương ứng
            if (schools && schools.length > 0) {
                const schoolsWithMajor = schools.filter(school => {
                    if (school.majors_data && Array.isArray(school.majors_data)) {
                        console.log('Checking school:', school.name_vn || school.name);
                        console.log('School majors:', school.majors_data.map(m => m.major_id));
                        console.log('Looking for major:', majorId);
                        return school.majors_data.some(major => {
                            const match = major.major_id === majorId;
                            if (match) {
                                console.log('Found match in school:', school.name_vn || school.name);
                            }
                            return match;
                        });
                    }
                    return false;
                });
                
                console.log('Schools with major', majorId, ':', schoolsWithMajor);
                
                if (schoolsWithMajor.length > 0) {
                    const suggestedSchools = schoolsWithMajor.map(school => ({
                        id: school.id,
                        name: school.name_vn || school.name,
                        short_code: school.short_code,
                        logo: school.logo,
                        school_type: school.school_type,
                        country: school.country,
                        tag: school.tag,
                        admission_score: school.admission_score,
                        score_year: school.score_year,
                        tuition_min: school.min_tuition_fee_per_year,
                        tuition_max: school.max_tuition_fee_per_year
                    }));
                    
                    console.log('Suggested schools:', suggestedSchools);
                    updateSuggestedSchools(suggestedSchools);
                } else {
                    console.log('No schools found teaching this major, showing top schools as fallback');
                    // Fallback: hiển thị top 10 trường
                    const topSchools = schools.slice(0, 10).map(school => ({
                        id: school.id,
                        name: school.name_vn || school.name,
                        short_code: school.short_code,
                        logo: school.logo,
                        school_type: school.school_type,
                        country: school.country,
                        tag: school.tag,
                        admission_score: school.admission_score,
                        score_year: school.score_year,
                        tuition_min: school.min_tuition_fee_per_year,
                        tuition_max: school.max_tuition_fee_per_year
                    }));
                    
                    console.log('Fallback top schools:', topSchools);
                    updateSuggestedSchools(topSchools);
                }
            } else {
                console.log('No schools data available');
                showNoSchoolsMessage();
            }
        } catch (error) {
            console.error('Error loading schools:', error);
            showNoSchoolsMessage();
        }
    }

    setTimeout(() => {
        console.log('Bắt đầu xử lý, major ID:', majorId);
        loadMajorData();
    }, 100);
});