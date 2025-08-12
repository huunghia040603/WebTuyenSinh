#!/usr/bin/env python
"""
Script để tạo các bảng tracking lượt xem trường và ngành
"""

import os
import sys
import django

# Thêm đường dẫn hiện tại vào sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Thiết lập Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

# Import Django
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def create_tracking_tables():
    """Tạo các bảng tracking mới"""
    
    with connection.cursor() as cursor:
        # Tạo bảng SchoolViewCount
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS apptimtruonghoc_schoolviewcount (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                view_count INTEGER NOT NULL DEFAULT 0,
                last_viewed DATETIME NOT NULL,
                created_at DATETIME NOT NULL,
                school_id INTEGER NOT NULL,
                UNIQUE(school_id),
                FOREIGN KEY (school_id) REFERENCES apptimtruonghoc_school (id)
            );
        """)
        
        # Tạo bảng MajorViewCount
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS apptimtruonghoc_majorviewcount (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                view_count INTEGER NOT NULL DEFAULT 0,
                last_viewed DATETIME NOT NULL,
                created_at DATETIME NOT NULL,
                major_id INTEGER NOT NULL,
                UNIQUE(major_id),
                FOREIGN KEY (major_id) REFERENCES apptimtruonghoc_major (id)
            );
        """)
        
        # Tạo bảng DailyViewStats
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS apptimtruonghoc_dailyviewstats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL UNIQUE,
                total_school_views INTEGER NOT NULL DEFAULT 0,
                total_major_views INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL
            );
        """)
        
        print("✅ Đã tạo thành công các bảng tracking!")
        print("📊 SchoolViewCount - Bảng tracking lượt xem trường")
        print("📊 MajorViewCount - Bảng tracking lượt xem ngành")
        print("📊 DailyViewStats - Bảng thống kê theo ngày")

if __name__ == "__main__":
    try:
        create_tracking_tables()
    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng: {e}")
        print("💡 Hãy đảm bảo Django đã được cài đặt và cấu hình đúng") 