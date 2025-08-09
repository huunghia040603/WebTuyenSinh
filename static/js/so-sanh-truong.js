// Global variables
let selectedSchools = [];
let searchResults = [];
let allSchools = [];

// DOM elements (will be initialized in DOMContentLoaded)
let schoolSearchInput;
let searchResultsDiv;
let comparisonResults;
let emptyState;

// Constants for localStorage
const STORAGE_KEY = 'school_comparison_data';
const STORAGE_EXPIRY_KEY = 'school_comparison_expiry';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing School Comparison page');
    
    initializeDOMElements();
    initializeComparison();
    initializeTabs();
});

// Initialize DOM elements
function initializeDOMElements() {
    console.log('🎯 Initializing DOM elements...');
    
    // Initialize DOM elements
    schoolSearchInput = document.getElementById('schoolSearch');
    searchResultsDiv = document.getElementById('searchResults');
    comparisonResults = document.getElementById('comparisonResults');
    emptyState = document.getElementById('emptyState');
    
    if (!schoolSearchInput || !searchResultsDiv) {
        console.error('❌ Required DOM elements not found!');
        return;
    }
    
    console.log('✅ DOM elements initialized successfully');
    
    // Set up search functionality
    const debouncedSearch = debounce(handleSearch, 300);
    
    // Test if event listener is working
    schoolSearchInput.addEventListener('input', function(e) {
        console.log('🎯 Input event triggered:', e.target.value);
        debouncedSearch();
    });
    
    schoolSearchInput.addEventListener('focus', function() {
        console.log('🎯 Focus event triggered');
        if (schoolSearchInput.value.trim().length >= 2) {
            showSearchResults();
        }
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!schoolSearchInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
            hideSearchResults();
        }
    });
    
    console.log('✅ Search functionality initialized');
}

// Initialize comparison functionality
async function initializeComparison() {
    console.log('🔄 Initializing comparison functionality...');
    
    // Load comparison data from localStorage
    loadComparisonFromStorage();
    
    // Load all schools data
    await loadAllSchools();
    
    // Update UI based on loaded data
    updateComparisonUI();
    
    console.log('✅ Comparison functionality initialized');
}

// Load all schools from API
async function loadAllSchools() {
    console.log('📡 Loading all schools...');
    
    try {
        // Sử dụng API tối ưu cho danh sách trường
        const response = await fetch('https://timtruonghoc.pythonanywhere.com/schools-optimized/?page_size=1000');
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 API response:', data);
            
            // Handle both paginated and non-paginated responses
            if (data.results && Array.isArray(data.results)) {
                allSchools = data.results;
            } else if (Array.isArray(data)) {
                allSchools = data;
            } else {
                console.error('❌ Unexpected API response format');
                allSchools = [];
            }
            
            console.log('✅ Loaded schools:', allSchools.length);
        } else {
            console.error('❌ Failed to load schools:', response.status);
            // Fallback to regular API
            const fallbackResponse = await fetch('https://timtruonghoc.pythonanywhere.com/schools/?page_size=500');
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                allSchools = fallbackData.results || fallbackData || [];
                console.log('✅ Loaded schools via fallback:', allSchools.length);
            }
        }
    } catch (error) {
        console.error('❌ Error loading schools:', error);
        allSchools = [];
    }
}

// Handle search input
function handleSearch() {
    const query = schoolSearchInput.value.trim();
    console.log('🔍 Search query:', query);
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    // Search through schools
    const filteredSchools = allSchools.filter(school => {
        return school.name_vn?.toLowerCase().includes(query.toLowerCase()) ||
               school.name_en?.toLowerCase().includes(query.toLowerCase()) ||
               school.short_code?.toLowerCase().includes(query.toLowerCase()) ||
               school.admission_code?.toLowerCase().includes(query.toLowerCase());
    });
    
    console.log('🎯 Filtered schools:', filteredSchools.length);
    displaySearchResults(filteredSchools.slice(0, 10)); // Limit to 10 results
}

