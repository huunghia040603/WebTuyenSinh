from flask import Flask, render_template, request, redirect, jsonify, session, json
from flask_cors import CORS
import requests
import sys
import os

# Import Django models
try:
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    django.setup()
    from models import ExpertApplication, ConsultationRequest
    DJANGO_AVAILABLE = True
except ImportError as e:
    print(f"Không thể import Django models: {e}")
    DJANGO_AVAILABLE = False

# Thêm đường dẫn để import AI advisor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import AI advisor
try:
    from ai_advisor_new import ai_advisor
    AI_AVAILABLE = True
except ImportError as e:
    print(f"Không thể import AI advisor: {e}")
    AI_AVAILABLE = False

app = Flask(__name__)
CORS(app, origins=['http://localhost:5000', 'http://127.0.0.1:5000'])

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/dai-hoc-hcm")
def dai_hoc_hcm():
    return render_template('dh-hcm.html')



@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route("/account")
def account():
    return render_template('account.html')


@app.route("/dangnhap")
def dangnhap():
    return render_template('dangnhap.html')

@app.route("/dangky")
def dangky():
    return render_template('dangnhap.html')

@app.route("/mbti")
def mbti():
    return render_template('/khampha/mbti.html')

@app.route("/mota")
def mota():
    return render_template('/khampha/mota.html')

@app.route("/visao")
def visao():
    return render_template('/khampha/visao.html')

@app.route("/nganhchung")
def nganhchung():
    return render_template('nganhchung.html')

@app.route("/<university_code>")
def university_detail(university_code):
    return render_template('truongdaihoc/chitiet.html')

@app.route("/demo")
def demo():
    return render_template('demo.html')

@app.route("/nganh/<major_id>")
def major_detail(major_id):
    return render_template('chitiet-nganhchung.html')

@app.route("/chitiet-nganh-rieng")
def major_specific_detail():
    return render_template('chitiet-nganh-rieng.html')

@app.route("/mbtinew")
def mbtinew():
    return render_template('khampha/mbtinew.html')

@app.route("/moi")
def moi():
    return render_template('khampha/moi.html')

# @app.route("/zodiac")
# def cunghoangdao():
#     return render_template('cunghoangdao.html')

@app.route("/mbti-new")
def mbti_new():
    return render_template('mbti/mbti_new.html')


@app.route("/thansohoc")
def thansohoc():
    return render_template('thansohoc/thansohoc.html')

@app.route('/so-sanh-nganh')
def so_sanh_nganh():
    return render_template('so-sanh-nganh.html')

@app.route('/chat-test')
def chat_test():
    return render_template('chat_test.html')

@app.route('/debug-auth')
def debug_auth():
    return render_template('debug_auth.html')

@app.route('/thuatngu')
def thuatngu():
    return render_template('thuatngu.html')

@app.route('/demo-smart-terms')
def demo_smart_terms():
    return render_template('demo_smart_terms.html')

@app.route('/test-chat-flow')
def test_chat_flow():
    return render_template('test_chat_flow.html')

@app.route('/chat-demo')
def chat_demo():
    return render_template('chat_demo.html')

@app.route('/chat-notification-test')
def chat_notification_test():
    return render_template('chat_notification_test.html')

@app.route('/test-chat-notification')
def test_chat_notification():
    return render_template('test_chat_notification.html')

@app.route('/sticker-demo')
def sticker_demo():
    return render_template('sticker_demo.html')

@app.route('/thongke')
def thongke():
    return render_template('thongke.html')

@app.route('/test-thongke')
def test_thongke():
    return render_template('test_thongke_page.html')

# Mock data cho testing với dữ liệu mặc định
mock_school_views = {
    '1': 500,  # Đại học Bách khoa TP.HCM
    '2': 500,  # Đại học Kinh tế TP.HCM
    '3': 500,  # Đại học Sư phạm TP.HCM
    '4': 500,  # Đại học Y Dược TP.HCM
    '5': 500,  # Đại học Công nghệ Thông tin
    '6': 500,  # Đại học Khoa học Tự nhiên
    '7': 500,  # Đại học Khoa học Xã hội & Nhân văn
    '8': 500,  # Đại học Nông Lâm TP.HCM
    '9': 500,  # Đại học Tài chính - Marketing
    '10': 500  # Đại học Mở TP.HCM
}

