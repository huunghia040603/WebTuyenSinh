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
    const baseUrl = 'https://webtimtruong.pythonanywhere.com/all_major/';
    
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
        setInnerHTMLOrText('majorDuration', major.training_duration);
        setInnerHTMLOrText('majorTuition', major.tuition_fee_per_year);
        
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
        setInnerHTMLOrText('majorSuitable', major.suitable, 'Không có thông tin tố chất phù hợp');
    }

    function updateMajorProgram(major) {
        setInnerHTMLOrText('majorProgram', major.program, 'Không có thông tin chương trình học');
    }

    function updateMajorJobs(major) {
        setInnerHTMLOrText('majorJobs', major.job, 'Không có thông tin việc làm');
    }

    function updateMajorNote(major) {
        setInnerHTMLOrText('majorNote', major.note, 'Không có thông tin điểm nổi bật');
    }

    function updateOpportunityStats(major) {
        // Các trường này không phải RichTextField nên chỉ cần textContent
        setInnerHTMLOrText('opportunityScore', major.opportunities ? `${major.opportunities}/100` : '--');
        setInnerHTMLOrText('salaryRange', major.salary);

        const demandLevel = document.getElementById('demandLevel');
        if (demandLevel) {
            if (major.opportunities) {
                if (major.opportunities >= 80) demandLevel.textContent = 'Cao';
                else if (major.opportunities >= 60) demandLevel.textContent = 'Trung bình';
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
            autoSlideInterval = setInterval(nextSlide, 3000);
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

    setTimeout(() => {
        console.log('Bắt đầu xử lý, major ID:', majorId);
        loadMajorData();
    }, 100);
});