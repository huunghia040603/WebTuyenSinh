#!/usr/bin/env python3
"""
Script đơn giản để chạy Flask server trên port 5000
"""

import os
import sys
from index import app

def main():
    print("🚀 Khởi động Flask server...")
    print("📱 Truy cập: http://localhost:5000")
    print("📊 Thống kê: http://localhost:5000/thongke")
    print("🔗 Backend: https://timtruonghoc.pythonanywhere.com")
    print("⏹️  Nhấn Ctrl+C để dừng server")
    print("-" * 50)
    
    try:
        # Thử chạy trên port 5000
        app.run(debug=True, host='127.0.0.1', port=5000)
    except OSError as e:
        if "Address already in use" in str(e):
            print("❌ Port 5000 đang được sử dụng!")
            print("💡 Hãy tắt AirPlay Receiver trong System Preferences > General > AirDrop & Handoff")
            print("💡 Hoặc chạy lệnh: sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.airplay.receiver.plist")
        else:
            print(f"❌ Lỗi: {e}")
    except KeyboardInterrupt:
        print("\n👋 Đã dừng server")
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")

if __name__ == "__main__":
    main() 