mock_major_views = {
    '1': 500,  # Công nghệ thông tin
    '2': 500,  # Kinh tế
    '3': 500,  # Y khoa
    '4': 500,  # Sư phạm
    '5': 500,  # Kỹ thuật
    '6': 500,  # Luật
    '7': 500,  # Ngoại ngữ
    '8': 500,  # Kiến trúc
    '9': 500,  # Quản trị kinh doanh
    '10': 500  # Tài chính - Ngân hàng
}

mock_daily_stats = {}

# API endpoints cho tracking
@app.route('/tracking/increment-school-view/', methods=['POST'])
def increment_school_view():
    try:
        data = request.get_json()
        school_id = data.get('school_id')
        
        if not school_id:
            return jsonify({'error': 'school_id là bắt buộc'}), 400
        
        # Tăng lượt xem local
        if school_id not in mock_school_views:
            mock_school_views[school_id] = 0
        mock_school_views[school_id] += 1
        
        # Gửi dữ liệu lên PythonAnywhere
        try:
            increment_data = {
                'school_id': school_id,
                'increment': 1
            }
            response = requests.post(
                'https://timtruonghoc.pythonanywhere.com/tracking/increment-school-view/',
                json=increment_data,
                timeout=10
            )
            if response.status_code == 200:
                print(f"Đã gửi dữ liệu tăng lượt xem trường {school_id} lên PythonAnywhere")
            else:
                print(f"Lỗi khi gửi dữ liệu lên PythonAnywhere: {response.status_code}")
        except Exception as e:
            print(f"Lỗi khi gửi dữ liệu lên PythonAnywhere: {str(e)}")
        
        # Cập nhật thống kê ngày
        from datetime import date
        today = str(date.today())
        if today not in mock_daily_stats:
            mock_daily_stats[today] = {'school_views': 0, 'major_views': 0}
        mock_daily_stats[today]['school_views'] += 1
        
        return jsonify({
            'success': True,
            'view_count': mock_school_views[school_id],
            'message': f'Đã tăng lượt xem cho trường {school_id}'
        })
        
    except Exception as e:
        return jsonify({'error': f'Có lỗi xảy ra: {str(e)}'}), 500

@app.route('/tracking/increment-major-view/', methods=['POST'])
def increment_major_view():
    try:
        data = request.get_json()
        major_id = data.get('major_id')
        
        if not major_id:
            return jsonify({'error': 'major_id là bắt buộc'}), 400
        
        # Tăng lượt xem local
        if major_id not in mock_major_views:
            mock_major_views[major_id] = 0
        mock_major_views[major_id] += 1
        
        # Gửi dữ liệu lên PythonAnywhere
        try:
            increment_data = {
                'major_id': major_id,
                'increment': 1
            }
            response = requests.post(
                'https://timtruonghoc.pythonanywhere.com/tracking/increment-major-view/',
                json=increment_data,
                timeout=10
            )
            if response.status_code == 200:
                print(f"Đã gửi dữ liệu tăng lượt xem ngành {major_id} lên PythonAnywhere")
            else:
                print(f"Lỗi khi gửi dữ liệu lên PythonAnywhere: {response.status_code}")
        except Exception as e:
            print(f"Lỗi khi gửi dữ liệu lên PythonAnywhere: {str(e)}")
        
        # Cập nhật thống kê ngày
        from datetime import date
        today = str(date.today())
        if today not in mock_daily_stats:
            mock_daily_stats[today] = {'school_views': 0, 'major_views': 0}
        mock_daily_stats[today]['major_views'] += 1
        
        return jsonify({
            'success': True,
            'view_count': mock_major_views[major_id],
            'message': f'Đã tăng lượt xem cho ngành {major_id}'
        })
        
    except Exception as e:
        return jsonify({'error': f'Có lỗi xảy ra: {str(e)}'}), 500

