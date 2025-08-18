// Xu Hướng Ngành Nghề & Việc Làm JavaScript
class XuHuongNgheSystem {
    constructor() {
        this.majors = [];
        this.jobs = [];
        this.allMajorsForComparison = [];
        // Dùng API remote trên PythonAnywhere khi chạy local
        this.apiBase = (window.location.hostname.includes('pythonanywhere.com'))
            ? ''
            : 'https://timtruonghoc.pythonanywhere.com';
        this.init();
    }

    async init() {
        await this.loadMajors();
        this.setupCharts();
        this.setupEventListeners();
        this.renderMajors();
        this.renderJobs();
        this.setupComparison();
    }

    async loadMajors() {
        try {
            // Lấy top 6 ngành có opportunities cao nhất (dùng list + limit để tương thích backend hiện tại)
            const response = await fetch(`${this.apiBase}/api/xu-huong-nghe/?limit=6`);
            if (response.ok) {
                const data = await response.json();
                this.majors = data.results || [];
                console.log(`✅ Loaded ${this.majors.length} top majors from AllMajorOfAllSchool:`, data.message);
                console.log(`📊 Source: ${data.source}`);
                
                // Log chi tiết từng ngành để debug
                this.majors.forEach((major, index) => {
                    console.log(`🏆 ${index + 1}. ${major.name} - Opportunities: ${major.opportunities}%`);
                });
                
                // Lấy thống kê tổng quan
                await this.loadStatistics();
            } else {
                console.warn('❌ Failed to load top majors from API, using sample data');
                this.loadSampleMajors();
            }
        } catch (error) {
            console.warn('❌ Error loading top majors from API, using sample data:', error);
            this.loadSampleMajors();
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${this.apiBase}/api/xu-huong-nghe/statistics/`);
            if (response.ok) {
                const data = await response.json();
                this.updateHeroStats(data);
            }
        } catch (error) {
            console.warn('Error loading statistics:', error);
        }
    }

    updateHeroStats(statistics) {
        if (!statistics) return;
        
        const statNumbers = document.querySelectorAll('.hero-stats .stat-number');
        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = statistics.total_majors || '200+';
            statNumbers[1].textContent = '85%'; // Tỷ lệ việc làm
            statNumbers[2].textContent = '15M+'; // Lương TB
            statNumbers[3].textContent = '50+'; // Lĩnh vực
        }
    }

    loadSampleMajors() {
        this.majors = [
            {
                id: 1,
                name: "Công nghệ thông tin",
                short_description: "Ngành học về máy tính và công nghệ thông tin",
                salary: "15-25 triệu VND",
                opportunities: 95,
                tag: "hot",
                field: { name: "Công nghệ" }
            },
            {
                id: 2,
                name: "Y học",
                short_description: "Ngành học về chăm sóc sức khỏe và điều trị bệnh",
                salary: "20-35 triệu VND",
                opportunities: 90,
                tag: "find",
                field: { name: "Y tế" }
            },
            {
                id: 3,
                name: "Kinh tế",
                short_description: "Ngành học về quản lý kinh tế và tài chính",
                salary: "12-20 triệu VND",
                opportunities: 85,
                tag: "grown",
                field: { name: "Kinh tế" }
            },
            {
                id: 4,
                name: "Luật",
                short_description: "Ngành học về pháp luật và tư pháp",
                salary: "15-25 triệu VND",
                opportunities: 80,
                tag: "push",
                field: { name: "Pháp lý" }
            },
            {
                id: 5,
                name: "Kiến trúc",
                short_description: "Ngành học về thiết kế và xây dựng",
                salary: "18-30 triệu VND",
                opportunities: 88,
                tag: "hot",
                field: { name: "Xây dựng" }
            },
            {
                id: 6,
                name: "Sinh học",
                short_description: "Ngành học về nghiên cứu sinh vật và môi trường",
                salary: "12-18 triệu VND",
                opportunities: 75,
                tag: "grown",
                field: { name: "Khoa học" }
            }
        ];
    }

    setupCharts() {
        this.createGrowthChart();
        this.createSalaryChart();
        this.createDemandChart();
    }

    createGrowthChart() {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        const growthData = {
            labels: ['CNTT', 'Y học', 'Kinh tế', 'Luật', 'Kiến trúc'],
            datasets: [{
                label: 'Tốc độ tăng trưởng (%)',
                data: [25, 20, 15, 18, 22],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        };

        new Chart(ctx, {
            type: 'bar',
            data: growthData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 30,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createSalaryChart() {
        const ctx = document.getElementById('salaryChart');
        if (!ctx) return;

        const salaryData = {
            labels: ['0-5 năm', '5-10 năm', '10-15 năm', '15+ năm'],
            datasets: [{
                label: 'Mức lương trung bình (triệu VND)',
                data: [12, 18, 25, 35],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: salaryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    createDemandChart() {
        const ctx = document.getElementById('demandChart');
        if (!ctx) return;

        const demandData = {
            labels: ['CNTT', 'Y học', 'Kinh tế', 'Luật', 'Kiến trúc', 'Sinh học'],
            datasets: [{
                label: 'Nhu cầu tuyển dụng',
                data: [95, 90, 85, 80, 88, 75],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderWidth: 0
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: demandData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Job filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.filterJobs(button.dataset.filter);
            });
        });

        // Major card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.major-card')) {
                const majorId = e.target.closest('.major-card').dataset.id;
                this.showMajorDetail(majorId);
            }
        });
    }

    renderMajors() {
        const majorsGrid = document.getElementById('majors-grid');
        if (!majorsGrid) return;

        // Hiển thị 6 ngành từ AllMajorOfAllSchool (đã được sắp xếp theo opportunities)
        const topMajors = this.majors.slice(0, 6);

        if (topMajors.length === 0) {
            majorsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>Không có dữ liệu ngành nghề</h3>
                    <p>Vui lòng thử lại sau hoặc liên hệ admin để cập nhật dữ liệu.</p>
                </div>
            `;
            return;
        }

        majorsGrid.innerHTML = topMajors.map(major => `
            <div class="major-card" data-id="${major.id}">
                <div class="major-header">
                    <div>
                        <div class="major-title">${major.name || 'Tên ngành'}</div>
                        <div class="major-tag ${major.tag || 'normal'}">${this.getTagLabel(major.tag)}</div>
                    </div>
                </div>
                
                <div class="major-stats">
                    <div class="major-stat">
                        <span class="major-stat-value">${major.opportunities || 0}%</span>
                        <span class="major-stat-label">Cơ hội việc làm</span>
                    </div>
                    <div class="major-stat">
                        <span class="major-stat-value">${major.salary || 'N/A'}</span>
                        <span class="major-stat-label">Mức lương TB</span>
                    </div>
                </div>
                
                <div class="major-description">
                    ${this.truncateText(major.short_description || major.name || 'Mô tả ngành học...', 120)}
                </div>
                
                <div class="major-details">
                    <div class="major-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${major.training_duration || '4 năm'}</span>
                    </div>
                    <div class="major-detail-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>${major.field?.name || 'Chung'}</span>
                    </div>
                    
                </div>
                
                <div class="major-actions">
                    <button class="btn btn-primary" onclick="xuHuongNgheSystem.showMajorDetail(${major.id})">
                        <i class="fas fa-info-circle"></i>
                        Chi tiết
                    </button>
                    <button class="btn btn-outline" onclick="xuHuongNgheSystem.compareMajor(${major.id})">
                        <i class="fas fa-balance-scale"></i>
                        So sánh
                    </button>
                </div>
            </div>
        `).join('');

        // Populate comparison selects với tất cả ngành
        this.populateComparisonSelects().then(() => {
            console.log(`✅ Rendered ${topMajors.length} top majors from AllMajorOfAllSchool`);
        });
    }

