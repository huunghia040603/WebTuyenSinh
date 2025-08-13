#!/usr/bin/env python3
"""
Script để kiểm tra majors của Fulbright
"""
import requests
import json

API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'

def find_fulbright_majors():
    """Tìm tất cả majors của Fulbright"""
    print("🔍 Tìm majors của Fulbright...")
    
    # Fulbright có ID = 71
    url = f"{API_BASE_URL}/majors/?school=71"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            
            print(f"✅ Tìm thấy {len(results)} majors của Fulbright:")
            for i, major in enumerate(results):
                print(f"  {i+1}. ID: {major.get('id')}")
                print(f"     Major ID: {major.get('major_id')}")
                print(f"     Name: {major.get('name')}")
                print()
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def find_majors_by_name_and_school(major_name, school_id):
    """Tìm major theo tên và school"""
    print(f"🔍 Tìm major '{major_name}' ở school ID {school_id}...")
    
    url = f"{API_BASE_URL}/majors/?school={school_id}"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            
            found_majors = []
            for major in results:
                if major_name.lower() in major.get('name', '').lower():
                    found_majors.append(major)
            
            print(f"✅ Tìm thấy {len(found_majors)} majors có tên chứa '{major_name}':")
            for i, major in enumerate(found_majors):
                print(f"  {i+1}. ID: {major.get('id')}")
                print(f"     Major ID: {major.get('major_id')}")
                print(f"     Name: {major.get('name')}")
                print()
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_tracking_specific_major(major_id):
    """Test tracking với major_id cụ thể"""
    print(f"🧪 Test tracking với major_id: {major_id}")
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    data = {"major_id": major_id}
    
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
    print("🚀 Starting Fulbright majors check...")
    
    print(f"\n{'='*50}")
    find_fulbright_majors()
    
    print(f"\n{'='*50}")
    find_majors_by_name_and_school("Khoa học máy tính", 71)
    
    print(f"\n{'='*50}")
    find_majors_by_name_and_school("Computer Science", 71)
    
    print(f"\n{'='*50}")
    find_majors_by_name_and_school("Công nghệ", 71)
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main() 