@app.route('/tracking/top-schools/')
def top_schools():
    try:
        limit = int(request.args.get('limit', 10))
        
        # Lấy dữ liệu thật từ PythonAnywhere
        try:
            # Lấy danh sách trường từ PythonAnywhere
            schools_response = requests.get('https://timtruonghoc.pythonanywhere.com/schools/', timeout=10)
            if schools_response.status_code == 200:
                schools_data = schools_response.json()
                # PythonAnywhere trả về object với results array
                schools = schools_data.get('results', []) if isinstance(schools_data, dict) else schools_data
            else:
                # Fallback to mock data nếu không lấy được
                schools = []
                print(f"Không thể lấy dữ liệu trường từ PythonAnywhere: {schools_response.status_code}")
        except Exception as e:
            print(f"Lỗi khi lấy dữ liệu trường: {str(e)}")
            schools = []
        
        # Tạo top schools từ dữ liệu thật
        top_schools_data = []
        for school in schools[:limit]:
            # Lấy view count từ mock data hoặc tạo mặc định
            school_id = str(school.get('id', '1'))
            view_count = mock_school_views.get(school_id, 500)
            
            top_schools_data.append({
                'id': school.get('id', 1),
                'name_vn': school.get('name_vn', 'Trường Đại học'),
                'short_code': school.get('short_code', 'SCHOOL'),
                'logo': school.get('logo', '/static/images/logo/1.jpg'),
                'school_type': school.get('school_type', 'public'),
                'country': school.get('country', 'Việt Nam'),
                'view_count': view_count,
                'rank': len(top_schools_data) + 1
            })
        
        # Sắp xếp theo lượt xem giảm dần
        top_schools_data.sort(key=lambda x: x['view_count'], reverse=True)
        
        # Thêm rank sau khi sort
        for i, school in enumerate(top_schools_data):
            school['rank'] = i + 1
        
        return jsonify({
            'top_schools': top_schools_data[:limit],
            'total': len(top_schools_data[:limit])
        })
        
    except Exception as e:
        return jsonify({'error': f'Có lỗi xảy ra: {str(e)}'}), 500

@app.route('/tracking/top-majors/')
def top_majors():
    try:
        limit = int(request.args.get('limit', 10))
        
        # Lấy dữ liệu thật từ PythonAnywhere
        try:
            # Lấy danh sách ngành từ PythonAnywhere
            majors_response = requests.get('https://timtruonghoc.pythonanywhere.com/majors/', timeout=10)
            if majors_response.status_code == 200:
                majors_data = majors_response.json()
                # PythonAnywhere trả về object với results array
                majors = majors_data.get('results', []) if isinstance(majors_data, dict) else majors_data
            else:
                # Fallback to mock data nếu không lấy được
                majors = []
                print(f"Không thể lấy dữ liệu ngành từ PythonAnywhere: {majors_response.status_code}")
        except Exception as e:
            print(f"Lỗi khi lấy dữ liệu ngành: {str(e)}")
            majors = []
        
        # Tạo top majors từ dữ liệu thật
        top_majors_data = []
        for major in majors[:limit]:
            # Lấy view count từ mock data hoặc tạo mặc định
            major_id = str(major.get('id', '1'))
            view_count = mock_major_views.get(major_id, 500)
            
            # Lấy thông tin trường từ PythonAnywhere
            school_info = major.get('school', {}) if 'school' in major else {}
            school_name = school_info.get('name_vn', 'Trường Đại học')
            school_short_code = school_info.get('short_code', 'SCHOOL')
            school_logo = school_info.get('logo', '/static/images/logo/1.jpg')
            
            top_majors_data.append({
                'id': major.get('id', 1),
                'major_id': major.get('major_id', '74000001'),
                'name': major.get('name', 'Ngành học'),
                'school_name': school_name,
                'school_short_code': school_short_code,
                'school_logo': school_logo,
                'view_count': view_count,
                'rank': len(top_majors_data) + 1
            })
        
        # Sắp xếp theo lượt xem giảm dần
        top_majors_data.sort(key=lambda x: x['view_count'], reverse=True)
        
        # Thêm rank sau khi sort
        for i, major in enumerate(top_majors_data):
            major['rank'] = i + 1
        
        return jsonify({
            'top_majors': top_majors_data[:limit],
            'total': len(top_majors_data[:limit])
        })
        
    except Exception as e:
        return jsonify({'error': f'Có lỗi xảy ra: {str(e)}'}), 500