// Display search results
function displaySearchResults(results) {
    console.log('📋 Displaying search results:', results.length);
    
    // Save results for selection
    searchResults = results;
    
    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<div class="no-results">Không tìm thấy trường học phù hợp</div>';
        return;
    }
    
    const resultsHTML = results.map((school, index) => {
        const schoolType = school.school_type === 'public' ? 'Công lập' : 'Ngoài công lập';
        
        return `
            <div class="search-result-item" onclick="selectSchool(${index})">
                <div class="search-result-logo">
                    ${school.logo ? 
                        `<img src="${school.logo}" alt="${school.name_vn}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div style="display: none; width: 100%; height: 100%; background: #667eea; color: white; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem;">
                            ${school.short_code || school.name_vn.substring(0, 2).toUpperCase()}
                         </div>` :
                        `<div style="width: 100%; height: 100%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem;">
                            ${school.short_code || school.name_vn.substring(0, 2).toUpperCase()}
                         </div>`
                    }
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${school.name_vn}</div>
                    <div class="search-result-details">
                        <div>Mã: ${school.short_code || 'N/A'} - Loại hình: ${schoolType}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    searchResultsDiv.innerHTML = resultsHTML;
    showSearchResults();
}

// Show search results
function showSearchResults() {
    searchResultsDiv.style.display = 'block';
}

// Hide search results
function hideSearchResults() {
    searchResultsDiv.style.display = 'none';
}

// Select a school
async function selectSchool(index) {
    console.log('🎯 Selecting school at index:', index);
    
    if (selectedSchools.length >= 3) {
        alert('Bạn đã chọn tối đa 3 trường để so sánh. Vui lòng xóa một trường trước khi thêm trường mới.');
        return;
    }
    
    if (index >= 0 && index < searchResults.length) {
        const school = searchResults[index];
        console.log('📋 Selected school:', school);
        
        // Check if school is already selected
        const isAlreadySelected = selectedSchools.some(selected => selected.id === school.id);
        if (isAlreadySelected) {
            alert('Trường này đã được chọn. Vui lòng chọn trường khác.');
            return;
        }
        
        selectedSchools.push(school);
        console.log('✅ Added to selected schools. Total:', selectedSchools.length);
        
        // Save to localStorage
        saveComparisonToStorage();
        
        // Update UI
        await updateComparisonUI();
        
        // Hide search results
        hideSearchResults();
        
        // Clear search input
        schoolSearchInput.value = '';
    }
}

// Remove a school
async function removeSchool(schoolId) {
    console.log('🗑️ Removing school:', schoolId);
    
    selectedSchools = selectedSchools.filter(school => school.id !== schoolId);
    console.log('✅ School removed. Remaining:', selectedSchools.length);
    
    // Save to localStorage
    saveComparisonToStorage();
    
    // Update UI
    await updateComparisonUI();
}

// Update comparison UI
async function updateComparisonUI() {
    console.log('🔄 Updating comparison UI...');
    
    // Update slots
    updateSlots();
    
    if (selectedSchools.length >= 2) {
        // Show comparison results
        emptyState.style.display = 'none';
        comparisonResults.style.display = 'block';
        
        // Generate comparison data
        await generateComparison();
    } else {
        // Show empty state
        emptyState.style.display = 'block';
        comparisonResults.style.display = 'none';
    }
    
    console.log('✅ UI updated successfully');
}

// Update slots with selected schools
function updateSlots() {
    console.log('🎰 Updating slots...');
    
    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById(`slot${i}`);
        if (!slot) continue;
        
        if (selectedSchools[i - 1]) {
            const school = selectedSchools[i - 1];
            
            // Remove onclick and cursor for filled slots
            slot.removeAttribute('onclick');
            slot.style.cursor = 'default';
            
            slot.innerHTML = `
                <div class="school-card">
                    <div class="school-card-header">
                        <img src="${school.logo || '/static/images/logo12.png'}" 
                             alt="${school.name_vn}" 
                             class="school-logo"
                             onerror="this.src='/static/images/logo12.png'">
                        <div class="school-info">
                            <h4>${school.name_vn}</h4>
                            <div class="school-code">${school.short_code || 'N/A'}</div>
                        </div>
                    </div>
                    <button class="remove-school" onclick="removeSchool(${school.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            // Add onclick and cursor for empty slots
            slot.setAttribute('onclick', 'focusSearch()');
            slot.style.cursor = 'pointer';
            
            slot.innerHTML = `
                <div class="slot-placeholder">
                    <i class="fas fa-plus-circle"></i>
                    <p>Thêm trường thứ ${i === 1 ? 'nhất' : i === 2 ? 'hai' : 'ba'}</p>
                </div>
            `;
        }
    }
}

