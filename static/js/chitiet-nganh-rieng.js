// Global variables
let currentMajor = null;
let currentSchool = null;
let generalMajorData = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing chi tiết ngành riêng page');
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const majorId = urlParams.get('major_id');
    const schoolId = urlParams.get('school_id');
    const schoolShortCode = urlParams.get('school_short_code');
    
    console.log('📋 URL Parameters:', { majorId, schoolId, schoolShortCode });
    
    if (!majorId) {
        showError('Thiếu thông tin mã ngành');
        return;
    }
    
    // Load data
    loadMajorData(majorId, schoolId, schoolShortCode);
});

// Load major data
async function loadMajorData(majorId, schoolId, schoolShortCode) {
    try {
        console.log('🔄 Loading major data...');
        
        // Load school data first
        await loadSchoolData(schoolId, schoolShortCode);
        
        // Load major data
        await loadMajorDetails(majorId);
        
        // Load general major data - sử dụng major_id từ currentMajor
        if (currentMajor && currentMajor.major_id) {
            await loadGeneralMajorData(currentMajor.major_id);
        } else {
            await loadGeneralMajorData(majorId);
        }
        
        // Load related schools - sử dụng major_id từ currentMajor
        if (currentMajor && currentMajor.major_id) {
            await loadRelatedSchools(currentMajor.major_id);
        } else {
            await loadRelatedSchools(majorId);
        }
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading major data:', error);
        showError('Không thể tải dữ liệu ngành');
    }
}

