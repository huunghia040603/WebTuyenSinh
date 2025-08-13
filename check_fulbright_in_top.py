#!/usr/bin/env python3
"""
Script để kiểm tra Fulbright trong top majors
"""
import requests
import json

API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'

def check_fulbright_in_top_majors():
    """Kiểm tra Fulbright trong top majors"""
    print("🔍 Kiểm tra Fulbright trong top majors...")
    
    url = f"{API_BASE_URL}/tracking/top-majors/?limit=20"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            top_majors = data.get('top_majors', [])
            
            print(f"✅ Tìm thấy {len(top_majors)} majors trong top:")
            
            fulbright_found = False
            for i, major in enumerate(top_majors):
                school_name = major.get('school_name', '')
                major_name = major.get('name', '')
                major_id = major.get('id', '')
                view_count = major.get('view_count', 0)
                
                print(f"  {i+1}. ID: {major_id}, Name: {major_name}")
                print(f"     School: {school_name}")
                print(f"     Views: {view_count}")
                print()
                
                # Kiểm tra xem có phải Fulbright không
                if 'Fulbright' in school_name or 'fulbright' in school_name.lower():
                    fulbright_found = True
                    print(f"🎯 FOUND FULBRIGHT! ID: {major_id}, Views: {view_count}")
                    print()
            
            if not fulbright_found:
                print("❌ Không tìm thấy Fulbright trong top majors")
                
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_fulbright_tracking():
    """Test tracking Fulbright Computer Science"""
    print("\n🧪 Test tracking Fulbright Computer Science...")
    
    # Fulbright Computer Science có ID = 1683
    data = {
        "major_id": 1683
    }
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tracking successful: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting Fulbright top majors check...")
    
    check_fulbright_in_top_majors()
    test_fulbright_tracking()
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main() 