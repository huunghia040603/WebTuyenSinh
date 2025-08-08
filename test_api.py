#!/usr/bin/env python3
"""
Test script để kiểm tra API endpoint mới
"""

import requests
import json

def test_api_endpoint():
    base_url = "https://timtruonghoc.pythonanywhere.com"
    
    # Test 1: API endpoint mới
    print("=== Test API endpoint mới ===")
    test_short_code = "OU"  # Thay đổi mã trường để test
    
    try:
        # Test API tối ưu
        url = f"{base_url}/schools/by_short_code/{test_short_code}/"
        print(f"Testing URL: {url}")
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API tối ưu hoạt động!")
            print(f"School name: {data.get('name_vn', 'N/A')}")
            print(f"Short code: {data.get('short_code', 'N/A')}")
            print(f"Fields returned: {list(data.keys())}")
        else:
            print(f"❌ API tối ưu lỗi: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    print("\n=== Test API endpoint cũ (fallback) ===")
    try:
        # Test API cũ
        url = f"{base_url}/schools/?short_code={test_short_code}&page_size=2000"
        print(f"Testing URL: {url}")
        
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API cũ hoạt động!")
            print(f"Total results: {data.get('count', 0)}")
            if data.get('results'):
                school = data['results'][0]
                print(f"School name: {school.get('name_vn', 'N/A')}")
                print(f"Short code: {school.get('short_code', 'N/A')}")
        else:
            print(f"❌ API cũ lỗi: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_api_endpoint() 