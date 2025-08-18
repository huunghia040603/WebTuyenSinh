// Thuật ngữ Management System JavaScript
class ThuatNguSystem {
    constructor() {
        this.init();
    }

    async init() {
        this.termsIndex = null;
        this.setupEventListeners();
        this.setupAnimations();
        this.setupSmartFilters();
        this.setupFeaturedTerms();
        await this.loadRealData();
        this.loadSampleData();
        
        // Đảm bảo bộ sưu tập bắt đầu trống
        this.ensureEmptyCollection();
        this.updateCollectionDisplay(); // Khởi tạo hiển thị bộ sưu tập
    }

    async loadRealData() {
        try {
            // Try to load combined file first
            let combinedRes = await fetch('/static/data/terms_index_combined.json', { cache: 'no-store' });
            
            if (combinedRes.ok) {
                const combined = await combinedRes.json();
                const categories = Array.from(new Set(combined.terms.map(term => term.category))).sort();
                this.termsIndex = { 
                    count: combined.count || combined.terms.length, 
                    categories: categories, 
                    terms: combined.terms 
                };
                console.log(`Loaded ${combined.terms.length} terms from combined file`);
            } else {
                // Fallback to separate files
                const baseRes = await fetch('/static/data/terms_index.json', { cache: 'no-store' });
                if (!baseRes.ok) throw new Error('Failed to load base data');
                const base = await baseRes.json();

                // Try to load extra dataset if available
                let extra = { terms: [], categories: [] };
                try {
                    const extraRes = await fetch('/static/data/terms_index_extra.json', { cache: 'no-store' });
                    if (extraRes.ok) extra = await extraRes.json();
                } catch (_) {}

                const mergedTerms = [...(base.terms || []), ...(extra.terms || [])];
                const mergedCats = Array.from(new Set([...(base.categories || []), ...(extra.categories || [])])).sort();
                this.termsIndex = { count: mergedTerms.length, categories: mergedCats, terms: mergedTerms };
                console.log(`Loaded ${mergedTerms.length} terms from separate files`);
            }
            
            // Populate category filter if empty
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter && categoryFilter.options.length <= 1 && this.termsIndex.categories) {
                this.termsIndex.categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat; opt.textContent = cat;
                    categoryFilter.appendChild(opt);
                });
            }
        } catch (e) {
            console.warn('Không thể nạp dữ liệu thật, dùng dữ liệu mẫu.', e);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });

            // Auto-suggest functionality
            searchInput.addEventListener('input', (e) => {
                this.handleAutoSuggest(e.target.value);
            });

            // Sử dụng gợi ý thông minh
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length >= 2) {
                    const smartSuggestions = this.getSmartSuggestions(query);
                    this.showSuggestions(smartSuggestions);
                } else {
                    this.hideSuggestions();
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCTAClick(button);
            });
        });

        // Feature cards hover effects
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCard(card, 'enter');
            });
            card.addEventListener('mouseleave', () => {
                this.animateCard(card, 'leave');
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .demo-container, .stat-item');
        animateElements.forEach(el => {
            el.classList.add('animate-element');
            observer.observe(el);
        });

        // Counter animation for stats
        this.animateCounters();
    }

    performSearch() {
        const searchTerm = document.querySelector('.search-input')?.value.trim();
        if (!searchTerm) {
            this.showNotification('Vui lòng nhập từ khóa tìm kiếm', 'warning');
            return;
        }

        // Thêm vào lịch sử tìm kiếm
        this.addToRecentSearches(searchTerm);

        // Simulate search functionality
        this.showNotification(`Đang tìm kiếm: "${searchTerm}"...`, 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            this.showSearchResults(searchTerm);
        }, 1000);
    }

    handleAutoSuggest(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Sử dụng gợi ý thông minh
        const suggestions = this.getSmartSuggestions(query);
        this.showSuggestions(suggestions);
    }

    // Thêm tính năng tìm kiếm nhanh từ featured terms
    setupFeaturedTerms() {
        const featuredCards = document.querySelectorAll('.featured-term-card');
        featuredCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const term = card.querySelector('h3').textContent;
                this.searchTerm(term);
                this.scrollToSection('hero-section');
            });
        });
    }

    getSuggestions(query) {
        const lc = query.toLowerCase();
        // Use real index if available
        if (this.termsIndex && Array.isArray(this.termsIndex.terms)) {
            const categoryFilter = document.getElementById('categoryFilter');
            const activeCat = categoryFilter?.value || '';
            const matches = [];
            for (const t of this.termsIndex.terms) {
                if (activeCat && t.category !== activeCat) continue;
                // Match by vn/en/definition/search_text
                if (
                    (t.vn && t.vn.toLowerCase().includes(lc)) ||
                    (t.en && t.en.toLowerCase().includes(lc)) ||
                    (t.definition && t.definition.toLowerCase().includes(lc)) ||
                    (t.search_text && t.search_text.toLowerCase().includes(lc))
                ) {
                    matches.push({ 
                        term: t.vn || t.en || 'Thuật ngữ', 
                        category: t.category, 
                        data: t 
                    });
                }
            }
            // sort by startsWith > shorter term > category alpha
            matches.sort((a,b)=>{
                const as=a.term.toLowerCase().startsWith(lc), bs=b.term.toLowerCase().startsWith(lc);
                if (as!==bs) return as? -1: 1;
                if (a.term.length!==b.term.length) return a.term.length-b.term.length;
                return (a.category||'').localeCompare(b.category||'');
            });
            return matches.slice(0, 12);
        }

        // Fallback: dữ liệu mẫu (giữ như cũ khi chưa nạp được file)
        const fallback = ['Thuật toán','Lập trình','Cơ sở dữ liệu','Huyết áp','GDP','Hiến pháp','Thiết kế'];
        return fallback
            .filter(t=>t.toLowerCase().includes(lc))
            .map(t=>({term:t, category:'Gợi ý'}))
            .slice(0,8);
    }

    showSuggestions(suggestions) {
        let suggestionsContainer = document.querySelector('.search-suggestions');
        
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(suggestionsContainer);
        }

        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item">Không tìm thấy gợi ý</div>';
        } else {
            suggestionsContainer.innerHTML = suggestions.map(item => 
                `<div class="suggestion-item" onclick="thuatNguSystem.selectSuggestion('${item.term}')">
                    <span class="suggestion-term">${item.term}</span>
                    <span class="suggestion-category">${item.category}</span>
                </div>`
            ).join('');
        }

        suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        const suggestionsContainer = document.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    selectSuggestion(term) {
        document.querySelector('.search-input').value = term;
        this.hideSuggestions();
        this.performSearch();
    }

    showSearchResults(searchTerm) {
        // Create modal for search results
        const modal = this.createModal('Kết Quả Tìm Kiếm', this.generateSearchResultsHTML(searchTerm));
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    generateSearchResultsHTML(searchTerm) {
        // Nếu có dữ liệu thật: lấy top kết quả phù hợp
        if (this.termsIndex && Array.isArray(this.termsIndex.terms)) {
            const q = searchTerm.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter');
            const activeCat = categoryFilter?.value || '';
            const results = this.termsIndex.terms.filter(t => {
                if (activeCat && t.category !== activeCat) return false;
                return (
                    (t.vn && t.vn.toLowerCase().includes(q)) ||
                    (t.en && t.en.toLowerCase().includes(q)) ||
                    (t.definition && t.definition.toLowerCase().includes(q)) ||
                    (t.search_text && t.search_text.toLowerCase().includes(q))
                );
            }).slice(0, 25);

            if (results.length > 0) {
                return `
                <div class="search-results">
                    ${results.map(t => `
                        <div class="result-item">
                            <div class="result-header">
                                <h4>${t.vn || t.en || 'Thuật ngữ'}</h4>
                                <span class="result-category">${t.category || ''}</span>
                            </div>
                            <div class="result-content">
                                <div class="definition-section">
                                    <h5><i class="fas fa-book"></i> Định nghĩa</h5>
                                    <p>${t.definition || 'Đang cập nhật'}</p>
                                </div>
                                ${t.en ? `<div class="context-section"><h5><i class=\"fas fa-language\"></i> Tiếng Anh</h5><p>${t.en}</p></div>` : ''}
                            </div>
                            <div class="result-actions">
                                <button onclick="thuatNguSystem.saveToCollection('${(t.vn || t.en || 'Thuật ngữ').replace(/'/g, "\\'")}')" class="btn-save">
                                    <i class="fas fa-bookmark"></i> Lưu vào bộ sưu tập
                                </button>
                                <button onclick="thuatNguSystem.showRelatedTerms('${(t.vn || t.en || 'Thuật ngữ').replace(/'/g, "\\'")}')" class="btn-related">
                                    <i class="fas fa-link"></i> Thuật ngữ liên quan
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            }
        }

        // Dữ liệu fallback nếu không có dữ liệu thật
        const termDefinitions = {
            'Thuật toán': {
                definition: 'Tập hợp các bước có thứ tự để giải quyết một vấn đề cụ thể',
                context: 'Thuật toán được sử dụng trong lập trình để giải quyết các bài toán phức tạp',
                category: 'Công nghệ thông tin',
                examples: 'Thuật toán sắp xếp nổi bọt, thuật toán tìm kiếm nhị phân, thuật toán Dijkstra'
            },
            'Lập trình': {
                definition: 'Quá trình viết mã máy tính để tạo ra phần mềm',
                context: 'Lập trình là kỹ năng cơ bản trong phát triển phần mềm',
                category: 'Công nghệ thông tin',
                examples: 'Lập trình Python, Java, JavaScript, C++'
            },
            'Cơ sở dữ liệu': {
                definition: 'Hệ thống lưu trữ và quản lý thông tin có cấu trúc',
                context: 'Cơ sở dữ liệu được sử dụng trong hầu hết các ứng dụng phần mềm',
                category: 'Công nghệ thông tin',
                examples: 'MySQL, PostgreSQL, MongoDB, Oracle Database'
            },
            'Huyết áp': {
                definition: 'Áp lực của máu lên thành động mạch',
                context: 'Huyết áp là chỉ số quan trọng để đánh giá sức khỏe tim mạch',
                category: 'Y học',
                examples: 'Huyết áp tâm thu, huyết áp tâm trương'
            },
            'Chẩn đoán': {
                definition: 'Quá trình xác định bệnh tật dựa trên các triệu chứng và kết quả xét nghiệm',
                context: 'Chẩn đoán chính xác là bước đầu tiên trong điều trị bệnh',
                category: 'Y học',
                examples: 'Chẩn đoán hình ảnh, chẩn đoán xét nghiệm, chẩn đoán lâm sàng'
            },
            'GDP': {
                definition: 'Tổng sản phẩm quốc nội - tổng giá trị hàng hóa và dịch vụ được sản xuất trong một quốc gia',
                context: 'GDP là chỉ số quan trọng để đánh giá quy mô nền kinh tế',
                category: 'Kinh tế',
                examples: 'GDP danh nghĩa, GDP thực tế, GDP bình quân đầu người'
            },
            'Lạm phát': {
                definition: 'Sự tăng lên liên tục của mức giá chung trong nền kinh tế',
                context: 'Lạm phát ảnh hưởng đến sức mua của đồng tiền',
                category: 'Kinh tế',
                examples: 'Lạm phát do cầu kéo, lạm phát do chi phí đẩy'
            },
            'Hiến pháp': {
                definition: 'Đạo luật cơ bản nhất của quốc gia, quy định tổ chức và hoạt động của bộ máy nhà nước',
                context: 'Hiến pháp là cơ sở pháp lý cao nhất cho tất cả các văn bản pháp luật khác',
                category: 'Luật',
                examples: 'Hiến pháp 2013, Hiến pháp các nước'
            },
            'Thiết kế': {
                definition: 'Quá trình tạo ra các giải pháp sáng tạo cho các vấn đề cụ thể',
                context: 'Thiết kế là yếu tố quan trọng trong kiến trúc và xây dựng',
                category: 'Kiến trúc',
                examples: 'Thiết kế nhà ở, thiết kế công trình công cộng, thiết kế nội thất'
            }
        };

        const termData = termDefinitions[searchTerm] || {
            definition: 'Thuật ngữ chuyên môn quan trọng trong lĩnh vực này',
            context: `${searchTerm} được sử dụng rộng rãi trong chuyên ngành`,
            category: 'Chuyên ngành',
            examples: 'Các ví dụ và ứng dụng thực tế'
        };

        return `
            <div class="search-results">
                <div class="result-item">
                    <div class="result-header">
                        <h4>${searchTerm}</h4>
                        <span class="result-category">${termData.category}</span>
                    </div>
                    <div class="result-content">
                        <div class="definition-section">
                            <h5><i class="fas fa-book"></i> Định nghĩa</h5>
                            <p>${termData.definition}</p>
                        </div>
                        <div class="context-section">
                            <h5><i class="fas fa-lightbulb"></i> Ngữ cảnh sử dụng</h5>
                            <p>${termData.context}</p>
                        </div>
                        <div class="examples-section">
                            <h5><i class="fas fa-list"></i> Ví dụ</h5>
                            <p>${termData.examples}</p>
                        </div>
                    </div>
                    <div class="result-actions">
                        <button onclick="thuatNguSystem.saveToCollection('${searchTerm}')" class="btn-save">
                            <i class="fas fa-bookmark"></i> Lưu vào bộ sưu tập
                        </button>
                        <button onclick="thuatNguSystem.shareTerm('${searchTerm}')" class="btn-share">
                            <i class="fas fa-share"></i> Chia sẻ
                        </button>
                        <button onclick="thuatNguSystem.showRelatedTerms('${searchTerm}')" class="btn-related">
                            <i class="fas fa-link"></i> Thuật ngữ liên quan
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    handleCTAClick(button) {
        const action = button.textContent.trim();
        
        if (action.includes('Dùng Thử')) {
            this.showNotification('Tính năng demo sẽ được triển khai sớm!', 'info');
        } else if (action.includes('Tìm Hiểu')) {
            this.scrollToSection('features-section');
        }
    }

    animateCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');

        counters.forEach(counter => {
            // Extract only digits for animation. Keep non-numeric labels as-is
            const rawText = counter.textContent;
            const numericMatch = rawText.replace(/[^0-9]/g, '');
            const hasNumber = numericMatch.length > 0;

            if (!hasNumber) {
                // Skip animation for non-numeric items like "AI"
                return;
            }

            const target = Number(numericMatch);
            if (!Number.isFinite(target)) {
                return;
            }

            const durationMs = 1200;
            const step = Math.max(1, Math.floor(target / (durationMs / 16)));
            let current = 0;

            const updateCounter = () => {
                current = Math.min(target, current + step);
                counter.textContent = current.toLocaleString() + '+';
                if (current < target) requestAnimationFrame(updateCounter);
            };

            // Start animation
            updateCounter();
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    saveToCollection(term) {
        // Lấy thông tin chi tiết của term từ dữ liệu
        let termData = this.getTermData(term);
        
        // Lưu vào localStorage
        this.addToCollection(termData);
        
        // Cập nhật hiển thị
        this.updateCollectionDisplay();
        
        this.showNotification(`Đã lưu "${term}" vào bộ sưu tập`, 'success');
    }

    getTermData(term) {
        // Tìm term trong dữ liệu thật
        if (this.termsIndex && Array.isArray(this.termsIndex.terms)) {
            const foundTerm = this.termsIndex.terms.find(t => 
                (t.vn && t.vn.toLowerCase() === term.toLowerCase()) ||
                (t.en && t.en.toLowerCase() === term.toLowerCase())
            );
            
            if (foundTerm) {
                return {
                    id: foundTerm.id || Date.now(),
                    term: foundTerm.vn || foundTerm.en || term,
                    english: foundTerm.en || '',
                    definition: foundTerm.definition || 'Đang cập nhật',
                    category: foundTerm.category || 'Chuyên ngành',
                    addedAt: new Date().toISOString()
                };
            }
        }

        // Fallback data nếu không tìm thấy
        return {
            id: Date.now(),
            term: term,
            english: '',
            definition: 'Thuật ngữ chuyên môn quan trọng trong lĩnh vực này',
            category: 'Chuyên ngành',
            addedAt: new Date().toISOString()
        };
    }

    addToCollection(termData) {
        let collection = this.getCollection();
        
        // Kiểm tra xem term đã tồn tại chưa
        const existingIndex = collection.findIndex(item => item.term === termData.term);
        
        if (existingIndex !== -1) {
            // Cập nhật thông tin nếu đã tồn tại
            collection[existingIndex] = { ...collection[existingIndex], ...termData };
        } else {
            // Thêm mới nếu chưa tồn tại
            collection.unshift(termData);
        }
        
        // Giới hạn tối đa 100 items
        if (collection.length > 100) {
            collection = collection.slice(0, 100);
        }
        
        localStorage.setItem('termCollection', JSON.stringify(collection));
    }

    getCollection() {
        const collection = localStorage.getItem('termCollection');
        return collection ? JSON.parse(collection) : [];
    }

    updateCollectionDisplay() {
        const collection = this.getCollection();
        const collectionList = document.getElementById('collection-list');
        const emptyCollection = document.getElementById('empty-collection');
        const collectionCount = document.querySelector('.collection-count');
        
        if (collectionCount) {
            collectionCount.textContent = collection.length;
        }
        
        if (collection.length === 0) {
            if (collectionList) collectionList.style.display = 'none';
            if (emptyCollection) emptyCollection.style.display = 'block';
        } else {
            if (emptyCollection) emptyCollection.style.display = 'none';
            if (collectionList) {
                collectionList.style.display = 'grid';
                collectionList.innerHTML = collection.map(item => `
                    <div class="collection-item">
                        <div class="collection-item-header">
                            <div>
                                <h4 class="collection-item-title">${this.escapeHtml(item.term)}</h4>
                                <span class="collection-item-category">${this.escapeHtml(item.category)}</span>
                            </div>
                            <button class="collection-item-remove" onclick="thuatNguSystem.removeFromCollection('${item.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="collection-item-content">
                            <p class="collection-item-definition">${this.escapeHtml(item.definition)}</p>
                            ${item.english ? `<p class="collection-item-english">${this.escapeHtml(item.english)}</p>` : ''}
                        </div>
                        <div class="collection-item-footer">
                            <span class="collection-item-date">${new Date(item.addedAt).toLocaleDateString('vi-VN')}</span>
                            <div class="collection-item-actions">
                                <button class="collection-item-action" onclick="thuatNguSystem.searchTerm('${this.escapeHtml(item.term).replace(/'/g, "\\'")}')">
                                    <i class="fas fa-search"></i>
                                </button>
                                <button class="collection-item-action" onclick="thuatNguSystem.showRelatedTerms('${this.escapeHtml(item.term).replace(/'/g, "\\'")}')">
                                    <i class="fas fa-link"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    removeFromCollection(termId) {
        let collection = this.getCollection();
        collection = collection.filter(item => item.id != termId);
        localStorage.setItem('termCollection', JSON.stringify(collection));
        this.updateCollectionDisplay();
        this.showNotification('Đã xóa khỏi bộ sưu tập', 'success');
    }

    exportCollection() {
        const collection = this.getCollection();
        if (collection.length === 0) {
            this.showNotification('Bộ sưu tập trống', 'warning');
            return;
        }

        // Tạo nội dung PDF
        let content = `
            <html>
            <head>
                <title>Bộ Sưu Tập Thuật Ngữ</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #0a4191; text-align: center; }
                    .term-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .term-title { font-size: 18px; font-weight: bold; color: #0a4191; margin-bottom: 5px; }
                    .term-category { color: #666; font-size: 14px; margin-bottom: 10px; }
                    .term-definition { margin-bottom: 10px; }
                    .term-english { font-style: italic; color: #888; }
                    .term-date { font-size: 12px; color: #999; }
                </style>
            </head>
            <body>
                <h1>Bộ Sưu Tập Thuật Ngữ</h1>
                <p>Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}</p>
                <p>Tổng số: ${collection.length} thuật ngữ</p>
        `;

        collection.forEach(item => {
            content += `
                <div class="term-item">
                    <div class="term-title">${item.term}</div>
                    <div class="term-category">${item.category}</div>
                    <div class="term-definition">${item.definition}</div>
                    ${item.english ? `<div class="term-english">${item.english}</div>` : ''}
                    <div class="term-date">Thêm ngày: ${new Date(item.addedAt).toLocaleDateString('vi-VN')}</div>
                </div>
            `;
        });

        content += '</body></html>';

        // Tạo blob và download
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bo-suu-tap-thuat-ngu-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Đã xuất bộ sưu tập thành công', 'success');
    }

    clearCollection() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả thuật ngữ trong bộ sưu tập?')) {
            localStorage.removeItem('termCollection');
            localStorage.removeItem('collectionInitialized'); // Reset trạng thái khởi tạo
            this.updateCollectionDisplay();
            this.showNotification('Đã xóa tất cả thuật ngữ', 'success');
        }
    }

    resetCollection() {
        if (confirm('Bạn có chắc chắn muốn reset bộ sưu tập về trạng thái ban đầu?')) {
            localStorage.removeItem('termCollection');
            localStorage.removeItem('collectionInitialized');
            this.updateCollectionDisplay();
            this.showNotification('Đã reset bộ sưu tập về trạng thái ban đầu', 'success');
        }
    }

    scrollToSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.scrollIntoView({ behavior: 'smooth' });
            searchInput.focus();
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    ensureEmptyCollection() {
        // Kiểm tra xem có phải lần đầu chạy không
        const isFirstRun = !localStorage.getItem('collectionInitialized');
        
        if (isFirstRun) {
            // Lần đầu chạy: xóa bộ sưu tập cũ và đánh dấu đã khởi tạo
            localStorage.removeItem('termCollection');
            localStorage.setItem('collectionInitialized', 'true');
            console.log('✅ Bộ sưu tập đã được khởi tạo trống');
        }
    }

    shareTerm(term) {
        if (navigator.share) {
            navigator.share({
                title: 'Thuật ngữ chuyên môn',
                text: `Tìm hiểu về thuật ngữ: ${term}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${term} - Thuật ngữ chuyên môn`);
            this.showNotification('Đã sao chép vào clipboard', 'success');
        }
    }

    showRelatedTerms(term) {
        // Thuật ngữ liên quan dựa trên dữ liệu thật
        const relatedTerms = {
            'Thuật toán': ['Lập trình', 'Cơ sở dữ liệu', 'Trí tuệ nhân tạo', 'Machine Learning'],
            'Lập trình': ['Thuật toán', 'Cơ sở dữ liệu', 'API', 'Frontend', 'Backend'],
            'Cơ sở dữ liệu': ['Lập trình', 'API', 'MySQL', 'PostgreSQL', 'MongoDB'],
            'Huyết áp': ['Tim mạch', 'Chẩn đoán', 'Nhi khoa', 'Sản khoa'],
            'Chẩn đoán': ['Huyết áp', 'Tim mạch', 'Nhi khoa', 'Sản khoa', 'Da liễu'],
            'GDP': ['Lạm phát', 'Thất nghiệp', 'Cung cầu', 'Thị trường'],
            'Lạm phát': ['GDP', 'Thất nghiệp', 'Cung cầu', 'Thị trường', 'Tiền tệ'],
            'Hiến pháp': ['Bộ luật', 'Nghị định', 'Thông tư', 'Quyết định'],
            'Thiết kế': ['Quy hoạch', 'Đô thị', 'Nội thất', 'Ngoại thất', 'Kết cấu']
        };

        const related = relatedTerms[term] || ['Thuật ngữ liên quan', 'Chuyên ngành', 'Lĩnh vực'];
        
        const modal = this.createModal(
            `Thuật ngữ liên quan: ${term}`,
            `
            <div class="related-terms">
                <p>Dưới đây là các thuật ngữ liên quan đến <strong>${term}</strong>:</p>
                <div class="related-terms-list">
                    ${related.map(relatedTerm => 
                        `<div class="related-term-item" onclick="thuatNguSystem.searchTerm('${relatedTerm}')">
                            <i class="fas fa-link"></i>
                            <span>${relatedTerm}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            `
        );
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    searchTerm(term) {
        document.querySelector('.search-input').value = term;
        this.hideSuggestions();
        this.performSearch();
    }

    // Thêm tính năng lọc thông minh
    setupSmartFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value;
        const difficulty = document.getElementById('difficultyFilter')?.value;
        const searchQuery = document.querySelector('.search-input')?.value;

        if (searchQuery) {
            this.performSearch();
        }
    }

    // Thêm tính năng gợi ý thông minh dựa trên lịch sử
    getSmartSuggestions(query) {
        const recentSearches = this.getRecentSearches();
        const suggestions = this.getSuggestions(query);
        
        // Kết hợp gợi ý từ dữ liệu và lịch sử
        const smartSuggestions = [...suggestions];
        
        // Thêm từ lịch sử tìm kiếm
        recentSearches.forEach(search => {
            if (search.toLowerCase().includes(query.toLowerCase()) && 
                !smartSuggestions.find(s => s.term === search)) {
                smartSuggestions.push({
                    term: search,
                    category: 'Tìm kiếm gần đây'
                });
            }
        });

        return smartSuggestions.slice(0, 8);
    }

    getRecentSearches() {
        const searches = localStorage.getItem('recentSearches');
        return searches ? JSON.parse(searches) : [];
    }

    addToRecentSearches(term) {
        let searches = this.getRecentSearches();
        searches = searches.filter(s => s !== term); // Loại bỏ trùng lặp
        searches.unshift(term); // Thêm vào đầu
        searches = searches.slice(0, 10); // Giữ tối đa 10 tìm kiếm
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    }

    loadSampleData() {
        // Không load dữ liệu mẫu vào bộ sưu tập
        // Bộ sưu tập sẽ bắt đầu trống
        console.log('Thuật ngữ system initialized - Bộ sưu tập trống');
        
        // Xóa bộ sưu tập cũ nếu có (để đảm bảo bắt đầu trống)
        localStorage.removeItem('termCollection');
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.thuatNguSystem = new ThuatNguSystem();
});

// Global functions for HTML onclick
window.exportCollection = function() {
    if (window.thuatNguSystem) {
        window.thuatNguSystem.exportCollection();
    }
};

window.clearCollection = function() {
    if (window.thuatNguSystem) {
        window.thuatNguSystem.clearCollection();
    }
};

window.scrollToSearch = function() {
    if (window.thuatNguSystem) {
        window.thuatNguSystem.scrollToSearch();
    }
};

window.resetCollection = function() {
    if (window.thuatNguSystem) {
        window.thuatNguSystem.resetCollection();
    }
};

// Add CSS for additional components
const additionalStyles = `
    .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 1000;
        display: none;
        max-height: 200px;
        overflow-y: auto;
    }

    .suggestion-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .suggestion-item:hover {
        background-color: #f9fafb;
    }

    .suggestion-item:last-child {
        border-bottom: none;
    }

    .suggestion-term {
        font-weight: 500;
        color: #1f2937;
    }

    .suggestion-category {
        font-size: 0.8rem;
        color: #6b7280;
        background: #f3f4f6;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .modal {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
    }

    .modal-content {
        padding: 1.5rem;
    }

    .search-results .result-item {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }

    .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .result-header h4 {
        margin: 0;
        color: #0a4191;
        font-size: 1.5rem;
    }

    .result-category {
        background: #0a4191;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .result-content {
        margin-bottom: 1.5rem;
    }

    .definition-section, .context-section, .examples-section {
        margin-bottom: 1rem;
    }

    .definition-section h5, .context-section h5, .examples-section h5 {
        color: #0a4191;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .definition-section h5 i, .context-section h5 i, .examples-section h5 i {
        margin-right: 0.5rem;
    }

    .result-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .btn-save, .btn-share, .btn-related {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: all 0.3s ease;
    }

    .btn-save {
        background: #0a4191;
        color: white;
    }

    .btn-save:hover {
        background: #1e40af;
        transform: translateY(-1px);
    }

    .btn-share {
        background: #f3f4f6;
        color: #374151;
    }

    .btn-share:hover {
        background: #e5e7eb;
        transform: translateY(-1px);
    }

    .btn-related {
        background: #059669;
        color: white;
    }

    .btn-related:hover {
        background: #047857;
        transform: translateY(-1px);
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10001;
        animation: slideIn 0.3s ease;
    }

    .notification-success {
        border-left: 4px solid #10b981;
    }

    .notification-error {
        border-left: 4px solid #ef4444;
    }

    .notification-warning {
        border-left: 4px solid #f59e0b;
    }

    .notification-info {
        border-left: 4px solid #3b82f6;
    }

    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        color: #6b7280;
        margin-left: 0.5rem;
    }

    .animate-element {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .animate-element.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Dark mode support */
    .dark-mode .search-suggestions {
        background: var(--card-bg);
        border-color: var(--border-color);
    }

    .dark-mode .suggestion-item {
        border-bottom-color: var(--border-color);
    }

    .dark-mode .suggestion-item:hover {
        background-color: var(--bg-secondary);
    }

    .dark-mode .modal {
        background: var(--card-bg);
    }

    .dark-mode .modal-header {
        border-bottom-color: var(--border-color);
    }

    .dark-mode .search-results .result-item {
        border-color: var(--border-color);
    }

    .dark-mode .notification {
        background: var(--card-bg);
    }

    .related-terms {
        padding: 1rem 0;
    }

    .related-terms p {
        margin-bottom: 1rem;
        color: #4a5568;
    }

    .related-terms-list {
        display: grid;
        gap: 0.5rem;
    }

    .related-term-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #f8fafc;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .related-term-item:hover {
        background: #e9f1ff;
        border-color: #0a4191;
        transform: translateX(5px);
    }

    .related-term-item i {
        color: #0a4191;
        font-size: 0.9rem;
    }

    .related-term-item span {
        font-weight: 500;
        color: #1f2937;
    }

    /* Dark mode cho related terms */
    .dark-mode .related-term-item {
        background: var(--bg-secondary);
        border-color: var(--border-color);
    }

    .dark-mode .related-term-item:hover {
        background: var(--card-bg);
        border-color: var(--text-primary);
    }

    .dark-mode .related-term-item span {
        color: var(--text-secondary);
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 