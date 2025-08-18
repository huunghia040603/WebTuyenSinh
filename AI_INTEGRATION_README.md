# AI Integration Guide - Tích hợp AI vào hệ thống tư vấn

## 🚀 Tổng quan

Hệ thống AI tư vấn tuyển sinh đã được tích hợp thành công vào trang web timtruonghoc.vn với **AI Advisor mới** có định dạng chuyên nghiệp. AI có khả năng:

- **Tư vấn ngành nghề** thông minh với định dạng đẹp
- **Thu thập thông tin** người dùng một cách chuyên nghiệp
- **Tự động điền form** đăng ký tư vấn
- **Kết nối chuyên gia** khi cần thiết
- **Định dạng xuống dòng và in đậm** cho trải nghiệm tốt hơn

## 📁 Cấu trúc file

```
WebTuyenSinh/
├── ai_advisor_new.py          # AI Advisor mới với định dạng chuyên nghiệp
├── ai_advisor.py              # AI Advisor cũ (backup)
├── index.py                   # Flask app với API endpoints
├── templates/
│   └── dang-ky-tu-van.html    # Trang tư vấn với AI chat
└── AI_INTEGRATION_README.md   # File này
```

## 🎨 Tính năng mới - Định dạng chuyên nghiệp

### ✅ Cải thiện đã thực hiện:

**1. Định dạng câu trả lời:**
- **Xuống dòng** rõ ràng giữa các phần
- **In đậm** cho tiêu đề và từ khóa quan trọng
- **Emoji** phù hợp cho từng chủ đề
- **Bullet points** có cấu trúc

**2. Ví dụ định dạng mới:**
```
**Thông tin ngành Công nghệ thông tin**

**📝 Mô tả:**
Ngành học về máy tính, phần mềm, mạng và công nghệ số...

**💼 Cơ hội việc làm:**
• Lập trình viên (Developer)
• Kỹ sư phần mềm (Software Engineer)
• Data Scientist

**💰 Mức lương:**
15-150 triệu VND/tháng (tùy kinh nghiệm và vị trí)
```

**3. Thu thập thông tin chuyên nghiệp:**
- **Bước 1:** "**Tuyệt vời! Tôi sẽ giúp bạn liên hệ với chuyên gia tư vấn.**"
- **Bước 2:** "**Cảm ơn bạn!** Tiếp theo, vui lòng cung cấp **email**..."
- **Bước 3:** "**Tuyệt vời!** Cuối cùng, cho mình xin **số điện thoại**..."
- **Hoàn thành:** "**Tuyệt vời! Tôi đã thu thập đủ thông tin của bạn.**"

## 🔧 API Endpoints

### 1. AI Chat API
```http
POST /api/gemini-chat/
Content-Type: application/json

{
  "message": "tư vấn ngành CNTT",
  "history": [],
  "user_id": "user_123"
}
```

**Response với định dạng mới:**
```json
{
  "success": true,
  "response": "**Thông tin ngành Công nghệ thông tin**\n\n**📝 Mô tả:**\nNgành học về máy tính...",
  "user_id": "user_123"
}
```

### 2. User Form Data API
```http
GET /api/user-form-data/{user_id}
```

**Response:**
```json
{
  "success": true,
  "form_data": {
    "name": "Nguyễn Văn A",
    "grade": "Lớp 12",
    "favorite_subjects": "Toán, Tin học",
    "personality": "Hướng nội, Kiên nhẫn",
    "work_preference": "Văn phòng",
    "career_goals": "Làm việc ở công ty lớn"
  }
}
```

### 3. Expert Applications API
```http
POST /api/expert-applications/
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "example@email.com",
  "phone": "0123456789",
  "interested_school_type": "Đại học",
  "interested_major": "Công nghệ thông tin",
  "zalo_phone": "0123456789",
  "facebook_link": "https://facebook.com/...",
  "introduction": "Tôi muốn tư vấn..."
}
```

### 4. Consultation Requests API
```http
POST /api/consultation-requests/
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "example@email.com",
  "phone": "0123456789",
  "conversation_summary": "Tư vấn về ngành CNTT..."
}
```

## 🎯 Tính năng AI

### 1. Tư vấn ngành nghề với định dạng đẹp
AI có thể tư vấn về các ngành với định dạng chuyên nghiệp:
- **Công nghệ thông tin** (CNTT, IT, Computer Science)
- **Kinh tế** (Business, Economics, Finance)
- **Y Dược** (Medicine, Pharmacy, Healthcare)
- **Luật** (Law, Legal)
- **Sư phạm** (Education, Teaching)
- **Du lịch - Khách sạn** (Tourism, Hospitality)
- **Ngôn ngữ - Ngoại ngữ** (Language, Translation)
- **Kiến trúc - Xây dựng** (Architecture, Construction)

