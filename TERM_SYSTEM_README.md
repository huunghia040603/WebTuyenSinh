# Hệ Thống Quản Lý Thuật Ngữ Ngành Học

## 📋 Tổng Quan

Hệ thống quản lý thuật ngữ ngành học là một nền tảng toàn diện được thiết kế để hỗ trợ người dùng tìm kiếm, tra cứu và đóng góp các thuật ngữ chuyên môn. Mục tiêu chính là cung cấp một nguồn dữ liệu đáng tin cậy và nhất quán, giúp người dùng hiểu và sử dụng ngôn ngữ chuyên ngành một cách chính xác.

## 🏗️ Cấu Trúc Database

### 1. **TermCategory** - Danh mục thuật ngữ
```sql
- id: Primary Key
- name: Tên danh mục (Tiếng Việt)
- name_en: Tên danh mục (Tiếng Anh)
- description: Mô tả
- icon: Icon FontAwesome
- color: Màu sắc
- is_active: Trạng thái hoạt động
- created_at, updated_at: Timestamps
```

### 2. **Term** - Thuật ngữ chính ⭐
```sql
- id: Primary Key
- term_vn: Thuật ngữ (Tiếng Việt)
- term_en: Thuật ngữ (Tiếng Anh)
- abbreviation: Viết tắt
- category: FK -> TermCategory
- field_group: FK -> FieldGroup
- major: FK -> Major
- definition: Định nghĩa
- definition_en: Định nghĩa (Tiếng Anh)
- context: Ngữ cảnh sử dụng
- examples: Ví dụ
- difficulty_level: Mức độ khó (beginner/intermediate/advanced/expert)
- tags: Tags phân cách bằng dấu phẩy
- pronunciation: Phát âm
- status: Trạng thái (draft/pending/approved/rejected)
- is_featured: Thuật ngữ nổi bật
- view_count, search_count: Thống kê
- created_by, updated_by, approved_by: FK -> User
- created_at, updated_at, approved_at: Timestamps
```

### 3. **TermSynonym** - Từ đồng nghĩa
```sql
- id: Primary Key
- term: FK -> Term
- synonym_vn: Từ đồng nghĩa (Tiếng Việt)
- synonym_en: Từ đồng nghĩa (Tiếng Anh)
- created_at: Timestamp
```

### 4. **TermRelated** - Thuật ngữ liên quan
```sql
- id: Primary Key
- term: FK -> Term (Thuật ngữ chính)
- related_term: FK -> Term (Thuật ngữ liên quan)
- relationship: Mối quan hệ (synonym/antonym/broader/narrower/related/prerequisite)
- description: Mô tả mối quan hệ
- created_at: Timestamp
```

### 5. **TermTranslation** - Bản dịch đa ngôn ngữ
```sql
- id: Primary Key
- term: FK -> Term
- language: Ngôn ngữ (en/fr/de/ja/ko/zh/es/ru)
- translation: Bản dịch
- pronunciation: Phát âm
- notes: Ghi chú
- created_at: Timestamp
```

### 6. **UserTermCollection** - Bộ sưu tập cá nhân
```sql
- id: Primary Key
- user: FK -> User
- name: Tên bộ sưu tập
- description: Mô tả
- is_public: Công khai
- color: Màu sắc
- created_at, updated_at: Timestamps
```

### 7. **UserTermCollectionItem** - Thuật ngữ trong bộ sưu tập
```sql
- id: Primary Key
- collection: FK -> UserTermCollection
- term: FK -> Term
- notes: Ghi chú cá nhân
- is_favorite: Yêu thích
- added_at: Timestamp
```

### 8. **TermContribution** - Đóng góp từ người dùng
```sql
- id: Primary Key
- contributor: FK -> User
- contribution_type: Loại đóng góp (new_term/edit_definition/add_example/add_translation/report_error/suggestion)
- term: FK -> Term (có thể null)
- title: Tiêu đề
- content: Nội dung
- suggested_term_vn, suggested_term_en: Thuật ngữ đề xuất
- suggested_definition: Định nghĩa đề xuất
- status: Trạng thái (pending/reviewing/approved/rejected/implemented)
- reviewed_by: FK -> User
- review_notes: Ghi chú xem xét
- created_at, reviewed_at: Timestamps
```

