// Global variables
let selectedMajors = [];
let searchResults = [];
let allMajors = [];

// Storage keys
const STORAGE_KEY = 'major_comparison_data';
const STORAGE_EXPIRY_KEY = 'major_comparison_expiry';

// Load comparison data from localStorage
function loadComparisonFromStorage() {
    try {
        const expiryTime = localStorage.getItem(STORAGE_EXPIRY_KEY);
        const currentTime = Date.now();
        
        // Check if data has expired (1 hour = 3600000 milliseconds)
        if (expiryTime && currentTime > parseInt(expiryTime)) {
            console.log('🗑️ Comparison data has expired, clearing storage');
            clearComparisonStorage();
            return false;
        }
        
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            selectedMajors = parsedData.selectedMajors || [];
            console.log('📥 Loaded comparison data from storage:', selectedMajors.length, 'majors');
            return true;
        }
    } catch (error) {
        console.error('❌ Error loading comparison data from storage:', error);
        clearComparisonStorage();
    }
    return false;
}

// Save comparison data to localStorage
function saveComparisonToStorage() {
    try {
        const dataToSave = {
            selectedMajors: selectedMajors,
            timestamp: Date.now()
        };
        
        // Set expiry time to 1 hour from now
        const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour in milliseconds
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        localStorage.setItem(STORAGE_EXPIRY_KEY, expiryTime.toString());
        
        console.log('💾 Saved comparison data to storage:', selectedMajors.length, 'majors');
        console.log('⏰ Data will expire at:', new Date(expiryTime).toLocaleString());
    } catch (error) {
        console.error('❌ Error saving comparison data to storage:', error);
    }
}

// Clear comparison data from localStorage
function clearComparisonStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_EXPIRY_KEY);
        console.log('🗑️ Cleared comparison data from storage');
    } catch (error) {
        console.error('❌ Error clearing comparison data from storage:', error);
    }
}

// DOM elements (will be initialized in DOMContentLoaded)
let majorSearchInput;
let searchResultsDiv;
let comparisonResults;
let emptyState;
let majorModal;
let majorList;

// Initialize the comparison feature
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing comparison feature...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize functionality
    initializeComparison();
    loadAllMajors();
});

// Initialize DOM elements
function initializeDOMElements() {
    console.log('🔧 Initializing DOM elements...');
    
    // Initialize DOM elements
    majorSearchInput = document.getElementById('majorSearch');
    searchResultsDiv = document.getElementById('searchResults');
    comparisonResults = document.getElementById('comparisonResults');
    emptyState = document.getElementById('emptyState');
    
    if (!majorSearchInput || !searchResultsDiv) {
        console.error('❌ Required DOM elements not found!');
        return;
    }
    
    // Search functionality
    console.log('🔍 Setting up search event listeners...');
    
    // Create debounced search function
    const debouncedSearch = debounce(handleSearch, 300);
    
    // Test if event listener is working
    majorSearchInput.addEventListener('input', function(e) {
        console.log('🎯 Input event triggered:', e.target.value);
        debouncedSearch();
    });
    
    majorSearchInput.addEventListener('focus', function() {
        console.log('🎯 Focus event triggered');
        if (majorSearchInput.value.trim().length >= 2) {
            showSearchResults();
        }
    });
    
    console.log('✅ Search functionality initialized');
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!majorSearchInput.contains(e.target) && !searchResultsDiv.contains(e.target)) {
            hideSearchResults();
        }
    });
    
    console.log('✅ DOM elements initialized');
}

// Initialize comparison functionality
function initializeComparison() {
    console.log('🚀 Initializing comparison feature...');
    
    // Load comparison data from storage
    const hasStoredData = loadComparisonFromStorage();
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Load all majors
    loadAllMajors();
    
    // Initialize tabs and modal
    initializeTabs();
    initializeModal();
    
    // If we have stored data, update UI
    if (hasStoredData && selectedMajors.length > 0) {
        console.log('🔄 Restoring comparison UI from storage');
        updateComparisonUI();
    }
    
    console.log('✅ Comparison feature initialized');
}

