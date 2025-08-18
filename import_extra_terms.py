#!/usr/bin/env python3
"""
Script để import dữ liệu từ terms_extra.xlsx vào database Django
"""

import os
import sys
import django
import pandas as pd
from datetime import datetime

# Thêm đường dẫn hiện tại vào sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Thiết lập Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from models import Term, Category

def import_extra_terms():
    """Import dữ liệu từ terms_extra.xlsx vào database"""
    
    # Đường dẫn đến file Excel
    excel_path = 'static/data/terms_extra.xlsx'
    
    if not os.path.exists(excel_path):
        print(f"❌ File {excel_path} không tồn tại")
        return
    
    try:
        # Đọc file Excel
        print(f"📖 Đang đọc file {excel_path}...")
        df = pd.read_excel(excel_path)
        
        print(f"📊 Dữ liệu: {len(df)} dòng, {len(df.columns)} cột")
        print(f"📋 Các cột: {list(df.columns)}")
        
        # Kiểm tra cấu trúc dữ liệu
        if len(df.columns) < 4:
            print("❌ File Excel không đủ cột cần thiết")
            return
        
        # Lấy tên cột (giả sử cột đầu tiên là STT, các cột tiếp theo là ngành học, thuật ngữ VN, thuật ngữ EN, giải thích)
        columns = df.columns.tolist()
        
        # Tạo mapping cho các cột
        stt_col = columns[0] if len(columns) > 0 else None
        field_col = columns[1] if len(columns) > 1 else None
        term_vn_col = columns[2] if len(columns) > 2 else None
        term_en_col = columns[3] if len(columns) > 3 else None
        explanation_col = columns[4] if len(columns) > 4 else None
        
        print(f"🔍 Mapping cột:")
        print(f"   - STT: {stt_col}")
        print(f"   - Ngành học: {field_col}")
        print(f"   - Thuật ngữ VN: {term_vn_col}")
        print(f"   - Thuật ngữ EN: {term_en_col}")
        print(f"   - Giải thích: {explanation_col}")
        
        # Đếm số terms hiện có
        existing_count = Term.objects.count()
        print(f"📈 Số terms hiện có trong database: {existing_count}")
        
        # Import dữ liệu
        imported_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Lấy dữ liệu từ các cột
                field_name = str(row[field_col]).strip() if pd.notna(row[field_col]) else "Khác"
                term_vn = str(row[term_vn_col]).strip() if pd.notna(row[term_vn_col]) else ""
                term_en = str(row[term_en_col]).strip() if pd.notna(row[term_en_col]) else ""
                explanation = str(row[explanation_col]).strip() if pd.notna(row[explanation_col]) else ""
                
                # Bỏ qua nếu thiếu dữ liệu cần thiết
                if not term_vn or not explanation:
                    skipped_count += 1
                    continue
                
                # Kiểm tra xem term đã tồn tại chưa
                if Term.objects.filter(term_vn=term_vn).exists():
                    skipped_count += 1
                    continue
                
                # Tạo hoặc lấy category
                category, created = Category.objects.get_or_create(
                    name=field_name,
                    defaults={'description': f'Thuật ngữ về {field_name}'}
                )
                
                # Tạo term mới
                term = Term.objects.create(
                    category=category,
                    term_vn=term_vn,
                    term_en=term_en,
                    explanation=explanation,
                    created_at=datetime.now()
                )
                
                imported_count += 1
                
                # In progress mỗi 100 terms
                if imported_count % 100 == 0:
                    print(f"✅ Đã import {imported_count} terms...")
                
            except Exception as e:
                print(f"❌ Lỗi khi import dòng {index + 1}: {e}")
                skipped_count += 1
                continue
        
        # Kết quả cuối cùng
        final_count = Term.objects.count()
        print(f"\n🎉 Hoàn thành import!")
        print(f"   - Đã import: {imported_count} terms")
        print(f"   - Đã bỏ qua: {skipped_count} terms")
        print(f"   - Tổng số terms trong database: {final_count}")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc file Excel: {e}")

if __name__ == "__main__":
    import_extra_terms() 