// Load school data
async function loadSchoolData(schoolId, schoolShortCode) {
    console.log('🏫 Loading school data...');
    
    let schoolUrl;
    if (schoolShortCode) {
        schoolUrl = `https://timtruonghoc.pythonanywhere.com/schools/by_short_code/${schoolShortCode}/`;
    } else if (schoolId) {
        schoolUrl = `https://timtruonghoc.pythonanywhere.com/schools/${schoolId}/`;
    } else {
        throw new Error('Missing school information');
    }
    
    const response = await fetch(schoolUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    currentSchool = await response.json();
    console.log('✅ School data loaded:', currentSchool);
    
    // Update school information in UI
    updateSchoolInfo();
}

// Load major details
async function loadMajorDetails(majorId) {
    console.log('📚 Loading major details...');
    
    const response = await fetch(`https://timtruonghoc.pythonanywhere.com/majors/${majorId}/`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    currentMajor = await response.json();
    console.log('✅ Major data loaded:', currentMajor);
    console.log('🔍 Major ID (primary key):', currentMajor.id);
    console.log('🔍 Major ID (major_id field):', currentMajor.major_id);
    console.log('🔍 Major name:', currentMajor.name);
    
    // Update major information in UI
    updateMajorInfo();
}

// Load general major data
async function loadGeneralMajorData(majorId) {
    console.log('📖 Loading general major data...');
    console.log('🔍 Major ID to search:', majorId);
    console.log('🔍 Current major name:', currentMajor?.name);
    
    // Thử nhiều cách khác nhau để lấy dữ liệu ngành chung
    
    // Cách 1: Tìm theo mã ngành riêng chính xác
    let response = await fetch(`https://timtruonghoc.pythonanywhere.com/all_major/?all_major_id=${majorId}`);
    console.log('🔍 Method 1 - Exact major ID status:', response.status);
    
    if (response.ok) {
        const data = await response.json();
        console.log('🔍 Method 1 response:', data);
        if (data.results && data.results.length > 0) {
            const foundMajor = data.results[0];
            console.log('🔍 Found major in Method 1:', foundMajor.name, 'ID:', foundMajor.all_major_id);
            // Kiểm tra xem có đúng ngành không
            if (foundMajor.all_major_id === majorId || foundMajor.name === currentMajor?.name) {
                generalMajorData = foundMajor;
                console.log('✅ General major data loaded (Method 1):', generalMajorData);
                updateGeneralInfo();
                return;
            } else {
                console.log('⚠️ Method 1 found wrong major, trying next method...');
            }
        }
    }
    
    // Cách 2: Tìm theo tên ngành chính xác (ưu tiên cao hơn baseMajorId)
    if (currentMajor && currentMajor.name) {
        console.log('🔍 Trying to search by exact name:', currentMajor.name);
        response = await fetch(`https://timtruonghoc.pythonanywhere.com/all_major/?name=${encodeURIComponent(currentMajor.name)}`);
        console.log('🔍 Method 2 - By exact name status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🔍 Method 2 response:', data);
            if (data.results && data.results.length > 0) {
                // Tìm ngành có tên khớp chính xác nhất
                const exactMatch = data.results.find(major => 
                    major.name.toLowerCase() === currentMajor.name.toLowerCase()
                );
                if (exactMatch) {
                    generalMajorData = exactMatch;
                    console.log('✅ General major data loaded (Method 2 - exact match):', generalMajorData);
                    updateGeneralInfo();
                    return;
                } else {
                    console.log('⚠️ No exact name match found in Method 2');
                }
            }
        }
    }
    
    // Cách 3: Tìm theo base major ID (chỉ khi majorId có vẻ là mã ngành chuẩn)
    const baseMajorId = getBaseMajorId(majorId);
    console.log('🔍 Base major ID:', baseMajorId);
    
    // Chỉ thử baseMajorId nếu nó khác với majorId gốc hoặc có vẻ là mã ngành chuẩn
    if (baseMajorId !== majorId || /^\d{7}$/.test(majorId)) {
        response = await fetch(`https://timtruonghoc.pythonanywhere.com/all_major/?all_major_id=${baseMajorId}`);
        console.log('🔍 Method 3 - Base major ID status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🔍 Method 3 response:', data);
            if (data.results && data.results.length > 0) {
                const foundMajor = data.results[0];
                console.log('🔍 Found major in Method 3:', foundMajor.name, 'ID:', foundMajor.all_major_id);
                // Kiểm tra xem có đúng ngành không
                if (foundMajor.all_major_id === baseMajorId || foundMajor.name === currentMajor?.name) {
                    generalMajorData = foundMajor;
                    console.log('✅ General major data loaded (Method 3):', generalMajorData);
                    updateGeneralInfo();
                    return;
                } else {
                    console.log('⚠️ Method 3 found wrong major, trying next method...');
                }
            }
        }
    }
    
    // Cách 4: Thử endpoint khác - có thể là all_major_has_pagi
    response = await fetch(`https://timtruonghoc.pythonanywhere.com/all_major_has_pagi/?all_major_id=${baseMajorId}`);
    console.log('🔍 Method 4 - all_major_has_pagi status:', response.status);
    
    if (response.ok) {
        const data = await response.json();
        console.log('🔍 Method 4 response:', data);
        if (data.results && data.results.length > 0) {
            // Tìm ngành có tên khớp trong danh sách
            const nameMatch = data.results.find(major => 
                major.name.toLowerCase() === currentMajor?.name.toLowerCase()
            );
            if (nameMatch) {
                generalMajorData = nameMatch;
                console.log('✅ General major data loaded (Method 4 - name match):', generalMajorData);
                updateGeneralInfo();
                return;
            } else {
                console.log('⚠️ No name match found in Method 4 results');
            }
        }
    }
    
    // Cách 5: Tìm kiếm theo từ khóa trong tên ngành
    if (currentMajor && currentMajor.name) {
        const keywords = currentMajor.name.split(' ').filter(word => word.length > 2);
        console.log('🔍 Trying to search by keywords:', keywords);
        
        for (const keyword of keywords) {
            response = await fetch(`https://timtruonghoc.pythonanywhere.com/all_major/?name=${encodeURIComponent(keyword)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    // Tìm ngành có tên chứa từ khóa
                    const keywordMatch = data.results.find(major => 
                        major.name.toLowerCase().includes(keyword.toLowerCase()) ||
                        currentMajor.name.toLowerCase().includes(major.name.toLowerCase())
                    );
                    if (keywordMatch) {
                        generalMajorData = keywordMatch;
                        console.log('✅ General major data loaded (Method 5 - keyword match):', generalMajorData);
                        updateGeneralInfo();
                        return;
                    }
                }
            }
        }
    }
    
    console.warn('⚠️ No general major data found with any method');
    console.log('🔍 All methods failed. Major ID:', majorId, 'Base ID:', baseMajorId, 'Major name:', currentMajor?.name);
    console.log('💡 Suggestion: Check if this major exists in AllMajorOfAllSchool table');
}

// Load related schools (các trường có đào tạo ngành tương ứng)
async function loadRelatedSchools(majorId) {
    console.log('🏫 Loading related schools for major:', majorId);
    console.log('🔍 Current major name:', currentMajor?.name);
    console.log('🔍 Current major ID:', currentMajor?.major_id);
    
    // Thử nhiều cách để tìm các trường có đào tạo ngành tương ứng
    
    // Cách 1: Tìm theo major_id chính xác trong bảng Major
    console.log('🔍 Method 1: Searching for exact major_id in Major table');
    let response = await fetch(`https://timtruonghoc.pythonanywhere.com/majors/?major_id=${majorId}`);
    console.log('🔍 Method 1 - Exact major ID status:', response.status);
    
    if (response.ok) {
        const data = await response.json();
        console.log('🔍 Method 1 response:', data);
        if (data.results && data.results.length > 0) {
            console.log('✅ Found majors with Method 1:', data.results.length);
            // Lấy danh sách trường từ các major tìm được
            const schools = await getSchoolsFromMajors(data.results);
            if (schools.length > 0) {
                console.log('✅ Found schools with Method 1:', schools.length);
                updateRelatedSchoolsUI(schools);
                return;
            }
        } else {
            console.log('⚠️ Method 1: No majors found in response');
        }
    } else {
        console.log('❌ Method 1 failed with status:', response.status);
    }
    
    // Cách 2: Tìm theo tên ngành chính xác trong bảng Major
    if (currentMajor && currentMajor.name) {
        console.log('🔍 Method 2: Searching for exact name in Major table');
        response = await fetch(`https://timtruonghoc.pythonanywhere.com/majors/?name=${encodeURIComponent(currentMajor.name)}`);
        console.log('🔍 Method 2 - By exact name status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🔍 Method 2 response:', data);
            if (data.results && data.results.length > 0) {
                console.log('✅ Found majors with Method 2:', data.results.length);
                // Lấy danh sách trường từ các major tìm được
                const schools = await getSchoolsFromMajors(data.results);
                if (schools.length > 0) {
                    console.log('✅ Found schools with Method 2:', schools.length);
                    updateRelatedSchoolsUI(schools);
                    return;
                }
            } else {
                console.log('⚠️ Method 2: No majors found for name search');
            }
        } else {
            console.log('❌ Method 2 failed with status:', response.status);
        }
    }
    
    // Cách 3: Tìm theo base major ID trong bảng Major
    const baseMajorId = getBaseMajorId(majorId);
    console.log('🔍 Base major ID:', baseMajorId);
    
    if (baseMajorId !== majorId) {
        console.log('🔍 Method 3: Searching for base major ID in Major table');
        response = await fetch(`https://timtruonghoc.pythonanywhere.com/majors/?major_id=${baseMajorId}`);
        console.log('🔍 Method 3 - Base major ID status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🔍 Method 3 response:', data);
            if (data.results && data.results.length > 0) {
                console.log('✅ Found majors with Method 3:', data.results.length);
                // Lấy danh sách trường từ các major tìm được
                const schools = await getSchoolsFromMajors(data.results);
                if (schools.length > 0) {
                    console.log('✅ Found schools with Method 3:', schools.length);
                    updateRelatedSchoolsUI(schools);
                    return;
                }
            } else {
                console.log('⚠️ Method 3: No majors found in response');
            }
        } else {
            console.log('❌ Method 3 failed with status:', response.status);
        }
    } else {
        console.log('⚠️ Method 3: Base major ID same as original, skipping');
    }
    
    // Cách 4: Tìm theo từ khóa trong tên ngành trong bảng Major
    if (currentMajor && currentMajor.name) {
        const keywords = currentMajor.name.split(' ').filter(word => word.length > 2);
        console.log('🔍 Trying to find schools by keywords:', keywords);
        
        for (const keyword of keywords) {
            console.log('🔍 Searching for keyword:', keyword);
            response = await fetch(`https://timtruonghoc.pythonanywhere.com/majors/?name=${encodeURIComponent(keyword)}`);
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Keyword search response for', keyword, ':', data.results?.length || 0, 'results');
                if (data.results && data.results.length > 0) {
                    console.log('✅ Found majors with Method 4 (keyword):', data.results.length);
                    // Lấy danh sách trường từ các major tìm được
                    const schools = await getSchoolsFromMajors(data.results);
                    if (schools.length > 0) {
                        console.log('✅ Found schools with Method 4 (keyword):', schools.length);
                        updateRelatedSchoolsUI(schools);
                        return;
                    }
                } else {
                    console.log('⚠️ Method 4: No results found for keyword:', keyword);
                }
            } else {
                console.log('❌ Method 4: Keyword search failed with status:', response.status);
            }
        }
    }
    
    console.warn('⚠️ No related schools found with any method');
    console.log('🔍 All methods failed for major ID:', majorId, 'Major name:', currentMajor?.name);
    console.log('💡 Suggestion: Check if any schools are teaching this major');
}