// Load all majors for search
async function loadAllMajors() {
    try {
        console.log('📚 Loading all majors for comparison...');
        
        // Thử nhiều API khác nhau để lấy dữ liệu
        const apis = [
            'https://timtruonghoc.pythonanywhere.com/all_major/all_for_comparison/',
            'https://timtruonghoc.pythonanywhere.com/all_major/',
            'https://timtruonghoc.pythonanywhere.com/all_major_has_pagi/?page_size=1000',
            'https://timtruonghoc.pythonanywhere.com/all_major_has_pagi/'
        ];
        
        let success = false;
        
        for (let i = 0; i < apis.length; i++) {
            const apiUrl = apis[i];
            console.log(`🌐 Trying API ${i + 1}: ${apiUrl}`);
            
            try {
                const response = await fetch(apiUrl);
                console.log(`📡 Response status for API ${i + 1}:`, response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`📦 Raw response data from API ${i + 1}:`, data);
                    
                    // Xử lý các format khác nhau
                    if (data.results && Array.isArray(data.results)) {
                        allMajors = data.results;
                        console.log(`✅ API ${i + 1} loaded ${allMajors.length} majors (results format)`);
                    } else if (Array.isArray(data)) {
                        allMajors = data;
                        console.log(`✅ API ${i + 1} loaded ${allMajors.length} majors (array format)`);
                    } else {
                        console.log(`⚠️ API ${i + 1} returned unexpected format:`, typeof data);
                        continue;
                    }
                    
                    success = true;
                    break;
                } else {
                    console.error(`❌ API ${i + 1} failed:`, response.status);
                }
            } catch (error) {
                console.error(`❌ Error with API ${i + 1}:`, error);
            }
        }
        
        if (!success) {
            throw new Error('All APIs failed');
        }
        
        // Log first few majors for debugging
        if (allMajors.length > 0) {
            console.log('📋 Sample majors:');
            allMajors.slice(0, 5).forEach((major, index) => {
                console.log(`  ${index + 1}. ${major.name} (${major.all_major_id})`);
            });
        }
        
        // Test search functionality
        console.log('🧪 Testing search functionality...');
        if (allMajors.length > 0) {
            const testQuery = 'công nghệ';
            const testFiltered = allMajors.filter(major => 
                major.name.toLowerCase().includes(testQuery.toLowerCase()) ||
                major.all_major_id.includes(testQuery)
            );
            console.log(`🧪 Test search for "${testQuery}": ${testFiltered.length} results`);
            
            const testQuery2 = 'quan';
            const testFiltered2 = allMajors.filter(major => 
                major.name.toLowerCase().includes(testQuery2.toLowerCase()) ||
                major.all_major_id.includes(testQuery2)
            );
            console.log(`🧪 Test search for "${testQuery2}": ${testFiltered2.length} results`);
        }
        
    } catch (error) {
        console.error('❌ Error loading majors:', error);
        console.error('❌ Error details:', error.message);
        
        // Use sample data as last resort
        console.log('🔄 Using sample data as fallback...');
        allMajors = [
            {
                all_major_id: '7480101',
                name: 'Công nghệ thông tin',
                opportunities: 95,
                training_duration: '4 năm',
                salary: '15-30+ triệu',
                tuition_fee_per_year: '15-25 triệu'
            },
            {
                all_major_id: '7340101',
                name: 'Quản trị kinh doanh',
                opportunities: 85,
                training_duration: '4 năm',
                salary: '12-25 triệu',
                tuition_fee_per_year: '12-20 triệu'
            },
            {
                all_major_id: '7720101',
                name: 'Y khoa',
                opportunities: 98,
                training_duration: '6 năm',
                salary: '20-50+ triệu',
                tuition_fee_per_year: '25-40 triệu'
            },
            {
                all_major_id: '7220201',
                name: 'Kỹ thuật xây dựng',
                opportunities: 80,
                training_duration: '4 năm',
                salary: '12-25 triệu',
                tuition_fee_per_year: '12-20 triệu'
            },
            {
                all_major_id: '7340301',
                name: 'Kế toán',
                opportunities: 90,
                training_duration: '4 năm',
                salary: '10-25 triệu',
                tuition_fee_per_year: '10-18 triệu'
            }
        ];
        console.log('✅ Sample data loaded as fallback');
    }
}

// Handle search input
function handleSearch() {
    const query = majorSearchInput.value.trim();
    console.log('🔍 Search query:', query);
    
    if (query.length < 2) {
        console.log('⚠️ Query too short, hiding results');
        hideSearchResults();
        return;
    }
    
    console.log('📚 Filtering majors...');
    console.log('📊 Total majors available:', allMajors.length);
    
    // Improved search: search in name, major_id, and field name
    const filtered = allMajors.filter(major => {
        const searchText = query.toLowerCase();
        const majorName = (major.name || '').toLowerCase();
        const majorId = (major.all_major_id || '').toLowerCase();
        const fieldName = (major.field?.name || '').toLowerCase();
        
        return majorName.includes(searchText) || 
               majorId.includes(searchText) || 
               fieldName.includes(searchText);
    }).slice(0, 10); // Limit to 10 results
    
    console.log('✅ Filtered results:', filtered.length);
    console.log('📋 Filtered majors:', filtered.map(m => `${m.name} (${m.all_major_id})`));
    
    displaySearchResults(filtered);
}