// Generate comparison
async function generateComparison() {
    console.log('🔄 Generating comparison...');
    
    // Generate quick stats
    generateQuickStats();
    
    // Generate detailed comparisons for each tab
    generateOverviewComparison();
    generateQualityComparison();
    generateFacilitiesComparison();
    generateAdmissionComparison();
    
    console.log('✅ Comparison generated successfully');
}

// Generate quick stats
function generateQuickStats() {
    console.log('📊 Generating quick stats...');
    
    // Quality stats
    const qualityStats = document.getElementById('qualityStats');
    if (qualityStats) {
        let html = '';
        selectedSchools.forEach(school => {
            const qualityScore = school.tag === 'outstanding' ? '90-95' : 
                               school.tag === 'pro' ? '85-90' : '70-85';
            html += `
                <div class="stat-item">
                    <span class="stat-label">${school.name_vn}</span>
                    <span class="stat-value">${qualityScore}/100</span>
                </div>
            `;
        });
        qualityStats.innerHTML = html;
    }
    
    // Tuition stats
    const tuitionStats = document.getElementById('tuitionStats');
    if (tuitionStats) {
        let html = '';
        selectedSchools.forEach(school => {
            const tuitionText = formatTuition(school.start, school.end);
            html += `
                <div class="stat-item">
                    <span class="stat-label">${school.name_vn}</span>
                    <span class="stat-value">${tuitionText}</span>
                </div>
            `;
        });
        tuitionStats.innerHTML = html;
    }
    
    // Quota stats
    const quotaStats = document.getElementById('quotaStats');
    if (quotaStats) {
        let html = '';
        selectedSchools.forEach(school => {
            const quota = school.quota_per_year || 'N/A';
            html += `
                <div class="stat-item">
                    <span class="stat-label">${school.name_vn}</span>
                    <span class="stat-value">${quota}</span>
                </div>
            `;
        });
        quotaStats.innerHTML = html;
    }
    
    // Location stats
    const locationStats = document.getElementById('locationStats');
    if (locationStats) {
        let html = '';
        selectedSchools.forEach(school => {
            const location = school.country || 'N/A';
            html += `
                <div class="stat-item">
                    <span class="stat-label">${school.name_vn}</span>
                    <span class="stat-value">${location}</span>
                </div>
            `;
        });
        locationStats.innerHTML = html;
    }
}

// Generate overview comparison
function generateOverviewComparison() {
    console.log('📋 Generating overview comparison...');
    
    const overviewTableBody = document.getElementById('overviewTableBody');
    if (!overviewTableBody) return;
    
    // Update headers
    updateTableHeaders();
    
    const criteria = [
        { key: 'name_vn', label: 'Tên trường' },
        { key: 'school_type', label: 'Loại hình', format: (value) => value === 'public' ? 'Công lập' : 'Ngoài công lập' },
        { key: 'established_year', label: 'Năm thành lập' },
        { key: 'school_level', label: 'Cấp học', format: (value) => {
            const levels = { 'university': 'Đại học', 'college': 'Cao đẳng', 'vocational': 'Trung cấp' };
            return levels[value] || value;
        }},
        { key: 'quota_per_year', label: 'Chỉ tiêu/năm' },
        { key: 'tuition', label: 'Học phí', format: (school) => formatTuition(school.start, school.end) },
        { key: 'country', label: 'Vị trí' },
        { key: 'tag', label: 'Đánh giá', format: (value) => {
            const tags = { 'outstanding': 'Nổi bật', 'pro': 'Chuyên nghiệp', 'new': 'Mới', 'urgency': 'Tuyển sinh gấp' };
            return tags[value] || 'Bình thường';
        }}
    ];
    
    let html = '';
    criteria.forEach(criterion => {
        html += '<div class="table-row">';
        html += `<div class="table-cell criteria">${criterion.label}</div>`;
        
        for (let i = 0; i < 3; i++) {
            if (selectedSchools[i]) {
                const school = selectedSchools[i];
                let value;
                
                if (criterion.key === 'tuition') {
                    value = criterion.format(school);
                } else if (criterion.format) {
                    value = criterion.format(school[criterion.key]);
                } else {
                    value = school[criterion.key] || 'N/A';
                }
                
                html += `<div class="table-cell value">${value}</div>`;
            } else {
                html += '<div class="table-cell value">-</div>';
            }
        }
        html += '</div>';
    });
    
    overviewTableBody.innerHTML = html;
}

