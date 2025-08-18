#!/usr/bin/env python3
"""
Script để debug mapping giữa major_id và school
"""
import requests
import json

API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'

def find_majors_by_major_id(major_id):
    """Tìm tất cả majors có cùng major_id"""
    print(f"🔍 Tìm majors có major_id: {major_id}")
    
    url = f"{API_BASE_URL}/majors/?major_id={major_id}"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            
            print(f"✅ Tìm thấy {len(results)} majors:")
            for i, major in enumerate(results):
                print(f"  {i+1}. ID: {major.get('id')}")
                print(f"     Major ID: {major.get('major_id')}")
                print(f"     Name: {major.get('name')}")
                print(f"     School ID: {major.get('school')}")
                print(f"     School Name: {major.get('school_name', 'N/A')}")
                print()
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def find_school_by_short_code(short_code):
    """Tìm school theo short_code"""
    print(f"🏫 Tìm school có short_code: {short_code}")
    
    url = f"{API_BASE_URL}/schools/by_short_code/{short_code}/"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            school = response.json()
            print(f"✅ School found:")
            print(f"  ID: {school.get('id')}")
            print(f"  Name: {school.get('name_vn')}")
            print(f"  Short Code: {school.get('short_code')}")
            print(f"  Type: {school.get('school_type')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def find_majors_by_school(school_id):
    """Tìm tất cả majors của một school"""
    print(f"📚 Tìm majors của school ID: {school_id}")
    
    url = f"{API_BASE_URL}/majors/?school={school_id}"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', []) if isinstance(data, dict) else data
            
            print(f"✅ Tìm thấy {len(results)} majors:")
            for i, major in enumerate(results[:5]):  # Chỉ hiển thị 5 majors đầu
                print(f"  {i+1}. ID: {major.get('id')}")
                print(f"     Major ID: {major.get('major_id')}")
                print(f"     Name: {major.get('name')}")
                print()
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_tracking_with_specific_major(major_id):
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
    print("🚀 Starting major mapping debug...")
    
    # Test với major_id "7480101" (Khoa học Máy tính)
    major_id = "7480101"
    
    print(f"\n{'='*50}")
    find_majors_by_major_id(major_id)
    
    print(f"\n{'='*50}")
    find_school_by_short_code("fulbright")
    
    print(f"\n{'='*50}")
    find_school_by_short_code("HCMUT")
    
    print(f"\n{'='*50}")
    # Giả sử Fulbright có ID là 123 (cần tìm ID thực tế)
    # find_majors_by_school(123)
    
    print(f"\n{'='*50}")
    test_tracking_with_specific_major(6)  # Test với ID 6 (Bách khoa)
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main() 