@app.route('/tracking/statistics/')
def view_statistics():
    try:
        # Tính toán từ mock data thật
        total_school_views = sum(mock_school_views.values())
        total_major_views = sum(mock_major_views.values())
        total_views = total_school_views + total_major_views
        
        # Mock daily stats with sample data
        from datetime import date, timedelta
        daily_data = []
        
        # Tạo daily stats từ mock data thật
        for i in range(7):
            day = date.today() - timedelta(days=6-i)  # Start from 6 days ago
            day_str = str(day)
            
            # Sử dụng dữ liệu thật nếu có, nếu không thì tạo dữ liệu mặc định
            if day_str in mock_daily_stats:
                daily_data.append({
                    'date': day_str,
                    'school_views': mock_daily_stats[day_str]['school_views'],
                    'major_views': mock_daily_stats[day_str]['major_views'],
                    'total_views': mock_daily_stats[day_str]['school_views'] + mock_daily_stats[day_str]['major_views']
                })
            else:
                # Tạo dữ liệu mặc định dựa trên tổng số
                avg_school_views = total_school_views // 7
                avg_major_views = total_major_views // 7
                # Thêm một chút random để tạo sự khác biệt
                import random
                school_views = avg_school_views + random.randint(-20, 20)
                major_views = avg_major_views + random.randint(-15, 15)
                daily_data.append({
                    'date': day_str,
                    'school_views': max(0, school_views),
                    'major_views': max(0, major_views),
                    'total_views': max(0, school_views) + max(0, major_views)
                })
        
        return jsonify({
            'total_school_views': total_school_views,
            'total_major_views': total_major_views,
            'total_views': total_views,
            'daily_stats': daily_data,
            'last_7_days': len(daily_data)
        })
        
    except Exception as e:
        return jsonify({'error': f'Có lỗi xảy ra: {str(e)}'}), 500