// Display search results
function displaySearchResults(results) {
    console.log('📋 Displaying search results:', results.length);
    
    // Save results for selection
    searchResults = results;
    
    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<div class="no-results">Không tìm thấy ngành học phù hợp</div>';
        return;
    }
    
    const resultsHTML = results.map((major, index) => {
        const fieldName = major.field?.name || 'Chưa phân loại';
        
        return `
            <div class="search-result-item" onclick="selectMajor(${index})">
                <div class="search-result-logo">
                    ${(major.name || '').substring(0, 2).toUpperCase()}
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${major.name || ''}</div>
                    <div class="search-result-details">
                        <div>Mã: ${major.all_major_id || ''}  -  Lĩnh vực: ${fieldName || ''}</div>
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
    if (searchResults.length > 0) {
        searchResultsDiv.style.display = 'block';
        console.log('👁️ Search results shown');
    }
}

// Hide search results
function hideSearchResults() {
    searchResultsDiv.style.display = 'none';
    console.log('🙈 Search results hidden');
}

// Select a major
async function selectMajor(index) {
    console.log('🎯 Selecting major at index:', index);
    
    if (selectedMajors.length >= 3) {
        alert('Bạn đã chọn tối đa 3 ngành để so sánh. Vui lòng xóa một ngành trước khi thêm ngành mới.');
        return;
    }
    
    if (index >= 0 && index < searchResults.length) {
        const major = searchResults[index];
        console.log('📋 Selected major:', major);
        
        // Check if major is already selected
        const isAlreadySelected = selectedMajors.some(selected => selected.all_major_id === major.all_major_id);
        if (isAlreadySelected) {
            alert('Ngành này đã được chọn. Vui lòng chọn ngành khác.');
            return;
        }
        
        selectedMajors.push(major);
        console.log('✅ Added to selected majors. Total:', selectedMajors.length);
        
        // Save to localStorage
        saveComparisonToStorage();
        
        // Update UI
        await updateComparisonUI();
        
        // Hide search results
        hideSearchResults();
        
        // Clear search input
        majorSearchInput.value = '';
    }
}

// Update comparison UI
async function updateComparisonUI() {
    console.log('🔄 Updating comparison UI...');
    
    // Update slots
    updateSlots();
    
    // Show/hide comparison results
    if (selectedMajors.length >= 2) {
        comparisonResults.style.display = 'block';
        emptyState.style.display = 'none';
        await generateComparison();
    } else {
        comparisonResults.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    console.log('✅ Comparison UI updated');
}

// Update comparison slots
function updateSlots() {
    const slots = ['slot1', 'slot2', 'slot3'];
    
    slots.forEach((slotId, index) => {
        const slot = document.getElementById(slotId);
        
        if (selectedMajors[index]) {
            const major = selectedMajors[index];
            slot.innerHTML = `
                <div class="major-card">
                    <button class="remove-major" onclick="removeMajor(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="major-card-header">
                        <img src="${major.cover || '/static/images/nganh/anh01.png'}" 
                             alt="${major.name || ''}" 
                             class="major-logo"
                             onerror="this.src='/static/images/nganh/anh01.png'">
                        <div class="major-info">
                            <h4>${major.name || ''}</h4>
                            <div class="major-code">${major.all_major_id || ''}</div>
                        </div>
                    </div>
                </div>
            `;
            // Remove onclick for filled slots
            slot.onclick = null;
            slot.style.cursor = 'default';
        } else {
            slot.innerHTML = `
                <div class="slot-placeholder">
                    <i class="fas fa-plus-circle"></i>
                    <p>Thêm ngành thứ ${index + 1}</p>
                </div>
            `;
            // Add onclick for empty slots
            slot.onclick = focusSearch;
            slot.style.cursor = 'pointer';
        }
    });
}

// Remove major from comparison
async function removeMajor(index) {
    selectedMajors.splice(index, 1);
    
    // Save to storage
    saveComparisonToStorage();
    
    await updateComparisonUI();
    console.log('🗑️ Removed major from comparison');
}

// Generate all comparison data
async function generateComparison() {
    console.log('🚀 Starting comparison generation...');
    console.log('📊 Selected majors:', selectedMajors);
    
    try {
        generateQuickStats();
        generateOverviewComparison();
        generateCareerComparison();
        generateCurriculumComparison();
        await generateSchoolsComparison();
        
        console.log('✅ All comparison data generated successfully');
    } catch (error) {
        console.error('❌ Error generating comparison:', error);
    }
}

// Generate quick stats comparison
function generateQuickStats() {
    console.log('🔄 Generating quick stats...');
    
    // Update opportunity stats
    const opportunityStats = document.getElementById('opportunityStats');
    const opportunityBest = document.getElementById('opportunityBest');
    
    if (opportunityStats && opportunityBest) {
        let statsHTML = '';
        const opportunities = selectedMajors.map(major => ({
            name: major.name,
            value: getNestedValue(major, 'opportunities') || 'N/A'
        }));
        
        opportunities.forEach(item => {
            statsHTML += `
                <div class="stat-item">
                    <span class="stat-label">${item.name || ''}</span>
                    <span class="stat-value">${item.value}/100</span>
                </div>
            `;
        });
        
        opportunityStats.innerHTML = statsHTML;
        
        // Find best opportunity
        const numericValues = opportunities
            .map(item => parseInt(item.value))
            .filter(val => !isNaN(val));
        
        if (numericValues.length > 0) {
            const max = Math.max(...numericValues);
            opportunityBest.innerHTML = `Tốt nhất: ${max}/100`;
        }
    }
    
    // Update duration stats
    const durationStats = document.getElementById('durationStats');
    if (durationStats) {
        let statsHTML = '';
        selectedMajors.forEach(major => {
            const duration = getNestedValue(major, 'training_duration') || 'N/A';
            statsHTML += `
                <div class="stat-item">
                    <span class="stat-label">${major.name || ''}</span>
                    <span class="stat-value">${duration} năm</span>
                </div>
            `;
        });
        durationStats.innerHTML = statsHTML;
    }
    
    // Update salary stats
    const salaryStats = document.getElementById('salaryStats');
    if (salaryStats) {
        let statsHTML = '';
        selectedMajors.forEach(major => {
            const salary = getNestedValue(major, 'salary') || 'N/A';
            statsHTML += `
                <div class="stat-item">
                    <span class="stat-label">${major.name || ''}</span>
                    <span class="stat-value">${salary}</span>
                </div>
            `;
        });
        salaryStats.innerHTML = statsHTML;
    }
    
    // Update tuition stats
    const tuitionStats = document.getElementById('tuitionStats');
    if (tuitionStats) {
        let statsHTML = '';
        selectedMajors.forEach(major => {
            const tuition = getNestedValue(major, 'tuition_fee_per_year') || 'N/A';
            statsHTML += `
                <div class="stat-item">
                    <span class="stat-label">${major.name || ''}</span>
                    <span class="stat-value">${tuition}</span>
                </div>
            `;
        });
        tuitionStats.innerHTML = statsHTML;
    }
    
    console.log('✅ Quick stats generated');
}

// Generate overview comparison table
function generateOverviewComparison() {
    console.log('🔄 Generating overview comparison...');
    
    const overviewTableBody = document.getElementById('overviewTableBody');
    const major1Header = document.getElementById('major1Header');
    const major2Header = document.getElementById('major2Header');
    const major3Header = document.getElementById('major3Header');
    
    if (!overviewTableBody) {
        console.error('❌ overviewTableBody not found');
        return;
    }
    
    // Update headers
    if (major1Header && selectedMajors[0]) {
        major1Header.textContent = selectedMajors[0].name || '';
    }
    if (major2Header && selectedMajors[1]) {
        major2Header.textContent = selectedMajors[1].name || '';
    }
    if (major3Header && selectedMajors[2]) {
        major3Header.textContent = selectedMajors[2].name || '';
        major3Header.style.display = 'block';
    } else if (major3Header) {
        major3Header.style.display = 'none';
    }
    
    const overviewData = [
        { label: 'Tên ngành', key: 'name' },
        { label: 'Mã ngành', key: 'all_major_id' },
        { label: 'Lĩnh vực', key: 'field.name' },
        { label: 'Mô tả ngắn', key: 'short_description' },
        { label: 'Thời gian đào tạo', key: 'training_duration', suffix: ' năm' },
        { label: 'Cơ hội việc làm', key: 'opportunities', suffix: '/100' },
        { label: 'Thu nhập trung bình', key: 'salary' },
        { label: 'Học phí', key: 'tuition_fee_per_year' }
    ];
    
    // Utility function để decode HTML entities và loại bỏ HTML tags
    function cleanHtmlText(text) {
        if (!text) return '';
        
        // Tạo một element tạm để decode HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        
        // Lấy text content (loại bỏ HTML tags)
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Loại bỏ các ký tự xuống dòng và khoảng trắng thừa
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        return cleanText;
    }

    let tableHTML = '';
    
    overviewData.forEach(item => {
        tableHTML += '<div class="table-row">';
        tableHTML += `<div class="table-cell criteria">${item.label}</div>`;
        
        selectedMajors.forEach(major => {
            let value = getNestedValue(major, item.key);
            
            // Clean HTML text for short_description
            if (item.key === 'short_description') {
                value = cleanHtmlText(value);
            }
            
            if (item.suffix) value += item.suffix;
            if (!value || value === 'undefined' || value === 'null') value = 'N/A';
            
            tableHTML += `<div class="table-cell value">${value}</div>`;
        });
        
        // Add empty cells if less than 3 majors
        for (let i = selectedMajors.length; i < 3; i++) {
            tableHTML += '<div class="table-cell value">-</div>';
        }
        
        tableHTML += '</div>';
    });
    
    overviewTableBody.innerHTML = tableHTML;
    console.log('✅ Overview comparison generated');
}

// Generate career comparison
function generateCareerComparison() {
    console.log('🔄 Generating career comparison...');
    
    const careerComparison = document.getElementById('careerComparison');
    if (!careerComparison) {
        console.error('❌ careerComparison not found');
        return;
    }
    
    let careerHTML = '';
    
    selectedMajors.forEach(major => {
        const jobInfo = getNestedValue(major, 'job') || 'Chưa có thông tin';
        const opportunities = getNestedValue(major, 'career_opportunities') || jobInfo;
        
        careerHTML += `
            <div class="career-card">
                <h3>${major.name || ''}</h3>
                <div class="career-opportunities">
                    ${opportunities.split(/[,;]/).map(opp => 
                        `<div class="career-opportunity">${opp.trim()}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    careerComparison.innerHTML = careerHTML;
    console.log('✅ Career comparison generated');
}

// Generate curriculum comparison
function generateCurriculumComparison() {
    console.log('🔄 Generating curriculum comparison...');
    
    const curriculumComparison = document.getElementById('curriculumComparison');
    if (!curriculumComparison) {
        console.error('❌ curriculumComparison not found');
        return;
    }
    
    let curriculumHTML = '';
    
    selectedMajors.forEach(major => {
        let curriculum = getNestedValue(major, 'program') || 'Chưa có thông tin';
        
        // Thêm xuống dòng khi gặp dấu ':', '.', '...'
        curriculum = curriculum.replace(/:/g, ':<br>');
        curriculum = curriculum.replace(/\.\.\./g, '...<br>');
        curriculum = curriculum.replace(/\./g, '.<br>');
        
        // In đậm các dòng chứa từ khóa đặc biệt hoặc dấu ':'
        const lines = curriculum.split('<br>');
        const formattedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('Chương trình') || 
                trimmedLine.includes('Kiến thức đại cương') ||
                trimmedLine.includes('Kiến thức cơ sở ngành') ||
                trimmedLine.includes('Kiến thức chuyên ngành') ||
                trimmedLine.includes(':')) {
                return `<strong>${line}</strong>`;
            }
            return line;
        });
        
        curriculum = formattedLines.join('<br>');
        
        curriculumHTML += `
            <div class="curriculum-card">
                <h3>${major.name || ''}</h3>
                <div class="curriculum-content">
                    ${curriculum}
                </div>
            </div>
        `;
    });
    
    curriculumComparison.innerHTML = curriculumHTML;
    console.log('✅ Curriculum comparison generated');
}

// Generate schools comparison
async function generateSchoolsComparison() {
    console.log('🔄 Generating schools comparison...');
    
    const schoolsComparison = document.getElementById('schoolsComparison');
    if (!schoolsComparison) {
        console.error('❌ schoolsComparison not found');
        return;
    }
    
    let schoolsHTML = '';
    
    for (const major of selectedMajors) {
        try {
            const schools = await loadSchoolsForMajor(major.all_major_id);
            
            // Sắp xếp: trường outstanding trước, sau đó theo tên
            const sortedSchools = schools.sort((a, b) => {
                // Ưu tiên trường outstanding
                if (a.tag === 'outstanding' && b.tag !== 'outstanding') return -1;
                if (a.tag !== 'outstanding' && b.tag === 'outstanding') return 1;
                
                // Sau đó theo tên trường
                return a.name.localeCompare(b.name);
            });
            
            schoolsHTML += `
                <div class="schools-card">
                    <h3>${major.name || ''}</h3>
                    <div class="schools-list" id="schools-list-${major.all_major_id || ''}">
                        ${sortedSchools.slice(0, 5).map(school => {
                            // Format học phí
                            const formatTuition = (min, max) => {
                                if (!min && !max) return 'N/A';
                                
                                const minValue = min ? Math.floor(parseInt(min) / 1000000) : 0;
                                const maxValue = max ? Math.floor(parseInt(max) / 1000000) : 0;
                                
                                if (minValue === 0 && maxValue === 0) return 'N/A';
                                if (minValue === maxValue) return `${minValue} triệu/năm`;
                                if (maxValue === 0) return `${minValue}+ triệu/năm`;
                                return `${minValue}-${maxValue} triệu/năm`;
                            };
                            
                            return `
                                <div class="school-item ${school.tag === 'outstanding' ? 'outstanding' : ''}" onclick="goToSchoolMajor('${school.short_code || ''}', '${major.all_major_id || ''}')" style="cursor: pointer;">
                                    <div class="school-logo">
                                        ${school.logo ? 
                                            `<img src="${school.logo}" alt="${school.name || ''}" onerror="this.parentElement.innerHTML='${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}'">` :
                                            `${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}`
                                        }
                                    </div>
                                    <div class="school-info">
                                        <div class="school-name">${school.name || ''}</div>
                                        <div class="school-details">
                                            Mã: ${school.short_code || ''} | Học phí: ${formatTuition(school.tuition_min, school.tuition_max)}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    ${sortedSchools.length > 5 ? `
                        <div class="schools-controls">
                            <div class="more-schools" onclick="toggleAllSchools('${major.all_major_id || ''}', ${JSON.stringify(sortedSchools).replace(/"/g, '&quot;')})">
                                Và ${sortedSchools.length - 5} trường khác...
                            </div>
                            <div class="less-schools" onclick="toggleLessSchools('${major.all_major_id}')" style="display: none;">
                                Thu gọn danh sách
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } catch (error) {
            console.error('Error loading schools for major:', major.name || '', error);
            schoolsHTML += `
                <div class="schools-card">
                    <h3>${major.name || ''}</h3>
                    <p>Không thể tải thông tin trường đào tạo</p>
                </div>
            `;
        }
    }
    
    schoolsComparison.innerHTML = schoolsHTML;
    console.log('✅ Schools comparison generated');
}

// Toggle hiển thị tất cả trường
function toggleAllSchools(majorId, allSchools) {
    console.log('🔄 Showing all schools for major:', majorId);
    
    const schoolsList = document.getElementById(`schools-list-${majorId}`);
    const moreSchools = schoolsList.parentElement.querySelector('.more-schools');
    const lessSchools = schoolsList.parentElement.querySelector('.less-schools');
    
    if (!schoolsList) return;
    
    // Format học phí function
    const formatTuition = (min, max) => {
        if (!min && !max) return 'N/A';
        
        const minValue = min ? Math.floor(parseInt(min) / 1000000) : 0;
        const maxValue = max ? Math.floor(parseInt(max) / 1000000) : 0;
        
        if (minValue === 0 && maxValue === 0) return 'N/A';
        if (minValue === maxValue) return `${minValue} triệu/năm`;
        if (maxValue === 0) return `${minValue}+ triệu/năm`;
        return `${minValue}-${maxValue} triệu/năm`;
    };
    
    // Hiển thị tất cả trường
    const allSchoolsHTML = allSchools.map(school => `
        <div class="school-item ${school.tag === 'outstanding' ? 'outstanding' : ''}" onclick="goToSchoolMajor('${school.short_code || ''}', '${majorId || ''}')" style="cursor: pointer;">
            <div class="school-logo">
                ${school.logo ? 
                    `<img src="${school.logo}" alt="${school.name || ''}" onerror="this.parentElement.innerHTML='${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}'">` :
                    `${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}`
                }
            </div>
            <div class="school-info">
                <div class="school-name">${school.name || ''}</div>
                <div class="school-details">
                    Mã: ${school.short_code || ''} | Học phí: ${formatTuition(school.tuition_min, school.tuition_max)}
                </div>
            </div>
        </div>
    `).join('');
    
    schoolsList.innerHTML = allSchoolsHTML;
    
    // Ẩn "Và X trường khác", hiện "Thu gọn danh sách"
    moreSchools.style.display = 'none';
    lessSchools.style.display = 'block';
    
    console.log('✅ All schools displayed');
}

// Thu gọn danh sách trường
function toggleLessSchools(majorId) {
    console.log('🔄 Collapsing schools list for major:', majorId);
    
    const schoolsList = document.getElementById(`schools-list-${majorId}`);
    const moreSchools = schoolsList.parentElement.querySelector('.more-schools');
    const lessSchools = schoolsList.parentElement.querySelector('.less-schools');
    
    if (!schoolsList) return;
    
    // Reload schools data để hiển thị lại 5 trường đầu
    loadSchoolsForMajor(majorId).then(schools => {
        const formatTuition = (min, max) => {
            if (!min && !max) return 'N/A';
            
            const minValue = min ? Math.floor(parseInt(min) / 1000000) : 0;
            const maxValue = max ? Math.floor(parseInt(max) / 1000000) : 0;
            
            if (minValue === 0 && maxValue === 0) return 'N/A';
            if (minValue === maxValue) return `${minValue} triệu/năm`;
            if (maxValue === 0) return `${minValue}+ triệu/năm`;
            return `${minValue}-${maxValue} triệu/năm`;
        };
        
        // Hiển thị lại 5 trường đầu
        const first5SchoolsHTML = schools.slice(0, 5).map(school => `
            <div class="school-item" onclick="goToSchoolMajor('${school.short_code || ''}', '${majorId || ''}')" style="cursor: pointer;">
                <div class="school-logo">
                    ${school.logo ? 
                        `<img src="${school.logo}" alt="${school.name || ''}" onerror="this.parentElement.innerHTML='${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}'">` :
                        `${school.short_code ? school.short_code.substring(0, 2).toUpperCase() : 'TR'}`
                    }
                </div>
                <div class="school-info">
                    <div class="school-name">${school.name || ''}</div>
                    <div class="school-details">
                        Mã: ${school.short_code || ''} | Học phí: ${formatTuition(school.tuition_min, school.tuition_max)}
                    </div>
                </div>
            </div>
        `).join('');
        
        schoolsList.innerHTML = first5SchoolsHTML;
        
        // Hiện "Và X trường khác", ẩn "Thu gọn danh sách"
        moreSchools.style.display = 'block';
        lessSchools.style.display = 'none';
        
        console.log('✅ Schools list collapsed');
    });
}

// Điều hướng đến trang chi tiết ngành của trường
function goToSchoolMajor(schoolShortCode, majorId) {
    console.log('🎯 Navigating to school major:', schoolShortCode, majorId);
    
    // Tìm major trong selectedMajors để lấy thông tin chi tiết
    const major = selectedMajors.find(m => m.all_major_id === majorId);
    if (!major) {
        console.error('❌ Major not found:', majorId);
        return;
    }
    
    // Tạo URL với format đúng cho trang chi tiết ngành riêng
    // Sử dụng major_id thực tế thay vì ID tự sinh
    const url = `/chitiet-nganh-rieng?major_id=${majorId}&school_short_code=${schoolShortCode}`;
    
    console.log('🔗 Navigating to:', url);
    
    // Chuyển hướng đến trang chi tiết ngành riêng
    window.location.href = url;
}

// Load schools for a specific major
async function loadSchoolsForMajor(majorId) {
    try {
        console.log('Loading schools for major:', majorId);
        
        // Sử dụng API hiện có: schools_teaching_major
        const apiUrl = `https://timtruonghoc.pythonanywhere.com/all_major/${majorId}/schools_teaching_major/`;
        console.log('API URL for schools:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.schools && data.schools.length > 0) {
            const suggestedSchools = data.schools.map(school => ({
                id: school.id,
                name: school.name,
                short_code: school.short_code,
                logo: school.logo,
                school_type: school.school_type,
                country: school.country,
                tag: school.tag || 'none',
                admission_score: school.admission_score,
                score_year: school.score_year,
                tuition_min: school.tuition_min,
                tuition_max: school.tuition_max
            }));
            
            console.log('Suggested schools:', suggestedSchools);
            return suggestedSchools;
        } else {
            console.log('No schools found teaching this major');
            return [];
        }
    } catch (error) {
        console.error('Error loading schools:', error);
        return [];
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

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('majorModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Helper function to get nested object values
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

// Debounce function
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

// Add comparison button to other pages
function addComparisonButton() {
    // This function can be called from other pages to add a comparison button
    const comparisonBtn = document.createElement('button');
    comparisonBtn.className = 'comparison-btn';
    comparisonBtn.innerHTML = '<i class="fas fa-balance-scale"></i> So sánh';
    comparisonBtn.onclick = () => window.location.href = '/so-sanh-nganh';
    
    // Add to page
    document.body.appendChild(comparisonBtn);
}

// Test function to check if everything is working
function testComparisonFeature() {
    console.log('🧪 Testing comparison feature...');
    
    // Check DOM elements
    console.log('🔍 DOM Elements check:');
    console.log('- majorSearchInput:', majorSearchInput ? '✅ Found' : '❌ Not found');
    console.log('- searchResultsDiv:', searchResultsDiv ? '✅ Found' : '❌ Not found');
    // The addMajorBtn element was removed, so this check is no longer needed.
    
    // Check data
    console.log('📊 Data check:');
    console.log('- allMajors length:', allMajors.length);
    console.log('- selectedMajors length:', selectedMajors.length);
    console.log('- searchResults length:', searchResults.length);
    
    // Test search input
    if (majorSearchInput) {
        console.log('🔍 Testing search input...');
        
        // Test 1: Search for "công nghệ"
        console.log('🧪 Test 1: Searching for "công nghệ"');
        majorSearchInput.value = 'công nghệ';
        majorSearchInput.dispatchEvent(new Event('input'));
        
        // Test 2: Search for "quan"
        setTimeout(() => {
            console.log('🧪 Test 2: Searching for "quan"');
            majorSearchInput.value = 'quan';
            majorSearchInput.dispatchEvent(new Event('input'));
        }, 1000);
        
        // Test 3: Search for "y"
        setTimeout(() => {
            console.log('🧪 Test 3: Searching for "y"');
            majorSearchInput.value = 'y';
            majorSearchInput.dispatchEvent(new Event('input'));
        }, 2000);
        
        console.log('✅ Search input test completed');
    }
    
    // Test with sample data if no data loaded
    if (allMajors.length === 0) {
        console.log('⚠️ No majors loaded, using sample data for testing...');
        allMajors = [
            {
                all_major_id: '7480101',
                name: 'Công nghệ thông tin',
                opportunities: 95,
                training_duration: '4 năm',
                salary: '15-30+ triệu',
                tuition_fee_per_year: '15-25 triệu',
                field: { name: 'Công nghệ thông tin' }
            },
            {
                all_major_id: '7340101',
                name: 'Quản trị kinh doanh',
                opportunities: 85,
                training_duration: '4 năm',
                salary: '12-25 triệu',
                tuition_fee_per_year: '12-20 triệu',
                field: { name: 'Kinh tế' }
            },
            {
                all_major_id: '7720101',
                name: 'Y khoa',
                opportunities: 98,
                training_duration: '6 năm',
                salary: '20-50+ triệu',
                tuition_fee_per_year: '25-40 triệu',
                field: { name: 'Y tế' }
            },
            {
                all_major_id: '7220201',
                name: 'Ngôn ngữ Anh',
                opportunities: 80,
                training_duration: '4 năm',
                salary: '12-25 triệu',
                tuition_fee_per_year: '12-18 triệu',
                field: { name: 'Xã hội - Giáo dục' }
            },
            {
                all_major_id: '7140201',
                name: 'Giáo dục Tiểu học',
                opportunities: 75,
                training_duration: '4 năm',
                salary: '10-20 triệu',
                tuition_fee_per_year: '8-15 triệu',
                field: { name: 'Xã hội - Giáo dục' }
            }
        ];
        console.log('✅ Sample data loaded for testing');
    }
}

// Manual test function for search
function testSearch(query) {
    console.log(`🧪 Manual search test for: "${query}"`);
    if (majorSearchInput) {
        majorSearchInput.value = query;
        majorSearchInput.dispatchEvent(new Event('input'));
    } else {
        console.error('❌ majorSearchInput element not found');
    }
}

// Focus search input function
function focusSearch() {
    console.log('🎯 Focusing search input...');
    if (majorSearchInput) {
        majorSearchInput.focus();
        console.log('✅ Search input focused');
        
        // Add a small visual feedback
        majorSearchInput.style.borderColor = '#667eea';
        majorSearchInput.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)';
        
        // Reset after 1 second
        setTimeout(() => {
            majorSearchInput.style.borderColor = '';
            majorSearchInput.style.boxShadow = '';
        }, 1000);
    } else {
        console.error('❌ majorSearchInput element not found');
    }
}

// Test placeholder function
function testPlaceholder() {
    console.log('🧪 Testing placeholder...');
    if (majorSearchInput) {
        console.log('✅ majorSearchInput element found');
        console.log('📝 Placeholder attribute:', majorSearchInput.getAttribute('placeholder'));
        console.log('📝 Current value:', majorSearchInput.value);
        try {
            console.log('📝 Computed placeholder color:', getComputedStyle(majorSearchInput, '::placeholder').color);
        } catch (error) {
            console.log('📝 Could not get placeholder color:', error.message);
        }
    } else {
        console.error('❌ majorSearchInput element not found');
    }
}

// Add test function to window for manual testing
window.testComparison = testComparisonFeature;
window.testSearch = testSearch;
window.testPlaceholder = testPlaceholder;
window.focusSearch = focusSearch;

// Export functions for use in other scripts
window.MajorComparison = {
    addMajor: selectMajor,
    removeMajor: removeMajor,
    getSelectedMajors: () => selectedMajors,
    addComparisonButton: addComparisonButton,
    test: testComparisonFeature,
    testSearch: testSearch,
    testPlaceholder: testPlaceholder,
    focusSearch: focusSearch
}; 