    truncateText(text, maxLength) {
        if (!text) return 'Mô tả ngành học...';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    getTagLabel(tag) {
        const labels = {
            'hot': 'Ngành hot',
            'find': 'Đang thiếu nhân lực',
            'grown': 'Đang phát triển',
            'push': 'Đẩy mạnh',
            'normal': 'Bình thường'
        };
        return labels[tag] || 'Bình thường';
    }

    renderJobs() {
        this.jobs = this.generateSampleJobs();
        this.filterJobs('all');
    }

    generateSampleJobs() {
        return [
            {
                id: 1,
                title: "Frontend Developer",
                company: "TechCorp Vietnam",
                salary: "20-30M VND",
                location: "TP.HCM",
                type: "Full-time",
                experience: "2-5 năm",
                description: "Phát triển giao diện người dùng với React, Vue.js...",
                major: "Công nghệ thông tin",
                tag: "hot"
            },
            {
                id: 2,
                title: "Bác sĩ Nội khoa",
                company: "Bệnh viện Đa khoa",
                salary: "25-40M VND",
                location: "Hà Nội",
                type: "Full-time",
                experience: "3-7 năm",
                description: "Khám và điều trị các bệnh nội khoa...",
                major: "Y học",
                tag: "find"
            },
            {
                id: 3,
                title: "Financial Analyst",
                company: "Bank ABC",
                salary: "18-25M VND",
                location: "TP.HCM",
                type: "Full-time",
                experience: "1-3 năm",
                description: "Phân tích tài chính và báo cáo...",
                major: "Kinh tế",
                tag: "grown"
            },
            {
                id: 4,
                title: "Luật sư Tư vấn",
                company: "Công ty Luật XYZ",
                salary: "20-35M VND",
                location: "Hà Nội",
                type: "Full-time",
                experience: "2-5 năm",
                description: "Tư vấn pháp lý cho doanh nghiệp...",
                major: "Luật",
                tag: "push"
            },
            {
                id: 5,
                title: "Kiến trúc sư",
                company: "Studio Design",
                salary: "25-40M VND",
                location: "TP.HCM",
                type: "Full-time",
                experience: "3-6 năm",
                description: "Thiết kế kiến trúc và giám sát thi công...",
                major: "Kiến trúc",
                tag: "hot"
            },
            {
                id: 6,
                title: "Nghiên cứu sinh Sinh học",
                company: "Viện Nghiên cứu",
                salary: "15-25M VND",
                location: "Hà Nội",
                type: "Full-time",
                experience: "1-3 năm",
                description: "Nghiên cứu về sinh học phân tử...",
                major: "Sinh học",
                tag: "grown"
            }
        ];
    }

    filterJobs(filter) {
        const jobsGrid = document.getElementById('jobs-grid');
        if (!jobsGrid) return;

        let filteredJobs = this.jobs;
        if (filter !== 'all') {
            filteredJobs = this.jobs.filter(job => job.tag === filter);
        }

        jobsGrid.innerHTML = filteredJobs.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="job-company">${job.company}</div>
                    </div>
                    <div class="job-salary">${job.salary}</div>
                </div>
                
                <div class="job-details">
                    <div class="job-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${job.location}</span>
                    </div>
                    <div class="job-detail">
                        <i class="fas fa-clock"></i>
                        <span>${job.type}</span>
                    </div>
                    <div class="job-detail">
                        <i class="fas fa-briefcase"></i>
                        <span>${job.experience}</span>
                    </div>
                </div>
                
                <div class="job-description">
                    ${job.description}
                </div>
                
                <div class="job-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Ứng tuyển
                    </button>
                    <button class="btn btn-outline">
                        <i class="fas fa-heart"></i>
                        Lưu việc làm
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupComparison() {
        // Đảm bảo có dữ liệu cho dropdown ngay từ đầu
        this.populateComparisonSelects();
        this.setupSearchableSelect('major1');
        this.setupSearchableSelect('major2');
    }

    setupSearchableSelect(selectId) {
        const input = document.getElementById(`${selectId}-input`);
        const dropdown = document.getElementById(`${selectId}-dropdown`);
        const hiddenInput = document.getElementById(selectId);

        if (!input || !dropdown || !hiddenInput) return;

        // Show dropdown on focus and populate if empty
        input.addEventListener('focus', () => {
            if (!dropdown.innerHTML.trim()) {
                // Nếu chưa có options (do mạng chậm), fetch lại
                this.populateComparisonSelects();
            }
            dropdown.style.display = 'block';
        });

        // Filter options on input
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = dropdown.querySelectorAll('.searchable-select-option');
            
            options.forEach(option => {
                const text = option.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    option.style.display = 'block';
                } else {
                    option.style.display = 'none';
                }
            });
            // Luôn hiển thị dropdown khi có input
            dropdown.style.display = 'block';
        });

