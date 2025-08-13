#!/usr/bin/env python3
"""
Script để test tracking với school_id
"""
import requests
import json

API_BASE_URL = 'https://timtruonghoc.pythonanywhere.com'

def test_tracking_with_school_id():
    """Test tracking với major_id và school_id"""
    print("🧪 Testing tracking with school_id...")
    
    # Test với Fulbright Computer Science
    # Major ID: 7480101, School ID: 71, Major DB ID: 1683
    data = {
        "major_id": "7480101",
        "school_id": 71
    }
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Request Data: {data}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tracking successful: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_tracking_without_school_id():
    """Test tracking chỉ với major_id (cách cũ)"""
    print("\n🧪 Testing tracking without school_id (old way)...")
    
    data = {
        "major_id": "7480101"
    }
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Request Data: {data}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tracking successful: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_tracking_specific_major_id():
    """Test tracking với specific major ID (database ID)"""
    print("\n🧪 Testing tracking with specific major ID...")
    
    # Fulbright Computer Science có ID = 1683
    data = {
        "major_id": 1683  # Database ID thay vì major_id field
    }
    
    url = f"{API_BASE_URL}/tracking/increment-major-view/"
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Request Data: {data}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Tracking successful: {result}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting tracking tests with school_id...")
    
    test_tracking_with_school_id()
    test_tracking_without_school_id()
    test_tracking_specific_major_id()
    
    print("\n✅ All tests completed")

if __name__ == "__main__":
    main() 