### 9. **TermSearchHistory** - Lịch sử tìm kiếm
```sql
- id: Primary Key
- user: FK -> User
- search_query: Từ khóa tìm kiếm
- results_count: Số kết quả
- clicked_term: FK -> Term
- search_filters: JSON filters
- created_at: Timestamp
```

### 10. **TermViewHistory** - Lịch sử xem
```sql
- id: Primary Key
- user: FK -> User
- term: FK -> Term
- view_duration: Thời gian xem (giây)
- source: Nguồn (search/collection/etc.)
- created_at: Timestamp
```

### 11. **TermRating** - Đánh giá thuật ngữ
```sql
- id: Primary Key
- user: FK -> User
- term: FK -> Term
- rating: Điểm đánh giá (1-5)
- comment: Nhận xét
- is_helpful: Hữu ích
- created_at: Timestamp
```

## 🔧 API Endpoints

### Danh mục thuật ngữ
- `GET /api/term-categories/` - Lấy danh sách danh mục
- `GET /api/term-categories/{id}/` - Chi tiết danh mục
- `POST /api/term-categories/` - Tạo danh mục mới (Admin)
- `PUT /api/term-categories/{id}/` - Cập nhật danh mục (Admin)
- `DELETE /api/term-categories/{id}/` - Xóa danh mục (Admin)

### Thuật ngữ
- `GET /api/terms/` - Lấy danh sách thuật ngữ
- `GET /api/terms/{id}/` - Chi tiết thuật ngữ
- `POST /api/terms/` - Tạo thuật ngữ mới (Admin)
- `PUT /api/terms/{id}/` - Cập nhật thuật ngữ (Admin)
- `DELETE /api/terms/{id}/` - Xóa thuật ngữ (Admin)
- `POST /api/terms/{id}/increment-view/` - Tăng lượt xem
- `POST /api/terms/{id}/increment-search/` - Tăng lượt tìm kiếm

### Tìm kiếm thuật ngữ
- `POST /api/terms/search/` - Tìm kiếm nâng cao
- `GET /api/terms/search/suggestions/` - Gợi ý tìm kiếm
- `GET /api/terms/featured/` - Thuật ngữ nổi bật
- `GET /api/terms/recent/` - Thuật ngữ mới nhất

### Bộ sưu tập cá nhân
- `GET /api/user-collections/` - Bộ sưu tập của user
- `POST /api/user-collections/` - Tạo bộ sưu tập mới
- `GET /api/user-collections/{id}/` - Chi tiết bộ sưu tập
- `PUT /api/user-collections/{id}/` - Cập nhật bộ sưu tập
- `DELETE /api/user-collections/{id}/` - Xóa bộ sưu tập
- `POST /api/user-collections/{id}/add-term/` - Thêm thuật ngữ
- `DELETE /api/user-collections/{id}/remove-term/{term_id}/` - Xóa thuật ngữ

### Đóng góp
- `GET /api/contributions/` - Lịch sử đóng góp
- `POST /api/contributions/` - Tạo đóng góp mới
- `GET /api/contributions/{id}/` - Chi tiết đóng góp
- `PUT /api/contributions/{id}/` - Cập nhật đóng góp (Admin)

### Thống kê
- `GET /api/terms/stats/` - Thống kê tổng quan
- `GET /api/terms/top-viewed/` - Thuật ngữ xem nhiều nhất
- `GET /api/terms/top-rated/` - Thuật ngữ đánh giá cao nhất
- `GET /api/terms/top-searched/` - Thuật ngữ tìm kiếm nhiều nhất

## 🎯 Tính Năng Chính

### 1. **Tra Cứu Thuật Ngữ**
- ✅ Tìm kiếm thông minh với auto-suggest
- ✅ Kết quả chi tiết với định nghĩa, ngữ cảnh, ví dụ
- ✅ Thuật ngữ liên quan và từ đồng nghĩa
- ✅ Bản dịch đa ngôn ngữ
- ✅ Phân loại theo mức độ khó

### 2. **Đóng Góp & Đề Xuất**
- ✅ Đề xuất thuật ngữ mới
- ✅ Góp ý chỉnh sửa định nghĩa
- ✅ Báo cáo sai sót
- ✅ Đánh giá chất lượng
- ✅ Hệ thống duyệt đóng góp

