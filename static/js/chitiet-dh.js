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
    const baseUrl = 'https://timtruonghoc.pythonanywhere.com/schools/';
    
    // Load dữ liệu trường học
    async function loadUniversityData() {
        try {
            console.log('Bắt đầu load dữ liệu cho mã trường:', universityCode);
            
            // Kiểm tra cache localStorage trước
            const cacheKey = `uni_${universityCode.toLowerCase()}`;
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTime = localStorage.getItem(`${cacheKey}_time`);
            const now = Date.now();
            
            // Cache hợp lệ trong 30 phút
            if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 30 * 60 * 1000) {
                console.log('Sử dụng dữ liệu từ cache');
                const university = JSON.parse(cachedData);
                
                // Track lượt xem trường (ngay cả khi dùng cache)
                trackSchoolView(university.id);
                
                updatePageContent(university);
                hideLoading();
                return;
            }
            
            // Hiển thị loading
            showLoading();
            
            // Thử API endpoint tối ưu trước
            let apiUrl = `${baseUrl}by_short_code/${universityCode.toUpperCase()}/`;
            console.log('Thử API tối ưu:', apiUrl);
            
            let response = await fetch(apiUrl);
            console.log('Response status:', response.status);
            
            // Nếu API tối ưu lỗi, fallback về API cũ
            if (!response.ok) {
                console.log('API tối ưu lỗi, thử API cũ...');
                apiUrl = `${baseUrl}?short_code=${universityCode.toUpperCase()}&page_size=2000`;
                console.log('API fallback:', apiUrl);
                
                response = await fetch(apiUrl);
                console.log('Fallback response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
                console.log('Fallback API response:', data);
            
            if (data.results && data.results.length > 0) {
                // Lọc đúng short_code (không phân biệt hoa thường)
                const university = data.results.find(
                    u => u.short_code && u.short_code.toLowerCase() === universityCode.toLowerCase()
                );
                if (university) {
                        // Lưu vào cache
                        localStorage.setItem(cacheKey, JSON.stringify(university));
                        localStorage.setItem(`${cacheKey}_time`, now.toString());
                        
                        // Track lượt xem trường (API fallback)
                        trackSchoolView(university.id);
                        
                    updatePageContent(university);
                        hideLoading();
                        return;
                } else {
                    showError('Không tìm thấy thông tin trường học');
                        return;
                    }
                } else {
                    showError('Không tìm thấy thông tin trường học');
                    return;
                }
            }
            
            // API tối ưu thành công
            const university = await response.json();
            console.log('API tối ưu response:', university);
            
            if (university && university.short_code) {
                // Lưu vào cache
                localStorage.setItem(cacheKey, JSON.stringify(university));
                localStorage.setItem(`${cacheKey}_time`, now.toString());
                
                // Track lượt xem trường
                trackSchoolView(university.id);
                
                updatePageContent(university);
                hideLoading(); // Ẩn loading khi thành công
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
            
            // Cập nhật style cho trường nổi bật
            updateOutstandingStyle(university);
            
            // Khởi tạo các sự kiện
            initializeEvents();
            
            console.log('Cập nhật thông tin trường hoàn tất');
            
            // Hiển thị thông báo nhỏ về việc đang tải ngành
            const majorsSection = document.querySelector('.uni-majors-section');
            if (majorsSection) {
                const loadingNotice = document.createElement('div');
                loadingNotice.id = 'majorsLoadingNotice';
                loadingNotice.style.cssText = `
                    text-align: center;
                    padding: 10px;
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    color: #0369a1;
                    font-size: 14px;
                    font-weight: 500;
                `;
                loadingNotice.innerHTML = '📚 Đang tải danh sách ngành đào tạo...';
                
                // Chèn vào đầu section ngành
                const majorsTitle = majorsSection.querySelector('.uni-majors-title');
                if (majorsTitle) {
                    majorsTitle.parentNode.insertBefore(loadingNotice, majorsTitle.nextSibling);
                }
            }
            
            // Tải ngành sau khi thông tin trường đã hiển thị xong
            setTimeout(() => {
                console.log('Bắt đầu tải danh sách ngành...');
                updateMajors(university);
            }, 500); // Delay 500ms để người dùng thấy thông tin trường trước
            
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

    // Biến quản lý phân trang cho majors
    let majorsCurrentPage = 1;
    let majorsTotalPages = 1;
    let allMajors = [];
    let currentUniversity = null; // Lưu thông tin trường hiện tại
    let majorsLoaded = false; // Kiểm tra xem majors đã được tải chưa
    let majorsLoading = false; // Tránh tải trùng lặp
    let MAJORS_PER_PAGE = 9;
    
    // Search variables
    let majorsSearchTerm = '';
    let filteredMajors = [];
    
    // Function to filter majors based on search term
    function filterMajors() {
        if (!majorsSearchTerm.trim()) {
            filteredMajors = [...allMajors];
        } else {
            const searchLower = majorsSearchTerm.toLowerCase().trim();
            filteredMajors = allMajors.filter(major => {
                const name = major.name ? major.name.toLowerCase() : '';
                return name.includes(searchLower);
            });
        }
        majorsCurrentPage = 1;
        majorsTotalPages = Math.ceil(filteredMajors.length / MAJORS_PER_PAGE);
        
        // Cập nhật số lượng ngành trong search stats
        updateMajorsSearchStats();
        
        renderMajorsPageFromCache(1);
    }
    
    // Hàm cập nhật số lượng ngành trong search stats
    function updateMajorsSearchStats() {
        const searchStats = document.querySelector('.majors-search-stats span');
        if (searchStats) {
            if (majorsSearchTerm.trim()) {
                // Nếu đang tìm kiếm, hiển thị số kết quả tìm được
                searchStats.textContent = `Tìm thấy ${filteredMajors.length} ngành`;
            } else {
                // Nếu không tìm kiếm, hiển thị tổng số ngành
                searchStats.textContent = `Tổng cộng ${allMajors.length} ngành`;
            }
        }
    }

    // Thay đổi: Tải toàn bộ ngành 1 lần khi vào trường
    async function loadAllMajors() {
        if (!currentUniversity) {
            console.log('❌ No current university set');
            return;
        }
        
        console.log('🔄 Loading ALL majors for university:', currentUniversity.name_vn);
        console.log('🏫 University ID:', currentUniversity.id);
        
        try {
            // Use majors_data from currentUniversity (already loaded)
            if (currentUniversity.majors_data && currentUniversity.majors_data.length > 0) {
                console.log('✅ Using majors_data from currentUniversity');
                allMajors = currentUniversity.majors_data;
                console.log('✅ All majors loaded from cache:', allMajors.length, 'majors');
                console.log('📊 Sample major:', allMajors[0]);
                
                filteredMajors = [...allMajors];
                majorsCurrentPage = 1;
                majorsTotalPages = Math.ceil(filteredMajors.length / MAJORS_PER_PAGE);
                majorsLoaded = true;
                
                console.log('📊 Total pages:', majorsTotalPages);
                console.log('📊 Majors per page:', MAJORS_PER_PAGE);
                
                // Cập nhật số lượng ngành trong search stats
                updateMajorsSearchStats();
                
                renderMajorsPageFromCache(1);
                return;
            }
            
            // Fallback: Fetch school data if majors_data not available
            console.log('🔄 Fallback: Fetching school data with majors...');
            showMajorsSkeleton();
            
            const apiUrl = `https://timtruonghoc.pythonanywhere.com/schools/${currentUniversity.id}/`;
            console.log('🔗 API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const schoolData = await response.json();
            console.log('📦 Loaded school data with majors');
            
            // Extract majors_data from school response
            allMajors = schoolData.majors_data || [];
            console.log('✅ All majors loaded from API:', allMajors.length, 'majors');
            
            if (allMajors.length > 0) {
                console.log('📊 Sample major:', allMajors[0]);
                
                filteredMajors = [...allMajors];
                majorsCurrentPage = 1;
                majorsTotalPages = Math.ceil(filteredMajors.length / MAJORS_PER_PAGE);
                majorsLoaded = true;
                
                console.log('📊 Total pages:', majorsTotalPages);
                console.log('📊 Majors per page:', MAJORS_PER_PAGE);
                
                // Cập nhật số lượng ngành trong search stats
                updateMajorsSearchStats();
                
                renderMajorsPageFromCache(1);
            } else {
                console.log('⚠️ No majors found for this university');
                showMajorsError('Không tìm thấy ngành học cho trường này');
            }
            
        } catch (error) {
            console.error('❌ Error loading all majors:', error);
            showMajorsError();
        }
    }

    // Sửa updateMajors để gọi loadAllMajors thay vì loadMajorsPage
    function updateMajors(university) {
        console.log('🔄 Updating majors for university:', university.name_vn);
        currentUniversity = university;
        allMajors = [];
        filteredMajors = [];
        majorsCurrentPage = 1;
        majorsTotalPages = 1;
        majorsLoaded = false;
        majorsLoading = false;
        majorsSearchTerm = '';
        showMajorsSkeleton();
        setTimeout(() => {
            loadAllMajors();
        }, 200);
        setTimeout(() => {
            initializeMajorsSearch();
        }, 1000);
    }

    function showMajorsSkeleton() {
        const majorsGrid = document.getElementById('majorsGrid');
        if (!majorsGrid) return;
        
        console.log('🔄 Showing majors skeleton loading...');
        
        // Hiển thị loading indicator với thông báo rõ ràng
        majorsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <div style="display: inline-block; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0;">
                    <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    <div style="color: #64748b; font-weight: 600; font-size: 14px;">Đang tải danh sách ngành...</div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 5px;">Vui lòng chờ trong giây lát</div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Ẩn pagination trong khi loading
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsPagination) {
            majorsPagination.style.display = 'none';
        }
        
        // Cập nhật search results
        const searchResults = document.getElementById('majorsSearchResults');
        if (searchResults) {
            searchResults.textContent = 'Đang tải dữ liệu ngành...';
        }
    }

    function setupMajorsLazyLoading() {
        const majorsSection = document.querySelector('.uni-majors-section');
        if (!majorsSection) return;

        // Tạo Intersection Observer để lazy load khi scroll đến
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !majorsLoaded && !majorsLoading) {
                    console.log('Majors section visible, loading first page...');
                    loadMajorsPage(1);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger khi 10% section hiển thị
            rootMargin: '100px' // Trigger sớm hơn 100px
        });

        observer.observe(majorsSection);

        // Thêm click event cho title để load ngay lập tức
        const majorsTitle = document.querySelector('.uni-majors-title');
        if (majorsTitle) {
            majorsTitle.style.cursor = 'pointer';
            majorsTitle.addEventListener('click', () => {
                if (!majorsLoaded && !majorsLoading) {
                    console.log('Majors title clicked, loading first page...');
                    loadMajorsPage(1);
                    observer.unobserve(majorsSection);
                }
            });
        }
    }

    // Function to fetch majors data from API
    async function loadMajorsPage(page) {
        if (!currentUniversity) {
            console.log('❌ No current university set');
            return;
        }

        console.log(`📊 Loading majors page ${page} for university:`, currentUniversity.name_vn);
        console.log(`🏫 University ID:`, currentUniversity.id);
        
        // Kiểm tra cache cho majors
        const majorsCacheKey = `majors_${currentUniversity.id}_page_${page}`;
        const cachedMajors = localStorage.getItem(majorsCacheKey);
        const cacheTime = localStorage.getItem(`${majorsCacheKey}_time`);
        const now = Date.now();
        
        // Cache hợp lệ trong 15 phút
        if (cachedMajors && cacheTime && (now - parseInt(cacheTime)) < 15 * 60 * 1000) {
            console.log(`📊 Sử dụng majors từ cache cho page ${page}`);
            const data = JSON.parse(cachedMajors);
            processMajorsData(data, page);
            return;
        }
        
        // Hiển thị skeleton khi chuyển trang (không phải trang đầu tiên)
        if (page > 1) {
            showMajorsSkeleton();
        }
        
        // Sử dụng API majors thông thường (đã hoạt động)
        const apiUrl = `https://timtruonghoc.pythonanywhere.com/schools/${currentUniversity.id}/majors/?page=${page}&page_size=${MAJORS_PER_PAGE}`;
        console.log(`🔗 API URL:`, apiUrl);
        
        try {
            const response = await fetch(apiUrl);
            console.log(`📡 Response status:`, response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Majors page ${page} loaded:`, data);
            
            // Lưu vào cache
            localStorage.setItem(majorsCacheKey, JSON.stringify(data));
            localStorage.setItem(`${majorsCacheKey}_time`, now.toString());
            
            processMajorsData(data, page);
            
        } catch (error) {
            console.error('❌ Error loading majors:', error);
            showMajorsError();
        }
    }
    
    // Tách riêng logic xử lý dữ liệu majors
    function processMajorsData(data, page) {
        console.log(`📊 Data type:`, typeof data);
        console.log(`📊 Is Array:`, Array.isArray(data));
        console.log(`📊 Data length:`, data.length || 'N/A');
        
        // Xử lý dữ liệu - handle cả Array và Object có results
        let majorsData = [];
        let totalCount = 0;
        
        if (Array.isArray(data)) {
            // API trả về Array trực tiếp
            majorsData = data;
            totalCount = data.length;
            console.log(`📊 Processing Array data: ${majorsData.length} majors`);
        } else if (data && data.results) {
            // API trả về Object có results
            majorsData = data.results;
            totalCount = data.count || data.results.length;
            console.log(`📊 Processing Object data: ${majorsData.length} majors, total: ${totalCount}`);
        } else {
            console.error(`❌ Unexpected data format:`, data);
            throw new Error('Unexpected data format from API');
        }
        
        // Cập nhật dữ liệu majors
        if (page === 1) {
            // Trang đầu tiên: thay thế toàn bộ dữ liệu
            allMajors = majorsData;
            console.log(`📊 Page 1: Set allMajors to ${allMajors.length} majors`);
        } else {
            // Các trang tiếp theo: thêm vào dữ liệu hiện có
            const oldLength = allMajors.length;
            allMajors = [...allMajors, ...majorsData];
            console.log(`📊 Page ${page}: Added ${majorsData.length} majors to existing ${oldLength} -> ${allMajors.length}`);
        }
        
        // Cập nhật filteredMajors
        filteredMajors = [...allMajors];
        console.log(`📊 Updated filteredMajors: ${filteredMajors.length} majors`);
        
        // Cập nhật thông tin phân trang
        majorsTotalPages = Math.ceil(totalCount / MAJORS_PER_PAGE);
        console.log(`📊 Total pages: ${majorsTotalPages} (total: ${totalCount}, per page: ${MAJORS_PER_PAGE})`);
        
        // Render trang hiện tại
        console.log(`🎨 Calling renderMajorsPageFromCache with page ${page}`);
        majorsCurrentPage = page; // Cập nhật trang hiện tại
        renderMajorsPageFromCache(page);
        
        // Ẩn thông báo loading khi tải thành công
        const loadingNotice = document.getElementById('majorsLoadingNotice');
        if (loadingNotice) {
            loadingNotice.style.display = 'none';
        }
    }

    // Sửa renderMajorsPageFromCache để phân trang trên filteredMajors
    function renderMajorsPageFromCache(page) {
        console.log(`🎨 Rendering majors page ${page} from cache`);
        console.log(`📊 Total filtered majors: ${filteredMajors.length}`);
        console.log(`📊 Majors per page: ${MAJORS_PER_PAGE}`);
        
        const startIndex = (page - 1) * MAJORS_PER_PAGE;
        const endIndex = startIndex + MAJORS_PER_PAGE;
        const pageMajors = filteredMajors.slice(startIndex, endIndex);
        
        console.log(`📊 Showing majors ${startIndex + 1} to ${endIndex} (${pageMajors.length} majors)`);
        
        // Cập nhật trang hiện tại
        majorsCurrentPage = page;
        
        // Render majors cards
        renderMajorsCards(pageMajors);
        
        // Cập nhật pagination
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsTotalPages > 1) {
            majorsPagination.style.display = 'flex';
            renderMajorsPagination();
        } else {
            majorsPagination.style.display = 'none';
        }
        
        // Cập nhật số lượng ngành trong search stats
        updateMajorsSearchStats();
        
        // Ẩn thông báo loading khi tải thành công
        const loadingNotice = document.getElementById('majorsLoadingNotice');
        if (loadingNotice) {
            loadingNotice.style.display = 'none';
        }
    }

    function renderMajorsPageFromAPI(page, pageMajors) {
        // Cập nhật trang hiện tại
        majorsCurrentPage = page;
        
        renderMajorsCards(pageMajors);
        
        // Cập nhật pagination
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsTotalPages > 1) {
            majorsPagination.style.display = 'flex';
            renderMajorsPagination();
        } else {
            majorsPagination.style.display = 'none';
        }
    }

    function renderMajorsCards(majors) {
        const majorsGrid = document.getElementById('majorsGrid');
        if (!majorsGrid) {
            console.log('❌ Majors grid not found');
            return;
        }

        console.log('=== DEBUG RENDER MAJORS CARDS ===');
        console.log('Majors to render:', majors.length);
        console.log('Majors grid found:', !!majorsGrid);
        
        // Render majors cards trực tiếp
        renderMajorsCardsReal(majors);
    }
    
    function renderMajorsCardsReal(majors) {
        const majorsGrid = document.getElementById('majorsGrid');
        if (!majorsGrid) {
            console.log('❌ Majors grid not found in real render');
            return;
        }
        
                majorsGrid.innerHTML = '';
                
        let totalTags = 0;
        let outstandingTags = 0;
        let proTags = 0;
        
        majors.forEach((major, index) => {
            console.log(`Rendering major ${index + 1}:`, major.name);
            
                    const majorCard = document.createElement('div');
                    majorCard.className = 'major-card';

            // Thêm class cho ngành đặc biệt
            const specialClass = getSpecialProgramClass(major.major_id);
            if (specialClass) {
                majorCard.classList.add(specialClass);
            }
            
            // Lấy tên hiển thị cho ngành đặc biệt
            const displayName = getSpecialProgramDisplayName(major.name, major.major_id);
            
            // Format học phí
            let feeText = '';
            
            // Ưu tiên thông tin học phí của ngành trước
            if (major.min_tuition_fee_per_year && major.max_tuition_fee_per_year) {
                const min = major.min_tuition_fee_per_year;
                const max = major.max_tuition_fee_per_year;
                
                if (min === "0" && max === "0") {
                    feeText = 'Thường miễn phí';
                } else if (min === max) {
                    const val = formatCurrency(min);
                    feeText = val === 'Thường miễn phí' ? val : `Khoảng ${val}`;
                } else {
                    const minVal = formatCurrency(min);
                    const maxVal = formatCurrency(max);
                    if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                        feeText = 'Thường miễn phí';
                    } else if (minVal === 'Thường miễn phí') {
                        feeText = minVal;
                    } else if (maxVal === 'Thường miễn phí') {
                        feeText = maxVal;
                    } else {
                        feeText = `${minVal} - ${maxVal}`;
                    }
                }
            } else if (major.min_tuition_fee_per_year) {
                const minVal = formatCurrency(major.min_tuition_fee_per_year);
                feeText = minVal === 'Thường miễn phí' ? minVal : `Từ ${minVal}`;
            } else if (major.max_tuition_fee_per_year) {
                const maxVal = formatCurrency(major.max_tuition_fee_per_year);
                feeText = maxVal === 'Thường miễn phí' ? maxVal : `Đến ${maxVal}`;
            } else {
                if (currentUniversity.start === 0 && currentUniversity.end === 0) {
                    feeText = 'Thường miễn phí';
                } else if (currentUniversity.start && currentUniversity.end && currentUniversity.start !== currentUniversity.end) {
                    const minVal = formatCurrency(currentUniversity.start);
                    const maxVal = formatCurrency(currentUniversity.end);
                    if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                        feeText = 'Thường miễn phí';
                    } else if (minVal === 'Thường miễn phí') {
                        feeText = minVal;
                    } else if (maxVal === 'Thường miễn phí') {
                        feeText = maxVal;
                    } else {
                        feeText = `${minVal} - ${maxVal}`;
                    }
                } else if (currentUniversity.start) {
                    const minVal = formatCurrency(currentUniversity.start);
                    feeText = minVal === 'Thường miễn phí' ? minVal : `Khoảng ${minVal}`;
                } else {
                    feeText = 'Đang cập nhật';
                }
            }

            // Debug: Log kết quả học phí cuối cùng
            console.log('Final tuition display:', feeText);

            // Tạo labels
            let majorLabelHtml = '';
            
            // Debug: Log thông tin major để kiểm tra
            console.log('Major data:', {
                name: major.name,
                major_id: major.major_id,
                isSpecial: isSpecialProgram(major.major_id),
                displayName: displayName,
                min_tuition: major.min_tuition_fee_per_year,
                max_tuition: major.max_tuition_fee_per_year,
                tags: major.tags,
                tagsType: typeof major.tags,
                tagsLower: major.tags ? major.tags.toLowerCase() : null
            });
            
            // Debug: Log thông tin học phí trường
            console.log('University tuition data:', {
                school_name: currentUniversity?.name_vn,
                start: currentUniversity?.start,
                end: currentUniversity?.end,
                start_type: typeof currentUniversity?.start,
                end_type: typeof currentUniversity?.end
            });
            
            // Tạo tất cả labels trong một hàng
            if (currentUniversity.school_type === 'public') {
                majorLabelHtml += `<span class="major-label conglap">Công lập</span>`;
            } else if (currentUniversity.school_type === 'private') {
                majorLabelHtml += `<span class="major-label ngoaiconglap">Ngoài công lập</span>`;
            }
            
            // Thêm tag cho ngành đặc biệt
            if (isSpecialProgram(major.major_id)) {
                majorLabelHtml += `<span class="major-label special">CLC</span>`;
            }
            
            // Thêm tags cho outstanding và pro
            if (major.tags && major.tags.toLowerCase() === 'outstanding') {
                majorLabelHtml += `<span class="major-label noibat">Nổi bật</span>`;
                outstandingTags++;
                totalTags++;
            } else if (major.tags && major.tags.toLowerCase() === 'pro') {
                majorLabelHtml += `<span class="major-label pro">Pro</span>`;
                proTags++;
                totalTags++;
            }
            
                    majorCard.innerHTML = `
                <div class="major-card-header">
                    <img src="${currentUniversity.logo || '/static/images/logo/0.jpg'}" class="major-logo" alt="logo trường">
                    <div>
                        <div class="major-labels-row">
                            ${majorLabelHtml}
                        </div>
                        <div class="major-title">${displayName}</div>
                        <div class="major-code">Mã ngành: ${major.major_id}</div>
                    </div>
                </div>
                <div class="major-info-row">
                    <div class="major-fee">${feeText}</div>
                    <div class="major-location">${currentUniversity.country || 'Đang cập nhật'}</div>
                </div>
                <div class="major-fav-btn">
                    <i class="fas fa-heart"></i>
                </div>
            `;
            
            // Tags đã được thêm vào major-labels-row trong HTML structure
            
            // Thêm event listeners
            const majorTitle = majorCard.querySelector('.major-title');
            if (majorTitle) {
                let hoverTimeout;
                majorTitle.addEventListener('mouseenter', () => {
                    hoverTimeout = setTimeout(() => {
                        showMajorModal(major);
                    }, 300);
                });
                majorTitle.addEventListener('mouseleave', () => {
                    clearTimeout(hoverTimeout);
                });
            }
            
            // Thêm click event cho toàn bộ card
            majorCard.addEventListener('click', (e) => {
                // Không trigger nếu click vào favorite button
                if (e.target.closest('.major-fav-btn')) {
                    return;
                }
                
                // Navigate to major detail page (specific to this school)
                const majorId = major.major_id; // Use major_id (real code) instead of major.id (database ID)
                const schoolShortCode = currentUniversity.short_code;
                window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
            });
            
            // Thêm click event cho favorite button
            const favBtn = majorCard.querySelector('.major-fav-btn');
            if (favBtn) {
                // Kiểm tra trạng thái yêu thích từ localStorage
                const favoriteKey = `favorite_${currentUniversity.short_code}_${major.major_id}`;
                const isFavorite = localStorage.getItem(favoriteKey) === 'true';
                
                if (isFavorite) {
                    favBtn.classList.add('active');
                    const icon = favBtn.querySelector('i');
                    icon.style.color = '#ff4757';
                }
                
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMajorFavorite(major, currentUniversity, favBtn);
                });
            }
            
                    majorsGrid.appendChild(majorCard);
                });
        
        console.log('=== END RENDER MAJORS CARDS ===');
        console.log('Total cards created:', majorsGrid.children.length);
        console.log('Majors grid HTML length:', majorsGrid.innerHTML.length);
        console.log('Majors grid first 200 chars:', majorsGrid.innerHTML.substring(0, 200));
        
        // Cập nhật thống kê tags
        const searchResults = document.getElementById('majorsSearchResults');
        if (searchResults) {
            if (majorsSearchTerm) {
                searchResults.textContent = `Tìm thấy ${majors.length} ngành cho "${majorsSearchTerm}"`;
            } else {
                searchResults.textContent = `Hiển thị ${majors.length} ngành`;
            }
        }
    }

    function showPageLoading() {
        const majorsGrid = document.getElementById('majorsGrid');
        if (!majorsGrid) return;

        majorsGrid.innerHTML = '';
        
        // Tạo 6 skeleton cards cho trang đang tải
        for (let i = 0; i < 6; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'major-card skeleton-major-card';
            skeletonCard.innerHTML = `
                <div class="major-card-header">
                    <div class="skeleton-logo"></div>
                    <div>
                        <div class="skeleton-label"></div>
                        <div class="skeleton-title"></div>
                        <div class="skeleton-code"></div>
                    </div>
                </div>
                <div class="major-info-row">
                    <div class="skeleton-fee"></div>
                    <div class="skeleton-location"></div>
                </div>
                <div class="skeleton-fav-btn"></div>
            `;
            majorsGrid.appendChild(skeletonCard);
        }
    }

    function showPageError() {
        const majorsGrid = document.getElementById('majorsGrid');
        if (!majorsGrid) return;

        majorsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <div style="font-size: 2rem; color: #ef4444; margin-bottom: 16px;">⚠️</div>
                <h3 style="color: #dc2626; margin-bottom: 8px;">Không thể tải trang này</h3>
                <p style="color: #9ca3af; margin-bottom: 16px;">Vui lòng thử lại</p>
                <button onclick="loadMajorsPage(${majorsCurrentPage})" style="
                    background: #0a4191; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 600;
                ">Thử lại</button>
            </div>
        `;
    }

    function showMajorsEmpty() {
        const majorsGrid = document.getElementById('majorsGrid');
        if (majorsGrid) {
            majorsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; color: #d1d5db; margin-bottom: 16px;">📚</div>
                    <h3 style="color: #6b7280; margin-bottom: 8px;">Chưa có thông tin ngành đào tạo</h3>
                    <p style="color: #9ca3af;">Thông tin ngành đào tạo sẽ được cập nhật sớm nhất</p>
                </div>
            `;
        }
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsPagination) {
            majorsPagination.style.display = 'none';
        }
    }

    function showMajorsError() {
        const majorsGrid = document.getElementById('majorsGrid');
        if (majorsGrid) {
            majorsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; color: #ef4444; margin-bottom: 16px;">⚠️</div>
                    <h3 style="color: #dc2626; margin-bottom: 8px;">Không thể tải dữ liệu</h3>
                    <p style="color: #9ca3af; margin-bottom: 16px;">Vui lòng thử lại sau</p>
                    <button onclick="loadAllMajors()" style="
                        background: #0a4191; 
                        color: white; 
                        border: none; 
                        padding: 8px 16px; 
                        border-radius: 6px; 
                        cursor: pointer;
                        font-weight: 600;
                    ">Thử lại</button>
                </div>
            `;
        }
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsPagination) {
            majorsPagination.style.display = 'none';
        }
    }

    function renderMajorsPagination() {
        const prevBtn = document.getElementById('majorsPrevPage');
        const nextBtn = document.getElementById('majorsNextPage');
        const pageNumbers = document.getElementById('majorsPageNumbers');
        
        if (!prevBtn || !nextBtn || !pageNumbers) return;
        
        console.log(`🎯 Rendering pagination: current page ${majorsCurrentPage}, total pages ${majorsTotalPages}`);
        
        // Update button states
        prevBtn.disabled = majorsCurrentPage === 1;
        nextBtn.disabled = majorsCurrentPage === majorsTotalPages;
        
        // Clear existing page numbers
        pageNumbers.innerHTML = '';
        
        // Calculate page range to show (max 5 pages)
        const maxPageButtons = 5;
        let startPage = Math.max(1, majorsCurrentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(majorsTotalPages, majorsCurrentPage + Math.floor(maxPageButtons / 2));
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        if (startPage === 1) {
            endPage = Math.min(majorsTotalPages, maxPageButtons);
        }
        
        // Add first page button if needed
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'majors-page-number';
            firstPageBtn.textContent = '1';
            firstPageBtn.addEventListener('click', () => {
                console.log(`🔄 Pagination: Clicked page 1`);
                majorsCurrentPage = 1;
                renderMajorsPageFromCache(1);
                renderMajorsPagination();
            });
            pageNumbers.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Add main page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'majors-page-number';
            pageBtn.textContent = i;
            if (i === majorsCurrentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                console.log(`🔄 Pagination: Clicked page ${i}`);
                majorsCurrentPage = i;
                renderMajorsPageFromCache(i);
                renderMajorsPagination();
            });
            pageNumbers.appendChild(pageBtn);
        }
        
        // Add last page button if needed
        if (endPage < majorsTotalPages) {
            if (endPage < majorsTotalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'majors-page-number';
            lastPageBtn.textContent = majorsTotalPages;
            lastPageBtn.addEventListener('click', () => {
                console.log(`🔄 Pagination: Clicked page ${majorsTotalPages}`);
                majorsCurrentPage = majorsTotalPages;
                renderMajorsPageFromCache(majorsTotalPages);
                renderMajorsPagination();
            });
            pageNumbers.appendChild(lastPageBtn);
        }
        
        // Add event listeners for prev/next buttons
        prevBtn.onclick = () => {
            if (majorsCurrentPage > 1) {
                console.log(`🔄 Pagination: Previous page (${majorsCurrentPage - 1})`);
                majorsCurrentPage = majorsCurrentPage - 1;
                renderMajorsPageFromCache(majorsCurrentPage);
                renderMajorsPagination();
            }
        };
        
        nextBtn.onclick = () => {
            if (majorsCurrentPage < majorsTotalPages) {
                console.log(`🔄 Pagination: Next page (${majorsCurrentPage + 1})`);
                majorsCurrentPage = majorsCurrentPage + 1;
                renderMajorsPageFromCache(majorsCurrentPage);
                renderMajorsPagination();
            }
        };
        
        // Show pagination only if there are more than 1 page
        const majorsPagination = document.getElementById('majorsPagination');
        if (majorsPagination) {
            majorsPagination.style.display = majorsTotalPages > 1 ? 'flex' : 'none';
        }
        
        console.log(`✅ Pagination rendered successfully`);
    }

    // Hàm format tiền tệ (giống như trong nganh.js)
    function formatCurrency(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0) {
            return "Thường miễn phí";
        }
        const amountInMillions = numAmount / 1000000;
        if (amountInMillions % 1 === 0) {
            return `${parseInt(amountInMillions)} triệu`; 
        } else {
            return `${amountInMillions.toFixed(1)} triệu`; 
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

    // Initialize search functionality
    function initializeMajorsSearch() {
        const searchInput = document.getElementById('majorsSearchInput');
        const searchClear = document.getElementById('majorsSearchClear');
        
        if (searchInput) {
            // Debounce search
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    majorsSearchTerm = e.target.value;
                    
                    // Show/hide clear button
                    if (searchClear) {
                        searchClear.style.display = majorsSearchTerm ? 'block' : 'none';
                    }
                    
                    // Filter majors
                    if (majorsLoaded) {
                        filterMajors();
                    }
                }, 300);
            });
            
            // Clear search
            if (searchClear) {
                searchClear.addEventListener('click', () => {
                    searchInput.value = '';
                    majorsSearchTerm = '';
                    searchClear.style.display = 'none';
                    if (majorsLoaded) {
                        filterMajors();
                        // Cập nhật số lượng ngành sau khi clear
                        updateMajorsSearchStats();
                    }
                });
            }
        }
    }
    
    // Call initialize search when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeMajorsSearch();
    });

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

    // Modal logic for majors
    let majorModalTimeout;

    function showMajorModal(major) {
        console.log('🎯 showMajorModal called for:', major.name);
        
        const modalOverlay = document.getElementById('modalOverlay');
        const modalContent = document.getElementById('modalContent');
        const modalDetail = document.getElementById('modalDetail');
        const modalClose = document.getElementById('modalClose');
        
        console.log('🔍 Modal elements found:', {
            modalOverlay: !!modalOverlay,
            modalContent: !!modalContent,
            modalDetail: !!modalDetail,
            modalClose: !!modalClose
        });
        
        if (!modalOverlay || !modalContent || !modalDetail || !modalClose) {
            console.log('❌ Modal elements not found');
            return;
        }
        
        // Format tuition
        let tuitionDisplay = 'Chưa có thông tin';
        
        // Ưu tiên thông tin học phí của ngành trước
        if (major.min_tuition_fee_per_year && major.max_tuition_fee_per_year) {
            const min = major.min_tuition_fee_per_year;
            const max = major.max_tuition_fee_per_year;
            
            if (min === "0" && max === "0") {
                tuitionDisplay = 'Thường miễn phí';
            } else if (min === max) {
                const val = formatCurrency(min);
                tuitionDisplay = val === 'Thường miễn phí' ? val : `Khoảng ${val}`;
            } else {
                const minVal = formatCurrency(min);
                const maxVal = formatCurrency(max);
                if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                    tuitionDisplay = 'Thường miễn phí';
                } else if (minVal === 'Thường miễn phí') {
                    tuitionDisplay = minVal;
                } else if (maxVal === 'Thường miễn phí') {
                    tuitionDisplay = maxVal;
                } else {
                    tuitionDisplay = `${minVal} - ${maxVal}`;
                }
            }
        } else if (major.min_tuition_fee_per_year) {
            const minVal = formatCurrency(major.min_tuition_fee_per_year);
            tuitionDisplay = minVal === 'Thường miễn phí' ? minVal : `Từ ${minVal}`;
        } else if (major.max_tuition_fee_per_year) {
            const maxVal = formatCurrency(major.max_tuition_fee_per_year);
            tuitionDisplay = maxVal === 'Thường miễn phí' ? maxVal : `Đến ${maxVal}`;
        } else {
            if (currentUniversity && typeof currentUniversity.start === 'number' && typeof currentUniversity.end === 'number') {
                if (currentUniversity.start === 0 && currentUniversity.end === 0) {
                    tuitionDisplay = 'Thường miễn phí';
                } else if (currentUniversity.start === currentUniversity.end) {
                    const val = formatCurrency(currentUniversity.start);
                    tuitionDisplay = val === 'Thường miễn phí' ? val : `Khoảng ${val}`;
                } else {
                    const minVal = formatCurrency(currentUniversity.start);
                    const maxVal = formatCurrency(currentUniversity.end);
                    if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                        tuitionDisplay = 'Thường miễn phí';
                    } else if (minVal === 'Thường miễn phí') {
                        tuitionDisplay = minVal;
                    } else if (maxVal === 'Thường miễn phí') {
                        tuitionDisplay = maxVal;
                    } else {
                        tuitionDisplay = `${minVal} - ${maxVal}`;
                    }
                }
            } else if (currentUniversity && typeof currentUniversity.start === 'number') {
                const minVal = formatCurrency(currentUniversity.start);
                tuitionDisplay = minVal === 'Thường miễn phí' ? minVal : `Từ ${minVal}`;
            } else if (currentUniversity && typeof currentUniversity.end === 'number') {
                const maxVal = formatCurrency(currentUniversity.end);
                tuitionDisplay = maxVal === 'Thường miễn phí' ? maxVal : `Đến ${maxVal}`;
            } else {
                tuitionDisplay = 'Chưa có thông tin';
            }
        }
        
        // Format tags
        let tagsHtml = '';
        if (major.tags && major.tags.toLowerCase().trim() !== 'none') {
            const tagClass = major.tags.toLowerCase().trim() === 'outstanding' ? 'tag-outstanding' : 'tag-pro';
            const tagText = major.tags.toLowerCase().trim() === 'outstanding' ? 'Nổi bật' : 'Chuyên nghiệp';
            tagsHtml = `<span class="major-tag ${tagClass}">${tagText}</span>`;
        }
        
        // Get school logo
        const schoolLogo = currentUniversity ? currentUniversity.logo : '/static/images/logo/0.jpg';
        
        // Get school name
        const schoolName = currentUniversity ? currentUniversity.name_vn : 'Trường đại học';
        
        // Lấy tên hiển thị cho ngành đặc biệt
        const displayName = getSpecialProgramDisplayName(major.name, major.major_id);
        
        // Lấy mã ngành gốc (loại bỏ các chữ đặc biệt)
        const originalMajorId = getOriginalMajorId(major.major_id);
        
        // Set modal border color based on tags and special program
        if (isSpecialProgram(major.major_id)) {
            modalContent.style.borderColor = '#8b5cf6'; // Purple for special programs
            modalContent.style.borderWidth = '3px';
        } else if (major.tags && major.tags.toLowerCase().trim() === 'outstanding') {
            modalContent.style.borderColor = '#ffc107';
            modalContent.style.borderWidth = '3px';
        } else if (major.tags && major.tags.toLowerCase().trim() === 'pro') {
            modalContent.style.borderColor = '#10b981';
            modalContent.style.borderWidth = '3px';
        } else {
            modalContent.style.borderColor = '#3b82f6';
            modalContent.style.borderWidth = '2px';
        }
        
        // Tạo nội dung modal cơ bản
        let modalContentHTML = `
            <div class="detailed-title">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <img src="${schoolLogo}" alt="Logo trường" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <div>
                        <h2 style="margin: 0; color: #1e3a8a;">${displayName}</h2>
                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 0.9rem;">${schoolName}</p>
                    </div>
                </div>
                ${tagsHtml}
                ${isSpecialProgram(major.major_id) ? '<span class="major-tag tag-special">Chất lượng cao</span>' : ''}
            </div>
            
            <div class="detailed-section">
                <h4 class="section-heading">Thông tin cơ bản</h4>
                <ul class="description-list">
                    <li><strong>Mã ngành:</strong> ${major.major_id || 'N/A'}</li>
                    ${isSpecialProgram(major.major_id) ? `<li><strong>Mã ngành gốc:</strong> ${originalMajorId || 'N/A'}</li>` : ''}
                    <li><strong>Trạng thái:</strong> ${major.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</li>
                    <li><strong>Học phí:</strong> ${tuitionDisplay}</li>
                </ul>
            </div>
            
            ${major.description ? `
            <div class="detailed-section">
                <h4 class="section-heading">Mô tả ngành</h4>
                <div class="description-content">${major.description}</div>
            </div>
            ` : ''}
            
            ${major.entry_requirement ? `
            <div class="detailed-section">
                <h4 class="section-heading">Phương thức xét tuyển</h4>
                <div class="description-content">${major.entry_requirement}</div>
            </div>
            ` : ''}
            
            <div class="detailed-section">
                <h4 class="section-heading">Thông tin trường</h4>
                <ul class="description-list">
                    <li><strong>Tên trường:</strong> ${schoolName}</li>
                    <li><strong>Mã trường:</strong> ${currentUniversity ? currentUniversity.short_code : 'N/A'}</li>
                    <li><strong>Loại hình:</strong> ${currentUniversity ? (currentUniversity.school_type === 'public' ? 'Công lập' : 'Ngoài công lập') : 'N/A'}</li>
                    <li><strong>Năm thành lập:</strong> ${currentUniversity ? currentUniversity.established_year : 'N/A'}</li>
                    <li><strong>Website:</strong> ${currentUniversity && currentUniversity.website_url ? `<a href="${currentUniversity.website_url}" target="_blank">${currentUniversity.website_url}</a>` : 'N/A'}</li>
                </ul>
            </div>
            
            <div class="detailed-section">
                <h4 class="section-heading">Liên hệ</h4>
                <ul class="description-list">
                    <li><strong>Điện thoại:</strong> ${currentUniversity ? currentUniversity.phone_number : 'N/A'}</li>
                    <li><strong>Email:</strong> ${currentUniversity ? currentUniversity.email : 'N/A'}</li>
                    <li><strong>Địa chỉ:</strong> ${currentUniversity ? currentUniversity.country : 'N/A'}</li>
                </ul>
            </div>
        `;
        
        // Hiển thị modal với nội dung cơ bản trước
        modalDetail.innerHTML = modalContentHTML;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Modal content set, showing modal');
        
        // Cập nhật nút "Xem chi tiết" trong modal
        const modalActions = document.querySelector('.modal-actions');
        if (modalActions) {
            const detailBtn = modalActions.querySelector('.detail-btn');
            if (detailBtn && major.major_id) {
                detailBtn.onclick = () => {
                    console.log('🖱️ Detail button clicked for major:', major.name);
                    // Sử dụng major_id thực tế để link đến trang chi tiết ngành riêng
                    const majorId = major.major_id;
                    const schoolShortCode = currentUniversity ? currentUniversity.short_code : '';
                    console.log('🔄 Redirecting to major detail page with ID:', majorId);
                    window.location.href = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
                };
            }
        }
        
        // Fetch và hiển thị dữ liệu so sánh điểm nếu có mã ngành
        if (major.major_id) {
            console.log('📊 Fetching comparison data for major:', major.major_id);
            // Sử dụng major_id thực tế cho comparison
            const comparisonMajorId = major.major_id;
            fetchMajorComparison(comparisonMajorId).then(comparisonData => {
                if (comparisonData) {
                    const comparisonHTML = createComparisonHTML(comparisonData, schoolName);
                    if (comparisonHTML) {
                        // Thêm phần so sánh vào cuối modal
                        modalDetail.innerHTML += comparisonHTML;
                        console.log('✅ Comparison data added to modal');
                    }
                }
            });
        }
    }

    function hideModal() {
        clearTimeout(majorModalTimeout);
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Modal event listeners
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', hideModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
        
        modalOverlay.addEventListener('mouseleave', hideModal);
    }

    // Hàm fetch dữ liệu so sánh điểm dựa vào mã ngành
    async function fetchMajorComparison(majorId) {
        try {
            const response = await fetch(`/api/major-comparison/${majorId}/`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.log('❌ Error fetching major comparison:', error);
        }
        return null;
    }

    // Hàm tạo HTML cho phần so sánh điểm
    function createComparisonHTML(comparisonData, currentSchoolName) {
        if (!comparisonData || !comparisonData.length) {
            return '';
        }
        
        let html = `
            <div class="detailed-section">
                <h4 class="section-heading">So sánh điểm chuẩn</h4>
                <div class="benchmark-comparison">
                    <div class="benchmark-header">
                        <div>Trường</div>
                        <div>Điểm chuẩn</div>
                        <div>Năm</div>
                    </div>
        `;
        
        comparisonData.forEach((item, index) => {
            const isCurrentSchool = item.school_name === currentSchoolName;
            const rowClass = isCurrentSchool ? 'benchmark-item current-school' : 'benchmark-item';
            
            html += `
                <div class="${rowClass}">
                    <div class="benchmark-school">${item.school_name}</div>
                    <div class="benchmark-score">${item.score || 'N/A'}</div>
                    <div class="benchmark-year">${item.year || 'N/A'}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    // Hàm nhận diện ngành chất lượng cao/chương trình đặc biệt
    function isSpecialProgram(majorId) {
        if (!majorId) return false;
        
        // Kiểm tra xem mã ngành có chứa chữ cái không
        return /[A-Za-z]/.test(majorId);
    }

    // Hàm lấy tên hiển thị cho ngành đặc biệt
    function getSpecialProgramDisplayName(majorName, majorId) {
        if (!isSpecialProgram(majorId)) return majorName;
        
        // Thêm suffix "Chất lượng cao" cho tất cả ngành có chữ cái
        return majorName + ' - Chất lượng cao';
    }

    // Hàm lấy class CSS cho ngành đặc biệt
    function getSpecialProgramClass(majorId) {
        if (!isSpecialProgram(majorId)) return '';
        
        // Tất cả ngành có chữ cái đều dùng class "special-default"
        return 'special-default';
    }

    // Hàm lấy mã ngành gốc (loại bỏ các chữ đặc biệt)
    function getOriginalMajorId(majorId) {
        if (!majorId) return majorId;
        
        // Loại bỏ tất cả chữ cái, chỉ giữ lại số
        return majorId.replace(/[A-Za-z]/g, '');
    }

    // ===== FAVORITE MANAGEMENT FUNCTIONS =====

    /**
     * Toggle favorite status for a major
     */
    function toggleMajorFavorite(major, university, favBtn) {
        const favoriteKey = `favorite_${university.short_code}_${major.major_id}`;
        const isFavorite = localStorage.getItem(favoriteKey) === 'true';
        const icon = favBtn.querySelector('i');
        
        if (isFavorite) {
            // Remove from favorites
            removeMajorFromFavorites(major, university);
            favBtn.classList.remove('active');
            icon.style.color = '#cbd5e0';
            showFavoriteToast(`Đã bỏ yêu thích "${major.name}"`, 'remove');
        } else {
            // Add to favorites
            addMajorToFavorites(major, university);
            favBtn.classList.add('active');
            icon.style.color = '#ff4757';
            showFavoriteToast(`Đã thêm "${major.name}" vào yêu thích`, 'add');
        }
    }

    /**
     * Add major to favorites
     */
    function addMajorToFavorites(major, university) {
        const favoriteKey = `favorite_${university.short_code}_${major.major_id}`;
        const favoritesListKey = 'favorite_majors_list';
        
        // Mark as favorite
        localStorage.setItem(favoriteKey, 'true');
        
        // Add to favorites list
        let favoritesList = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
        
        // Check if already exists
        const existingIndex = favoritesList.findIndex(
            item => item.school_short_code === university.short_code && 
                   item.major_id === major.major_id
        );
        
        if (existingIndex === -1) {
            const favoriteItem = {
                major_id: major.major_id,
                major_name: major.name,
                school_short_code: university.short_code,
                school_name: university.name_vn,
                school_logo: university.logo,
                school_type: university.school_type,
                min_tuition: major.min_tuition_fee_per_year,
                max_tuition: major.max_tuition_fee_per_year,
                university_start: university.start,
                university_end: university.end,
                location: university.country,
                tags: major.tags,
                status: major.status,
                added_date: new Date().toISOString()
            };
            
            favoritesList.push(favoriteItem);
            localStorage.setItem(favoritesListKey, JSON.stringify(favoritesList));
            
            console.log('✅ Added major to favorites:', favoriteItem);
        }
        
        // Update favorites count
        updateFavoritesCount();
    }

    /**
     * Remove major from favorites
     */
    function removeMajorFromFavorites(major, university) {
        const favoriteKey = `favorite_${university.short_code}_${major.major_id}`;
        const favoritesListKey = 'favorite_majors_list';
        
        // Remove favorite mark
        localStorage.removeItem(favoriteKey);
        
        // Remove from favorites list
        let favoritesList = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
        favoritesList = favoritesList.filter(
            item => !(item.school_short_code === university.short_code && 
                     item.major_id === major.major_id)
        );
        
        localStorage.setItem(favoritesListKey, JSON.stringify(favoritesList));
        
        console.log('✅ Removed major from favorites:', major.name);
        
        // Update favorites count
        updateFavoritesCount();
    }

    /**
     * Get all favorite majors
     */
    function getFavoriteMajors() {
        const favoritesListKey = 'favorite_majors_list';
        return JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
    }

    /**
     * Clear all favorites
     */
    function clearAllFavorites() {
        if (confirm('Bạn có chắc muốn xóa tất cả ngành yêu thích?')) {
            const favoritesListKey = 'favorite_majors_list';
            const favoritesList = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
            
            // Remove individual favorite marks
            favoritesList.forEach(item => {
                const favoriteKey = `favorite_${item.school_short_code}_${item.major_id}`;
                localStorage.removeItem(favoriteKey);
            });
            
            // Clear favorites list
            localStorage.removeItem(favoritesListKey);
            
            // Update UI
            updateFavoritesCount();
            
            showFavoriteToast('Đã xóa tất cả ngành yêu thích', 'remove');
            
            console.log('✅ Cleared all favorites');
        }
    }

    /**
     * Update favorites count in UI using automatic system
     */
    function updateFavoritesCount() {
        // Use the automatic footer system if available
        if (window.FooterFavoriteManager && window.FooterFavoriteManager.updateFavoritesCount) {
            const count = window.FooterFavoriteManager.updateFavoritesCount();
            
            // Update any favorites count displays on current page
            const countElements = document.querySelectorAll('.favorites-count');
            countElements.forEach(element => {
                element.textContent = count;
            });
            
            return count;
        }
        
        // Fallback to manual update if footer system not available
        const favoritesList = getFavoriteMajors();
        const count = favoritesList.length;
        
        // Update any favorites count displays
        const countElements = document.querySelectorAll('.favorites-count');
        countElements.forEach(element => {
            element.textContent = count;
        });
        
        // Update heart button if exists
        const heartBtn = document.querySelector('.nav-btn.tim');
        if (heartBtn) {
            if (count > 0) {
                heartBtn.classList.add('has-favorites');
                heartBtn.setAttribute('data-count', count);
            } else {
                heartBtn.classList.remove('has-favorites');
                heartBtn.removeAttribute('data-count');
            }
        }
        
        console.log('📊 Updated favorites count:', count);
        return count;
    }

    /**
     * Show favorite toast notification
     */
    function showFavoriteToast(message, type = 'add') {
        // Remove existing toast
        const existingToast = document.querySelector('.favorite-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = 'favorite-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-heart" style="color: ${type === 'add' ? '#ff4757' : '#cbd5e0'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'add' ? '#10b981' : '#ef4444'};
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
     * Export favorites as JSON
     */
    function exportFavorites() {
        const favoritesList = getFavoriteMajors();
        if (favoritesList.length === 0) {
            showFavoriteToast('Không có ngành yêu thích nào để xuất', 'remove');
            return;
        }
        
        const dataStr = JSON.stringify(favoritesList, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nganh-yeu-thich-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showFavoriteToast('Đã xuất danh sách yêu thích', 'add');
    }

    /**
     * Import favorites from JSON
     */
    function importFavorites(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedFavorites = JSON.parse(e.target.result);
                if (Array.isArray(importedFavorites)) {
                    const favoritesListKey = 'favorite_majors_list';
                    const existingFavorites = JSON.parse(localStorage.getItem(favoritesListKey) || '[]');
                    
                    // Merge favorites (avoid duplicates)
                    importedFavorites.forEach(newItem => {
                        const exists = existingFavorites.find(
                            item => item.school_short_code === newItem.school_short_code && 
                                   item.major_id === newItem.major_id
                        );
                        
                        if (!exists) {
                            existingFavorites.push(newItem);
                            // Add individual favorite mark
                            const favoriteKey = `favorite_${newItem.school_short_code}_${newItem.major_id}`;
                            localStorage.setItem(favoriteKey, 'true');
                        }
                    });
                    
                    localStorage.setItem(favoritesListKey, JSON.stringify(existingFavorites));
                    updateFavoritesCount();
                    
                    showFavoriteToast(`Đã nhập ${importedFavorites.length} ngành yêu thích`, 'add');
                } else {
                    throw new Error('Invalid format');
                }
            } catch (error) {
                showFavoriteToast('Lỗi: File không đúng định dạng', 'remove');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }

    /**
     * Export favorites to Excel function for chitiet-dh.js
     */
    function exportFavoritesToExcel() {
        // Use the footer function if available
        if (window.exportFavoritesToExcel && window.exportFavoritesToExcel !== exportFavoritesToExcel) {
            window.exportFavoritesToExcel();
            return;
        }
        
        // Fallback implementation
        const favoritesList = getFavoriteMajors();
        if (favoritesList.length === 0) {
            showFavoriteToast('Không có ngành yêu thích nào để xuất', 'error');
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
                    `"${formatTuitionForExcelLocal(favorite.min_tuition)}"`,
                    `"${formatTuitionForExcelLocal(favorite.max_tuition)}"`,
                    `"${(favorite.location || '').replace(/"/g, '""')}"`,
                    `"${(favorite.tags || '').replace(/"/g, '""')}"`,
                    `"${(favorite.status || '').replace(/"/g, '""')}"`,
                    `"${formatDateForExcelLocal(favorite.added_date)}"`
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
            
            showFavoriteToast('Đã xuất danh sách yêu thích dạng Excel (.csv)', 'add');
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showFavoriteToast('Có lỗi khi xuất file Excel', 'error');
        }
    }
    
    /**
     * Format tuition for Excel display
     */
    function formatTuitionForExcelLocal(tuition) {
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
     * Format date for Excel display
     */
    function formatDateForExcelLocal(dateString) {
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

    // Initialize favorites count when page loads
    setTimeout(() => {
        updateFavoritesCount();
    }, 1000);

    // Expose functions globally for use in other scripts
    // ✨ Listen for favorite events from modal
    window.addEventListener('favoriteRemoved', function(event) {
        const { schoolShortCode, majorId } = event.detail;
        console.log(`🔄 Received favoriteRemoved event: ${majorId} from ${schoolShortCode}`);
        
        // Update heart buttons on current university page
        const heartButtons = document.querySelectorAll(`[data-major-id="${majorId}"] .major-fav-btn`);
        heartButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                btn.classList.remove('active');
                btn.style.color = '#cbd5e0';
                icon.className = 'far fa-heart';
                icon.style.color = '#cbd5e0';
            }
        });
        
        updateFavoritesCount();
    });
    
    window.addEventListener('allFavoritesCleared', function() {
        console.log(`🔄 Received allFavoritesCleared event`);
        
        // Update all heart buttons on current page
        const heartButtons = document.querySelectorAll('.major-fav-btn');
        heartButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                btn.classList.remove('active');
                btn.style.color = '#cbd5e0';
                icon.className = 'far fa-heart';
                icon.style.color = '#cbd5e0';
            }
        });
        
        updateFavoritesCount();
    });

    window.FavoriteManager = {
        toggleMajorFavorite,
        addMajorToFavorites,
        removeMajorFromFavorites,
        getFavoriteMajors,
        clearAllFavorites,
        updateFavoritesCount,
        exportFavorites,
        exportFavoritesToExcel,
        importFavorites,
        showFavoriteToast
    };

    // Function to track school view
    async function trackSchoolView(schoolId) {
        try {
            const response = await fetch('https://timtruonghoc.pythonanywhere.com/tracking/increment-school-view/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    school_id: schoolId
                })
            });
            
            if (response.ok) {
                console.log('✅ School view tracked successfully');
            } else {
                console.log('⚠️ Failed to track school view');
            }
        } catch (error) {
            console.log('⚠️ Error tracking school view:', error);
        }
    }

});
