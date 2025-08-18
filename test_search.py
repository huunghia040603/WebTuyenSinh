#!/usr/bin/env python3
"""
Script để test tìm kiếm trong file JSON
"""

import json
import os

def test_search():
    """Test tìm kiếm trong file JSON"""
    
    json_path = 'static/data/terms_index_combined.json'
    
    if not os.path.exists(json_path):
        print(f"❌ File {json_path} không tồn tại")
        return
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        terms = data.get('terms', [])
        print(f"✅ Loaded {len(terms)} terms")
        
        # Test tìm kiếm một số từ khóa
        test_queries = ['huyết áp', 'thuật toán', 'GDP', 'hiến pháp', 'lập trình']
        
        for query in test_queries:
            print(f"\n🔍 Tìm kiếm: '{query}'")
            q = query.lower()
            
            results = []
            for term in terms:
                if (
                    (term.get('vn', '').lower().find(q) != -1) or
                    (term.get('en', '').lower().find(q) != -1) or
                    (term.get('definition', '').lower().find(q) != -1) or
                    (term.get('search_text', '').lower().find(q) != -1)
                ):
                    results.append({
                        'vn': term.get('vn', ''),
                        'en': term.get('en', ''),
                        'category': term.get('category', ''),
                        'definition': term.get('definition', '')[:100] + '...' if len(term.get('definition', '')) > 100 else term.get('definition', '')
                    })
            
            print(f"   Tìm thấy {len(results)} kết quả")
            for i, result in enumerate(results[:3]):  # Hiển thị 3 kết quả đầu
                print(f"   {i+1}. {result['vn']} ({result['category']})")
                print(f"      EN: {result['en']}")
                print(f"      Def: {result['definition']}")
        
        # Test categories
        print(f"\n📚 Categories có sẵn:")
        categories = set(term.get('category', '') for term in terms)
        for cat in sorted(list(categories))[:10]:
            count = sum(1 for term in terms if term.get('category') == cat)
            print(f"   - {cat}: {count} terms")
        
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    test_search() 