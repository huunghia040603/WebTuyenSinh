# 📊 ADMIN TRACKING SETUP

## 🎯 **Mục đích:**
Thêm quản trị bảng thống kê vào Django Admin để admin có thể theo dõi và quản lý dữ liệu lượt xem trường và ngành.

## ✅ **Các model đã thêm vào admin:**

### **1. SchoolViewCountAdmin (Quản lý lượt xem trường):**
```python
class SchoolViewCountAdmin(admin.ModelAdmin):
    list_display = ('school', 'view_count', 'last_viewed', 'created_at', 'display_school_logo')
    list_filter = ('created_at', 'last_viewed')
    search_fields = ('school__name_vn', 'school__name_en', 'school__short_code')
    readonly_fields = ('created_at', 'last_viewed')
    ordering = ('-view_count', '-last_viewed')
    
    def display_school_logo(self, obj):
        if obj.school.logo:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 3px;" />',
                obj.school.logo
            )
        return "No Logo"
    display_school_logo.short_description = 'Logo'
```

**Tính năng:**
- Hiển thị tên trường, lượt xem, thời gian xem cuối, ngày tạo
- Hiển thị logo trường (40x40px)
- Sắp xếp theo lượt xem giảm dần
- Tìm kiếm theo tên trường (VN/EN) và short_code
- Lọc theo ngày tạo và thời gian xem cuối

### **2. MajorViewCountAdmin (Quản lý lượt xem ngành):**
```python
class MajorViewCountAdmin(admin.ModelAdmin):
    list_display = ('major', 'view_count', 'last_viewed', 'created_at', 'display_school_name', 'display_school_logo')
    list_filter = ('created_at', 'last_viewed', 'major__school')
    search_fields = ('major__name', 'major__major_id', 'major__school__name_vn')
    readonly_fields = ('created_at', 'last_viewed')
    ordering = ('-view_count', '-last_viewed')
    
    def display_school_name(self, obj):
        return obj.major.school.name_vn if obj.major.school else 'N/A'
    display_school_name.short_description = 'Trường'
    display_school_name.admin_order_field = 'major__school__name_vn'
    
    def display_school_logo(self, obj):
        if obj.major.school and obj.major.school.logo:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 3px;" />',
                obj.major.school.logo
            )
        return "No Logo"
    display_school_logo.short_description = 'Logo Trường'
```

**Tính năng:**
- Hiển thị tên ngành, lượt xem, thời gian xem cuối, ngày tạo
- Hiển thị tên trường và logo trường
- Sắp xếp theo lượt xem giảm dần
- Tìm kiếm theo tên ngành, mã ngành, tên trường
- Lọc theo ngày tạo, thời gian xem cuối, và trường

### **3. DailyViewStatsAdmin (Quản lý thống kê theo ngày):**
```python
class DailyViewStatsAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_school_views', 'total_major_views', 'total_views', 'created_at')
    list_filter = ('date', 'created_at')
    search_fields = ('date',)
    readonly_fields = ('created_at',)
    ordering = ('-date',)
    
    def total_views(self, obj):
        return obj.total_school_views + obj.total_major_views
    total_views.short_description = 'Tổng lượt xem'
    total_views.admin_order_field = 'total_school_views'
```

**Tính năng:**
- Hiển thị ngày, lượt xem trường, lượt xem ngành, tổng lượt xem
- Tính tổng lượt xem tự động (trường + ngành)
- Sắp xếp theo ngày giảm dần
- Tìm kiếm theo ngày
- Lọc theo ngày và ngày tạo

## 🔧 **Đăng ký với admin:**

```python
# Register Tracking Models (Thống kê lượt xem)
admin.site.register(SchoolViewCount, SchoolViewCountAdmin)
admin.site.register(MajorViewCount, MajorViewCountAdmin)
admin.site.register(DailyViewStats, DailyViewStatsAdmin)
```

## 📋 **Các tính năng admin:**

### **1. SchoolViewCount:**
- **List Display:** Trường, Lượt xem, Lần xem cuối, Ngày tạo, Logo
- **Filters:** Ngày tạo, Lần xem cuối
- **Search:** Tên trường (VN/EN), Short code
- **Ordering:** Lượt xem giảm dần, Lần xem cuối giảm dần
- **Readonly:** Ngày tạo, Lần xem cuối

### **2. MajorViewCount:**
- **List Display:** Ngành, Lượt xem, Lần xem cuối, Ngày tạo, Tên trường, Logo trường
- **Filters:** Ngày tạo, Lần xem cuối, Trường
- **Search:** Tên ngành, Mã ngành, Tên trường
- **Ordering:** Lượt xem giảm dần, Lần xem cuối giảm dần
- **Readonly:** Ngày tạo, Lần xem cuối

### **3. DailyViewStats:**
- **List Display:** Ngày, Lượt xem trường, Lượt xem ngành, Tổng lượt xem, Ngày tạo
- **Filters:** Ngày, Ngày tạo
- **Search:** Ngày
- **Ordering:** Ngày giảm dần
- **Readonly:** Ngày tạo

## 🎯 **Lợi ích:**

### **1. Theo dõi hiệu suất:**
- Xem trường/ngành nào được quan tâm nhất
- Theo dõi xu hướng lượt xem theo thời gian
- Phân tích dữ liệu để tối ưu hóa nội dung

### **2. Quản lý dữ liệu:**
- Xem và chỉnh sửa dữ liệu thống kê
- Reset lượt xem nếu cần
- Theo dõi lịch sử thay đổi

### **3. Báo cáo:**
- Xuất dữ liệu thống kê
- Tạo báo cáo theo ngày/tuần/tháng
- Phân tích xu hướng

## 🔄 **Cách sử dụng:**

### **1. Truy cập admin:**
```
http://your-domain/admin/
```

### **2. Tìm các model thống kê:**
- **Lượt xem các trường** (SchoolViewCount)
- **Lượt xem các ngành** (MajorViewCount)
- **Thống kê lượt xem theo ngày** (DailyViewStats)

### **3. Thao tác:**
- **Xem danh sách:** Tất cả dữ liệu thống kê
- **Tìm kiếm:** Theo tên trường/ngành
- **Lọc:** Theo thời gian
- **Sắp xếp:** Theo lượt xem hoặc thời gian
- **Chỉnh sửa:** Cập nhật dữ liệu nếu cần

## 📊 **Dữ liệu hiển thị:**

### **SchoolViewCount:**
```
Trường | Lượt xem | Lần xem cuối | Ngày tạo | Logo
RMIT   | 1,234    | 2024-01-15   | 2024-01-01 | [Logo]
FPT    | 987      | 2024-01-14   | 2024-01-01 | [Logo]
```

### **MajorViewCount:**
```
Ngành | Lượt xem | Lần xem cuối | Ngày tạo | Trường | Logo Trường
CNTT  | 2,345    | 2024-01-15   | 2024-01-01 | RMIT   | [Logo]
Kinh tế| 1,876   | 2024-01-14   | 2024-01-01 | FPT    | [Logo]
```

### **DailyViewStats:**
```
Ngày       | Lượt xem trường | Lượt xem ngành | Tổng lượt xem | Ngày tạo
2024-01-15 | 5,432          | 8,765          | 14,197        | 2024-01-15
2024-01-14 | 4,321          | 7,654          | 11,975        | 2024-01-14
```

**Admin tracking đã được thiết lập hoàn chỉnh!** 📊✨ 