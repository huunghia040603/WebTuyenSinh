# Tóm tắt Luồng Dữ liệu - Hệ thống Tư vấn

## 🎯 Tổng quan

Hệ thống có **2 luồng dữ liệu riêng biệt** để xử lý các loại đăng ký khác nhau:

## 📋 Luồng 1: Đăng ký Chuyên gia (ExpertApplication)

### 🔄 Quy trình:
1. **Người dùng điền form** → `templates/dang-ky-tu-van.html`
2. **Bấm nút "Hoàn tất đăng ký"** → Gọi hàm `submitExpert()`
3. **Gửi đến PythonAnywhere** → `https://timtruonghoc.pythonanywhere.com/api/expert-applications/`
4. **Lưu vào database** → Model `ExpertApplication` trên PythonAnywhere

### 📊 Dữ liệu được thu thập:
```javascript
{
  full_name: "Họ và tên",
  email: "email@domain.com", 
  phone: "0123456789",
  zalo_phone: "Zalo (nếu có)",
  interested_school_type: "Trường quan tâm", // Không bắt buộc
  interested_major: "Ngành của trường đã chọn", // Không bắt buộc
  facebook_link: "Facebook (nếu có)",
  introduction: "Giới thiệu bản thân & sở thích"
}
```

### 🎯 Mục đích:
- Đăng ký làm **chuyên gia tư vấn**
- Thu thập thông tin chi tiết về chuyên môn
- Lưu trữ trên server PythonAnywhere

---

## 🤖 Luồng 2: Yêu cầu Tư vấn AI (ConsultationRequest)

### 🔄 Quy trình:
1. **Người dùng chat với AI** → Trợ lý AI thu thập thông tin
2. **AI hiển thị modal xác nhận** → Hàm `showConfirmationModal()`
3. **Bấm nút "Xác nhận và gửi"** → Gọi hàm `confirmAndSubmitConsultation()`
4. **Gửi đến Local Server** → `http://127.0.0.1:5000/api/consultation-requests/`
5. **Lưu vào database** → Model `ConsultationRequest` local

### 📊 Dữ liệu được thu thập:
```javascript
{
  full_name: "Tên từ AI",
  email: "email@domain.com",
  phone: "0123456789", 
  conversation_summary: "Tóm tắt cuộc trò chuyện với AI"
}
```

### 🎯 Mục đích:
- **Yêu cầu tư vấn từ AI**
- Thu thập thông tin cơ bản
- Lưu trữ trên server local

---

## 🔧 Cấu hình Backend

### 📁 File: `index.py`

#### API Endpoint cho ExpertApplication:
```python
@app.route("/api/expert-applications/", methods=['POST'])
def expert_applications():
    # Gửi đến PythonAnywhere
    # Không lưu local
```

#### API Endpoint cho ConsultationRequest:
```python
@app.route("/api/consultation-requests/", methods=['POST'])
def consultation_requests():
    # Lưu vào local database
    consultation = ConsultationRequest.objects.create(
        full_name=data['full_name'],
        email=data['email'],
        phone=data['phone'],
        conversation_summary=data.get('conversation_summary', '')
    )
```

### 📁 File: `templates/dang-ky-tu-van.html`

#### Hàm submitExpert():
```javascript
async function submitExpert() {
  const base = (location.hostname.includes('pythonanywhere.com')) ? 
    '' : 'https://timtruonghoc.pythonanywhere.com';
  const res = await fetch(`${base}/api/expert-applications/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload)
  });
}
```

#### Hàm saveConsultation():
```javascript
async function saveConsultation(full_name, email, phone, summary) {
  const base = (location.hostname.includes('pythonanywhere.com')) ? 
    '' : 'http://127.0.0.1:5000';
  const res = await fetch(`${base}/api/consultation-requests/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, phone, conversation_summary: summary })
  });
}
```

---

## 🎨 Giao diện

### 📱 Form đăng ký chuyên gia:
- **Nút:** "Hoàn tất đăng ký"
- **Validation:** Chỉ yêu cầu Họ tên, Email, Số điện thoại, Giới thiệu
- **Trường quan tâm & Ngành:** Không bắt buộc (đã bỏ dấu *)

### 🤖 Modal AI:
- **Nút:** "Xác nhận và gửi"
- **Validation:** Chỉ yêu cầu Email và Số điện thoại
- **Dữ liệu:** Tự động điền từ AI

---

## ✅ Kiểm tra hoạt động

### Test ExpertApplication:
```bash
curl -X POST https://timtruonghoc.pythonanywhere.com/api/expert-applications/ \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test Expert", "email": "expert@example.com", "phone": "0123456789", "introduction": "Test"}'
```

### Test ConsultationRequest:
```bash
curl -X POST http://localhost:5000/api/consultation-requests/ \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test AI User", "email": "ai@example.com", "phone": "0123456789", "conversation_summary": "Test"}'
```

---

## 🎯 Kết luận

**2 luồng dữ liệu hoàn toàn độc lập:**
- ✅ **ExpertApplication** → PythonAnywhere (chuyên gia)
- ✅ **ConsultationRequest** → Local Server (AI tư vấn)
- ✅ **Validation riêng biệt** cho từng loại
- ✅ **Database models** tách biệt
- ✅ **API endpoints** riêng biệt 