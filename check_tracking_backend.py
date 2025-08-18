#!/usr/bin/env python3
"""
Script để kiểm tra backend tracking system
"""
import requests
import json

API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'

def test_tracking_endpoint():
    """Test tracking endpoint"""
    print("🧪 Testing tracking endpoint...")
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    
    # Test với major_id = 1
    data = {
        "major_id": 1
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_statistics_endpoint():
    """Test statistics endpoint"""
    print("\n🧪 Testing statistics endpoint...")
    
    url = f"{API_BASE_URL}/tracking/statistics/"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_top_majors_endpoint():
    """Test top majors endpoint"""
    print("\n🧪 Testing top majors endpoint...")
    
    url = f"{API_BASE_URL}/tracking/top-majors/?limit=5"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_majors_endpoint():
    """Test majors endpoint to see available majors"""
    print("\n🧪 Testing majors endpoint...")
    
    url = f"{API_BASE_URL}/majors/?limit=5"
    
    try:
        response = requests.get(url)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Found {len(result.get('results', []))} majors")
            
            # Show first few majors
            for i, major in enumerate(result.get('results', [])[:3]):
                print(f"  {i+1}. ID: {major.get('id')}, Major ID: {major.get('major_id')}, Name: {major.get('name')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting backend tracking tests...")
    
    test_tracking_endpoint()
    test_statistics_endpoint()
    test_top_majors_endpoint()
    test_majors_endpoint()
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main() 