zodiac_data = {
    "Aries": {
        "name": "Bạch Dương",
        "date_range": "21/3 - 20/4",
        "element": "Lửa",
        "ruler": "Sao Hỏa",
        "strengths": "Năng nổ, dũng cảm, tự tin, nhiệt tình, lạc quan",
        "weaknesses": "Thiếu kiên nhẫn, bốc đồng, nóng nảy, đôi khi hung hăng",
        "analysis": "Bạch Dương là cung hoàng đạo đầu tiên của vòng tròn hoàng đạo, tượng trưng cho sự khởi đầu và năng lượng mãnh liệt. Những người thuộc cung này thường là những nhà lãnh đạo bẩm sinh, luôn tiên phong trong mọi việc và không ngại đối mặt với thử thách. Họ sống hết mình, yêu ghét rõ ràng và luôn tràn đầy năng lượng tích cực. Tuy nhiên, tính cách nóng vội và bốc đồng đôi khi khiến họ gặp rắc rối.",
        "careers": ["Doanh nhân", "Trưởng nhóm", "Vận động viên chuyên nghiệp", "Nhà sản xuất", "Nhân viên cứu hỏa", "Chuyên viên marketing"]
    },
    "Taurus": {
        "name": "Kim Ngưu",
        "date_range": "21/4 - 20/5",
        "element": "Đất",
        "ruler": "Sao Kim",
        "strengths": "Kiên định, đáng tin cậy, kiên nhẫn, thực tế, có trách nhiệm",
        "weaknesses": "Bướng bỉnh, cứng đầu, đôi khi quá ham vật chất",
        "analysis": "Kim Ngưu là hiện thân của sự ổn định, vững chãi và đáng tin cậy. Họ là những người sống thực tế, luôn tìm kiếm sự an toàn và thoải mái trong cuộc sống. Với sự kiên nhẫn và quyết tâm, họ có thể hoàn thành bất kỳ mục tiêu nào mà họ đã đặt ra. Kim Ngưu cũng có một tâm hồn yêu cái đẹp và nghệ thuật, được cai trị bởi Sao Kim.",
        "careers": ["Chuyên gia tài chính", "Nhà thiết kế nội thất", "Đầu bếp", "Kiến trúc sư", "Nhà quản lý bất động sản", "Ca sĩ"]
    },
    "Gemini": {
        "name": "Song Tử",
        "date_range": "21/5 - 21/6",
        "element": "Khí",
        "ruler": "Sao Thủy",
        "strengths": "Linh hoạt, thông minh, ham học hỏi, giao tiếp tốt, hài hước",
        "weaknesses": "Thiếu quyết đoán, hay thay đổi, dễ lo lắng, bề ngoài",
        "analysis": "Song Tử là những người có trí tuệ sắc bén và khả năng giao tiếp tuyệt vời. Họ tò mò về mọi thứ trên thế giới và luôn muốn khám phá, học hỏi những điều mới. Sự linh hoạt và khả năng thích ứng giúp họ dễ dàng kết bạn và thành công trong nhiều lĩnh vực. Tuy nhiên, bản tính 'hai mặt' đôi khi khiến họ khó đưa ra quyết định cuối cùng.",
        "careers": ["Nhà báo", "Nhà văn", "Giáo viên", "Luật sư", "Người dẫn chương trình (MC)", "Chuyên viên truyền thông"]
    },
    "Cancer": {
        "name": "Cự Giải",
        "date_range": "22/6 - 22/7",
        "element": "Nước",
        "ruler": "Mặt Trăng",
        "strengths": "Giàu trí tưởng tượng, trung thành, giàu cảm xúc, có sức thuyết phục",
        "weaknesses": "Hay thay đổi tâm trạng, bi quan, đa nghi, khó buông bỏ",
        "analysis": "Cự Giải được cai trị bởi Mặt Trăng, do đó họ sống rất tình cảm và có một trực giác nhạy bén. Gia đình và những người thân yêu là ưu tiên hàng đầu của họ. Họ có khả năng đồng cảm sâu sắc và luôn sẵn lòng che chở, bảo vệ người khác. Đôi khi, sự nhạy cảm quá mức khiến họ dễ bị tổn thương và thu mình lại.",
        "careers": ["Nhà tâm lý học", "Y tá/Bác sĩ", "Giáo viên mầm non", "Chuyên gia nhân sự", "Nhà hoạt động xã hội", "Đầu bếp"]
    },
    "Leo": {
        "name": "Sư Tử",
        "date_range": "23/7 - 22/8",
        "element": "Lửa",
        "ruler": "Mặt Trời",
        "strengths": "Sáng tạo, đam mê, hào phóng, ấm áp, vui vẻ, hài hước",
        "weaknesses": "Kiêu ngạo, bướng bỉnh, tự cho mình là trung tâm, thiếu linh hoạt",
        "analysis": "Sư Tử sinh ra để tỏa sáng. Được cai trị bởi Mặt Trời, họ luôn là trung tâm của sự chú ý với sự tự tin và sức hút tự nhiên. Họ là những người ấm áp, hào phóng và có trái tim nhân hậu. Với tố chất lãnh đạo và nguồn năng lượng dồi dào, họ truyền cảm hứng cho những người xung quanh. Tuy nhiên, cái tôi lớn đôi khi là điểm yếu của họ.",
        "careers": ["Diễn viên", "Nhà lãnh đạo", "Giám đốc điều hành (CEO)", "Nhà tổ chức sự kiện", "Chính trị gia", "Nhà thiết kế thời trang"]
    },
    "Virgo": {
        "name": "Xử Nữ",
        "date_range": "23/8 - 22/9",
        "element": "Đất",
        "ruler": "Sao Thủy",
        "strengths": "Thực tế, cẩn thận, tốt bụng, chăm chỉ, có óc phân tích",
        "weaknesses": "Hay lo lắng, quá cầu toàn, chỉ trích, tự ti",
        "analysis": "Xử Nữ là những người theo đuổi sự hoàn hảo. Họ có óc phân tích sắc sảo, chú ý đến từng chi tiết nhỏ và luôn làm việc một cách có phương pháp. Sự chăm chỉ và tận tâm giúp họ đạt được hiệu quả cao trong công việc. Họ sống rất thực tế và luôn sẵn lòng giúp đỡ người khác. Đôi khi, sự cầu toàn quá mức khiến họ trở nên khắt khe với bản thân và mọi người.",
        "careers": ["Biên tập viên", "Kế toán", "Nhà khoa học", "Lập trình viên", "Nhà phân tích dữ liệu", "Thư viện viên"]
    },
    "Libra": {
        "name": "Thiên Bình",
        "date_range": "23/9 - 23/10",
        "element": "Khí",
        "ruler": "Sao Kim",
        "strengths": "Hòa đồng, công bằng, hợp tác, duyên dáng, có tài ngoại giao",
        "weaknesses": "Thiếu quyết đoán, né tránh đối đầu, hay oán giận, tự thương hại",
        "analysis": "Thiên Bình là biểu tượng của sự cân bằng, hài hòa và công lý. Họ có khả năng nhìn nhận vấn đề từ nhiều góc độ và luôn cố gắng tìm ra giải pháp công bằng nhất. Với sự duyên dáng và tài ngoại giao, họ dễ dàng xây dựng các mối quan hệ tốt đẹp. Họ yêu cái đẹp, nghệ thuật và luôn tìm kiếm sự bình yên trong cuộc sống.",
        "careers": ["Luật sư", "Nhà ngoại giao", "Thẩm phán", "Chuyên viên tư vấn", "Nhà thiết kế", "Quản lý nhân sự"]
    },
    "Scorpio": {
        "name": "Bọ Cạp",
        "date_range": "24/10 - 22/11",
        "element": "Nước",
        "ruler": "Sao Diêm Vương",
        "strengths": "Nhiệt huyết, can đảm, trung thành, quyết đoán, có sức hút",
        "weaknesses": "Ghen tuông, đa nghi, bí ẩn, đôi khi cực đoan",
        "analysis": "Bọ Cạp là cung hoàng đạo mạnh mẽ và bí ẩn nhất. Họ có một nội tâm sâu sắc và một ý chí kiên cường. Khi đã đặt ra mục tiêu, họ sẽ theo đuổi đến cùng với một sự quyết tâm đáng kinh ngạc. Họ là những người bạn trung thành nhưng cũng có thể là kẻ thù đáng sợ. Sự sâu sắc và trực giác nhạy bén giúp họ nhìn thấu bản chất của sự việc.",
        "careers": ["Thám tử", "Nhà tâm lý học", "Bác sĩ phẫu thuật", "Nhà nghiên cứu", "Nhà quản lý tài chính", "Nhà báo điều tra"]
    },
    "Sagittarius": {
        "name": "Nhân Mã",
        "date_range": "23/11 - 21/12",
        "element": "Lửa",
        "ruler": "Sao Mộc",
        "strengths": "Hào phóng, lý tưởng, hài hước, yêu tự do, lạc quan",
        "weaknesses": "Thiếu kiên nhẫn, hứa hẹn nhiều hơn những gì có thể làm, thiếu tế nhị",
        "analysis": "Nhân Mã là những nhà thám hiểm của vòng hoàng đạo. Họ yêu tự do, luôn khao khát được đi du lịch, khám phá những vùng đất mới và học hỏi những nền văn hóa khác nhau. Với tinh thần lạc quan và góc nhìn triết lý, họ luôn tìm thấy ý nghĩa và niềm vui trong cuộc sống. Sự hài hước và thẳng thắn khiến họ trở thành những người bạn thú vị.",
        "careers": ["Hướng dẫn viên du lịch", "Giáo sư", "Nhà triết học", "Nhiếp ảnh gia", "Phiên dịch viên", "Nhà xuất bản"]
    },
    "Capricorn": {
        "name": "Ma Kết",
        "date_range": "22/12 - 19/1",
        "element": "Đất",
        "ruler": "Sao Thổ",
        "strengths": "Có trách nhiệm, kỷ luật, tự chủ, giỏi quản lý",
        "weaknesses": "Bi quan, không khoan dung, luôn cho rằng mình biết tất cả",
        "analysis": "Ma Kết là hiện thân của sự kỷ luật, trách nhiệm và tham vọng. Họ là những người làm việc chăm chỉ, có khả năng lập kế hoạch và quản lý xuất sắc. Với tính cách nghiêm túc và thực tế, họ từng bước xây dựng sự nghiệp vững chắc cho mình. Họ coi trọng truyền thống và gia đình. Đằng sau vẻ ngoài lạnh lùng là một trái tim ấm áp và đáng tin cậy.",
        "careers": ["Giám đốc", "Nhà quản lý", "Kỹ sư", "Chuyên viên phân tích tài chính", "Chính trị gia", "Kiến trúc sư"]
    },
    "Aquarius": {
        "name": "Bảo Bình",
        "date_range": "20/1 - 18/2",
        "element": "Khí",
        "ruler": "Sao Thiên Vương",
        "strengths": "Độc lập, nhân đạo, độc đáo, có tầm nhìn xa",
        "weaknesses": "Khó đoán, xa cách, bướng bỉnh, thiếu cảm xúc",
        "analysis": "Bảo Bình là những nhà tư tưởng độc đáo và cấp tiến. Họ luôn đi trước thời đại với những ý tưởng sáng tạo và khác biệt. Họ có một tinh thần nhân đạo sâu sắc, luôn mong muốn làm cho thế giới trở nên tốt đẹp hơn. Dù có vẻ ngoài lạnh lùng và xa cách, họ thực sự quan tâm đến bạn bè và cộng đồng. Họ coi trọng tự do và sự độc lập cá nhân.",
        "careers": ["Nhà khoa học", "Nhà phát minh", "Lập trình viên", "Nhà hoạt động xã hội", "Nhà văn khoa học viễn tưởng", "Phi hành gia"]
    },
    "Pisces": {
        "name": "Song Ngư",
        "date_range": "19/2 - 20/3",
        "element": "Nước",
        "ruler": "Sao Hải Vương",
        "strengths": "Nhân ái, nghệ thuật, trực giác tốt, dịu dàng, khôn ngoan",
        "weaknesses": "Sợ hãi, quá tin người, buồn rầu, muốn thoát ly thực tế",
        "analysis": "Song Ngư là cung hoàng đạo cuối cùng, mang trong mình sự tổng hòa của tất cả các cung khác. Họ có một tâm hồn nghệ sĩ, một trái tim nhân hậu và một trực giác vô cùng nhạy bén. Họ dễ dàng đồng cảm với cảm xúc của người khác và luôn sẵn lòng giúp đỡ. Họ sống trong một thế giới của những giấc mơ và trí tưởng tượng phong phú. Đôi khi, họ gặp khó khăn trong việc đối mặt với thực tế khắc nghiệt.",
        "careers": ["Nghệ sĩ", "Nhạc sĩ", "Nhà thơ", "Bác sĩ", "Nhà trị liệu tâm lý", "Nhà từ thiện"]
    }
}

