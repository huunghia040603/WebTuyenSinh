#!/usr/bin/env python3
"""
Script để chạy Flask server với port tự động
"""

import socket
from index import app

def find_free_port(start_port=5000, max_attempts=10):
    """Tìm port tự do bắt đầu từ start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            continue
    return None

def main():
    # Force sử dụng port 5000
    port = 5000
    
    print(f"🚀 Khởi động server trên port {port}")
    print(f"📱 Truy cập: http://localhost:{port}")
    print(f"📊 Thống kê: http://localhost:{port}/thongke")
    print("🔗 Backend: https://timtruonghoc.pythonanywhere.com")
    print("⏹️  Nhấn Ctrl+C để dừng server")
    print("-" * 50)
    
    try:
        app.run(debug=True, host='127.0.0.1', port=port)
    except KeyboardInterrupt:
        print("\n👋 Đã dừng server")
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        print("💡 Nếu port 5000 bị chiếm, hãy tắt AirPlay Receiver trong System Preferences")

if __name__ == "__main__":
    main() 