        // Handle option selection
        dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('searchable-select-option')) {
                const selectedId = e.target.dataset.value;
                const selectedText = e.target.textContent;
                
                input.value = selectedText;
                hiddenInput.value = selectedId;
                dropdown.style.display = 'none';
                
                // Remove selected class from all options
                dropdown.querySelectorAll('.searchable-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to chosen option
                e.target.classList.add('selected');
                
                // Trigger comparison update
                this.updateComparison();
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                // Chỉ ẩn nếu không có text đang nhập; nếu đang nhập thì giữ lại để tránh mất danh sách
                if (!input.value) {
                    dropdown.style.display = 'none';
                }
            }
        });
    }

    async populateComparisonSelects() {
        const major1Dropdown = document.getElementById('major1-dropdown');
        const major2Dropdown = document.getElementById('major2-dropdown');

        if (!major1Dropdown || !major2Dropdown) return;

        try {
            // Lấy tất cả ngành từ AllMajorOfAllSchool cho comparison
            const response = await fetch(`${this.apiBase}/api/xu-huong-nghe/?limit=200`);
            if (response.ok) {
                const data = await response.json();
                const allMajors = data.results || [];
                this.allMajorsForComparison = allMajors;
                
                const options = allMajors.map(major => 
                    `<div class="searchable-select-option" data-value="${major.id}">${major.name} (${major.all_major_id || 'N/A'})</div>`
                ).join('');

                major1Dropdown.innerHTML = options;
                major2Dropdown.innerHTML = options;
                
                console.log(`✅ Populated searchable comparison selects with ${allMajors.length} majors from AllMajorOfAllSchool`);
            } else {
                // Fallback to current majors
                const options = this.majors.map(major => 
                    `<div class="searchable-select-option" data-value="${major.id}">${major.name} (${major.all_major_id || 'N/A'})</div>`
                ).join('');

                major1Dropdown.innerHTML = options;
                major2Dropdown.innerHTML = options;
            }
        } catch (error) {
            console.warn('❌ Error loading all majors for comparison:', error);
            // Fallback to current majors
            const options = this.majors.map(major => 
                `<div class="searchable-select-option" data-value="${major.id}">${major.name} (${major.all_major_id || 'N/A'})</div>`
            ).join('');

            major1Dropdown.innerHTML = options;
            major2Dropdown.innerHTML = options;
        }
    }

    updateComparison() {
        const major1Id = document.getElementById('major1').value;
        const major2Id = document.getElementById('major2').value;
        const resultsDiv = document.getElementById('comparison-results');

        if (!major1Id || !major2Id) {
            resultsDiv.style.display = 'none';
            return;
        }

        // Tìm trong danh sách đầy đủ cho so sánh (ưu tiên), fallback sang top majors đang hiển thị
        const source = this.allMajorsForComparison && this.allMajorsForComparison.length ? this.allMajorsForComparison : this.majors;
        const major1 = source.find(m => String(m.id) === String(major1Id));
        const major2 = source.find(m => String(m.id) === String(major2Id));

        if (!major1 || !major2) {
            resultsDiv.style.display = 'none';
            return;
        }

        document.getElementById('major1-name').textContent = major1.name;
        document.getElementById('major2-name').textContent = major2.name;

        document.getElementById('major1-details').innerHTML = this.generateComparisonDetails(major1);
        document.getElementById('major2-details').innerHTML = this.generateComparisonDetails(major2);

        resultsDiv.style.display = 'grid';
    }

    generateComparisonDetails(major) {
        return `
            <div class="comparison-item">
                <span class="comparison-label">Mã ngành</span>
                <span class="comparison-value">${major.all_major_id || 'N/A'}</span>
            </div>
            <div class="comparison-item">
                <span class="comparison-label">Cơ hội việc làm</span>
                <span class="comparison-value">${major.opportunities}%</span>
            </div>
            <div class="comparison-item">
                <span class="comparison-label">Mức lương TB</span>
                <span class="comparison-value">${major.salary || 'N/A'}</span>
            </div>
            <div class="comparison-item">
                <span class="comparison-label">Thời gian đào tạo</span>
                <span class="comparison-value">${major.training_duration || '4 năm'}</span>
            </div>
           
            <div class="comparison-item">
                <span class="comparison-label">Lĩnh vực</span>
                <span class="comparison-value">${major.field?.name || 'Chung'}</span>
            </div>
            <div class="comparison-item">
                <span class="comparison-label">Trạng thái</span>
                <span class="comparison-value">${this.getTagLabel(major.tag)}</span>
            </div>
        `;
    }

    showMajorDetail(majorId) {
        const major = this.majors.find(m => m.id == majorId);
        if (!major) return;

        const modal = this.createModal(
            `Chi tiết ngành: ${major.name}`,
            `
            <div class="major-detail-content">
                <div class="major-info">
                    <h3>${major.name}</h3>
                    <p><strong>Mã ngành:</strong> ${major.all_major_id || 'N/A'}</p>
                    <p><strong>Lĩnh vực:</strong> ${major.field?.name || 'Chung'}</p>
                    <p><strong>Trạng thái:</strong> <span class="major-tag ${major.tag}">${this.getTagLabel(major.tag)}</span></p>
                </div>
                
                <div class="major-stats-detail">
                    <div class="stat-item">
                        <span class="stat-number">${major.opportunities}%</span>
                        <span class="stat-label">Cơ hội việc làm</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${major.salary || 'N/A'}</span>
                        <span class="stat-label">Mức lương trung bình</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${major.training_duration || '4 năm'}</span>
                        <span class="stat-label">Thời gian đào tạo</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${major.tuition_fee_per_year || 'Liên hệ'}</span>
                        <span class="stat-label">Học phí/năm</span>
                    </div>
                </div>
                
                <div class="major-description-detail">
                    <h4>Mô tả ngành</h4>
                    <div>${major.short_description || 'Mô tả chi tiết về ngành học...'}</div>
                </div>
                
                
                
                <div class="major-jobs">
                    <h4>Việc làm sau khi tốt nghiệp</h4>
                    <div>${major.job || 'Các vị trí việc làm phù hợp...'}</div>
                </div>
                
                <div class="major-skills">
                    <h4>Tố chất phù hợp</h4>
                    <div>${major.suitable || 'Các tố chất cần thiết...'}</div>
                </div>
                
                ${major.note ? `
                <div class="major-notes">
                    <h4>Ghi chú</h4>
                    <div>${major.note}</div>
                </div>
                ` : ''}
            </div>
            `
        );

        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

		// Đóng modal khi click ra ngoài nội dung
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});

		// Đóng modal khi nhấn phím Escape
		const escHandler = (ev) => {
			if (ev.key === 'Escape') {
				modal.remove();
				document.removeEventListener('keydown', escHandler);
			}
		};
		document.addEventListener('keydown', escHandler);
    }

    compareMajor(majorId) {
        const major1Input = document.getElementById('major1-input');
        const major1Hidden = document.getElementById('major1');
        const major = this.allMajorsForComparison.find(m => String(m.id) === String(majorId)) || 
                     this.majors.find(m => String(m.id) === String(majorId));
        
        if (major1Input && major1Hidden && major) {
            major1Input.value = `${major.name} (${major.all_major_id || 'N/A'})`;
            major1Hidden.value = majorId;
            this.updateComparison();
            
            // Scroll to comparison section
            document.querySelector('.comparison-section').scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 16px;
                padding: 2rem;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <h2 style="margin: 0; color: #1e293b;">${title}</h2>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #6b7280;
                    ">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        return modal;
    }
}

// Initialize the system
const xuHuongNgheSystem = new XuHuongNgheSystem();

// Global functions for HTML onclick handlers
function showMajorDetail(majorId) {
    xuHuongNgheSystem.showMajorDetail(majorId);
}

function compareMajor(majorId) {
    xuHuongNgheSystem.compareMajor(majorId);
} 