// Helper function to format tuition for schools
function formatTuitionForSchools(min, max) {
    if (!min && !max) return 'Chưa có thông tin';
    
    const getInt = (value) => {
        if (!value) return 0;
        // Nếu là string chứa số lớn, chia cho 1000000
        if (typeof value === 'string' && value.length > 6) {
            const num = parseInt(value.replace(/[^\d]/g, ''));
            return isNaN(num) ? 0 : Math.round(num / 1000000);
        }
        // Nếu là số nhỏ, giữ nguyên
        const num = parseInt(value.toString().replace(/[^\d]/g, ''));
        return isNaN(num) ? 0 : num;
    };
    
    const minInt = getInt(min);
    const maxInt = getInt(max);
    
    if (minInt === 0 && maxInt === 0) return 'Miễn phí';
    if (minInt === maxInt) return `${minInt} triệu/năm`;
    if (minInt > 0 && maxInt > 0) return `${minInt}-${maxInt} triệu/năm`;
    if (minInt > 0) return `Từ ${minInt} triệu/năm`;
    if (maxInt > 0) return `Đến ${maxInt} triệu/năm`;
    
    return 'Chưa có thông tin';
}

// Helper function to get schools from majors
async function getSchoolsFromMajors(majors) {
    console.log('🏫 Getting schools from majors:', majors.length);
    
    const schools = [];
    const seenSchoolIds = new Set();
    
    for (const major of majors) {
        if (major.school && !seenSchoolIds.has(major.school.id)) {
            seenSchoolIds.add(major.school.id);
            
            // Lấy thông tin trường
            const school = major.school;
            
            // Lấy điểm chuẩn gần nhất của ngành này tại trường
            let latestScore = null;
            if (major.admission_scores && major.admission_scores.length > 0) {
                latestScore = major.admission_scores.sort((a, b) => b.year - a.year)[0];
            }
            
            schools.push({
                id: school.id,
                name: school.name_vn,
                short_code: school.short_code,
                logo: school.logo,
                school_type: school.school_type,
                country: school.country,
                tag: school.tag,
                admission_score: latestScore ? latestScore.score : null,
                score_year: latestScore ? latestScore.year : null,
                major_id_at_school: major.major_id,
                tuition_min: major.min_tuition_fee_per_year || school.start,
                tuition_max: major.max_tuition_fee_per_year || school.end,
            });
        }
    }
    
    console.log('🏫 Processed schools:', schools.length);
    return schools;
}

