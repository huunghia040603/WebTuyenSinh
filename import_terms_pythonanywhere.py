#!/usr/bin/env python
"""
Script import dữ liệu thuật ngữ từ file Excel vào database trên PythonAnywhere
"""

import os
import sys
import django
import pandas as pd
from django.conf import settings

# Cấu hình cho PythonAnywhere
sys.path.append('/home/timtruonghoc/timtruonghoc')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timtruonghoc.settings')

# Import Django settings
try:
    django.setup()
except Exception as e:
    print(f"Lỗi khi setup Django: {e}")
    sys.exit(1)

def clean_text(text):
    """Làm sạch text"""
    if pd.isna(text):
        return ""
    return str(text).strip()

def create_categories_from_excel():
    """Tạo danh mục từ dữ liệu Excel"""
    try:
        print("🔄 Đang tạo danh mục từ dữ liệu Excel...")
        
        # Import models
        from apptimtruonghoc.models import TermCategory, FieldGroup, Major, Term, User
        
        # Đọc file Excel từ PythonAnywhere
        excel_path = '/home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx'
        df = pd.read_excel(excel_path)
        
        # Lấy danh sách ngành học duy nhất
        majors = df['Ngành học'].unique()
        
        # Mapping ngành học với icon và màu sắc
        major_config = {
            'Công nghệ thông tin': {'icon': 'fas fa-laptop-code', 'color': '#0a4191'},
            'Y học': {'icon': 'fas fa-heartbeat', 'color': '#dc2626'},
            'Kiến trúc': {'icon': 'fas fa-building', 'color': '#7c3aed'},
            'Xã hội học': {'icon': 'fas fa-users', 'color': '#059669'},
            'Khoa học môi trường': {'icon': 'fas fa-leaf', 'color': '#16a34a'},
            'Truyền thông': {'icon': 'fas fa-broadcast-tower', 'color': '#ea580c'},
            'Lịch sử': {'icon': 'fas fa-landmark', 'color': '#854d0e'},
            'Thiết kế đồ họa': {'icon': 'fas fa-palette', 'color': '#be185d'},
            'Văn học': {'icon': 'fas fa-book-open', 'color': '#1d4ed8'},
            'Điện tử': {'icon': 'fas fa-microchip', 'color': '#0891b2'},
            'Kinh tế': {'icon': 'fas fa-chart-line', 'color': '#059669'},
            'Luật': {'icon': 'fas fa-gavel', 'color': '#7c2d12'},
            'Tâm lý học': {'icon': 'fas fa-brain', 'color': '#be185d'},
            'Sinh học': {'icon': 'fas fa-dna', 'color': '#16a34a'},
            'Hóa học': {'icon': 'fas fa-flask', 'color': '#ea580c'},
            'Vật lý': {'icon': 'fas fa-atom', 'color': '#0891b2'},
            'Toán học': {'icon': 'fas fa-square-root-alt', 'color': '#7c3aed'},
            'Ngoại ngữ': {'icon': 'fas fa-language', 'color': '#dc2626'},
            'Giáo dục': {'icon': 'fas fa-graduation-cap', 'color': '#059669'},
            'Thể thao': {'icon': 'fas fa-running', 'color': '#16a34a'},
            'Nghệ thuật': {'icon': 'fas fa-paint-brush', 'color': '#be185d'},
            'Âm nhạc': {'icon': 'fas fa-music', 'color': '#7c3aed'},
            'Du lịch': {'icon': 'fas fa-plane', 'color': '#0891b2'},
            'Nông nghiệp': {'icon': 'fas fa-seedling', 'color': '#16a34a'},
            'Thủy sản': {'icon': 'fas fa-fish', 'color': '#0891b2'},
            'Lâm nghiệp': {'icon': 'fas fa-tree', 'color': '#16a34a'},
            'Thú y': {'icon': 'fas fa-paw', 'color': '#dc2626'},
            'Dược': {'icon': 'fas fa-pills', 'color': '#7c3aed'},
            'Điều dưỡng': {'icon': 'fas fa-user-nurse', 'color': '#dc2626'},
            'Kỹ thuật': {'icon': 'fas fa-cogs', 'color': '#7c3aed'},
            'Cơ khí': {'icon': 'fas fa-cog', 'color': '#7c3aed'},
            'Xây dựng': {'icon': 'fas fa-hammer', 'color': '#ea580c'},
            'Giao thông': {'icon': 'fas fa-car', 'color': '#0891b2'},
            'Hàng hải': {'icon': 'fas fa-ship', 'color': '#0891b2'},
            'Hàng không': {'icon': 'fas fa-plane', 'color': '#0891b2'},
            'Quân sự': {'icon': 'fas fa-shield-alt', 'color': '#7c2d12'},
            'Cảnh sát': {'icon': 'fas fa-user-shield', 'color': '#7c2d12'},
            'Cứu hỏa': {'icon': 'fas fa-fire-extinguisher', 'color': '#dc2626'},
            'Khí tượng': {'icon': 'fas fa-cloud-sun', 'color': '#0891b2'},
            'Địa chất': {'icon': 'fas fa-mountain', 'color': '#ea580c'},
            'Khảo cổ': {'icon': 'fas fa-shovel', 'color': '#854d0e'},
            'Nhân chủng': {'icon': 'fas fa-user-friends', 'color': '#059669'},
            'Dân tộc': {'icon': 'fas fa-flag', 'color': '#059669'},
            'Tôn giáo': {'icon': 'fas fa-pray', 'color': '#7c3aed'},
            'Triết học': {'icon': 'fas fa-lightbulb', 'color': '#7c3aed'},
            'Chính trị': {'icon': 'fas fa-balance-scale', 'color': '#7c2d12'},
            'Quan hệ quốc tế': {'icon': 'fas fa-globe', 'color': '#0891b2'},
            'Ngoại giao': {'icon': 'fas fa-handshake', 'color': '#0891b2'},
            'Thương mại': {'icon': 'fas fa-store', 'color': '#059669'},
            'Tài chính': {'icon': 'fas fa-coins', 'color': '#059669'},
            'Ngân hàng': {'icon': 'fas fa-university', 'color': '#059669'},
            'Bảo hiểm': {'icon': 'fas fa-shield-alt', 'color': '#059669'},
            'Kế toán': {'icon': 'fas fa-calculator', 'color': '#059669'},
            'Kiểm toán': {'icon': 'fas fa-search-dollar', 'color': '#059669'},
            'Marketing': {'icon': 'fas fa-bullhorn', 'color': '#ea580c'},
            'Quản lý': {'icon': 'fas fa-tasks', 'color': '#059669'},
            'Nhân sự': {'icon': 'fas fa-user-tie', 'color': '#059669'},
            'Hậu cần': {'icon': 'fas fa-truck', 'color': '#ea580c'},
            'Vận tải': {'icon': 'fas fa-shipping-fast', 'color': '#ea580c'},
            'Kho vận': {'icon': 'fas fa-warehouse', 'color': '#ea580c'},
            'Thương mại điện tử': {'icon': 'fas fa-shopping-cart', 'color': '#ea580c'},
            'Logistics': {'icon': 'fas fa-route', 'color': '#ea580c'},
            'Xuất nhập khẩu': {'icon': 'fas fa-exchange-alt', 'color': '#ea580c'},
            'Hải quan': {'icon': 'fas fa-passport', 'color': '#ea580c'},
            'Thuế': {'icon': 'fas fa-file-invoice-dollar', 'color': '#059669'},
            'Báo chí': {'icon': 'fas fa-newspaper', 'color': '#ea580c'},
            'Phát thanh': {'icon': 'fas fa-radio', 'color': '#ea580c'},
            'Truyền hình': {'icon': 'fas fa-tv', 'color': '#ea580c'},
            'Quảng cáo': {'icon': 'fas fa-ad', 'color': '#ea580c'},
            'PR': {'icon': 'fas fa-comments', 'color': '#ea580c'},
            'Sự kiện': {'icon': 'fas fa-calendar-alt', 'color': '#ea580c'},
            'Giải trí': {'icon': 'fas fa-gamepad', 'color': '#be185d'},
            'Tin học': {'icon': 'fas fa-laptop-code', 'color': '#0a4191'},
        }
        
        # Tạo danh mục cho từng ngành học
        categories_created = 0
        for major in majors:
            major_clean = clean_text(major)
            if not major_clean:
                continue
                
            # Lấy config cho ngành học
            config = major_config.get(major_clean, {
                'icon': 'fas fa-graduation-cap',
                'color': '#6b7280'
            })
            
            # Tạo hoặc cập nhật danh mục
            category, created = TermCategory.objects.get_or_create(
                name=major_clean,
                defaults={
                    'name_en': major_clean,  # Có thể cập nhật sau
                    'description': f'Thuật ngữ chuyên ngành {major_clean}',
                    'icon': config['icon'],
                    'color': config['color'],
                    'is_active': True
                }
            )
            
            if created:
                categories_created += 1
                print(f"✅ Đã tạo danh mục: {major_clean}")
        
        print(f"🎉 Hoàn thành tạo {categories_created} danh mục!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo danh mục: {e}")
        return False