// Generate quality comparison
function generateQualityComparison() {
    console.log('⭐ Generating quality comparison...');
    
    const qualityComparison = document.getElementById('qualityComparison');
    if (!qualityComparison) return;
    
    let html = '';
    selectedSchools.forEach(school => {
        const qualityScore = school.tag === 'outstanding' ? '90-95' : 
                           school.tag === 'pro' ? '85-90' : '70-85';
        const ranking = school.tag === 'outstanding' ? 'Top 10' : 
                       school.tag === 'pro' ? 'Top 20' : 'Top 50';
        
        html += `
            <div class="quality-card">
                <h3>${school.name_vn}</h3>
                <div class="quality-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Chất lượng đào tạo:</span>
                        <span class="metric-value">${qualityScore}/100</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Xếp hạng:</span>
                        <span class="metric-value">${ranking} quốc gia</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Đánh giá:</span>
                        <span class="metric-value">${school.tag === 'outstanding' ? 'Xuất sắc' : 
                                                   school.tag === 'pro' ? 'Tốt' : 'Khá'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Trang web:</span>
                        <span class="metric-value">
                            ${school.website_url ? 
                                `<a href="${school.website_url}" target="_blank">Xem trang web</a>` : 
                                'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    qualityComparison.innerHTML = html;
}

// Generate facilities comparison
function generateFacilitiesComparison() {
    console.log('🏢 Generating facilities comparison...');
    
    const facilitiesComparison = document.getElementById('facilitiesComparison');
    if (!facilitiesComparison) return;
    
    let html = '';
    selectedSchools.forEach(school => {
        html += `
            <div class="facilities-card">
                <h3>${school.name_vn}</h3>
                <div class="facilities-info">
                    <div class="facility-item">
                        <i class="fas fa-building"></i>
                        <span>Cơ sở vật chất: ${school.tag === 'outstanding' ? 'Hiện đại' : 'Tốt'}</span>
                    </div>
                    <div class="facility-item">
                        <i class="fas fa-book"></i>
                        <span>Thư viện: ${school.tag === 'outstanding' ? 'Phong phú' : 'Đầy đủ'}</span>
                    </div>
                    <div class="facility-item">
                        <i class="fas fa-microscope"></i>
                        <span>Phòng thí nghiệm: ${school.tag === 'outstanding' ? 'Tiên tiến' : 'Cơ bản'}</span>
                    </div>
                    <div class="facility-item">
                        <i class="fas fa-wifi"></i>
                        <span>WiFi: ${school.tag === 'outstanding' ? 'Tốc độ cao' : 'Ổn định'}</span>
                    </div>
                    <div class="facility-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Vị trí: ${school.country || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    facilitiesComparison.innerHTML = html;
}

// Generate admission comparison
function generateAdmissionComparison() {
    console.log('🎓 Generating admission comparison...');
    
    const admissionComparison = document.getElementById('admissionComparison');
    if (!admissionComparison) return;
    
    let html = '';
    selectedSchools.forEach(school => {
        html += `
            <div class="admission-card">
                <h3>${school.name_vn}</h3>
                <div class="admission-info">
                    <div class="admission-item">
                        <span class="admission-label">Chỉ tiêu tuyển sinh:</span>
                        <span class="admission-value">${school.quota_per_year || 'N/A'} sinh viên/năm</span>
                    </div>
                    <div class="admission-item">
                        <span class="admission-label">Điểm chuẩn dự kiến:</span>
                        <span class="admission-value">${school.benchmark_min || 'N/A'} - ${school.benchmark_max || 'N/A'}</span>
                    </div>
                    <div class="admission-item">
                        <span class="admission-label">Học phí:</span>
                        <span class="admission-value">${formatTuition(school.start, school.end)}</span>
                    </div>
                    <div class="admission-item">
                        <span class="admission-label">Liên hệ:</span>
                        <span class="admission-value">${school.phone_number || 'N/A'}</span>
                    </div>
                    <div class="admission-item">
                        <span class="admission-label">Email:</span>
                        <span class="admission-value">${school.email || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    admissionComparison.innerHTML = html;
}

// Update table headers
function updateTableHeaders() {
    const headers = ['school1Header', 'school2Header', 'school3Header'];
    headers.forEach((headerId, index) => {
        const headerElement = document.getElementById(headerId);
        if (headerElement) {
            if (selectedSchools[index]) {
                headerElement.textContent = selectedSchools[index].name_vn;
            } else {
                headerElement.textContent = `Trường ${index + 1}`;
            }
        }
    });
}

// Format tuition
function formatTuition(start, end) {
    if (!start && !end) return 'Chưa có thông tin';
    if (start === 0 && end === 0) return 'Thường miễn phí';
    
    const formatAmount = (amount) => {
        if (!amount || amount === 0) return 'Miễn phí';
        const millions = amount / 1000000;
        return `${millions.toFixed(1)} triệu`;
    };
    
    if (start && end && start !== end) {
        return `${formatAmount(start)} - ${formatAmount(end)}/năm`;
    } else if (start) {
        return `${formatAmount(start)}/năm`;
    } else if (end) {
        return `${formatAmount(end)}/năm`;
    }
    
    return 'Chưa có thông tin';
}

// Focus search input
function focusSearch() {
    console.log('🎯 Focusing search input...');
    if (schoolSearchInput) {
        schoolSearchInput.focus();
        console.log('✅ Search input focused');
        
        // Add a small visual feedback
        schoolSearchInput.style.borderColor = '#667eea';
        schoolSearchInput.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
        
        // Reset after 1 second
        setTimeout(() => {
            schoolSearchInput.style.borderColor = '';
            schoolSearchInput.style.boxShadow = '';
        }, 1000);
    } else {
        console.error('❌ schoolSearchInput element not found');
    }
}

// Initialize tabs
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// LocalStorage functions
function loadComparisonFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);
        
        if (data && expiry) {
            const now = new Date().getTime();
            const expiryTime = parseInt(expiry);
            
            if (now < expiryTime) {
                selectedSchools = JSON.parse(data);
                console.log('✅ Loaded comparison from storage:', selectedSchools.length);
                return;
            }
        }
        
        // Clear expired data
        clearComparisonStorage();
    } catch (error) {
        console.error('❌ Error loading from storage:', error);
        clearComparisonStorage();
    }
}

function saveComparisonToStorage() {
    try {
        const expiry = new Date().getTime() + (60 * 60 * 1000); // 1 hour
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedSchools));
        localStorage.setItem(STORAGE_EXPIRY_KEY, expiry.toString());
        console.log('✅ Saved comparison to storage');
    } catch (error) {
        console.error('❌ Error saving to storage:', error);
    }
}

function clearComparisonStorage() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXPIRY_KEY);
    selectedSchools = [];
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add comparison button to other pages
function addComparisonButton() {
    // This function can be called from other pages to add a comparison button
    const comparisonBtn = document.createElement('button');
    comparisonBtn.className = 'comparison-btn';
    comparisonBtn.innerHTML = '<i class="fas fa-balance-scale"></i> So sánh trường';
    comparisonBtn.onclick = () => window.location.href = '/so-sanh-truong';
    
    return comparisonBtn;
}

// Export for use in other scripts
window.SchoolComparison = {
    addComparisonButton
};

console.log('📚 School Comparison module loaded successfully');