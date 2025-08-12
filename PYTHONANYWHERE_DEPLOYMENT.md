# 🚀 Hướng dẫn triển khai API Tracking lên PythonAnywhere

## 📋 **Tình trạng hiện tại:**

### ✅ **Đã hoàn thành:**
- ✅ Frontend Flask chạy trên port 5000
- ✅ Trang thống kê `/thongke` hoạt động
- ✅ Biểu đồ Chart.js đã được tối ưu hóa
- ✅ Mock API endpoints trong Flask

### ❌ **Cần triển khai:**
- ❌ API tracking chưa có trên PythonAnywhere
- ❌ Database models chưa được tạo
- ❌ Django REST Framework endpoints chưa được deploy

## 🔧 **Các bước triển khai lên PythonAnywhere:**

### **1. Cập nhật Models (models.py):**

Thêm các models tracking vào file `models.py` trên PythonAnywhere:

```python
# --- Models Tracking lượt xem trường và ngành ---
class SchoolViewCount(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='view_counts', verbose_name="Trường")
    view_count = models.IntegerField(default=0, verbose_name="Lượt xem")
    last_viewed = models.DateTimeField(auto_now=True, verbose_name="Lần xem cuối")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    
    class Meta:
        verbose_name = "Lượt xem trường"
        verbose_name_plural = "Lượt xem các trường"
        unique_together = ('school',)
    
    def __str__(self):
        return f"{self.school.name_vn} - {self.view_count} lượt xem"

class MajorViewCount(models.Model):
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='view_counts', verbose_name="Ngành")
    view_count = models.IntegerField(default=0, verbose_name="Lượt xem")
    last_viewed = models.DateTimeField(auto_now=True, verbose_name="Lần xem cuối")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    
    class Meta:
        verbose_name = "Lượt xem ngành"
        verbose_name_plural = "Lượt xem các ngành"
        unique_together = ('major',)
    
    def __str__(self):
        return f"{self.major.name} - {self.view_count} lượt xem"

class DailyViewStats(models.Model):
    date = models.DateField(unique=True, verbose_name="Ngày")
    total_school_views = models.IntegerField(default=0, verbose_name="Tổng lượt xem trường")
    total_major_views = models.IntegerField(default=0, verbose_name="Tổng lượt xem ngành")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    
    class Meta:
        verbose_name = "Thống kê lượt xem theo ngày"
        verbose_name_plural = "Thống kê lượt xem theo ngày"
        ordering = ['-date']
    
    def __str__(self):
        return f"Thống kê ngày {self.date} - Trường: {self.total_school_views}, Ngành: {self.total_major_views}"
```

### **2. Cập nhật Serializers (serializers.py):**

Thêm các serializers vào file `serializers.py`:

