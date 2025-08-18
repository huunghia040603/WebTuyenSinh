# 🔧 TRACKING SYSTEM FIX - PYTHONANYWHERE

## ❌ **Vấn đề hiện tại:**
```
GET https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=10 500 (Internal Server Error)
GET https://timtruonghoc.pythonanywhere.com/tracking/statistics/ 500 (Internal Server Error)
GET https://timtruonghoc.pythonanywhere.com/tracking/top-schools/?limit=10 500 (Internal Server Error)
```

**Nguyên nhân:** Các tracking models chưa được tạo trong database trên PythonAnywhere.

## ✅ **Giải pháp:**

### **Bước 1: Cập nhật files trên PythonAnywhere**

Tất cả các file backend đã đúng, chỉ cần đảm bảo có đầy đủ:

1. **models.py** - Có 3 models: `SchoolViewCount`, `MajorViewCount`, `DailyViewStats`
2. **serializers.py** - Có 5 serializers cho tracking
3. **views.py** - Có 5 API views cho tracking
4. **urls.py** - Có 5 URL patterns cho tracking

### **Bước 2: Tạo Migration trên PythonAnywhere**

```bash
# Trên PythonAnywhere console
python manage.py makemigrations
python manage.py migrate
```

### **Bước 3: Tạo dữ liệu mẫu (Optional)**

```python
# Trong Django shell trên PythonAnywhere
python manage.py shell

# Tạo view counts cho tất cả schools và majors
from your_app.models import School, Major, SchoolViewCount, MajorViewCount

for school in School.objects.all():
    SchoolViewCount.objects.get_or_create(
        school=school,
        defaults={'view_count': 500}
    )

for major in Major.objects.all():
    MajorViewCount.objects.get_or_create(
        major=major,
        defaults={'view_count': 500}
    )

print("✅ Đã tạo dữ liệu mẫu!")
exit()
```

### **Bước 4: Test API Endpoints**

```bash
# Test tracking endpoints
curl -X POST -H "Content-Type: application/json" \
  -d '{"school_id": "1"}' \
  https://timtruonghoc.pythonanywhere.com/tracking/increment-school-view/

curl -X POST -H "Content-Type: application/json" \
  -d '{"major_id": "1"}' \
  https://timtruonghoc.pythonanywhere.com/tracking/increment-major-view/

curl "https://timtruonghoc.pythonanywhere.com/tracking/top-schools/?limit=5"

curl "https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=5"

curl "https://timtruonghoc.pythonanywhere.com/tracking/statistics/"
```

## 📋 **Files đã sẵn sàng:**

### ✅ **models.py** - Tracking Models
```python
class SchoolViewCount(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='view_counts')
    view_count = models.IntegerField(default=0)
    last_viewed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('school',)

class MajorViewCount(models.Model):
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='view_counts')
    view_count = models.IntegerField(default=0)
    last_viewed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('major',)

class DailyViewStats(models.Model):
    date = models.DateField(unique=True)
    total_school_views = models.IntegerField(default=0)
    total_major_views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
```

### ✅ **serializers.py** - Tracking Serializers
- `SchoolViewCountSerializer`
- `MajorViewCountSerializer`
- `DailyViewStatsSerializer`
- `TopSchoolsSerializer`
- `TopMajorsSerializer`

### ✅ **views.py** - Tracking API Views
- `increment_school_view()` - POST
- `increment_major_view()` - POST
- `top_schools()` - GET
- `top_majors()` - GET
- `view_statistics()` - GET

### ✅ **urls.py** - Tracking URL Patterns
```python
path('tracking/increment-school-view/', increment_school_view, name='increment-school-view'),
path('tracking/increment-major-view/', increment_major_view, name='increment-major-view'),
path('tracking/top-schools/', top_schools, name='top-schools'),
path('tracking/top-majors/', top_majors, name='top-majors'),
path('tracking/statistics/', view_statistics, name='view-statistics'),
```

## 🎯 **Kết quả mong đợi:**

Sau khi hoàn thành migration:

1. ✅ **API endpoints hoạt động** - Không còn lỗi 500
2. ✅ **Dữ liệu thật** - Lấy từ PythonAnywhere database
3. ✅ **Real-time tracking** - Tăng lượt xem khi user click
4. ✅ **Thống kê chính xác** - Hiển thị top schools/majors thật
5. ✅ **Chart data** - Dữ liệu biểu đồ từ database thật

## 🚀 **Bước tiếp theo:**

1. **Cập nhật PythonAnywhere** với các file đã cung cấp
2. **Chạy migration** để tạo database tables
3. **Test API endpoints** để đảm bảo hoạt động
4. **Reload web app** nếu cần

**Khi hoàn thành, tracking system sẽ hoạt động hoàn hảo với dữ liệu thật từ PythonAnywhere!** 🎉 