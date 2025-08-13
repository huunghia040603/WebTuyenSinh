# Hướng dẫn Copy File lên PythonAnywhere

## 📋 Các file cần copy

### 1. File JSON đã được tạo
- `static/data/terms_index_combined.json` (8.1MB) - File chính chứa 11,781 thuật ngữ

### 2. File JavaScript đã cập nhật
- `static/js/thuatngu.js` - Đã cập nhật để load file combined

### 3. File HTML đã cập nhật
- `templates/thuatngu.html` - Đã cập nhật số liệu thống kê

## 🚀 Cách copy lên PythonAnywhere

### Bước 1: Upload file JSON
```bash
# Trên PythonAnywhere, tạo thư mục nếu chưa có
mkdir -p /home/timtruonghoc/timtruonghoc/apptimtruonghoc/static/data

# Upload file terms_index_combined.json lên thư mục này
```

### Bước 2: Upload file JavaScript
```bash
# Copy file thuatngu.js lên
# /home/timtruonghoc/timtruonghoc/apptimtruonghoc/static/js/thuatngu.js
```

### Bước 3: Upload file HTML
```bash
# Copy file thuatngu.html lên
# /home/timtruonghoc/timtruonghoc/apptimtruonghoc/templates/thuatngu.html
```

## 📊 Kết quả mong đợi

Sau khi copy xong:
- Trang `/thuatngu` sẽ hiển thị 11,781 thuật ngữ thay vì 2,617
- Số lĩnh vực sẽ là 23 thay vì 50+
- Hệ thống tìm kiếm sẽ có nhiều dữ liệu hơn
- Các số liệu thống kê sẽ được cập nhật

## 🔍 Kiểm tra

1. Truy cập trang `/thuatngu` trên PythonAnywhere
2. Kiểm tra console browser để xem log "Loaded X terms from combined file"
3. Thử tìm kiếm một số thuật ngữ để đảm bảo hoạt động tốt

## ⚠️ Lưu ý

- File JSON khá lớn (8.1MB), có thể mất thời gian upload
- Đảm bảo restart server sau khi upload file
- Kiểm tra quyền truy cập file trên PythonAnywhere 