// Update school information in UI
function updateSchoolInfo() {
    if (!currentSchool) return;
    
    // Update hero section
    const schoolLogo = document.getElementById('schoolLogo');
    const schoolName = document.getElementById('schoolName');
    const schoolNameEn = document.getElementById('schoolNameEn');
    
    if (schoolLogo) schoolLogo.src = currentSchool.logo || '/static/images/logo/0.jpg';
    if (schoolName) schoolName.textContent = currentSchool.name_vn;
    if (schoolNameEn) schoolNameEn.textContent = currentSchool.name_en || 'Đang cập nhật';
    
    // Update school specific section
    const schoolSpecificLogo = document.getElementById('schoolSpecificLogo');
    if (schoolSpecificLogo) schoolSpecificLogo.src = currentSchool.logo || '/static/images/logo/0.jpg';
}

// Update major information in UI
function updateMajorInfo() {
    if (!currentMajor) return;
    
    // Update hero section
    const majorCodeValue = document.getElementById('majorCodeValue');
    const majorTitle = document.getElementById('majorTitle');
    const majorSubtitle = document.getElementById('majorSubtitle');
    const majorCover = document.getElementById('majorCover');
    
    if (majorCodeValue) majorCodeValue.textContent = currentMajor.major_id;
    if (majorTitle) majorTitle.textContent = currentMajor.name;
    if (majorSubtitle) majorSubtitle.textContent = `Chương trình đào tạo tại ${currentSchool?.name_vn || 'trường'}`;
    if (majorCover) {
        // Use general major cover if available, otherwise use default
        majorCover.src = generalMajorData?.cover || '/static/images/nganh/nganh.png';
    }
    
    // Update tags
    updateMajorTags();
    
    // Update tuition information
    updateTuitionInfo();
    
    // Update school specific content
    updateSchoolSpecificContent();
    
    // Update admission requirements
    updateAdmissionRequirements();
}

