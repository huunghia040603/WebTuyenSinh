#!/usr/bin/env python3
"""
Script để kiểm tra tiến độ tạo terms
"""

import json
import os
import time

def check_progress():
    json_path = 'static/data/terms_index_extra.json'
    
    if not os.path.exists(json_path):
        print("❌ File terms_index_extra.json chưa tồn tại")
        return
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        count = data.get('count', 0)
        categories = data.get('categories', [])
        
        print(f"📊 Tiến độ hiện tại:")
        print(f"   - Số terms: {count:,}")
        print(f"   - Số categories: {len(categories)}")
        print(f"   - Mục tiêu: 10,000")
        print(f"   - Hoàn thành: {count/10000*100:.1f}%")
        
        if categories:
            print(f"\n📚 Categories đã xử lý:")
            for i, cat in enumerate(categories[:10], 1):
                print(f"   {i}. {cat}")
            if len(categories) > 10:
                print(f"   ... và {len(categories)-10} categories khác")
        
        # Kiểm tra file size
        file_size = os.path.getsize(json_path)
        print(f"\n💾 Kích thước file: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")
        
    except Exception as e:
        print(f"❌ Lỗi khi đọc file: {e}")

if __name__ == "__main__":
    while True:
        os.system('clear' if os.name == 'posix' else 'cls')
        check_progress()
        print(f"\n⏰ Cập nhật lúc: {time.strftime('%H:%M:%S')}")
        print("Nhấn Ctrl+C để thoát")
        time.sleep(5) 