# Ví dụ về filter.py
import django_filters
import re
from .models import *

class AllMajorFilter(django_filters.FilterSet):
    # Lọc tìm kiếm theo tên ngành và việc làm (chứa từ khóa)
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')
    job = django_filters.CharFilter(field_name='job', lookup_expr='icontains')

    # Đổi tên tham số này để khớp với tham số trong URL
    # all_training_duration = django_filters.CharFilter(field_name='training_duration', method='filter_training_duration')
    all_training_duration = django_filters.CharFilter(field_name='training_duration', method='filter_training_duration')

    # Lọc theo khoảng học phí (chứa từ khóa)
    tuition_fee_per_year = django_filters.CharFilter(field_name='tuition_fee_per_year', lookup_expr='icontains')

    # Lọc theo cơ hội việc làm (lớn hơn hoặc bằng)
    opportunities = django_filters.NumberFilter(field_name='opportunities', lookup_expr='gte')

    # Tùy chỉnh phương thức lọc
    def filter_training_duration(self, queryset, name, value):
        # Tạo regex để loại bỏ các thẻ HTML như <p>, <span>...
        cleaned_value = re.sub(r'<[^>]+>', '', value)

        # Tìm kiếm các bản ghi có training_duration chứa giá trị đã làm sạch
        return queryset.filter(**{'training_duration__icontains': cleaned_value})

    class Meta:
        model = AllMajorOfAllSchool
        # Thêm 'all_training_duration' vào danh sách các trường
        fields = ['name', 'job', 'tuition_fee_per_year', 'all_training_duration', 'opportunities']





class SchoolFilter(django_filters.FilterSet):
    start = django_filters.NumberFilter(field_name='start', lookup_expr='gte')
    end = django_filters.NumberFilter(field_name='end', lookup_expr='lte')
    benchmark_min = django_filters.NumberFilter(field_name='benchmark_min', lookup_expr='gte')
    benchmark_max = django_filters.NumberFilter(field_name='benchmark_max', lookup_expr='lte')
    address = django_filters.CharFilter(field_name='address', lookup_expr='icontains')

    # Thêm bộ lọc cho trường 'tag'
    tag = django_filters.CharFilter(field_name='tag', lookup_expr='exact') # Lọc chính xác theo tag

    class Meta:
        model = School
        fields = [
            'school_type',
            'school_level',
            'country',
            'start',
            'end',
            'benchmark_min',
            'benchmark_max',
            'address',
            'tag', # Thêm 'tag' vào danh sách các trường có thể lọc
        ]




class MajorFilter(django_filters.FilterSet):
    """
    Lớp FilterSet tùy chỉnh cho mô hình Major để lọc theo khoảng học phí.
    """
    # Lọc theo trường
    school = django_filters.NumberFilter(
        field_name='school',
        lookup_expr='exact',
        label='Trường'
    )
    
    # Lọc theo mã ngành (chứa từ khóa)
    major_id = django_filters.CharFilter(
        field_name='major_id',
        lookup_expr='icontains',
        label='Mã ngành'
    )
    
    # Lọc học phí tối thiểu (lớn hơn hoặc bằng)
    # Tên tham số trên URL sẽ là min_tuition_fee_gte
    min_tuition_fee_gte = django_filters.NumberFilter(
        field_name='min_tuition_fee_per_year',
        lookup_expr='gte',
        label='Học phí tối thiểu từ'
    )
    # Lọc học phí tối đa (nhỏ hơn hoặc bằng)
    # Tên tham số trên URL sẽ là max_tuition_fee_lte
    max_tuition_fee_lte = django_filters.NumberFilter(
        field_name='max_tuition_fee_per_year',
        lookup_expr='lte',
        label='Học phí tối đa đến'
    )

    class Meta:
        model = Major
        # Bạn có thể thêm các trường khác muốn lọc trực tiếp ở đây
        # Ví dụ: 'status', 'tags' nếu bạn muốn lọc chính xác
        fields = {
            'school': ['exact'],
            'major_id': ['exact', 'icontains'],  # Thêm major_id với icontains
            'status': ['exact'],
            'tags': ['exact'],
            # Chúng ta không cần liệt kê min_tuition_fee_per_year và max_tuition_fee_per_year
            # trực tiếp ở đây vì đã định nghĩa các filter tùy chỉnh ở trên.
        }


class SchoolMajorsFilter(django_filters.FilterSet):
    """
    FilterSet cho việc lọc ngành của trường.
    """
    # Lọc theo học phí tối thiểu
    min_tuition_fee_gte = django_filters.NumberFilter(
        field_name='school_major__min_tuition_fee_per_year',
        lookup_expr='gte',
        label='Học phí tối thiểu từ'
    )
    
    # Lọc theo học phí tối đa
    max_tuition_fee_lte = django_filters.NumberFilter(
        field_name='school_major__max_tuition_fee_per_year',
        lookup_expr='lte',
        label='Học phí tối đa đến'
    )
    
    # Lọc theo trạng thái ngành
    major_status = django_filters.CharFilter(
        field_name='school_major__status',
        lookup_expr='exact',
        label='Trạng thái ngành'
    )
    
    # Lọc theo tags ngành
    major_tags = django_filters.CharFilter(
        field_name='school_major__tags',
        lookup_expr='exact',
        label='Tags ngành'
    )

    class Meta:
        model = School
        fields = {
            'school_major__name': ['icontains'],
            'school_major__major_id': ['icontains'],
        }