// Update major tags
function updateMajorTags() {
    const majorTags = document.getElementById('majorTags');
    if (!majorTags) return;
    
    majorTags.innerHTML = '';
    
    // Add short_code tag
    if (currentSchool && currentSchool.short_code) {
        const shortCodeTag = document.createElement('span');
        shortCodeTag.className = 'major-tag';
        shortCodeTag.textContent = `Mã trường: ${currentSchool.short_code}`;
        shortCodeTag.style.background = '#e0f2fe';
        shortCodeTag.style.color = '#0c4a6e';
        shortCodeTag.style.border = '2px solid #0ea5e9';
        majorTags.appendChild(shortCodeTag);
    }
    
    // Add school type tag
    if (currentSchool) {
        const schoolTypeTag = document.createElement('span');
        schoolTypeTag.className = 'major-tag';
        schoolTypeTag.textContent = currentSchool.school_type === 'public' ? 'Công lập' : 'Ngoài công lập';
        schoolTypeTag.style.background = currentSchool.school_type === 'public' ? '#dbeafe' : '#fecaca';
        schoolTypeTag.style.color = currentSchool.school_type === 'public' ? '#1e40af' : '#dc2626';
        schoolTypeTag.style.border = currentSchool.school_type === 'public' ? '2px solid #3b82f6' : '2px solid #ef4444';
        majorTags.appendChild(schoolTypeTag);
    }
    
    // Add special program tag
    if (isSpecialProgram(currentMajor.major_id)) {
        const specialTag = document.createElement('span');
        specialTag.className = 'major-tag special';
        specialTag.textContent = 'Chất lượng cao';
        majorTags.appendChild(specialTag);
    }
    
    // Add major tags
    if (currentMajor.tags && currentMajor.tags.toLowerCase() !== 'none') {
        const tagClass = currentMajor.tags.toLowerCase() === 'outstanding' ? 'outstanding' : 'pro';
        const tagText = currentMajor.tags.toLowerCase() === 'outstanding' ? 'Nổi bật' : 'Chuyên nghiệp';
        
        const majorTag = document.createElement('span');
        majorTag.className = `major-tag ${tagClass}`;
        majorTag.textContent = tagText;
        majorTags.appendChild(majorTag);
    }
}

// Update tuition information
function updateTuitionInfo() {
    const tuitionAmount = document.getElementById('tuitionAmount');
    if (!tuitionAmount) return;
    
    let tuitionText = 'Chưa có thông tin';
    
    // Priority: major tuition > school tuition
    if (currentMajor.min_tuition_fee_per_year && currentMajor.max_tuition_fee_per_year) {
        const min = currentMajor.min_tuition_fee_per_year;
        const max = currentMajor.max_tuition_fee_per_year;
        
        if (min === "0" && max === "0") {
            tuitionText = 'Thường miễn phí';
        } else if (min === max) {
            const val = formatCurrency(min);
            tuitionText = val === 'Thường miễn phí' ? val : `Khoảng ${val}/năm`;
        } else {
            const minVal = formatCurrency(min);
            const maxVal = formatCurrency(max);
            if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                tuitionText = 'Thường miễn phí';
            } else if (minVal === 'Thường miễn phí') {
                tuitionText = minVal;
            } else if (maxVal === 'Thường miễn phí') {
                tuitionText = maxVal;
            } else {
                tuitionText = `${minVal} - ${maxVal}/năm`;
            }
        }
    } else if (currentMajor.min_tuition_fee_per_year) {
        const minVal = formatCurrency(currentMajor.min_tuition_fee_per_year);
        tuitionText = minVal === 'Thường miễn phí' ? minVal : `Từ ${minVal}/năm`;
    } else if (currentMajor.max_tuition_fee_per_year) {
        const maxVal = formatCurrency(currentMajor.max_tuition_fee_per_year);
        tuitionText = maxVal === 'Thường miễn phí' ? maxVal : `Đến ${maxVal}/năm`;
    } else if (currentSchool) {
        if (currentSchool.start === 0 && currentSchool.end === 0) {
            tuitionText = 'Thường miễn phí';
        } else if (currentSchool.start && currentSchool.end && currentSchool.start !== currentSchool.end) {
            const minVal = formatCurrency(currentSchool.start);
            const maxVal = formatCurrency(currentSchool.end);
            if (minVal === 'Thường miễn phí' && maxVal === 'Thường miễn phí') {
                tuitionText = 'Thường miễn phí';
            } else if (minVal === 'Thường miễn phí') {
                tuitionText = minVal;
            } else if (maxVal === 'Thường miễn phí') {
                tuitionText = maxVal;
            } else {
                tuitionText = `${minVal} - ${maxVal}/năm`;
            }
        } else if (currentSchool.start) {
            const minVal = formatCurrency(currentSchool.start);
            tuitionText = minVal === 'Thường miễn phí' ? minVal : `Khoảng ${minVal}/năm`;
        }
    }
    
    tuitionAmount.textContent = tuitionText;
}

