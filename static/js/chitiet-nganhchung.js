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
            
            // Hiển thị loading
            showLoading();
            
            // Fetch dữ liệu từ API
            const apiUrl = `${baseUrl}?all_major_id=${majorId}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            
            // Kiểm tra nếu data là array trực tiếp
            if (Array.isArray(data) && data.length > 0) {
                const major = data[0]; // Lấy ngành đầu tiên
                updatePageContent(major);
                hideLoading();
            } else if (data.results && data.results.length > 0) {
                // Fallback cho trường hợp có results
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
            // Cập nhật header
            updateHeader(major);
            
            // Cập nhật thông tin ngành
            updateMajorInfo(major);
            
            // Cập nhật nội dung các section
            updateMajorDescription(major);
            updateMajorSuitable(major);
            updateMajorProgram(major);
            updateMajorJobs(major);
            updateMajorNote(major);
            updateOpportunityStats(major);
            
            // Khởi tạo slider
            initializeSlider();
            
            console.log('Cập nhật nội dung hoàn tất');
        } catch (error) {
            console.error('Lỗi khi cập nhật nội dung:', error);
        }
    }

    function updateHeader(major) {
        // Cập nhật tên ngành
        const majorName = document.getElementById('majorName');
        if (majorName) {
            majorName.textContent = major.name || 'Tên ngành';
        }

        // Cập nhật mã ngành
        const majorCode = document.getElementById('majorCode');
        if (majorCode) {
            majorCode.textContent = `Mã ngành: ${major.all_major_id || 'N/A'}`;
        }
    }

    function updateMajorInfo(major) {
        // Cập nhật thông tin cơ bản
        const majorId = document.getElementById('majorId');
        if (majorId) {
            majorId.textContent = major.all_major_id || 'N/A';
        }

        const majorField = document.getElementById('majorField');
        if (majorField) {
            majorField.textContent = major.field?.name || 'N/A';
        }

        const majorDuration = document.getElementById('majorDuration');
        if (majorDuration) {
            majorDuration.textContent = major.training_duration || 'N/A';
        }

        const majorTuition = document.getElementById('majorTuition');
        if (majorTuition) {
            majorTuition.textContent = major.tuition_fee_per_year || 'N/A';
        }

        const majorSalary = document.getElementById('majorSalary');
        if (majorSalary) {
            majorSalary.textContent = major.salary || 'N/A';
        }

        const majorTag = document.getElementById('majorTag');
        if (majorTag) {
            const tagText = major.tag === 'hot' ? 'Ngành hot' : 
                           major.tag === 'new' ? 'Ngành mới' : 
                           major.tag === 'trending' ? 'Ngành xu hướng' : 'Ngành thường';
            majorTag.textContent = tagText;
        }
    }

    function updateMajorDescription(major) {
        const majorDescription = document.getElementById('majorDescription');
        if (majorDescription) {
            if (major.short_description) {
                // Xử lý HTML từ RichTextField
                majorDescription.innerHTML = major.short_description;
            } else {
                majorDescription.textContent = 'Không có thông tin mô tả';
            }
        }
    }

    function updateMajorSuitable(major) {
        const majorSuitable = document.getElementById('majorSuitable');
        if (majorSuitable) {
            if (major.suitable) {
                // Xử lý HTML từ RichTextField
                majorSuitable.innerHTML = major.suitable;
            } else {
                majorSuitable.textContent = 'Không có thông tin tố chất phù hợp';
            }
        }
    }

    function updateMajorProgram(major) {
        const majorProgram = document.getElementById('majorProgram');
        if (majorProgram) {
            if (major.program) {
                // Xử lý HTML từ RichTextField
                majorProgram.innerHTML = major.program;
            } else {
                majorProgram.textContent = 'Không có thông tin chương trình học';
            }
        }
    }

    function updateMajorJobs(major) {
        const majorJobs = document.getElementById('majorJobs');
        if (majorJobs) {
            if (major.job) {
                // Xử lý HTML từ RichTextField
                majorJobs.innerHTML = major.job;
            } else {
                majorJobs.textContent = 'Không có thông tin việc làm';
            }
        }
    }

    function updateMajorNote(major) {
        const majorNote = document.getElementById('majorNote');
        if (majorNote) {
            if (major.note) {
                // Xử lý HTML từ RichTextField
                majorNote.innerHTML = major.note;
            } else {
                majorNote.textContent = 'Không có thông tin điểm nổi bật';
            }
        }
    }

    function updateOpportunityStats(major) {
        // Cập nhật thống kê cơ hội
        const opportunityScore = document.getElementById('opportunityScore');
        if (opportunityScore) {
            opportunityScore.textContent = major.opportunities ? `${major.opportunities}/100` : '--';
        }

        const salaryRange = document.getElementById('salaryRange');
        if (salaryRange) {
            salaryRange.textContent = major.salary || '--';
        }

        const demandLevel = document.getElementById('demandLevel');
        if (demandLevel) {
            // Tính toán dựa trên opportunities
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
            // Tính toán dựa trên tag
            if (major.tag === 'hot') growthRate.textContent = 'Tăng nhanh';
            else if (major.tag === 'trending') growthRate.textContent = 'Tăng ổn định';
            else if (major.tag === 'new') growthRate.textContent = 'Mới phát triển';
            else growthRate.textContent = 'Ổn định';
        }
    }

    function initializeSlider() {
        // Slider functionality
        const slider = document.querySelector('.chitiet-slider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.chitiet-slide');
        const navBtns = slider.querySelectorAll('.chitiet-nav-btn');
        const dots = slider.querySelectorAll('.chitiet-dot');
        
        let currentSlide = 0;
        let autoSlideInterval;
        
        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            navBtns.forEach(btn => btn.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show current slide
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
            autoSlideInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
        }
        
        // Event listeners for navigation buttons
        navBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                showSlide(index);
                stopAutoSlide();
                startAutoSlide(); // Restart auto slide
            });
        });
        
        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                stopAutoSlide();
                startAutoSlide(); // Restart auto slide
            });
        });
        
        // Pause auto slide on hover
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        
        // Start auto slide
        startAutoSlide();
    }

    // Bắt đầu load dữ liệu với delay nhỏ để đảm bảo DOM load hoàn toàn
    setTimeout(() => {
        console.log('Bắt đầu xử lý, major ID:', majorId);
        loadMajorData();
    }, 100);
});
