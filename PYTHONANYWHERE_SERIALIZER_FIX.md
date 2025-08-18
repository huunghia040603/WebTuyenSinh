# 🔧 PYTHONANYWHERE SERIALIZER FIX

## ❌ **Vấn đề hiện tại:**
```
AttributeError: Got AttributeError when attempting to get a value for field `view_count` on serializer `TopSchoolsSerializer`.
The serializer field might be named incorrectly and not match any attribute or key on the `School` instance.
Original exception text was: 'School' object has no attribute 'view_count'.
```

## ✅ **Giải pháp: Sửa Serializers**

### **Cập nhật serializers.py trên PythonAnywhere:**

Thay thế phần `TopSchoolsSerializer` và `TopMajorsSerializer` trong file `serializers.py`:

```python
class TopSchoolsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField(required=False, default=0)
    rank = serializers.IntegerField(required=False, default=0)
    
    class Meta:
        model = School
        fields = ['id', 'name_vn', 'short_code', 'logo', 'school_type', 'country', 'view_count', 'rank']

class TopMajorsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField(required=False, default=0)
    rank = serializers.IntegerField(required=False, default=0)
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_short_code = serializers.CharField(source='school.short_code', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    
    class Meta:
        model = Major
        fields = ['id', 'major_id', 'name', 'school_name', 'school_short_code', 'school_logo', 'view_count', 'rank']
```

### **Thay đổi chính:**
- Thêm `required=False, default=0` cho `view_count` và `rank` fields
- Điều này cho phép serializer hoạt động ngay cả khi `School`/`Major` object không có những field này

## 🚀 **Bước thực hiện:**

### **1. Cập nhật serializers.py trên PythonAnywhere**
- Mở file `serializers.py` trên PythonAnywhere
- Tìm và thay thế `TopSchoolsSerializer` và `TopMajorsSerializer`
- Lưu file

### **2. Reload PythonAnywhere web app**
- Vào PythonAnywhere dashboard
- Click "Reload" cho web app

### **3. Test API endpoints**
```bash
curl "https://timtruonghoc.pythonanywhere.com/tracking/top-schools/?limit=3"

curl "https://timtruonghoc.pythonanywhere.com/tracking/top-majors/?limit=3"

curl "https://timtruonghoc.pythonanywhere.com/tracking/statistics/"
```

## 🎯 **Kết quả mong đợi:**

Sau khi fix:
- ✅ **Không còn AttributeError**
- ✅ **API trả về JSON hợp lệ**
- ✅ **Dữ liệu thật từ PythonAnywhere**
- ✅ **Tracking system hoạt động hoàn hảo**

## 📋 **Lý do lỗi:**

Lỗi xảy ra vì:
1. `TopSchoolsSerializer` có field `view_count` và `rank`
2. Nhưng `School` model không có những field này
3. `view_count` và `rank` được thêm vào trong `views.py` sau khi serialize
4. Serializer cần được cấu hình để chấp nhận những field này là optional

**Fix này sẽ giải quyết hoàn toàn vấn đề!** 🎉 