// Update school specific content
function updateSchoolSpecificContent() {
    const schoolSpecificContent = document.getElementById('schoolSpecificContent');
    if (!schoolSpecificContent) return;
    
    let content = '';
    
    if (currentMajor.description) {
        content += `<div class="school-specific-content">
            <h4>Mô tả ngành tại trường</h4>
            <div>${currentMajor.description}</div>
        </div>`;
    }
    
    if (currentSchool && currentSchool.introduction) {
        content += `<div class="school-specific-content">
            
        </div>`;
    }
    
    if (!content) {
        content = '<p>Thông tin chi tiết về chương trình đào tạo sẽ được cập nhật sớm.</p>';
    }
    
    schoolSpecificContent.innerHTML = content;
}

// Update general info
function updateGeneralInfo() {
    if (!generalMajorData) return;
    
    // Update quick info with highlighted numbers
    const trainingDuration = document.getElementById('trainingDuration');
    const opportunities = document.getElementById('opportunities');
    const averageSalary = document.getElementById('averageSalary');
    const fieldName = document.getElementById('fieldName');
    
    if (trainingDuration) {
        const duration = generalMajorData.training_duration || 'Chưa có thông tin';
        trainingDuration.innerHTML = `<span class="info-title">Thời gian đào tạo:</span> <span class="highlight-line">${highlightNumbers(duration)} năm</span>`;
    }
    
    if (opportunities) {
        const opp = generalMajorData.opportunities;
        if (opp) {
            opportunities.innerHTML = `<span class="info-title">Cơ hội việc làm:</span> <span class="highlight-line"><span class="highlight-number">${opp}/100</span><span class="highlight-text"></span></span>`;
        } else {
            opportunities.innerHTML = `<span class="info-title">Cơ hội việc làm:</span> <span class="highlight-line">Chưa có thông tin</span>`;
        }
    }
    
    if (averageSalary) {
        const salary = generalMajorData.salary || 'Chưa có thông tin';
        averageSalary.innerHTML = `<span class="info-title">Mức lương trung bình:</span> <span class="highlight-line">${highlightNumbers(salary)}</span>`;
    }
    
    if (fieldName) {
        const field = generalMajorData.field?.name || 'Chưa có thông tin';
        fieldName.innerHTML = `<span class="info-title">Lĩnh vực:</span> <span class="highlight-line">${field}</span>`;
    }
    
    // Update content sections
    updateContentSection('generalInfo', generalMajorData.short_description);
    updateContentSection('trainingProgram', generalMajorData.program);
    updateContentSection('careerOpportunities', generalMajorData.job);
    updateContentSection('suitableQualities', generalMajorData.suitable);
}

// Helper function to highlight numbers in text
function highlightNumbers(text) {
    if (!text) return text;
    
    // Nếu là mức lương, highlight toàn bộ
    if (text.toLowerCase().includes('triệu') || text.toLowerCase().includes('đồng')|| text.toLowerCase().includes('năm')) {
        return `<span class="highlight-number">${text}</span>`;
    }
    
    // Tìm và highlight các con số
    return text.replace(/(\d+(?:\.\d+)?)/g, '<span class="highlight-number">$1</span>');
}

// Update content section
function updateContentSection(sectionId, content) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    if (content) {
        // Format chương trình đào tạo đặc biệt
        if (sectionId === 'trainingProgram') {
            section.innerHTML = formatTrainingProgram(content);
        } 
        // Format cơ hội nghề nghiệp thành các ô ngành nghề
        else if (sectionId === 'careerOpportunities') {
            section.innerHTML = formatCareerOpportunities(content);
        }
        // Format tố chất phù hợp thành các ô ngành nghề
        else if (sectionId === 'suitableQualities') {
            section.innerHTML = formatSuitableQualities(content);
        }
        else {
            section.innerHTML = content;
        }
    } else {
        section.innerHTML = '<p>Thông tin đang được cập nhật.</p>';
    }
}

// Helper function to format training program
function formatTrainingProgram(content) {
    if (!content) return '<p>Thông tin đang được cập nhật.</p>';
    
    let formattedContent = content;
    
    // Xuống dòng khi gặp dấu hai chấm hoặc dấu chấm
    formattedContent = formattedContent.replace(/[:.]\s*/g, '$&<br>');
    
    // In đậm các dòng tiêu đề cụ thể và thêm bullet points
    formattedContent = formattedContent.replace(/([^<>\n]+)(?=<br>|$)/g, function(match) {
        const trimmedMatch = match.trim();
        
        // Bỏ qua nếu là dòng trống
        if (!trimmedMatch) return match;
        
        // In đậm các dòng tiêu đề cụ thể
        if (trimmedMatch.includes('Chương trình đào tạo') || 
            trimmedMatch.includes('Kiến thức đại cương') ||
            trimmedMatch.includes('Kiến thức cơ sở ngành') ||
            trimmedMatch.includes('Kiến thức chuyên ngành')) {
            return '<strong>' + trimmedMatch + '</strong>';
        }
        
        // Thêm bullet point cho các môn học
        if (trimmedMatch.length > 2) {
            return '<div style=" padding-left: 20px;">• ' + trimmedMatch + '</div>';
        }
        
        return trimmedMatch;
    });
    
    // Xử lý các dòng trống
    formattedContent = formattedContent.replace(/<br><br>/g, '<br>');
    
    return formattedContent;
}