```python
# --- Serializers cho tracking lượt xem ---
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

### **3. Cập nhật Views (views.py):**

Thêm các views vào file `views.py`:

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import date, timedelta

# --- ViewSets cho tracking lượt xem ---
class SchoolViewCountViewSet(viewsets.ModelViewSet):
    queryset = SchoolViewCount.objects.all().order_by('-view_count')
    serializer_class = SchoolViewCountSerializer
    permission_classes = [AllowAny]

class MajorViewCountViewSet(viewsets.ModelViewSet):
    queryset = MajorViewCount.objects.all().order_by('-view_count')
    serializer_class = MajorViewCountSerializer
    permission_classes = [AllowAny]

class DailyViewStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyViewStats.objects.all().order_by('-date')
    serializer_class = DailyViewStatsSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def increment_school_view(request):
    try:
        school_id = request.data.get('school_id')
        if not school_id:
            return Response({'error': 'school_id is required'}, status=400)
        
        school = School.objects.get(id=school_id)
        view_count, created = SchoolViewCount.objects.get_or_create(
            school=school,
            defaults={'view_count': 0}
        )
        view_count.view_count += 1
        view_count.save()
        
        # Update daily stats
        today = date.today()
        daily_stats, created = DailyViewStats.objects.get_or_create(
            date=today,
            defaults={'total_school_views': 0, 'total_major_views': 0}
        )
        daily_stats.total_school_views += 1
        daily_stats.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': 'School view incremented successfully'
        })
    except School.DoesNotExist:
        return Response({'error': 'School not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def increment_major_view(request):
    try:
        major_id = request.data.get('major_id')
        if not major_id:
            return Response({'error': 'major_id is required'}, status=400)
        
        major = Major.objects.get(id=major_id)
        view_count, created = MajorViewCount.objects.get_or_create(
            major=major,
            defaults={'view_count': 0}
        )
        view_count.view_count += 1
        view_count.save()
        
        # Update daily stats
        today = date.today()
        daily_stats, created = DailyViewStats.objects.get_or_create(
            date=today,
            defaults={'total_school_views': 0, 'total_major_views': 0}
        )
        daily_stats.total_major_views += 1
        daily_stats.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': 'Major view incremented successfully'
        })
    except Major.DoesNotExist:
        return Response({'error': 'Major not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_schools(request):
    limit = int(request.GET.get('limit', 10))
    
    top_schools = SchoolViewCount.objects.select_related('school').order_by('-view_count')[:limit]
    
    data = []
    for i, view_count in enumerate(top_schools, 1):
        school_data = TopSchoolsSerializer(view_count.school).data
        school_data['view_count'] = view_count.view_count
        school_data['rank'] = i
        data.append(school_data)
    
    return Response({
        'total': len(data),
        'results': data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def top_majors(request):
    limit = int(request.GET.get('limit', 10))
    
    top_majors = MajorViewCount.objects.select_related('major', 'major__school').order_by('-view_count')[:limit]
    
    data = []
    for i, view_count in enumerate(top_majors, 1):
        major_data = TopMajorsSerializer(view_count.major).data
        major_data['view_count'] = view_count.view_count
        major_data['rank'] = i
        data.append(major_data)
    
    return Response({
        'total': len(data),
        'results': data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def view_statistics(request):
    # Get total views
    total_school_views = SchoolViewCount.objects.aggregate(total=models.Sum('view_count'))['total'] or 0
    total_major_views = MajorViewCount.objects.aggregate(total=models.Sum('view_count'))['total'] or 0
    total_views = total_school_views + total_major_views
    
    # Get last 7 days stats
    last_7_days = DailyViewStats.objects.filter(
        date__gte=date.today() - timedelta(days=6)
    ).order_by('date')
    
    daily_data = []
    for stat in last_7_days:
        daily_data.append({
            'date': stat.date.isoformat(),
            'school_views': stat.total_school_views,
            'major_views': stat.total_major_views,
            'total_views': stat.total_school_views + stat.total_major_views
        })
    
    return Response({
        'total_school_views': total_school_views,
        'total_major_views': total_major_views,
        'total_views': total_views,
        'last_7_days': len(daily_data),
        'daily_stats': daily_data
    })
```

### **4. Cập nhật URLs (urls.py):**

Thêm các URL patterns:

```python
from .views import (
    SchoolViewCountViewSet, MajorViewCountViewSet, DailyViewStatsViewSet,
    increment_school_view, increment_major_view, top_schools, top_majors, view_statistics
)

# Register ViewSets cho tracking lượt xem
r.register('school-view-counts', SchoolViewCountViewSet, basename='school-view-counts')
r.register('major-view-counts', MajorViewCountViewSet, basename='major-view-counts')
r.register('daily-view-stats', DailyViewStatsViewSet, basename='daily-view-stats')

urlpatterns = [
    # ... existing paths ...
    # Tracking lượt xem endpoints
    path('tracking/increment-school-view/', increment_school_view, name='increment-school-view'),
    path('tracking/increment-major-view/', increment_major_view, name='increment-major-view'),
    path('tracking/top-schools/', top_schools, name='top-schools'),
    path('tracking/top-majors/', top_majors, name='top-majors'),
    path('tracking/statistics/', view_statistics, name='view-statistics'),
]
```

### **5. Tạo và chạy migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

### **6. Test API endpoints:**

```bash
# Test increment school view
curl -X POST https://timtruonghoc.pythonanywhere.com/tracking/increment-school-view/ \
  -H "Content-Type: application/json" \
  -d '{"school_id": 1}'

# Test increment major view
curl -X POST https://timtruonghoc.pythonanywhere.com/tracking/increment-major-view/ \
  -H "Content-Type: application/json" \
  -d '{"major_id": 1}'

# Test get statistics
curl https://timtruonghoc.pythonanywhere.com/tracking/statistics/

# Test get top schools
curl https://timtruonghoc.pythonanywhere.com/tracking/top-schools/?limit=5

# Test get top majors
curl https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=5
```

## 🎯 **Kết quả mong đợi:**

Sau khi triển khai thành công:

- ✅ API endpoints hoạt động trên PythonAnywhere
- ✅ Database models được tạo và migrate
- ✅ Frontend kết nối được với backend thật
- ✅ Dữ liệu tracking được lưu trữ thật
- ✅ Trang thống kê hiển thị dữ liệu thật

## 📞 **Hỗ trợ:**

Nếu gặp vấn đề trong quá trình triển khai, hãy:

1. Kiểm tra logs trên PythonAnywhere
2. Đảm bảo CORS settings cho phép localhost:5000
3. Kiểm tra database migrations
4. Test từng API endpoint một cách riêng biệt

**Truy cập:** `http://localhost:5000/thongke` 🎉 