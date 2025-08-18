# 🚀 PYTHONANYWHERE TRACKING SYSTEM SETUP

## ❌ **Vấn đề hiện tại:**
PythonAnywhere backend đang trả về lỗi 500 vì các tracking models chưa được tạo trong database.

## ✅ **Giải pháp: Cập nhật PythonAnywhere**

### **1. Tạo Migration Files**

Trên PythonAnywhere, chạy các lệnh sau:

```bash
# Tạo migration cho tracking models
python manage.py makemigrations

# Chạy migration để tạo tables
python manage.py migrate
```

### **2. Kiểm tra Models đã được tạo**

```bash
# Vào Django shell
python manage.py shell

# Kiểm tra models
from your_app.models import SchoolViewCount, MajorViewCount, DailyViewStats
print("✅ Tracking models đã sẵn sàng!")
exit()
```

### **3. Tạo dữ liệu mẫu (Optional)**

```python
# Trong Django shell
from your_app.models import School, Major, SchoolViewCount, MajorViewCount
from datetime import date, timedelta

# Tạo view counts cho tất cả schools
for school in School.objects.all():
    SchoolViewCount.objects.get_or_create(
        school=school,
        defaults={'view_count': 500}
    )

# Tạo view counts cho tất cả majors  
for major in Major.objects.all():
    MajorViewCount.objects.get_or_create(
        major=major,
        defaults={'view_count': 500}
    )

print("✅ Đã tạo dữ liệu mẫu!")
```

### **4. Test API Endpoints**

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

## 📋 **Files cần cập nhật trên PythonAnywhere:**

### **1. models.py** ✅ (Đã có)
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

### **2. serializers.py** ✅ (Đã có)
```python
class SchoolViewCountSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    school_short_code = serializers.CharField(source='school.short_code', read_only=True)
    
    class Meta:
        model = SchoolViewCount
        fields = ['id', 'school', 'school_name', 'school_logo', 'school_short_code', 'view_count', 'last_viewed', 'created_at']

class MajorViewCountSerializer(serializers.ModelSerializer):
    major_name = serializers.CharField(source='major.name', read_only=True)
    major_id = serializers.CharField(source='major.major_id', read_only=True)
    school_name = serializers.CharField(source='major.school.name_vn', read_only=True)
    school_short_code = serializers.CharField(source='major.school.short_code', read_only=True)
    school_logo = serializers.CharField(source='major.school.logo', read_only=True)
    
    class Meta:
        model = MajorViewCount
        fields = ['id', 'major', 'major_name', 'major_id', 'school_name', 'school_short_code', 'school_logo', 'view_count', 'last_viewed', 'created_at']

class DailyViewStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyViewStats
        fields = ['id', 'date', 'total_school_views', 'total_major_views', 'created_at']

class TopSchoolsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField()
    rank = serializers.IntegerField()
    
    class Meta:
        model = School
        fields = ['id', 'name_vn', 'short_code', 'logo', 'school_type', 'country', 'view_count', 'rank']

class TopMajorsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField()
    rank = serializers.IntegerField()
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_short_code = serializers.CharField(source='school.short_code', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    
    class Meta:
        model = Major
        fields = ['id', 'major_id', 'name', 'school_name', 'school_short_code', 'school_logo', 'view_count', 'rank']
```

### **3. views.py** ✅ (Đã có)
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def increment_school_view(request):
    school_id = request.data.get('school_id')
    if not school_id:
        return Response({'error': 'school_id là bắt buộc'}, status=400)
    
    try:
        school = School.objects.get(id=school_id)
        view_count, created = SchoolViewCount.objects.get_or_create(
            school=school,
            defaults={'view_count': 1}
        )
        
        if not created:
            view_count.view_count += 1
            view_count.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': f'Đã tăng lượt xem cho trường {school.name_vn}'
        })
        
    except School.DoesNotExist:
        return Response({'error': 'Không tìm thấy trường'}, status=404)
    except Exception as e:
        return Response({'error': f'Có lỗi xảy ra: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def increment_major_view(request):
    major_id = request.data.get('major_id')
    if not major_id:
        return Response({'error': 'major_id là bắt buộc'}, status=400)
    
    try:
        major = Major.objects.get(id=major_id)
        view_count, created = MajorViewCount.objects.get_or_create(
            major=major,
            defaults={'view_count': 1}
        )
        
        if not created:
            view_count.view_count += 1
            view_count.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': f'Đã tăng lượt xem cho ngành {major.name}'
        })
        
    except Major.DoesNotExist:
        return Response({'error': 'Không tìm thấy ngành'}, status=404)
    except Exception as e:
        return Response({'error': f'Có lỗi xảy ra: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_schools(request):
    limit = int(request.GET.get('limit', 10))
    top_schools = SchoolViewCount.objects.select_related('school').order_by('-view_count')[:limit]
    
    result = []
    for i, school_view in enumerate(top_schools, 1):
        school_data = TopSchoolsSerializer(school_view.school).data
        school_data['view_count'] = school_view.view_count
        school_data['rank'] = i
        result.append(school_data)
    
    return Response({
        'top_schools': result,
        'total': len(result)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def top_majors(request):
    limit = int(request.GET.get('limit', 10))
    top_majors = MajorViewCount.objects.select_related('major', 'major__school').order_by('-view_count')[:limit]
    
    result = []
    for i, major_view in enumerate(top_majors, 1):
        major_data = TopMajorsSerializer(major_view.major).data
        major_data['view_count'] = major_view.view_count
        major_data['rank'] = i
        result.append(major_data)
    
    return Response({
        'top_majors': result,
        'total': len(result)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def view_statistics(request):
    from django.db.models import Sum
    from datetime import timedelta
    from django.utils import timezone
    
    total_school_views = SchoolViewCount.objects.aggregate(
        total=Sum('view_count')
    )['total'] or 0
    
    total_major_views = MajorViewCount.objects.aggregate(
        total=Sum('view_count')
    )['total'] or 0
    
    seven_days_ago = timezone.now().date() - timedelta(days=7)
    recent_stats = DailyViewStats.objects.filter(
        date__gte=seven_days_ago
    ).order_by('date')
    
    daily_data = []
    for stat in recent_stats:
        daily_data.append({
            'date': stat.date.strftime('%Y-%m-%d'),
            'school_views': stat.total_school_views,
            'major_views': stat.total_major_views,
            'total_views': stat.total_school_views + stat.total_major_views
        })
    
    return Response({
        'total_school_views': total_school_views,
        'total_major_views': total_major_views,
        'total_views': total_school_views + total_major_views,
        'daily_stats': daily_data,
        'last_7_days': len(daily_data)
    })
```

### **4. urls.py** ✅ (Đã có)
```python
# Tracking lượt xem endpoints
path('tracking/increment-school-view/', increment_school_view, name='increment-school-view'),
path('tracking/increment-major-view/', increment_major_view, name='increment-major-view'),
path('tracking/top-schools/', top_schools, name='top-schools'),
path('tracking/top-majors/', top_majors, name='top-majors'),
path('tracking/statistics/', view_statistics, name='view-statistics'),
```

## 🎯 **Bước tiếp theo:**

1. **Cập nhật các file trên PythonAnywhere** với nội dung đã cung cấp
2. **Chạy migration** để tạo database tables
3. **Test API endpoints** để đảm bảo hoạt động
4. **Reload PythonAnywhere web app** nếu cần

Sau khi hoàn thành, tracking system sẽ hoạt động hoàn hảo với dữ liệu thật từ PythonAnywhere! 🚀 