// Helper function to format career opportunities into job cards
function formatCareerOpportunities(content) {
    if (!content) return '<p>Thông tin đang được cập nhật.</p>';
    
    // Tách nội dung theo dấu phẩy hoặc chấm phẩy
    const jobs = content.split(/[,;]/).map(item => item.trim()).filter(item => item);
    
    if (jobs.length === 0) {
        return '<p>Thông tin đang được cập nhật.</p>';
    }
    
    let html = '<div class="career-opportunities-grid">';
    jobs.forEach(job => {
        if (job.length > 0) {
            // Viết hoa chữ cái đầu của từ đầu tiên
            const words = job.split(' ');
            const capitalizedJob = words.map((word, index) => {
                if (index === 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                } else {
                    return word;
                }
            }).join(' ');
            
            html += `<div class="career-opportunity-card">${capitalizedJob}</div>`;
        }
    });
    html += '</div>';
    
    return html;
}

// Helper function to format suitable qualities into quality cards
function formatSuitableQualities(content) {
    if (!content) return '<p>Thông tin đang được cập nhật.</p>';
    
    // Tách nội dung theo dấu phẩy hoặc chấm phẩy
    const qualities = content.split(/[,;]/).map(item => item.trim()).filter(item => item);
    
    if (qualities.length === 0) {
        return '<p>Thông tin đang được cập nhật.</p>';
    }
    
    let html = '<div class="suitable-qualities-grid">';
    qualities.forEach(quality => {
        if (quality.length > 0) {
            // Viết hoa chữ cái đầu của từ đầu tiên
            const words = quality.split(' ');
            const capitalizedQuality = words.map((word, index) => {
                if (index === 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                } else {
                    return word;
                }
            }).join(' ');
            
            html += `<div class="suitable-quality-card">${capitalizedQuality}</div>`;
        }
    });
    html += '</div>';
    
    return html;
}

// Update admission requirements
function updateAdmissionRequirements() {
    const admissionRequirements = document.getElementById('admissionRequirements');
    if (!admissionRequirements) return;
    
    if (currentMajor.entry_requirement) {
        // Format phương thức xét tuyển theo quy tắc
        let formattedContent = formatAdmissionRequirements(currentMajor.entry_requirement);
        admissionRequirements.innerHTML = formattedContent;
    } else {
        admissionRequirements.innerHTML = '<p>Thông tin phương thức xét tuyển đang được cập nhật.</p>';
    }
}

// Helper function to format admission requirements
function formatAdmissionRequirements(content) {
    if (!content) return '';
    
    // Chuyển đổi HTML entities nếu có
    let text = content;
    
    // Tạo danh sách các phương thức xét tuyển theo thứ tự ưu tiên
    const methods = [
        {
            keywords: ['thi tốt nghiệp', 'thpt', 'tốt nghiệp thpt', 'kết quả thi'],
            title: '1. Xét kết quả thi tốt nghiệp THPT.'
        },
        {
            keywords: ['học bạ', 'điểm học bạ', 'kết quả học bạ'],
            title: '2. Xét kết quả học bạ THPT.'
        },
        {
            keywords: ['tuyển thẳng', 'ưu tiên xét tuyển', 'ưu tiên'],
            title: '3. Xét tuyển thẳng, ưu tiên xét tuyển.'
        },
        {
            keywords: ['phương thức khác', 'quy định của trường', 'theo quy định'],
            title: '4. Các phương thức khác theo quy định của trường.'
        }
    ];
    
    // Tìm và format các phương thức
    let formattedText = text;
    let foundMethods = [];
    
    methods.forEach(method => {
        const hasKeyword = method.keywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
        if (hasKeyword) {
            foundMethods.push(method.title);
        }
    });
    
    // Nếu tìm thấy các phương thức cụ thể, format theo thứ tự
    if (foundMethods.length > 0) {
        formattedText = foundMethods.join('<br>');
    } else {
        // Nếu không tìm thấy, format theo dấu chấm hoặc dấu phẩy
        formattedText = text
            .replace(/\.\s*/g, '.<br>')
            .replace(/,\s*/g, ',<br>')
            .replace(/<br><br>/g, '<br>'); // Loại bỏ <br> thừa
    }
    
    // Thêm style cho các dòng
    formattedText = formattedText.replace(/<br>/g, '</p><p>');
    formattedText = '<p>' + formattedText + '</p>';
    
    return formattedText;
}

