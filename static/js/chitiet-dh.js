// Đợi DOM load hoàn toàn
window.addEventListener('load', function () {
    console.log('Window loaded');
    
    // Lấy mã trường từ URL
    const pathSegments = window.location.pathname.split('/');
    const universityCode = pathSegments[pathSegments.length - 1];
    
    console.log('Path segments:', pathSegments);
    console.log('University code:', universityCode);
    
    if (!universityCode) {
        console.error('Không tìm thấy mã trường trong URL');
        return;
    }

    // API endpoint
    const baseUrl = 'https://webtimtruong.pythonanywhere.com/schools/';
    
    // Load dữ liệu trường học
    async function loadUniversityData() {
        try {
            console.log('Bắt đầu load dữ liệu cho mã trường:', universityCode);
            
            // Hiển thị loading
            showLoading();
            
            // Fetch dữ liệu từ API - tải tất cả trường
            const apiUrl = `${baseUrl}?short_code=${universityCode.toUpperCase()}&page_size=2000`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            
            if (data.results && data.results.length > 0) {
                // Lọc đúng short_code (không phân biệt hoa thường)
                const university = data.results.find(
                    u => u.short_code && u.short_code.toLowerCase() === universityCode.toLowerCase()
                );
                if (university) {
                    updatePageContent(university);
                    hideLoading(); // Ẩn loading khi thành công
                } else {
                    showError('Không tìm thấy thông tin trường học');
                }
            } else {
                showError('Không tìm thấy thông tin trường học');
            }
            
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            showError(`Có lỗi xảy ra khi tải dữ liệu trường học: ${error.message}`);
        }
    }

    async function fetchAllUniversities(short_code) {
        let allResults = [];
        let page = 1;
        let hasNext = true;
        while (hasNext) {
            const apiUrl = `${baseUrl}?short_code=${short_code}&page_size=100&page=${page}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                allResults = allResults.concat(data.results);
            }
            if (data.next) {
                page++;
            } else {
                hasNext = false;
            }
        }
        return allResults;
    }

    function showLoading() {
        const container = document.querySelector('.uni-container');
        if (container) {
            // Ẩn uni-container khi loading
            container.style.display = 'none';
            
            // Tạo loading container nằm giữa header và footer
            const loadingContainer = document.createElement('div');
            loadingContainer.id = 'loadingOverlay';
            loadingContainer.style.cssText = `
                max-width: 1200px;
                margin: 0 auto;
                padding: 100px 12px;
                min-height: 30vh;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            loadingContainer.innerHTML = `
                <div style="text-align: center;">
                    <div class="modern-loader">
                        <div class="modern-loader-spinner"></div>
                        <div class="modern-loader-text">Đang tải thông tin trường học...</div>
                    </div>
                </div>
            `;
            
            // Chèn loading vào sau header, trước footer
            const mainContent = document.querySelector('main') || document.querySelector('.main-content') || document.body;
            mainContent.appendChild(loadingContainer);
        }
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        // Hiện lại uni-container khi load xong
        const container = document.querySelector('.uni-container');
        if (container) {
            container.style.display = 'block';
        }
    }

    function showError(message) {
        hideLoading();
        alert(message);
    }

    function updatePageContent(university) {
        console.log('Bắt đầu cập nhật nội dung trang');
        
        try {
            // Cập nhật header
            updateHeader(university);
            
            // Cập nhật thông tin chính
            updateMainContent(university);
            
            // Cập nhật thông tin bên phải
            updateSidebar(university);
            
            // Cập nhật ngành đào tạo
            updateMajors(university);
            
            // Cập nhật style cho trường nổi bật
            updateOutstandingStyle(university);
            
            // Khởi tạo các sự kiện
            initializeEvents();
            
            console.log('Cập nhật nội dung hoàn tất');
        } catch (error) {
            console.error('Lỗi khi cập nhật nội dung:', error);
        }
    }

    function updateHeader(university) {
        // Cập nhật logo
        const logoImg = document.querySelector('.uni-logo-box img');
        if (logoImg) {
            logoImg.src = university.logo || '/static/images/logo/6.jpg';
            logoImg.alt = university.name_vn;
        }

        // Cập nhật ảnh bìa (cover_photo) cho header
        const uniHeader = document.querySelector('.uni-header');
        if (uniHeader && university.cover_photo) {
            uniHeader.style.backgroundImage = `url('${university.cover_photo}')`;
            // Thêm overlay mờ 50%
            uniHeader.style.position = 'relative';
            uniHeader.style.backgroundBlendMode = 'overlay';
            uniHeader.style.backgroundColor = 'rgba(255, 255, 255, 0.17)';
            // Hoặc dùng filter để mờ ảnh
            // uniHeader.style.filter = 'brightness(0.5)';
        }

        // Cập nhật tên trường
        const uniTitle = document.querySelector('.uni-title');
        if (uniTitle) {
            uniTitle.textContent = university.short_code + ' - ' + university.name_vn || 'Tên trường';
        }

        // Cập nhật mã trường
        // const uniCode = document.querySelector('.uni-code');
        // if (uniCode) {
        //     uniCode.textContent = university.short_code || 'CODE';
        // }

        // Cập nhật header bar
        const headerBar = document.querySelector('.uni-header-bar');
        if (headerBar) {
            headerBar.textContent = university.name_en || 'UNIVERSITY NAME';
        }
    }

    function updateMainContent(university) {
        console.log('Cập nhật nội dung chính');
        
        // Cập nhật giới thiệu
        const descBox = document.getElementById('descBox');
        
        if (descBox) { 
            const contentDiv = descBox.querySelector('.desc-extra');
            const toggleBtn = document.getElementById('toggleDesc');
            
            console.log('Tìm thấy descBox:', descBox);
            console.log('Tìm thấy contentDiv:', contentDiv);
            console.log('Tìm thấy toggleBtn:', toggleBtn);
            
            if (contentDiv) {
                // Tạo nội dung đầy đủ chia thành 3 mục
                let fullContent = '';
                
                // 1. Mục GIỚI THIỆU
                fullContent += '<div class="info-section">';
                fullContent += '<h4 class="section-subtitle">Giới thiệu</h4>';
                fullContent += '<ul>';
                
                if (university.introduction) {
                    // Phân tích và format introduction
                    let introText = university.introduction;
                    
                    // Tách thành các câu dựa trên dấu chấm, chấm than, dấu hai chấm
                    let sentences = introText.split(/(?<=[.!:])\s+/).filter(s => s.trim().length > 0);
                    
                    if (sentences.length > 1) {
                        // Nếu có nhiều câu, tạo xuống dòng
                        sentences.forEach(sentence => {
                            if (sentence.trim().length > 10) { // Chỉ thêm câu có ý nghĩa
                                let formattedSentence = sentence.trim()
                                    .replace(/(\d{4})/g, '<strong>$1</strong>') // Bold năm
                                    .replace(/(\d+)/g, '<strong>$1</strong>') // Bold số
                                    .replace(/(TP\.|TP\.HCM|HCM|Hà Nội|Đà Nẵng)/g, '<strong>$1</strong>') // Bold tên thành phố
                                    .replace(/(\d+\.\d+)/g, '<strong>$1</strong>') // Bold số thập phân
                                    .replace(/([^:]+):/g, '<strong>$1:</strong>'); // Bold phần trước dấu :
                                fullContent += `<li>${formattedSentence}</li>`;
                            }
                        });
                    } else {
                        // Nếu chỉ có 1 câu dài, tách thành các đoạn nhỏ
                        if (introText.length > 100) {
                            // Tách theo dấu phẩy hoặc từ khóa quan trọng
                            let parts = introText.split(/[,;]/).filter(part => part.trim().length > 0);
                            if (parts.length > 1) {
                                parts.forEach(part => {
                                    if (part.trim().length > 15) {
                                        let formattedPart = part.trim()
                                            .replace(/(\d{4})/g, '<strong>$1</strong>')
                                            .replace(/(\d+)/g, '<strong>$1</strong>')
                                            .replace(/(TP\.|TP\.HCM|HCM|Hà Nội|Đà Nẵng)/g, '<strong>$1</strong>')
                                            .replace(/(\d+\.\d+)/g, '<strong>$1</strong>')
                                            .replace(/([^:]+):/g, '<strong>$1:</strong>'); // Bold phần trước dấu :
                                        fullContent += `<li>${formattedPart}</li>`;
                                    }
                                });
                            } else {
                                // Format câu dài thành nhiều dòng
                                let formattedIntro = introText
                                    .replace(/(\d{4})/g, '<br><strong>$1</strong>') // Xuống dòng trước năm
                                    .replace(/(\d+)/g, '<strong>$1</strong>') // Bold số
                                    .replace(/(TP\.|TP\.HCM|HCM|Hà Nội|Đà Nẵng)/g, '<strong>$1</strong>') // Bold tên thành phố
                                    .replace(/(\d+\.\d+)/g, '<strong>$1</strong>') // Bold số thập phân
                                    .replace(/([^:]+):/g, '<strong>$1:</strong>'); // Bold phần trước dấu :
                                
                                fullContent += `<li>${formattedIntro}</li>`;
                            }
                        } else {
                            // Câu ngắn, chỉ format đơn giản
                            let formattedIntro = introText
                                .replace(/(\d{4})/g, '<strong>$1</strong>')
                                .replace(/(\d+)/g, '<strong>$1</strong>')
                                .replace(/(TP\.|TP\.HCM|HCM|Hà Nội|Đà Nẵng)/g, '<strong>$1</strong>')
                                .replace(/(\d+\.\d+)/g, '<strong>$1</strong>')
                                .replace(/([^:]+):/g, '<strong>$1:</strong>'); // Bold phần trước dấu :
                            
                            fullContent += `<li>${formattedIntro}</li>`;
                        }
                    }
                } else {
                    fullContent += '<li>Không có thông tin giới thiệu</li>';
                }
                fullContent += '</ul></div>';
                
                // 2. Mục THÔNG TIN LIÊN HỆ
                fullContent += '<div class="info-section">';
                fullContent += '<h4 class="section-subtitle">Thông tin liên hệ</h4>';
                fullContent += '<ul>';
                if (university.address) {
                    let addressText = university.address;
                    
                    // Format địa chỉ với line breaks cho "Minh" và "HCM"
                    addressText = addressText.replace(/(Minh|HCM)(?=\s|\.|,|$)/gi, '$1<br>');
                    
                    // Format địa chỉ với CSx: và thêm icon
                    addressText = addressText.replace(/(CS\d+:)/gi, '<br><strong>$1</strong>');
                    
                    fullContent += `<li><strong>Địa chỉ:</strong> ${addressText}</li>`;
                }
                if (university.phone_number) {
                    fullContent += `<li><strong>Điện thoại:</strong> ${university.phone_number}</li>`;
                }
                if (university.email) {
                    fullContent += `<li><strong>E-mail:</strong> ${university.email}</li>`;
                }
                if (university.website_url) {
                    fullContent += `<li><strong>Website:</strong> <a href="${university.website_url}" target="_blank">${university.website_url}</a></li>`;
                }
                if (!university.address && !university.phone_number && !university.email && !university.website_url) {
                    fullContent += '<li>Không có thông tin liên hệ</li>';
                }
                fullContent += '</ul></div>';
                
                // 3. Mục THÔNG TIN KHÁC
                fullContent += '<div class="info-section">';
                fullContent += '<h4 class="section-subtitle">Thông tin khác</h4>';
                fullContent += '<ul>';
                if (university.school_type) {
                    fullContent += `<li><strong>Loại hình giáo dục:</strong> ${university.school_type === 'public' ? 'Công lập' : 'Ngoài công lập'}</li>`;
                }
                if (university.established_year) {
                    fullContent += `<li><strong>Năm thành lập:</strong> ${university.established_year}</li>`;
                }
                if (university.quota_per_year) {
                    fullContent += `<li><strong>Chỉ tiêu hàng năm:</strong> ${university.quota_per_year.toLocaleString()}</li>`;
                }
                if (university.start && university.end) {
                    fullContent += `<li><strong>Học phí:</strong> ${university.start} - ${university.end} triệu/năm</li>`;
                }
                if (university.country) {
                    fullContent += `<li><strong>Khu vực:</strong> ${university.country}</li>`;
                }
                if (university.school_level) {
                    const levelText = university.school_level === 'university' ? 'Đại học' : 
                                    university.school_level === 'college' ? 'Cao đẳng' : 'Trung cấp';
                    fullContent += `<li><strong>Loại trường:</strong> ${levelText}</li>`;
                }
                if (university.benchmark_min && university.benchmark_max) {
                    fullContent += `<li><strong>Điểm chuẩn:</strong> ${university.benchmark_min} - ${university.benchmark_max} điểm</li>`;
                }
                if (university.scholarships) {
                    fullContent += `<li><strong>Học bổng:</strong> ${university.scholarships}</li>`;
                }
                if (!university.school_type && !university.established_year && !university.quota_per_year && 
                    !university.start && !university.end && !university.country && !university.school_level && 
                    !university.benchmark_min && !university.benchmark_max && !university.scholarships) {
                    fullContent += '<li>Không có thông tin khác</li>';
                }
                fullContent += '</ul></div>';
                
                console.log('Nội dung sẽ hiển thị:', fullContent);
                contentDiv.innerHTML = fullContent || 'Không có thông tin';
                contentDiv.style.display = 'block';
                
                // Kiểm tra chiều cao để quyết định hiển thị nút "Xem thêm"
                setTimeout(() => {
                    const contentHeight = contentDiv.scrollHeight;
                    console.log('Chiều cao nội dung:', contentHeight);
                    if (contentHeight > 400 && toggleBtn) {
                        // Nội dung dài hơn 200px - hiển thị nút "Xem thêm"
                        contentDiv.style.maxHeight = '400px';
                        contentDiv.style.overflow = 'hidden';
                        contentDiv.classList.add('fade-bottom'); // Thêm hiệu ứng mờ
                        toggleBtn.style.display = 'block';
                        console.log('Hiển thị nút Xem thêm với hiệu ứng mờ');
                    } else if (toggleBtn) {
                        // Nội dung ngắn - ẩn nút "Xem thêm"
                        toggleBtn.style.display = 'none';
                        contentDiv.classList.remove('fade-bottom'); // Bỏ hiệu ứng mờ
                        console.log('Ẩn nút Xem thêm');
                    }
                }, 100);
                
                console.log('Đã cập nhật nội dung giới thiệu');
            } else {
                console.log('Không tìm thấy contentDiv');
            }
        } else {
            console.log('Không tìm thấy descBox, bỏ qua cập nhật nội dung chính');
        }
    }

    function updateSidebar(university) {
        console.log('Cập nhật sidebar');
        console.log('University data:', university);
        
        // Cập nhật social media links
        console.log('Social media fields:', {
            socialmedialink: university.socialmedialink,
            social_media_link: university.social_media_link,
            facebook: university.facebook,
            social_links: university.social_links
        });
        
        // Tìm Facebook link từ các field khác nhau
        let facebookLink = null;
        
        // Thử từ socialmedialink
        if (university.socialmedialink) {
            console.log('Có thông tin mạng xã hội:', university.socialmedialink);
            
            // Pattern 1: Facebook: URL
            const facebookMatch1 = university.socialmedialink.match(/Facebook:\s*(https?:\/\/[^\s]+)/i);
            if (facebookMatch1) {
                facebookLink = facebookMatch1[1];
            }
            
            // Pattern 2: Chỉ có URL Facebook
            if (!facebookLink) {
                const facebookMatch2 = university.socialmedialink.match(/(https?:\/\/[^\/]*facebook\.com[^\s]*)/i);
                if (facebookMatch2) {
                    facebookLink = facebookMatch2[1];
                }
            }
            
            // Pattern 3: Tìm bất kỳ URL nào chứa facebook
            if (!facebookLink) {
                const facebookMatch3 = university.socialmedialink.match(/(https?:\/\/[^\s]*facebook[^\s]*)/i);
                if (facebookMatch3) {
                    facebookLink = facebookMatch3[1];
                }
            }
        }
        
        // Thử từ social_media_link
        if (!facebookLink && university.social_media_link) {
            const facebookMatch = university.social_media_link.match(/(https?:\/\/[^\s]*facebook[^\s]*)/i);
            if (facebookMatch) {
                facebookLink = facebookMatch[1];
            }
        }
        
        // Thử từ facebook field trực tiếp
        if (!facebookLink && university.facebook) {
            facebookLink = university.facebook;
        }
        
        // Thử từ social_links
        if (!facebookLink && university.social_links) {
            const facebookMatch = university.social_links.match(/(https?:\/\/[^\s]*facebook[^\s]*)/i);
            if (facebookMatch) {
                facebookLink = facebookMatch[1];
            }
        }
        
        if (facebookLink) {
            const facebookIcon = document.querySelector('.uni-social-icon[title="Facebook"]');
            if (facebookIcon) {
                facebookIcon.href = facebookLink;
                console.log('Đã cập nhật Facebook link:', facebookLink);
            } else {
                console.log('Không tìm thấy Facebook icon');
            }
        } else {
            console.log('Không tìm thấy Facebook link trong bất kỳ field nào');
        }
        
        // Cập nhật bản đồ - gắn trực tiếp chuỗi iframe
        const mapContainer = document.querySelector('.uni-map-iframe').parentElement;
        if (mapContainer && university.map_link) {
            // Tạo HTML địa chỉ + iframe
            let addressHtml = '';
            if (university.address) {
                let addressText = university.address;
                
                addressHtml = `<div style="font-size:0.85rem;color:#222;font-weight:500;">
                    ${addressText}
                </div>`;
            }
            mapContainer.innerHTML = addressHtml + university.map_link;

            // Chỉnh kích thước iframe nhỏ lại
            const iframe = mapContainer.querySelector('iframe');
            if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '200px';
                iframe.style.borderRadius = '8px';
            }
        }

        // Cập nhật địa chỉ
        const mapAddress = document.querySelector('.uni-map-address');
        if (mapAddress && university.address) {
            let addressText = university.address;
            
            // Format địa chỉ với line breaks cho "Minh" và "HCM"
            addressText = addressText.replace(/(Minh|HCM)(?=\s|\.|,|$)/gi, '$1<br>');
            
            // Format địa chỉ với CSx: và thêm icon
            addressText = addressText.replace(/(CS\d+:)/gi, '<br><strong>$1</strong>');
            
            // Thêm icon địa chỉ trước mỗi cơ sở
            addressText = addressText.replace(/(<br><strong>CS\d+:<\/strong>)/g, '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px;color:#10b981;margin-right:4px;"><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z"/><circle cx="12" cy="11" r="3"/></svg>$1');
            
            mapAddress.innerHTML = `
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
                ${addressText}
            `;
        }

        // Cập nhật link bản đồ
        const mapLink = document.querySelector('.uni-map-link');
        if (mapLink && university.map_link) {
            mapLink.href = university.map_link;
        }
    }

    function updateMajors(university) {
        console.log('Cập nhật ngành đào tạo');
        const majorsGrid = document.querySelector('.majors-grid');
        
        if (majorsGrid) {
            if (university.majors_data && university.majors_data.length > 0) {
                majorsGrid.innerHTML = '';
                
                university.majors_data.forEach(major => {
                    const majorCard = document.createElement('div');
                    majorCard.className = 'major-card';
                    majorCard.innerHTML = `
                        <div class="major-title">${major.name || 'Tên ngành'}</div>
                        <div class="major-code">Mã ngành: ${major.code || 'N/A'}</div>
                        <div class="major-desc">${major.description || 'Không có mô tả'}</div>
                        <div class="major-tuition">Học phí: ${major.tuition_fee || 'Đang cập nhật'}</div>
                    `;
                    majorsGrid.appendChild(majorCard);
                });
            } else {
                majorsGrid.innerHTML = '<p style="text-align: center; padding: 20px;">Không có thông tin ngành đào tạo</p>';
            }
        } else {
            console.log('Không tìm thấy majors grid, bỏ qua cập nhật ngành đào tạo');
        }
    }

    function updateOutstandingStyle(university) {
        console.log('Cập nhật style cho trường nổi bật');
        
        // Kiểm tra xem có phải trường nổi bật không
        if (university.tag === 'outstanding') {
            console.log('Đây là trường nổi bật, áp dụng style đặc biệt');
            
            // Thêm class cho container chính
            const uniContainer = document.querySelector('.uni-container');
            if (uniContainer) {
                uniContainer.classList.add('outstanding-university');
            }
            
            // Thêm class cho header
            const uniHeader = document.querySelector('.uni-header');
            if (uniHeader) {
                uniHeader.classList.add('outstanding-header');
            }
            
            // Thêm class cho các section
            const sections = document.querySelectorAll('.uni-section-title, .uni-box-title, .uni-majors-title');
            sections.forEach(section => {
                section.classList.add('outstanding-section');
            });
            
            // Thêm class cho major cards
            const majorCards = document.querySelectorAll('.major-card');
            majorCards.forEach(card => {
                card.classList.add('outstanding-major');
            });
            
            // Thêm badge "NỔI BẬT" vào header
            const uniTitle = document.querySelector('.uni-title');
            if (uniTitle) {
                const existingBadge = uniTitle.querySelector('.outstanding-badge');
                if (!existingBadge) {
                    const badge = document.createElement('span');
                    badge.className = 'outstanding-badge';
                    badge.textContent = 'NỔI BẬT';
                    badge.style.cssText = `
                        background: #ffc107;
                        color: #000;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        margin-left: 12px;
                        display: inline-block;
                        vertical-align: middle;
                    `;
                    uniTitle.appendChild(badge);
                }
            }
        }
    }

    function initializeEvents() {
        // Mô tả trường
        const descBox = document.getElementById('descBox');
        const contentDiv = descBox?.querySelector('.desc-extra');
        const toggleBtn = document.getElementById('toggleDesc');
        
        if (contentDiv && toggleBtn) {
            toggleBtn.onclick = function(e) {
                e.preventDefault();
                // Khi bấm "Xem thêm" - mở rộng nội dung và ẩn nút
                contentDiv.style.maxHeight = 'none';
                contentDiv.style.overflow = 'visible';
                contentDiv.classList.remove('fade-bottom'); // Bỏ hiệu ứng mờ
                toggleBtn.style.display = 'none';
            };
        }

        // Hình ảnh trường
        const toggleImagesBtn = document.getElementById('toggleImages');
        const imagesContent = document.getElementById('imagesContent');
        const imagesContainer = document.getElementById('imagesContainer');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotsContainer = document.getElementById('dotsContainer');
        const dots = dotsContainer?.querySelectorAll('.uni-slider-dot');

        if (toggleImagesBtn && imagesContent) {
            toggleImagesBtn.onclick = function() {
                if(imagesContent.classList.contains('active')) {
                    imagesContent.classList.remove('active');
                    toggleImagesBtn.textContent = 'Hiện ảnh';
                } else {
                    imagesContent.classList.add('active');
                    toggleImagesBtn.textContent = 'Ẩn ảnh';
                }
            };
        }

        // Slider logic
        let currentSlide = 0;
        const totalSlides = dots?.length || 0;

        function updateSlider() {
            if (imagesContainer) {
                imagesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            }
            dots?.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        if (prevBtn) {
            prevBtn.onclick = function() {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlider();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = function() {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateSlider();
            };
        }

        dots?.forEach((dot, index) => {
            dot.onclick = function() {
                currentSlide = index;
                updateSlider();
            };
        });
    }

    // Bắt đầu load dữ liệu với delay nhỏ để đảm bảo DOM load hoàn toàn
    setTimeout(() => {
        console.log('Bắt đầu xử lý, university code:', universityCode);
        
        // Kiểm tra xem các element có tồn tại không
        const descBox = document.getElementById('descBox');
        console.log('descBox check:', descBox);
        
        // Kiểm tra tất cả các element quan trọng
        const allElements = {
            descBox: document.getElementById('descBox'),
            uniCode: document.querySelector('.uni-code'),
            uniTitle: document.querySelector('.uni-title'),
            uniHeaderBar: document.querySelector('.uni-header-bar'),
            majorsGrid: document.querySelector('.majors-grid')
        };
        
        console.log('All elements check:', allElements);
        
        // Nếu không tìm thấy descBox, thử tìm bằng class
        if (!descBox) {
            const descBoxByClass = document.querySelector('.uni-main-content');
            console.log('descBox by class:', descBoxByClass);
        }
        
        // Test với dữ liệu mẫu trước
        if (universityCode === 'test') {
            showLoading();
            const testUniversity = {
                id: 1,
                name_vn: 'Trường Đại học Mở TP.HCM',
                name_en: 'HO CHI MINH OPEN UNIVERSITY',
                short_code: 'HCMOU',
                logo: '/static/images/logo/6.jpg',
                cover_photo: '/static/images/daihoc/ou/nen2.png',
                school_type: 'public',
                school_level: 'university',
                address: 'CS1: Số 51 đường Quốc Hương, phường An Khánh, TP. Hồ Chí Minh.CS2: Số 288 đường Đỗ Xuân Hợp, phường Phước Long, TP. Hồ Chí Minh.',
                phone_number: '(028) 3930 0210',
                email: 'ou@ou.edu.vn',
                website_url: 'https://www.ou.edu.vn',
                introduction: 'Trường Đại học Mở TP.HCM được thành lập năm 1990, là một trong những trường đại học công lập đầu tiên triển khai mô hình đào tạo mở, linh hoạt.',
                established_year: 1990,
                quota_per_year: 5000,
                start: 25,
                end: 35,
                country: 'TP.HCM',
                benchmark_min: 18,
                benchmark_max: 24,
                scholarships: 'Học bổng khuyến khích học tập, học bổng doanh nghiệp',
                socialmedialink: 'Facebook: https://facebook.com/ouhcm',
                map_link: 'https://www.google.com/maps?q=97+Võ+Văn+Tần,+Quận+3,+TP.HCM&output=embed',
                majors_data: [
                    {
                        name: 'Quản trị kinh doanh',
                        code: '7340101',
                        description: 'Đào tạo kiến thức quản trị, kinh doanh hiện đại.',
                        tuition_fee: '28 triệu/năm'
                    },
                    {
                        name: 'Công nghệ thông tin',
                        code: '7480201',
                        description: 'Lập trình, hệ thống thông tin, AI, dữ liệu.',
                        tuition_fee: '32 triệu/năm'
                    }
                ]
            };
            console.log('Sử dụng dữ liệu test:', testUniversity);
            updatePageContent(testUniversity);
            hideLoading();
        } else {
            loadUniversityData();
        }
    }, 100); // Delay 100ms để đảm bảo DOM load hoàn toàn
});