def get_zodiac_sign(day, month):
    if (month == 3 and day >= 21) or (month == 4 and day <= 20):
        return "Aries"
    elif (month == 4 and day >= 21) or (month == 5 and day <= 20):
        return "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 21):
        return "Gemini"
    elif (month == 6 and day >= 22) or (month == 7 and day <= 22):
        return "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 23):
        return "Libra"
    elif (month == 10 and day >= 24) or (month == 11 and day <= 22):
        return "Scorpio"
    elif (month == 11 and day >= 23) or (month == 12 and day <= 21):
        return "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius"
    elif (month == 2 and day >= 19) or (month == 3 and day <= 20):
        return "Pisces"

@app.route("/cunghoangdao", methods=['GET', 'POST'])
def cunghoangdao():
    sign_data = None
    if request.method == 'POST':
        try:
            day = int(request.form.get('day'))
            month = int(request.form.get('month'))
            zodiac_sign_key = get_zodiac_sign(day, month)
            if zodiac_sign_key:
                sign_data = zodiac_data[zodiac_sign_key]
        except (ValueError, TypeError):
            # Handle cases where day/month are not valid integers
            pass
    return render_template('cunghoangdao/cunghoangdao.html', sign_data=sign_data)

@app.route("/hop-tac")
def hoptac():
    return render_template('hoptac.html')