// Update related schools section
function updateRelatedSchoolsUI(schools) {
    console.log('🏫 Updating related schools section with:', schools.length, 'schools');
    
    const relatedSchoolsContainer = document.getElementById('relatedSchools');
    if (!relatedSchoolsContainer) {
        console.error('❌ Related schools container not found');
        return;
    }
    
    if (!schools || schools.length === 0) {
        relatedSchoolsContainer.innerHTML = '<p class="no-data">Chưa có thông tin về các trường đào tạo ngành tương ứng.</p>';
        return;
    }
    
    // Sắp xếp: trường nổi bật trước, sau đó theo tên
    const sortedSchools = schools.sort((a, b) => {
        // Ưu tiên trường nổi bật
        if (a.tag === 'outstanding' && b.tag !== 'outstanding') return -1;
        if (a.tag !== 'outstanding' && b.tag === 'outstanding') return 1;
        
        // Sau đó theo tên trường
        return a.name.localeCompare(b.name);
    });
    
    // Hiển thị tối đa 5 trường
    const displaySchools = sortedSchools.slice(0, 5);
    
    let schoolsHTML = '<div class="related-schools-grid">';
    
    displaySchools.forEach(school => {
        const tuitionText = formatTuitionForSchools(school.tuition_min, school.tuition_max);
        const borderClass = school.tag === 'outstanding' ? 'outstanding-border' : 'normal-border';
        
        schoolsHTML += `
            <div class="related-school-card ${borderClass}">
                <div class="school-logo">
                    <img src="${school.logo || '/static/images/logo12.png'}" alt="${school.name}" onerror="this.src='/static/images/logo12.png'">
                </div>
                <div class="school-info">
                    <h4 class="school-name">${school.name}</h4>
                    <div class="school-details">
                        <span class="school-code">${school.short_code}</span>
                        <span class="school-tuition">${tuitionText}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    schoolsHTML += '</div>';
    
    if (schools.length > 5) {
        schoolsHTML += `<p class="more-schools" onclick="showAllSchools(${JSON.stringify(sortedSchools).replace(/"/g, '&quot;')})">Và ${schools.length - 5} trường khác đào tạo ngành này</p>`;
    }
    
    relatedSchoolsContainer.innerHTML = schoolsHTML;
}

// Function to show all schools
function showAllSchools(allSchools) {
    console.log('🏫 Showing all schools:', allSchools.length);
    
    const relatedSchoolsContainer = document.getElementById('relatedSchools');
    if (!relatedSchoolsContainer) return;
    
    let schoolsHTML = '<div class="related-schools-grid">';
    
    allSchools.forEach(school => {
        const tuitionText = formatTuitionForSchools(school.tuition_min, school.tuition_max);
        const borderClass = school.tag === 'outstanding' ? 'outstanding-border' : 'normal-border';
        
        schoolsHTML += `
            <div class="related-school-card ${borderClass}">
                <div class="school-logo">
                    <img src="${school.logo || '/static/images/logo12.png'}" alt="${school.name}" onerror="this.src='/static/images/logo12.png'">
                </div>
                <div class="school-info">
                    <h4 class="school-name">${school.name}</h4>
                    <div class="school-details">
                        <span class="school-code">${school.short_code}</span>
                        <span class="school-tuition">${tuitionText}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    schoolsHTML += '</div>';
    schoolsHTML += `<p class="show-less" onclick="showLessSchools()">Thu gọn danh sách</p>`;
    
    relatedSchoolsContainer.innerHTML = schoolsHTML;
}

// Function to show less schools (back to original view)
function showLessSchools() {
    // Reload related schools with original logic
    if (currentMajor && currentMajor.major_id) {
        loadRelatedSchools(currentMajor.major_id);
    }
}

// Helper functions
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

function isSpecialProgram(majorId) {
    if (!majorId) return false;
    // Check if major_id contains any letters (indicating special program)
    return /[a-zA-Z]/.test(majorId);
}

function getBaseMajorId(majorId) {
    if (!majorId) return '';
    // Remove letters to get base major ID
    return majorId.replace(/[a-zA-Z]/g, '');
}

function showError(message) {
    console.error('❌ Error:', message);
    // You can implement a more sophisticated error display here
    alert(message);
}

function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        window.location.href = '/';
    }
} 