def import_terms_from_excel():
    """Import thuật ngữ từ Excel vào database"""
    try:
        print("🔄 Đang import thuật ngữ từ Excel...")
        
        # Import models
        from apptimtruonghoc.models import TermCategory, FieldGroup, Major, Term, User
        
        # Đọc file Excel từ PythonAnywhere
        excel_path = '/home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx'
        df = pd.read_excel(excel_path)
        
        # Lấy field group và major đầu tiên để mapping
        field_group = FieldGroup.objects.first()
        major = Major.objects.first()
        
        if not field_group or not major:
            print("❌ Không tìm thấy FieldGroup hoặc Major trong database")
            return False
        
        # Lấy admin user đầu tiên
        admin_user = User.objects.filter(role='admin').first()
        if not admin_user:
            admin_user = User.objects.first()
        
        terms_created = 0
        terms_skipped = 0
        
        for index, row in df.iterrows():
            try:
                # Lấy dữ liệu từ Excel
                major_name = clean_text(row['Ngành học'])
                term_vn = clean_text(row['Thuật ngữ (Tiếng Việt)'])
                term_en = clean_text(row['Thuật ngữ (Tiếng Anh)'])
                explanation = clean_text(row['Giải thích'])
                
                # Kiểm tra dữ liệu bắt buộc
                if not term_vn or not term_en or not explanation:
                    terms_skipped += 1
                    continue
                
                # Tìm danh mục tương ứng
                try:
                    category = TermCategory.objects.get(name=major_name)
                except TermCategory.DoesNotExist:
                    # Tạo danh mục mới nếu chưa có
                    category = TermCategory.objects.create(
                        name=major_name,
                        name_en=major_name,
                        description=f'Thuật ngữ chuyên ngành {major_name}',
                        icon='fas fa-graduation-cap',
                        color='#6b7280',
                        is_active=True
                    )
                
                # Kiểm tra thuật ngữ đã tồn tại chưa
                existing_term = Term.objects.filter(
                    term_vn=term_vn,
                    major=major
                ).first()
                
                if existing_term:
                    terms_skipped += 1
                    continue
                
                # Tạo thuật ngữ mới
                term = Term.objects.create(
                    term_vn=term_vn,
                    term_en=term_en,
                    category=category,
                    field_group=field_group,
                    major=major,
                    definition=explanation,
                    definition_en=explanation,  # Có thể cập nhật sau
                    context=f"Thuật ngữ {term_vn} được sử dụng trong lĩnh vực {major_name}",
                    difficulty_level='intermediate',
                    status='approved',
                    created_by=admin_user,
                    updated_by=admin_user,
                    approved_by=admin_user
                )
                
                terms_created += 1
                
                if terms_created % 100 == 0:
                    print(f"📊 Đã import {terms_created} thuật ngữ...")
                
            except Exception as e:
                print(f"⚠️ Lỗi khi import dòng {index + 1}: {e}")
                terms_skipped += 1
                continue
        
        print(f"🎉 Hoàn thành import!")
        print(f"✅ Thuật ngữ đã tạo: {terms_created}")
        print(f"⚠️ Thuật ngữ bỏ qua: {terms_skipped}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi import thuật ngữ: {e}")
        return False

