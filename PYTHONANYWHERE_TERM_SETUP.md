# Hướng Dẫn Setup Hệ Thống Thuật Ngữ Trên PythonAnywhere

## 🚀 Bước 1: Upload File Excel

1. **Truy cập PythonAnywhere Console**
   - Đăng nhập vào PythonAnywhere
   - Mở Bash console

2. **Upload file Excel**
   ```bash
   # Tạo thư mục nếu chưa có
   mkdir -p /home/timtruonghoc/timtruonghoc/apptimtruonghoc/
   
   # Upload file thuat.xlsx vào thư mục này
   # Hoặc sử dụng Files tab trong PythonAnywhere để upload
   ```

3. **Kiểm tra file**
   ```bash
   ls -la /home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx
   ```

## 🔧 Bước 2: Cài Đặt Dependencies

1. **Cài đặt pandas và openpyxl**
   ```bash
   pip install pandas openpyxl
   ```

2. **Kiểm tra cài đặt**
   ```bash
   python -c "import pandas as pd; print('Pandas version:', pd.__version__)"
   python -c "import openpyxl; print('OpenPyXL installed successfully')"
   ```

## 📝 Bước 3: Tạo Migration

1. **Tạo migration cho models thuật ngữ**
   ```bash
   cd /home/timtruonghoc/timtruonghoc
   python manage.py makemigrations
   ```

2. **Áp dụng migration**
   ```bash
   python manage.py migrate
   ```

## 📊 Bước 4: Import Dữ Liệu

1. **Chạy script import**
   ```bash
   cd /home/timtruonghoc/timtruonghoc
   python import_terms_pythonanywhere.py
   ```

2. **Kiểm tra kết quả**
   - Script sẽ hiển thị số lượng danh mục và thuật ngữ đã tạo
   - Kiểm tra log để đảm bảo không có lỗi

## 🌐 Bước 5: Cập Nhật URLs

1. **Thêm route cho trang thuật ngữ**
   - Mở file `urls.py` trong Django project
   - Thêm URL pattern cho trang thuật ngữ

2. **Cập nhật WSGI file** (nếu cần)
   - Đảm bảo Django app được cấu hình đúng

## 🔍 Bước 6: Kiểm Tra

1. **Truy cập trang web**
   ```
   https://yourusername.pythonanywhere.com/thuatngu
   ```

2. **Kiểm tra admin panel**
   ```
   https://yourusername.pythonanywhere.com/admin
   ```

3. **Kiểm tra API endpoints**
   ```
   https://yourusername.pythonanywhere.com/api/terms/
   https://yourusername.pythonanywhere.com/api/term-categories/
   ```

## 📋 Cấu Trúc File Trên PythonAnywhere

```
/home/timtruonghoc/timtruonghoc/
├── timtruonghoc/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apptimtruonghoc/
│   ├── models.py (đã có models thuật ngữ)
│   ├── serializers.py (đã có serializers thuật ngữ)
│   ├── views.py (cần thêm views)
│   ├── thuat.xlsx (file Excel)
│   └── templates/
│       └── thuatngu.html
├── import_terms_pythonanywhere.py
└── manage.py
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **ModuleNotFoundError: No module named 'pandas'**
   ```bash
   pip install pandas openpyxl
   ```

2. **File not found: thuat.xlsx**
   - Kiểm tra đường dẫn file
   - Đảm bảo file đã được upload đúng vị trí

3. **Database connection error**
   - Kiểm tra cấu hình database trong settings.py
   - Đảm bảo database đã được tạo

4. **Permission denied**
   ```bash
   chmod +x import_terms_pythonanywhere.py
   ```

### Kiểm tra trạng thái:

```bash
# Kiểm tra file Excel
ls -la /home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx

# Kiểm tra database
python manage.py shell
>>> from apptimtruonghoc.models import Term, TermCategory
>>> print(f"Terms: {Term.objects.count()}")
>>> print(f"Categories: {TermCategory.objects.count()}")
>>> exit()
```

## 📈 Monitoring

### Theo dõi hiệu suất:

1. **Kiểm tra logs**
   ```bash
   tail -f /var/log/your-app.log
   ```

2. **Kiểm tra database size**
   ```sql
   SELECT pg_size_pretty(pg_database_size('your_database'));
   ```

3. **Kiểm tra số lượng records**
   ```python
   from apptimtruonghoc.models import Term, TermCategory
   print(f"Total terms: {Term.objects.count()}")
   print(f"Total categories: {TermCategory.objects.count()}")
   ```

## 🔄 Backup & Restore

### Backup dữ liệu:
```bash
# Backup database
python manage.py dumpdata apptimtruonghoc > backup_terms.json

# Backup file Excel
cp /home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx backup_thuat.xlsx
```

### Restore dữ liệu:
```bash
# Restore database
python manage.py loaddata backup_terms.json
```

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành setup, bạn sẽ có:

- ✅ **2,617 thuật ngữ** từ 50+ ngành học
- ✅ **Trang web thuật ngữ** hoạt động
- ✅ **API endpoints** cho tìm kiếm và quản lý
- ✅ **Admin panel** để quản lý dữ liệu
- ✅ **Hệ thống tìm kiếm** thông minh

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. **PythonAnywhere Console logs**
2. **Django error logs**
3. **Database connection**
4. **File permissions**

---

**Chúc bạn setup thành công hệ thống thuật ngữ trên PythonAnywhere!** 🎉 