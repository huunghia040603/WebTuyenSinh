#!/usr/bin/env python
"""
Script để tạo migration cho tracking models trên PythonAnywhere
Chạy script này trên PythonAnywhere để tạo database tables cho tracking system
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from django.db.utils import OperationalError

def create_tracking_tables():
    """Tạo tables cho tracking system"""
    print("🚀 Bắt đầu tạo tracking tables...")
    
    try:
        # Test database connection
        connection.ensure_connection()
        print("✅ Kết nối database thành công")
        
        # Tạo migration
        print("📝 Tạo migration files...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Chạy migration
        print("🔄 Chạy migration...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migration hoàn thành!")
        
    except OperationalError as e:
        print(f"❌ Lỗi database: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return False
    
    return True

def create_sample_data():
    """Tạo dữ liệu mẫu cho tracking"""
    print("📊 Tạo dữ liệu mẫu...")
    
    try:
        from your_app.models import School, Major, SchoolViewCount, MajorViewCount
        
        # Tạo view counts cho schools
        schools_created = 0
        for school in School.objects.all():
            view_count, created = SchoolViewCount.objects.get_or_create(
                school=school,
                defaults={'view_count': 500}
            )
            if created:
                schools_created += 1
        
        # Tạo view counts cho majors
        majors_created = 0
        for major in Major.objects.all():
            view_count, created = MajorViewCount.objects.get_or_create(
                major=major,
                defaults={'view_count': 500}
            )
            if created:
                majors_created += 1
        
        print(f"✅ Đã tạo {schools_created} school view counts")
        print(f"✅ Đã tạo {majors_created} major view counts")
        
    except Exception as e:
        print(f"❌ Lỗi tạo dữ liệu mẫu: {e}")

def test_tracking_models():
    """Test tracking models"""
    print("🧪 Test tracking models...")
    
    try:
        from your_app.models import SchoolViewCount, MajorViewCount, DailyViewStats
        
        # Test SchoolViewCount
        school_count = SchoolViewCount.objects.count()
        print(f"✅ SchoolViewCount: {school_count} records")
        
        # Test MajorViewCount
        major_count = MajorViewCount.objects.count()
        print(f"✅ MajorViewCount: {major_count} records")
        
        # Test DailyViewStats
        daily_count = DailyViewStats.objects.count()
        print(f"✅ DailyViewStats: {daily_count} records")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi test models: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 PYTHONANYWHERE TRACKING SYSTEM SETUP")
    print("=" * 50)
    
    # Tạo tables
    if create_tracking_tables():
        # Tạo dữ liệu mẫu
        create_sample_data()
        
        # Test models
        if test_tracking_models():
            print("\n🎉 HOÀN THÀNH! Tracking system đã sẵn sàng!")
            print("\n📋 Các API endpoints có sẵn:")
            print("  - POST /tracking/increment-school-view/")
            print("  - POST /tracking/increment-major-view/")
            print("  - GET /tracking/top-schools/")
            print("  - GET /tracking/top-majors/")
            print("  - GET /tracking/statistics/")
        else:
            print("\n❌ Có lỗi khi test models")
    else:
        print("\n❌ Không thể tạo tracking tables")
    
    print("\n" + "=" * 50) 