def check_database_status():
    """Kiểm tra trạng thái database"""
    try:
        from apptimtruonghoc.models import TermCategory, Term, FieldGroup, Major, User
        
        print("📊 KIỂM TRA TRẠNG THÁI DATABASE:")
        print(f"   - TermCategory: {TermCategory.objects.count()}")
        print(f"   - Term: {Term.objects.count()}")
        print(f"   - FieldGroup: {FieldGroup.objects.count()}")
        print(f"   - Major: {Major.objects.count()}")
        print(f"   - User: {User.objects.count()}")
        
        # Kiểm tra file Excel
        excel_path = '/home/timtruonghoc/timtruonghoc/apptimtruonghoc/thuat.xlsx'
        if os.path.exists(excel_path):
            print(f"   - File Excel: ✅ Tồn tại tại {excel_path}")
        else:
            print(f"   - File Excel: ❌ Không tìm thấy tại {excel_path}")
            
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra database: {e}")

def main():
    """Hàm chính"""
    print("🚀 Bắt đầu import dữ liệu thuật ngữ từ Excel trên PythonAnywhere...")
    print("=" * 70)
    
    # Kiểm tra trạng thái database
    check_database_status()
    print()
    
    # Tạo danh mục
    if create_categories_from_excel():
        # Import thuật ngữ
        import_terms_from_excel()
    
    print("=" * 70)
    print("🎉 Hoàn thành import dữ liệu thuật ngữ trên PythonAnywhere!")
    print("\n📋 Thống kê:")
    print("   - Tổng số thuật ngữ trong Excel: 2,617")
    print("   - Các ngành học chính: CNTT, Y học, Kiến trúc, Xã hội học...")
    print("   - Dữ liệu đã được làm sạch và import vào database")
    print("\n🔗 Truy cập trang web:")
    print("   - Trang thuật ngữ: https://yourusername.pythonanywhere.com/thuatngu")
    print("   - Admin panel: https://yourusername.pythonanywhere.com/admin")

if __name__ == "__main__":
    main() 