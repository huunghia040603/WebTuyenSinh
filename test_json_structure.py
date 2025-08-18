#!/usr/bin/env python3
"""
Script để kiểm tra cấu trúc file JSON
"""

import json
import os

def test_json_structure():
    """Kiểm tra cấu trúc file JSON"""
    
    json_path = 'static/data/terms_index_combined.json'
    
    if not os.path.exists(json_path):
        print(f"❌ File {json_path} không tồn tại")
        return
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ File JSON hợp lệ")
        print(f"📊 Tổng số terms: {data.get('count', len(data.get('terms', [])))}")
        print(f"📋 Cấu trúc dữ liệu:")
        print(f"   - count: {data.get('count')}")
        print(f"   - last_updated: {data.get('last_updated')}")
        print(f"   - terms: {len(data.get('terms', []))} items")
        
        # Kiểm tra cấu trúc của term đầu tiên
        if data.get('terms'):
            first_term = data['terms'][0]
            print(f"\n🔍 Cấu trúc term đầu tiên:")
            for key, value in first_term.items():
                print(f"   - {key}: {type(value).__name__} = {str(value)[:50]}{'...' if len(str(value)) > 50 else ''}")
        
        # Kiểm tra các thuộc tính cần thiết
        required_fields = ['term_vn', 'term_en', 'explanation', 'category']
        missing_fields = []
        
        for i, term in enumerate(data.get('terms', [])[:5]):  # Kiểm tra 5 terms đầu
            for field in required_fields:
                if field not in term:
                    missing_fields.append(f"Term {i}: {field}")
        
        if missing_fields:
            print(f"\n⚠️ Thiếu các trường:")
            for field in missing_fields:
                print(f"   - {field}")
        else:
            print(f"\n✅ Tất cả các trường cần thiết đều có")
        
        # Thống kê categories
        categories = {}
        for term in data.get('terms', []):
            cat = term.get('category', 'Unknown')
            categories[cat] = categories.get(cat, 0) + 1
        
        print(f"\n📚 Thống kê categories (top 10):")
        sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
        for cat, count in sorted_cats[:10]:
            print(f"   - {cat}: {count} terms")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc file JSON: {e}")

if __name__ == "__main__":
    test_json_structure() 