from flask import Flask, app
from flask import render_template, request, redirect, jsonify, session, json

app = Flask(__name__)

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

@app.route('/so-sanh-truong')
def so_sanh_truong():
    return render_template('so-sanh-truong.html')


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

@app.route("/hoptac")
def hoptac():
    return render_template('hoptac.html')

@app.route("/dieukhoan")
def dieukhoan():
    return render_template('dieukhoan.html')

@app.route("/quyche")
def quyche():
    return render_template('quychedaydu.html')




if __name__ == "__main__":
    app.run(debug=True)