### 2. Thu thập thông tin chuyên nghiệp
AI tự động thu thập với giao diện thân thiện:
- **Tên người dùng** - với hướng dẫn rõ ràng
- **Email** - với validation
- **Số điện thoại** - với format chuẩn
- **Mục tiêu học tập** - tùy chọn

### 3. Tự động điền form
Khi đủ thông tin, AI sẽ:
- **Tự động điền form** đăng ký tư vấn
- **Hiển thị modal** xác nhận với định dạng đẹp
- **Gửi yêu cầu tư vấn** tự động

## 🚀 Cách sử dụng

### 1. Khởi động server
```bash
cd WebTuyenSinh
python3 run_server.py
```

### 2. Truy cập trang tư vấn
```
http://localhost:5000/dang-ky-tu-van
```

### 3. Test AI chat với định dạng mới
```bash
# Test chào hỏi với định dạng mới
curl -X POST http://localhost:5000/api/gemini-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "xin chào", "user_id": "test_user"}'

# Test tư vấn ngành với định dạng đẹp
curl -X POST http://localhost:5000/api/gemini-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "tư vấn ngành CNTT", "user_id": "test_user"}'

# Test liên hệ chuyên gia với giao diện chuyên nghiệp
curl -X POST http://localhost:5000/api/gemini-chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "liên hệ chuyên gia", "user_id": "test_user"}'
```

## 🎨 Giao diện mới

### 1. Form đăng ký chuyên gia
- Thông tin cá nhân với validation
- Trường quan tâm với dropdown
- Ngành quan tâm với gợi ý
- Liên hệ (Zalo, Facebook) tùy chọn

### 2. AI Chat với định dạng đẹp
- **Chat box** với AI có định dạng chuyên nghiệp
- **Gợi ý câu hỏi** với emoji và bullet points
- **Thu thập thông tin** tự động với giao diện thân thiện
- **Kết nối chuyên gia** với modal xác nhận đẹp

## 🔧 Tùy chỉnh

### 1. Thêm ngành mới
Chỉnh sửa `ai_advisor_new.py`:
```python
self.knowledge_base['nganh_moi'] = {
    'name': 'Tên ngành',
    'description': 'Mô tả ngành',
    'careers': ['Nghề 1', 'Nghề 2'],
    'skills': ['Kỹ năng 1', 'Kỹ năng 2'],
    'personality_traits': ['Tính cách 1', 'Tính cách 2'],
    # ...
}
```

### 2. Thay đổi định dạng câu trả lời
Chỉnh sửa method `format_response()` trong `ai_advisor_new.py`

### 3. Thêm API endpoint
Thêm route mới trong `index.py`:
```python
@app.route("/api/new-endpoint/", methods=['POST'])
def new_endpoint():
    # Logic xử lý
    return jsonify({'success': True})
```

## 🐛 Troubleshooting

### 1. AI không hoạt động
```bash
# Kiểm tra import
python3 -c "from ai_advisor_new import ai_advisor; print('OK')"

# Kiểm tra server
curl http://localhost:5000/api/gemini-chat/
```

### 2. Lỗi 404
- Kiểm tra route trong `index.py`
- Đảm bảo server đang chạy
- Kiểm tra URL endpoint

### 3. Lỗi import
```bash
# Cài đặt dependencies
pip3 install -r requirements.txt

# Kiểm tra Python path
python3 -c "import sys; print(sys.path)"
```

## 📊 Monitoring

### 1. Logs
Server logs hiển thị:
- API calls với debug info
- AI responses với format mới
- Errors và warnings

### 2. Performance
- Response time với định dạng mới
- Memory usage
- Error rate

## 🔮 Roadmap

### Phase 1 ✅ (Hoàn thành)
- [x] Tích hợp AI cơ bản
- [x] API endpoints
- [x] Thu thập thông tin
- [x] Tự động điền form
- [x] **Định dạng chuyên nghiệp với xuống dòng và in đậm** ✨

### Phase 2 🚧 (Đang phát triển)
- [ ] Database integration
- [ ] User authentication
- [ ] Analytics dashboard
- [ ] Multi-language support

### Phase 3 📋 (Kế hoạch)
- [ ] Machine learning
- [ ] Personalization
- [ ] Voice chat
- [ ] Mobile app

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs
2. Test API endpoints
3. Xem file README này
4. Liên hệ developer

---

**AI Integration hoàn thành với định dạng chuyên nghiệp! 🎉**

Hệ thống AI tư vấn đã sẵn sàng sử dụng với giao diện đẹp tại:
- **Local:** http://localhost:5000/dang-ky-tu-van
- **Production:** https://timtruonghoc.pythonanywhere.com/dang-ky-tu-van

**✨ Tính năng mới:**
- Định dạng xuống dòng và in đậm
- Emoji phù hợp cho từng chủ đề
- Giao diện thu thập thông tin chuyên nghiệp
- Modal xác nhận đẹp mắt 