### 3. **Bộ Sưu Tập Cá Nhân**
- ✅ Lưu thuật ngữ yêu thích
- ✅ Tạo danh sách học tập
- ✅ Xuất dữ liệu PDF/Excel
- ✅ Đồng bộ đa thiết bị
- ✅ Chia sẻ với bạn bè

### 4. **Tích Hợp Công Cụ**
- ✅ API cho ứng dụng khác
- ✅ Gợi ý tự động khi soạn thảo
- ✅ Tiện ích mở rộng trình duyệt

## 📊 Thống Kê & Analytics

### Metrics được theo dõi:
- **Lượt xem thuật ngữ**: Theo dõi mức độ quan tâm
- **Lượt tìm kiếm**: Phân tích từ khóa phổ biến
- **Đánh giá người dùng**: Chất lượng nội dung
- **Thời gian xem**: Mức độ tương tác
- **Nguồn truy cập**: Từ đâu người dùng đến

### Báo cáo:
- Thuật ngữ phổ biến nhất
- Danh mục được quan tâm nhiều nhất
- Xu hướng tìm kiếm theo thời gian
- Hiệu suất đóng góp của cộng đồng

## 🔐 Bảo Mật & Quyền Truy Cập

### Phân quyền:
- **Admin**: Quản lý toàn bộ hệ thống
- **Staff**: Duyệt đóng góp, quản lý nội dung
- **Regular User**: Tìm kiếm, đóng góp, tạo bộ sưu tập
- **Guest**: Chỉ xem thuật ngữ công khai

### Bảo mật:
- Xác thực JWT token
- Rate limiting cho API
- Validation dữ liệu đầu vào
- Backup dữ liệu định kỳ

## 🚀 Triển Khai

### 1. **Cài đặt dependencies**
```bash
pip install -r requirements.txt
```

### 2. **Tạo migration**
```bash
python create_term_migration.py
```

### 3. **Chạy migration**
```bash
python manage.py migrate
```

### 4. **Tạo dữ liệu mẫu**
```bash
python create_term_migration.py
```

### 5. **Khởi động server**
```bash
python index.py
```

## 📝 Ví Dụ Sử Dụng

### Tạo thuật ngữ mới:
```python
from models import Term, TermCategory, FieldGroup, Major

# Tạo thuật ngữ
term = Term.objects.create(
    term_vn="Thuật toán",
    term_en="Algorithm",
    abbreviation="ALG",
    category=TermCategory.objects.get(name="Công nghệ thông tin"),
    field_group=FieldGroup.objects.first(),
    major=Major.objects.first(),
    definition="Một tập hợp các quy tắc hoặc hướng dẫn được định nghĩa rõ ràng để thực hiện một nhiệm vụ cụ thể.",
    context="Thuật toán được sử dụng trong lập trình để giải quyết các bài toán phức tạp.",
    examples="Thuật toán sắp xếp nổi bọt, thuật toán tìm kiếm nhị phân.",
    difficulty_level="intermediate",
    status="approved"
)
```

### Tìm kiếm thuật ngữ:
```python
from models import Term

# Tìm kiếm theo từ khóa
terms = Term.objects.filter(
    term_vn__icontains="thuật toán",
    status="approved"
)

# Tìm kiếm theo danh mục
it_terms = Term.objects.filter(
    category__name="Công nghệ thông tin",
    status="approved"
)
```

## 🔄 Roadmap

### Phase 1 (Hiện tại):
- ✅ Model và database design
- ✅ API endpoints cơ bản
- ✅ Trang web demo
- ✅ Hệ thống đóng góp

### Phase 2 (Sắp tới):
- 🔄 Machine Learning cho gợi ý thông minh
- 🔄 Tích hợp với các công cụ soạn thảo
- 🔄 Mobile app
- 🔄 Hệ thống gamification

### Phase 3 (Tương lai):
- 🔄 AI-powered content generation
- 🔄 Voice search
- 🔄 AR/VR integration
- 🔄 Blockchain for content verification

## 📞 Hỗ Trợ

Nếu bạn có câu hỏi hoặc gặp vấn đề, vui lòng liên hệ:
- Email: support@webtuyensinh.com
- GitHub Issues: [Tạo issue mới](https://github.com/your-repo/issues)
- Documentation: [Xem thêm tài liệu](https://docs.webtuyensinh.com)

---

**Hệ thống quản lý thuật ngữ ngành học** - Xây dựng cộng đồng tri thức chuyên môn! 🎓 