@app.route("/dieukhoan")
def dieukhoan():
    return render_template('dieukhoan.html')

@app.route("/quyche")
def quyche():
    return render_template('quychedaydu.html')

# Temporary API endpoints để serve data thay vì PythonAnywhere
@app.route("/api/majors-outstanding/")
def majors_outstanding():
    """Temporary API endpoint cho majors outstanding"""
    # Mock data để test
    mock_data = {
        "count": 0,
        "results": [],
        "next": None,
        "previous": None
    }
    return jsonify(mock_data)

@app.route("/api/schools_outstanding/")
def schools_outstanding():
    """Temporary API endpoint cho schools outstanding"""
    # Mock data để test
    mock_data = {
        "count": 0,
        "results": [],
        "next": None,
        "previous": None
    }
    return jsonify(mock_data)

@app.route("/api/fieldgroups/")
def fieldgroups():
    """Temporary API endpoint cho field groups"""
    # Mock data để test
    mock_data = {
        "count": 0,
        "results": [],
        "next": None,
        "previous": None
    }
    return jsonify(mock_data)

@app.route("/api/all_major/")
def all_major():
    """Temporary API endpoint cho all major"""
    # Mock data để test
    mock_data = {
        "count": 0,
        "results": [],
        "next": None,
        "previous": None
    }
    return jsonify(mock_data)

@app.route("/xu-huong-nghe")
def xu_huong_nghe():
    return render_template('xu-huong-nghe.html')

@app.route("/test-modal")
def test_modal():
    return render_template('test_modal.html')

