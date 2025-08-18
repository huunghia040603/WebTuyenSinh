#!/usr/bin/env python
"""
Script tạo migration cho hệ thống quản lý thuật ngữ ngành học
Chạy script này để tạo các bảng mới trong database
"""

import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

# Thêm đường dẫn project vào sys.path
sys.path.append('/Users/huunghiakhach/Documents/GitHub/WebTuyenSinh')

# Cấu hình Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

# Import Django settings
try:
    django.setup()
except Exception as e:
    print(f"Lỗi khi setup Django: {e}")
    sys.exit(1)

def create_migration():
    """Tạo migration cho các model thuật ngữ"""
    try:
        print("🔄 Đang tạo migration cho hệ thống thuật ngữ...")
        
        # Tạo migration
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        print("✅ Migration đã được tạo thành công!")
        print("📝 Bạn có thể chạy 'python manage.py migrate' để áp dụng migration")
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo migration: {e}")
        return False
    
    return True

def apply_migration():
    """Áp dụng migration"""
    try:
        print("🔄 Đang áp dụng migration...")
        
        # Áp dụng migration
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migration đã được áp dụng thành công!")
        
    except Exception as e:
        print(f"❌ Lỗi khi áp dụng migration: {e}")
        return False
    
    return True

def create_sample_data():
    """Tạo dữ liệu mẫu cho hệ thống thuật ngữ"""
    try:
        print("🔄 Đang tạo dữ liệu mẫu...")
        
        # Import models
        from models import TermCategory, Term, FieldGroup, Major, User
        
        # Tạo danh mục thuật ngữ mẫu
        categories = [
            {
                'name': 'Công nghệ thông tin',
                'name_en': 'Information Technology',
                'description': 'Thuật ngữ chuyên ngành công nghệ thông tin',
                'icon': 'fas fa-laptop-code',
                'color': '#0a4191'
            },
            {
                'name': 'Y học',
                'name_en': 'Medicine',
                'description': 'Thuật ngữ chuyên ngành y học',
                'icon': 'fas fa-heartbeat',
                'color': '#dc2626'
            },
            {
                'name': 'Kinh tế',
                'name_en': 'Economics',
                'description': 'Thuật ngữ chuyên ngành kinh tế',
                'icon': 'fas fa-chart-line',
                'color': '#059669'
            },
            {
                'name': 'Kỹ thuật',
                'name_en': 'Engineering',
                'description': 'Thuật ngữ chuyên ngành kỹ thuật',
                'icon': 'fas fa-cogs',
                'color': '#7c3aed'
            }
        ]
        
        for cat_data in categories:
            category, created = TermCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                print(f"✅ Đã tạo danh mục: {category.name}")
        
        # Lấy field group và major đầu tiên để tạo thuật ngữ mẫu
        try:
            field_group = FieldGroup.objects.first()
            major = Major.objects.first()
            
            if field_group and major:
                # Tạo thuật ngữ mẫu cho CNTT
                it_category = TermCategory.objects.get(name='Công nghệ thông tin')
                
                sample_terms = [
                    {
                        'term_vn': 'Thuật toán',
                        'term_en': 'Algorithm',
                        'abbreviation': 'ALG',
                        'category': it_category,
                        'field_group': field_group,
                        'major': major,
                        'definition': 'Một tập hợp các quy tắc hoặc hướng dẫn được định nghĩa rõ ràng để thực hiện một nhiệm vụ cụ thể.',
                        'definition_en': 'A set of well-defined rules or instructions to perform a specific task.',
                        'context': 'Thuật toán được sử dụng trong lập trình để giải quyết các bài toán phức tạp.',
                        'examples': 'Thuật toán sắp xếp nổi bọt, thuật toán tìm kiếm nhị phân, thuật toán Dijkstra.',
                        'difficulty_level': 'intermediate',
                        'tags': 'lập trình, toán học, tối ưu hóa',
                        'status': 'approved'
                    },
                    {
                        'term_vn': 'Cơ sở dữ liệu',
                        'term_en': 'Database',
                        'abbreviation': 'DB',
                        'category': it_category,
                        'field_group': field_group,
                        'major': major,
                        'definition': 'Hệ thống lưu trữ và quản lý thông tin có cấu trúc, cho phép truy xuất và cập nhật dữ liệu một cách hiệu quả.',
                        'definition_en': 'A structured system for storing and managing information, allowing efficient data retrieval and updates.',
                        'context': 'Cơ sở dữ liệu được sử dụng trong hầu hết các ứng dụng phần mềm để lưu trữ thông tin.',
                        'examples': 'MySQL, PostgreSQL, MongoDB, Oracle Database.',
                        'difficulty_level': 'intermediate',
                        'tags': 'dữ liệu, lưu trữ, quản lý',
                        'status': 'approved'
                    },
                    {
                        'term_vn': 'API',
                        'term_en': 'Application Programming Interface',
                        'abbreviation': 'API',
                        'category': it_category,
                        'field_group': field_group,
                        'major': major,
                        'definition': 'Tập hợp các quy tắc và cơ chế cho phép các ứng dụng phần mềm giao tiếp với nhau.',
                        'definition_en': 'A set of rules and mechanisms that allow software applications to communicate with each other.',
                        'context': 'API được sử dụng để tích hợp các dịch vụ và chia sẻ dữ liệu giữa các hệ thống.',
                        'examples': 'REST API, GraphQL API, WebSocket API.',
                        'difficulty_level': 'intermediate',
                        'tags': 'tích hợp, giao tiếp, web',
                        'status': 'approved'
                    }
                ]
                
                for term_data in sample_terms:
                    term, created = Term.objects.get_or_create(
                        term_vn=term_data['term_vn'],
                        major=major,
                        defaults=term_data
                    )
                    if created:
                        print(f"✅ Đã tạo thuật ngữ: {term.term_vn}")
            else:
                print("⚠️ Không tìm thấy FieldGroup hoặc Major để tạo thuật ngữ mẫu")
                
        except Exception as e:
            print(f"⚠️ Lỗi khi tạo thuật ngữ mẫu: {e}")
        
        print("✅ Dữ liệu mẫu đã được tạo thành công!")
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo dữ liệu mẫu: {e}")
        return False
    
    return True

def main():
    """Hàm chính"""
    print("🚀 Bắt đầu thiết lập hệ thống quản lý thuật ngữ...")
    print("=" * 50)
    
    # Tạo migration
    if create_migration():
        # Áp dụng migration
        if apply_migration():
            # Tạo dữ liệu mẫu
            create_sample_data()
    
    print("=" * 50)
    print("🎉 Hoàn thành thiết lập hệ thống quản lý thuật ngữ!")
    print("\n📋 Các bảng đã được tạo:")
    print("   - TermCategory (Danh mục thuật ngữ)")
    print("   - Term (Thuật ngữ chính)")
    print("   - TermSynonym (Từ đồng nghĩa)")
    print("   - TermRelated (Thuật ngữ liên quan)")
    print("   - TermTranslation (Bản dịch)")
    print("   - UserTermCollection (Bộ sưu tập)")
    print("   - UserTermCollectionItem (Thuật ngữ trong bộ sưu tập)")
    print("   - TermContribution (Đóng góp)")
    print("   - TermSearchHistory (Lịch sử tìm kiếm)")
    print("   - TermViewHistory (Lịch sử xem)")
    print("   - TermRating (Đánh giá)")

if __name__ == "__main__":
    main() 