# Hướng dẫn Import Dữ liệu Thuật ngữ Bổ sung

## 📋 Tổng quan
File `terms_extra.xlsx` đã được tạo với 10,000 thuật ngữ bổ sung. Hướng dẫn này sẽ giúp bạn import dữ liệu này vào database Django.

## 📁 Các file đã tạo
- `import_extra_terms.py` - Script import cho môi trường local
- `import_extra_terms_pythonanywhere.py` - Script import cho PythonAnywhere
- `static/data/terms_extra.xlsx` - File Excel chứa 10,000 thuật ngữ
- `static/data/terms_index_extra.json` - File JSON chứa dữ liệu thuật ngữ

## 🚀 Cách thực hiện

### Bước 1: Kiểm tra file Excel
```bash
# Kiểm tra xem file có tồn tại không
ls -la static/data/terms_extra.xlsx
```

### Bước 2: Import vào Database

#### Trên PythonAnywhere:
```bash
cd /home/timtruonghoc/timtruonghoc/apptimtruonghoc
python import_extra_terms_pythonanywhere.py
```

#### Trên môi trường local:
```bash
python import_extra_terms.py
```

### Bước 3: Kiểm tra kết quả
Script sẽ hiển thị:
- Số dòng dữ liệu đọc được
- Mapping các cột
- Số terms đã import
- Số terms bị bỏ qua (do trùng lặp hoặc thiếu dữ liệu)
- Tổng số terms trong database

## 📊 Cấu trúc dữ liệu
File Excel có các cột:
1. **STT** - Số thứ tự
2. **Ngành học** - Lĩnh vực chuyên môn
3. **Thuật ngữ (Tiếng Việt)** - Thuật ngữ tiếng Việt
4. **Thuật ngữ (Tiếng Anh)** - Thuật ngữ tiếng Anh
5. **Giải thích** - Định nghĩa chi tiết

## 🔍 Các lĩnh vực được bao gồm
- An ninh - Quốc phòng
- Chính trị
- Công nghệ thông tin
- Khoa học - Kỹ thuật - Công nghệ
- Kinh doanh - Quản lý
- Luật
- Sản xuất - Chế biến
- Sức khỏe
- Thú y - Nông, Lâm, Ngư nghiệp
- Toán - Công nghệ thông tin - Máy tính
- Truyền thông - Nghệ thuật - Nhân văn
- Vận tải - Du lịch - Thể thao
- Xã hội - Giáo dục
- Xây dựng - Môi trường
- Và nhiều lĩnh vực khác

## ⚠️ Lưu ý quan trọng
1. **Trùng lặp**: Script sẽ tự động bỏ qua các thuật ngữ đã tồn tại
2. **Dữ liệu thiếu**: Các dòng thiếu thuật ngữ hoặc giải thích sẽ bị bỏ qua
3. **Category tự động**: Các category mới sẽ được tạo tự động
4. **Thời gian**: Quá trình import có thể mất vài phút do số lượng lớn

## 🎯 Kết quả mong đợi
Sau khi import thành công:
- Database sẽ có thêm khoảng 10,000 thuật ngữ mới
- Hệ thống tìm kiếm sẽ trở nên "thông minh" hơn với nhiều dữ liệu
- Trang `/thuatngu` sẽ hiển thị số liệu thống kê cập nhật

## 🔧 Xử lý lỗi

### Lỗi "Module not found"
```bash
pip install pandas openpyxl
```

### Lỗi "File not found"
Kiểm tra đường dẫn file Excel và đảm bảo file tồn tại.

### Lỗi Django settings
Đảm bảo đang ở đúng thư mục và Django được cấu hình đúng.

## 📞 Hỗ trợ
Nếu gặp vấn đề, hãy chạy script và chia sẻ output để được hỗ trợ. 