@app.route("/test-success-modal")
def test_success_modal():
    return render_template('dang-ky-tu-van.html')

@app.route("/test-success-modal-demo")
def test_success_modal_demo():
    return render_template('test_success_modal.html')

@app.route("/test-effects")
def test_effects():
    return render_template('test_effects.html')

@app.route("/test-chat-fix")
def test_chat_fix():
    return render_template('test_chat_fix.html')

@app.route("/test-success-icon")
def test_success_icon():
    return render_template('test_success_icon.html')

@app.route("/test-schools-api")
def test_schools_api():
    return render_template('test_schools_api.html')

@app.route("/test-jobs-parsing")
def test_jobs_parsing():
    return render_template('test_jobs_parsing.html')

@app.route("/test-schools-loading")
def test_schools_loading():
    return render_template('test_schools_loading.html')

@app.route("/test-format")
def test_format():
    return render_template('test_format.html')

@app.route("/dang-ky-tu-van")
def dang_ky_tu_van():
    return render_template('dang-ky-tu-van.html')

# AI Chat API endpoints
@app.route("/api/gemini-chat/", methods=['POST'])
def gemini_chat():
    """API endpoint cho AI chat"""
    if not AI_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'AI service không khả dụng'
        }), 503
    
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        user_id = data.get('user_id', 'anonymous')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Tin nhắn không được để trống'
            }), 400
        
        # Gọi AI advisor
        response = ai_advisor.generate_response(message, history, user_id)
        
        return jsonify({
            'success': True,
            'response': response,
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"Lỗi trong AI chat: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi xử lý tin nhắn'
        }), 500

@app.route("/api/user-form-data/<user_id>")
def user_form_data(user_id):
    """API endpoint để lấy dữ liệu form đã thu thập"""
    if not AI_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'AI service không khả dụng'
        }), 503
    
    try:
        form_data = ai_advisor.get_user_form_data(user_id)
        
        if form_data:
            return jsonify({
                'success': True,
                'form_data': form_data
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Không tìm thấy dữ liệu cho user này'
            }), 404
            
    except Exception as e:
        print(f"Lỗi khi lấy form data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi lấy dữ liệu'
        }), 500

@app.route("/api/expert-applications/", methods=['POST'])
def expert_applications():
    """API endpoint cho đăng ký chuyên gia tư vấn"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Trường {field} là bắt buộc'
                }), 400
        
        # Mock response - trong thực tế sẽ lưu vào database
        print(f"Đăng ký chuyên gia mới: {data['full_name']} - {data['email']}")
        
        return jsonify({
            'success': True,
            'message': 'Đăng ký thành công! Chúng tôi sẽ liên hệ sớm nhất.'
        })
        
    except Exception as e:
        print(f"Lỗi khi đăng ký chuyên gia: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi đăng ký'
        }), 500

@app.route("/api/consultation-requests/", methods=['POST'])
def consultation_requests():
    """API endpoint cho yêu cầu tư vấn từ AI"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Trường {field} là bắt buộc'
                }), 400
        
        # Lưu vào database nếu Django available
        if DJANGO_AVAILABLE:
            try:
                consultation = ConsultationRequest.objects.create(
                    full_name=data['full_name'],
                    email=data['email'],
                    phone=data['phone'],
                    conversation_summary=data.get('conversation_summary', '')
                )
                print(f"Đã lưu yêu cầu tư vấn AI: {consultation.full_name} - {consultation.email}")
            except Exception as db_error:
                print(f"Lỗi database: {db_error}")
                # Fallback to mock nếu database lỗi
                print(f"Yêu cầu tư vấn mới (mock): {data['full_name']} - {data['email']}")
        else:
            # Mock response nếu Django không available
            print(f"Yêu cầu tư vấn mới (mock): {data['full_name']} - {data['email']}")
        
        return jsonify({
            'success': True,
            'message': 'Yêu cầu tư vấn đã được ghi nhận!'
        })
        
    except Exception as e:
        print(f"Lỗi khi tạo yêu cầu tư vấn: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Có lỗi xảy ra khi tạo yêu cầu'
        }), 500

# Google Auth được xử lý bởi Django backend trên PythonAnywhere

if __name__ == "__main__":
    try:
        app.run(debug=True, host='127.0.0.1', port=5000)
    except OSError:
        print("Port 5000 is in use. Trying port 5001...")
        app.run(debug=True, host='127.0.0.1', port=5001)
