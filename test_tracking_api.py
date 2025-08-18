#!/usr/bin/env python3
"""
Script test API tracking
"""

import requests
import json

BASE_URL = "https://timtruonghoc.pythonanywhere.com"

def test_tracking_apis():
    print("🧪 Testing Tracking APIs...")
    
    # Test increment school view
    print("\n1. Testing increment school view...")
    response = requests.post(f"{BASE_URL}/tracking/increment-school-view/", 
                           json={"school_id": 1})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test increment major view
    print("\n2. Testing increment major view...")
    response = requests.post(f"{BASE_URL}/tracking/increment-major-view/", 
                           json={"major_id": 1})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test get statistics
    print("\n3. Testing get statistics...")
    response = requests.get(f"{BASE_URL}/tracking/statistics/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test get top schools
    print("\n4. Testing get top schools...")
    response = requests.get(f"{BASE_URL}/tracking/top-schools/?limit=5")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test get top majors
    print("\n5. Testing get top majors...")
    response = requests.get(f"{BASE_URL}/tracking/top-majors/?limit=5")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    try:
        test_tracking_apis()
        print("\n✅ All tests completed!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Make sure the server is running on port 5001") 