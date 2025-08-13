#!/usr/bin/env python3
"""
Script đơn giản để import dữ liệu từ terms_extra.xlsx vào JSON
Không cần Django, chỉ cần pandas
"""

import os
import json
import pandas as pd
from datetime import datetime

def import_extra_terms():
    """Import dữ liệu từ terms_extra.xlsx vào JSON"""
    
    # Đường dẫn đến file Excel
    excel_paths = [
        'static/data/terms_extra.xlsx',
        'terms_extra.xlsx',
        '/home/timtruonghoc/timtruonghoc/apptimtruonghoc/static/data/terms_extra.xlsx'
    ]
    
    excel_path = None
    for path in excel_paths:
        if os.path.exists(path):
            excel_path = path
            break
    
    if not excel_path:
        print(f"❌ Không tìm thấy file terms_extra.xlsx")
        print(f"   Đã thử các đường dẫn: {excel_paths}")
        return
    
    print(f"✅ Tìm thấy file tại: {excel_path}")
    
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
        
        # Lấy tên cột
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
        
        # Đọc file JSON hiện tại nếu có
        json_path = 'static/data/terms_index.json'
        existing_terms = []
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    existing_terms = data.get('terms', [])
                print(f"📈 Số terms hiện có trong JSON: {len(existing_terms)}")
            except Exception as e:
                print(f"⚠️ Không thể đọc file JSON hiện tại: {e}")
        
        # Tạo set để kiểm tra trùng lặp
        existing_term_vn = set(term.get('term_vn', '') for term in existing_terms)
        
        # Import dữ liệu
        imported_count = 0
        skipped_count = 0
        new_terms = []
        
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
                if term_vn in existing_term_vn:
                    skipped_count += 1
                    continue
                
                # Tạo term mới
                new_term = {
                    'id': len(existing_terms) + len(new_terms) + 1,
                    'category': field_name,
                    'term_vn': term_vn,
                    'term_en': term_en,
                    'explanation': explanation,
                    'created_at': datetime.now().isoformat()
                }
                
                new_terms.append(new_term)
                existing_term_vn.add(term_vn)
                imported_count += 1
                
                # In progress mỗi 100 terms
                if imported_count % 100 == 0:
                    print(f"✅ Đã import {imported_count} terms...")
                
            except Exception as e:
                print(f"❌ Lỗi khi import dòng {index + 1}: {e}")
                skipped_count += 1
                continue
        
        # Kết hợp terms cũ và mới
        all_terms = existing_terms + new_terms
        
        # Tạo dữ liệu JSON mới
        json_data = {
            'count': len(all_terms),
            'last_updated': datetime.now().isoformat(),
            'terms': all_terms
        }
        
        # Lưu vào file JSON
        output_path = 'static/data/terms_index_combined.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        # Kết quả cuối cùng
        print(f"\n🎉 Hoàn thành import!")
        print(f"   - Đã import: {imported_count} terms")
        print(f"   - Đã bỏ qua: {skipped_count} terms")
        print(f"   - Tổng số terms: {len(all_terms)}")
        print(f"   - File output: {output_path}")
        
        # Tạo file Excel mới nếu cần
        excel_output_path = 'static/data/terms_combined.xlsx'
        df_combined = pd.DataFrame([
            {
                'STT': term['id'],
                'Ngành học': term['category'],
                'Thuật ngữ (Tiếng Việt)': term['term_vn'],
                'Thuật ngữ (Tiếng Anh)': term['term_en'],
                'Giải thích': term['explanation']
            }
            for term in all_terms
        ])
        df_combined.to_excel(excel_output_path, index=False)
        print(f"   - File Excel: {excel_output_path}")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc file Excel: {e}")

if __name__ == "__main__":
    import_extra_terms() 