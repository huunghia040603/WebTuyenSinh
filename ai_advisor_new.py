#!/usr/bin/env python3
"""
AI Advisor cho tư vấn tuyển sinh - Phiên bản nâng cao
Hệ thống AI thông minh với khả năng trò chuyện tự nhiên
"""

import re
import random
from datetime import datetime

class AdmissionAI:
    def __init__(self):
        # Knowledge base cho tư vấn tuyển sinh
        self.knowledge_base = {
            'nganh_cntt': {
                'name': 'Công nghệ thông tin',
                'description': 'Ngành học về máy tính, phần mềm, mạng và công nghệ số. Đây là ngành hot nhất hiện nay với cơ hội việc làm rộng mở và mức lương cao.',
                'careers': [
                    'Lập trình viên (Developer)', 'Kỹ sư phần mềm (Software Engineer)', 
                    'Data Scientist', 'AI Engineer', 'DevOps Engineer', 'Product Manager', 
                    'UX/UI Designer', 'System Administrator', 'Security Engineer', 'Cloud Engineer'
                ],
                'skills': [
                    'Lập trình (Programming)', 'Tư duy logic (Logical Thinking)', 
                    'Giải quyết vấn đề (Problem Solving)', 'Làm việc nhóm (Teamwork)', 
                    'Tiếng Anh (English)', 'Học hỏi nhanh (Fast Learning)'
                ],
                'salary_range': '15-150 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'universities': [
                    'ĐH Bách khoa TP.HCM', 'ĐH Công nghệ Thông tin', 'ĐH Khoa học Tự nhiên', 
                    'ĐH FPT', 'ĐH RMIT', 'ĐH Bách khoa Hà Nội'
                ],
                'trends': [
                    'AI/ML (Artificial Intelligence/Machine Learning)', 'Cloud Computing', 
                    'Cybersecurity', 'Blockchain', 'IoT (Internet of Things)', 'Big Data'
                ]
            },
            'nganh_kinh_te': {
                'name': 'Kinh tế',
                'description': 'Ngành học về quản lý, tài chính, marketing và kinh doanh. Phù hợp với những ai thích giao tiếp và làm việc với con người.',
                'careers': [
                    'Chuyên viên tài chính (Financial Analyst)', 'Marketing Manager', 
                    'Business Analyst', 'Accountant', 'Sales Manager', 'HR Manager', 
                    'Project Manager', 'Investment Banker', 'Financial Advisor'
                ],
                'skills': [
                    'Phân tích dữ liệu (Data Analysis)', 'Giao tiếp (Communication)', 
                    'Quản lý (Management)', 'Tư duy kinh doanh (Business Thinking)', 
                    'Thuyết trình (Presentation)', 'Đàm phán (Negotiation)'
                ],
                'salary_range': '12-100 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'universities': [
                    'ĐH Kinh tế TP.HCM', 'ĐH Tài chính Marketing', 'ĐH Mở TP.HCM', 
                    'ĐH RMIT', 'ĐH UEH', 'ĐH Kinh tế Quốc dân'
                ],
                'trends': [
                    'Digital Marketing', 'E-commerce', 'Fintech', 'Sustainable Business', 
                    'Data Analytics', 'AI in Business', 'Blockchain in Finance'
                ]
            },
            'nganh_y_duoc': {
                'name': 'Y Dược',
                'description': 'Ngành học về y học, dược phẩm và chăm sóc sức khỏe. Ngành cao quý với trách nhiệm cứu người.',
                'careers': [
                    'Bác sĩ (Doctor)', 'Dược sĩ (Pharmacist)', 'Y tá (Nurse)', 
                    'Chuyên viên y tế (Medical Specialist)', 'Nha sĩ (Dentist)', 
                    'Dược sĩ lâm sàng (Clinical Pharmacist)', 'Quản lý bệnh viện (Hospital Manager)'
                ],
                'skills': [
                    'Kiên nhẫn (Patience)', 'Tỉ mỉ (Detail-oriented)', 'Trách nhiệm cao (High Responsibility)', 
                    'Học tập liên tục (Continuous Learning)', 'Thương người (Compassion)', 
                    'Chịu áp lực (Stress Management)'
                ],
                'salary_range': '20-100 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'universities': [
                    'ĐH Y Dược TP.HCM', 'ĐH Y khoa Phạm Ngọc Thạch', 'ĐH Y Hà Nội', 
                    'ĐH Dược Hà Nội', 'ĐH Y Dược Cần Thơ', 'ĐH Y Dược Huế'
                ],
                'trends': [
                    'Telemedicine (Y tế từ xa)', 'Precision Medicine (Y học chính xác)', 
                    'AI in Healthcare (AI trong y tế)', 'Personalized Medicine (Y học cá nhân hóa)', 
                    'Digital Health (Y tế số)', 'Robotic Surgery (Phẫu thuật robot)'
                ]
            }
        }
        
        # Patterns để nhận diện câu hỏi
        self.patterns = {
            'greeting': [
                r'^xin chào', r'^chào$', r'^hello$', r'^hi$', r'^chào bạn$', r'^chào ai$',
                r'^chào buổi sáng', r'^chào buổi chiều', r'^chào buổi tối', r'^good morning', r'^good afternoon',
                r'^good evening', r'^hey$', r'^yo$', r'^xin chào bạn', r'^chào bạn ơi', r'^hello bạn'
            ],
            'major_info': [
                r'ngành (\w+)', r'thông tin ngành (\w+)', r'ngành học (\w+)', r'ngành (\w+) là gì',
                r'cntt', r'công nghệ thông tin', r'it', r'computer science', r'khoa học máy tính',
                r'kinh tế', r'business', r'economics', r'commerce', r'tài chính', r'finance',
                r'y dược', r'medicine', r'pharmacy', r'y khoa', r'dược', r'healthcare'
            ],
            'career_advice': [
                r'tư vấn', r'định hướng', r'chọn ngành', r'ngành nào', r'việc làm', r'career',
                r'mức lương', r'lương', r'salary', r'income', r'thu nhập', r'cơ hội', r'opportunity',
                r'tương lai', r'future', r'nghề nghiệp', r'job', r'work', r'profession'
            ],
            'university_info': [
                r'trường', r'đại học', r'university', r'college', r'institution', r'school',
                r'học ở đâu', r'where to study', r'study where', r'học trường nào', r'which university',
                r'điểm chuẩn', r'admission score', r'entrance score', r'cut-off score', r'điểm đầu vào'
            ],
            'skills_required': [
                r'kỹ năng cần thiết', r'kỹ năng', r'skills', r'ability', r'competency',
                r'cần gì', r'what needed', r'requirement', r'yêu cầu', r'điều kiện', r'condition'
            ],
            'contact_expert': [
                r'liên hệ chuyên gia', r'contact expert', r'meet expert', r'gặp chuyên gia',
                r'tư vấn trực tiếp', r'direct consultation', r'face to face', r'gặp mặt',
                r'đăng ký tư vấn', r'register consultation', r'sign up consultation', r'book consultation',
                r'muốn gặp chuyên gia', r'want to meet expert', r'need expert', r'cần chuyên gia',
                r'đặt lịch tư vấn', r'schedule consultation', r'appointment', r'hẹn gặp',
                r'kết nối chuyên gia', r'connect expert', r'liên lạc chuyên gia', r'call expert'
            ],
            'emotional_support': [
                r'lo lắng', r'worried', r'anxious', r'concerned', r'stress', r'stressed',
                r'sợ', r'afraid', r'scared', r'fear', r'fearful', r'terrified',
                r'không biết', r'don\'t know', r'unsure', r'uncertain', r'confused', r'confusing'
            ],
            'trends_info': [
                r'xu hướng', r'trend', r'trending', r'popular', r'hot', r'fashionable',
                r'phát triển', r'development', r'growth', r'progress', r'advancement',
                r'tương lai', r'future', r'upcoming', r'coming', r'next', r'forward',
                r'2024', r'2025', r'2026', r'năm nay', r'năm sau', r'tương lai gần'
            ]
        }
        
        # Conversation flow để thu thập thông tin - thay đổi thành dict để lưu theo user_id
        self.conversation_flows = {}  # Lưu trạng thái cho từng user
        
        # Questions để thu thập thông tin form - chỉ 4 thông tin cơ bản
        self.info_questions = [
            {
                'step': 'name',
                'question': 'Tuyệt vời! Tôi sẽ giúp bạn liên hệ với chuyên gia tư vấn. Để chuẩn bị thông tin, bạn có thể cho tôi biết tên của bạn không?',
                'field': 'full_name'
            },
            {
                'step': 'email',
                'question': 'Cảm ơn! Bây giờ bạn có thể cho tôi biết email của bạn không?',
                'field': 'email'
            },
            {
                'step': 'phone',
                'question': 'Tuyệt! Và số điện thoại của bạn là gì?',
                'field': 'phone'
            },
            {
                'step': 'intro',
                'question': 'Cuối cùng, bạn có thể chia sẻ một chút về sở thích, định hướng hoặc điểm mạnh của mình không? (không bắt buộc)',
                'field': 'introduction'
            }
        ]

    def extract_major(self, question):
        """Trích xuất tên ngành từ câu hỏi"""
        majors = {
            'cntt': 'nganh_cntt',
            'công nghệ thông tin': 'nganh_cntt',
            'it': 'nganh_cntt',
            'computer science': 'nganh_cntt',
            'khoa học máy tính': 'nganh_cntt',
            'kinh tế': 'nganh_kinh_te',
            'business': 'nganh_kinh_te',
            'economics': 'nganh_kinh_te',
            'tài chính': 'nganh_kinh_te',
            'finance': 'nganh_kinh_te',
            'y dược': 'nganh_y_duoc',
            'y': 'nganh_y_duoc',
            'dược': 'nganh_y_duoc',
            'medicine': 'nganh_y_duoc',
            'pharmacy': 'nganh_y_duoc',
            'y khoa': 'nganh_y_duoc',
            'healthcare': 'nganh_y_duoc'
        }
        
        question_lower = question.lower()
        for key, value in majors.items():
            if key in question_lower:
                return value
        
        return None

    def extract_personal_info(self, message):
        """Trích xuất thông tin cá nhân từ tin nhắn"""
        info = {}
        
        # Trích xuất tên - cải thiện pattern để nhận diện tên đơn giản
        name_patterns = [
            r'tôi tên là (\w+)',
            r'tên tôi là (\w+)',
            r'tôi là (\w+)',
            r'(\w+) là tên tôi',
            r'tên (\w+)',
            r'^([a-zA-ZÀ-ỹ\s]+)$'  # Chỉ chữ cái và dấu tiếng Việt
        ]
        for pattern in name_patterns:
            match = re.search(pattern, message.lower())
            if match:
                info['full_name'] = match.group(1).title()
                break
        
        # Trích xuất email
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        email_match = re.search(email_pattern, message)
        if email_match:
            info['email'] = email_match.group(0)
        
        # Trích xuất số điện thoại
        phone_patterns = [
            r'0\d{9,10}',
            r'\d{10,11}',
            r'(\d{3,4})\s*(\d{3,4})\s*(\d{3,4})'
        ]
        for pattern in phone_patterns:
            phone_match = re.search(pattern, message)
            if phone_match:
                if len(phone_match.groups()) > 0:
                    info['phone'] = ''.join(phone_match.groups())
                else:
                    info['phone'] = phone_match.group(0)
                break
        
        # Không còn trích xuất thông tin trường và ngành - chỉ thu thập 4 thông tin cơ bản
        
        return info

    def is_likely_info_answer(self, message):
        """Kiểm tra xem message có phải là câu trả lời thông tin đơn giản không"""
        message_lower = message.lower().strip()
        
        # Kiểm tra nếu là tên đơn giản (1-3 từ, có thể có dấu tiếng Việt)
        if len(message_lower.split()) <= 3:
            # Loại bỏ dấu cách và kiểm tra xem có phải chữ cái không (bao gồm dấu tiếng Việt)
            clean_name = message_lower.replace(' ', '')
            # Kiểm tra xem có chứa ký tự đặc biệt không (trừ dấu tiếng Việt)
            if not any(char in clean_name for char in '0123456789@#$%^&*()_+-=[]{}|;:,.<>?/"\'\\'):
                return True
        
        # Kiểm tra nếu là email
        if '@' in message and '.' in message:
            return True
        
        # Kiểm tra nếu là số điện thoại (chỉ số)
        if message_lower.replace(' ', '').replace('-', '').replace('.', '').isdigit() and len(message_lower.replace(' ', '').replace('-', '').replace('.', '')) >= 9:
            return True
        
        return False

    def analyze_question(self, question):
        """Phân tích câu hỏi để xác định ý định"""
        question_lower = question.lower()
        
        # Kiểm tra yêu cầu liên hệ chuyên gia
        for pattern in self.patterns['contact_expert']:
            if re.search(pattern, question_lower):
                return 'contact_expert'
        
        # Kiểm tra hỗ trợ cảm xúc
        for pattern in self.patterns['emotional_support']:
            if re.search(pattern, question_lower):
                return 'emotional_support'
        
        # Kiểm tra xu hướng và thông tin mới
        for pattern in self.patterns['trends_info']:
            if re.search(pattern, question_lower):
                return 'trends_info'
        
        # Kiểm tra greeting
        for pattern in self.patterns['greeting']:
            if re.search(pattern, question_lower):
                return 'greeting'
        
        # Kiểm tra kỹ năng
        for pattern in self.patterns['skills_required']:
            if re.search(pattern, question_lower):
                return 'skills_required'
        
        # Kiểm tra thông tin ngành
        major_key = self.extract_major(question_lower)
        if major_key:
            return ('major_info', major_key)
        
        # Kiểm tra tư vấn nghề nghiệp
        for pattern in self.patterns['career_advice']:
            if re.search(pattern, question_lower):
                return 'career_advice'
        
        # Kiểm tra thông tin trường
        for pattern in self.patterns['university_info']:
            if re.search(pattern, question_lower):
                return 'university_info'
        
        return 'general'

    def get_major_info(self, major_key):
        """Lấy thông tin chi tiết về ngành"""
        if major_key in self.knowledge_base:
            return self.knowledge_base[major_key]
        return None

    def start_info_collection(self, user_id):
        """Bắt đầu thu thập thông tin người dùng"""
        if user_id not in self.conversation_flows:
            self.conversation_flows[user_id] = {
                'collecting_info': True,
                'current_step': 0,
                'collected_data': {}
            }
        else:
            self.conversation_flows[user_id]['collecting_info'] = True
            self.conversation_flows[user_id]['current_step'] = 0
            self.conversation_flows[user_id]['collected_data'] = {}
        
        print(f"DEBUG: Bắt đầu thu thập thông tin cho user {user_id}")
        print(f"DEBUG: collecting_info = {self.conversation_flows[user_id]['collecting_info']}")
        print(f"DEBUG: current_step = {self.conversation_flows[user_id]['current_step']}")
        
        return "**Tuyệt vời! Tôi sẽ giúp bạn liên hệ với chuyên gia tư vấn.**\n\nĐể chuẩn bị thông tin, bạn có thể cho tôi biết **tên của bạn** không?"

    def continue_info_collection(self, answer, user_id):
        """Tiếp tục thu thập thông tin"""
        current_step = self.conversation_flows[user_id]['current_step']
        current_question = self.info_questions[current_step]
        
        # Kiểm tra nếu answer có vẻ như là câu trả lời thông tin thực sự
        if self.is_likely_info_answer(answer):
            # Lưu câu trả lời trực tiếp vào field tương ứng
            self.conversation_flows[user_id]['collected_data'][current_question['field']] = answer
            
            # Debug: In ra thông tin đã thu thập
            print(f"DEBUG: Step {current_step}, Field: {current_question['field']}, Answer: {answer}")
            print(f"DEBUG: Collected data: {self.conversation_flows[user_id]['collected_data']}")
            
            # Chuyển sang câu hỏi tiếp theo
            next_step = current_step + 1
            
            if next_step < len(self.info_questions):
                self.conversation_flows[user_id]['current_step'] = next_step
                next_question = self.info_questions[next_step]['question']
                
                # Cải thiện định dạng câu hỏi
                if next_step == 1:  # Email
                    return f"**Cảm ơn bạn!** Tiếp theo, vui lòng cung cấp **email** của bạn để chúng tôi có thể liên hệ."
                elif next_step == 2:  # Phone
                    return f"**Tuyệt vời!** Cuối cùng, cho mình xin **số điện thoại** để chuyên gia có thể liên hệ trực tiếp."
                elif next_step == 3:  # Introduction
                    return f"**Hoàn hảo!** Bạn có thể chia sẻ thêm về **mục tiêu học tập** hoặc **ngành nghề quan tâm** không? (Không bắt buộc)"
                else:
                    return next_question
            else:
                # Hoàn thành thu thập thông tin
                self.conversation_flows[user_id]['collecting_info'] = False
                
                return self.generate_final_form_data(user_id)
        else:
            # Nếu không phải câu trả lời thông tin, hỏi lại câu hỏi hiện tại
            print(f"DEBUG: Answer '{answer}' không phải câu trả lời thông tin, hỏi lại")
            
            # Cải thiện câu hỏi lại
            if current_step == 0:  # Name
                return "**Vui lòng nhập tên của bạn** (ví dụ: Nguyễn Văn A)"
            elif current_step == 1:  # Email
                return "**Vui lòng nhập email hợp lệ** (ví dụ: example@gmail.com)"
            elif current_step == 2:  # Phone
                return "**Vui lòng nhập số điện thoại** (ví dụ: 0123456789)"
            elif current_step == 3:  # Introduction
                return "**Bạn có thể chia sẻ thêm về mục tiêu học tập** hoặc nhập 'ok' nếu không có gì thêm."
            else:
                return current_question['question']

    def generate_final_form_data(self, user_id):
        """Tạo dữ liệu form cuối cùng - chỉ 4 thông tin cơ bản"""
        data = self.conversation_flows[user_id]['collected_data']
        
        print(f"DEBUG: Generating final form data with: {data}")
        
        response = f"""**Tuyệt vời! Tôi đã thu thập đủ thông tin của bạn.**\n\n**📋 Thông tin đã thu thập:**\n• **Tên:** {data.get('full_name', 'Chưa có')}\n• **Email:** {data.get('email', 'Chưa có')}\n• **Số điện thoại:** {data.get('phone', 'Chưa có')}\n• **Mục tiêu:** {data.get('introduction', 'Chưa có')}\n\n**🎯 Bước tiếp theo:**\nBây giờ tôi sẽ hiển thị modal để bạn xác nhận thông tin và gửi yêu cầu tư vấn.\n\n**💡 Lưu ý:**\nChuyên gia sẽ liên hệ với bạn trong thời gian sớm nhất!\n\n[FORM_DATA]\n{data.get('full_name', '')}\n{data.get('email', '')}\n{data.get('phone', '')}\n{data.get('introduction', '')}\n[/FORM_DATA]"""

        print(f"DEBUG: Final response with [FORM_DATA]: {response}")
        return response

    def format_response(self, response_type, data=None):
        """Format response với định dạng chuyên nghiệp - xuống dòng và in đậm"""
        
        if response_type == 'greeting':
            greetings = [
                "Xin chào! Mình là Trợ lý AI của timtruonghoc.vn, rất vui được gặp bạn! 😊\n\nMình có thể giúp bạn:\n• Tư vấn chọn ngành học phù hợp\n• Thông tin về các ngành nghề hot\n• Mức lương và cơ hội việc làm\n• Trường đại học và điểm chuẩn\n\nBạn muốn tìm hiểu về vấn đề gì?",
                "Chào bạn! Mình là AI tư vấn tuyển sinh, sẵn sàng hỗ trợ bạn tìm hiểu về các ngành nghề! 🌟\n\nMình chuyên về:\n• Định hướng nghề nghiệp\n• Thông tin ngành học chi tiết\n• Xu hướng thị trường lao động\n• Kết nối chuyên gia tư vấn\n\nBạn cần tư vấn gì nào?",
                "Hello! Mình là trợ lý thông minh, chuyên tư vấn về định hướng nghề nghiệp. 💪\n\nMình có thể hỗ trợ:\n• Phân tích sở thích và năng lực\n• So sánh các ngành nghề\n• Thông tin trường đại học\n• Lộ trình học tập\n\nBạn cần gì mình giúp nhé!"
            ]
            return random.choice(greetings)
        
        elif response_type == 'emotional_support':
            support_messages = [
                "Tôi hiểu bạn đang cảm thấy lo lắng. Đây là giai đoạn quan trọng và việc băn khoăn là hoàn toàn bình thường. 💙\n\nHãy để tôi giúp bạn tìm hiểu từng bước một cách rõ ràng nhé!\n\n• Chúng ta sẽ phân tích sở thích của bạn\n• Tìm hiểu các ngành nghề phù hợp\n• So sánh cơ hội việc làm\n• Đưa ra quyết định sáng suốt\n\nBạn có muốn bắt đầu không?",
                "Đừng lo lắng! Mỗi người đều có con đường riêng và tôi sẽ giúp bạn khám phá những lựa chọn phù hợp nhất. 🌈\n\nHãy bắt đầu với những gì bạn thích!\n\n• Bạn thích môn học nào nhất?\n• Bạn có sở thích gì đặc biệt?\n• Bạn muốn làm việc trong môi trường nào?\n\nChia sẻ với tôi nhé!",
                "Tôi thấy bạn đang gặp khó khăn. Hãy chia sẻ thêm với tôi, tôi sẽ lắng nghe và đưa ra lời khuyên hữu ích nhất có thể! 🤗\n\nTôi ở đây để:\n• Lắng nghe và thấu hiểu\n• Phân tích tình huống của bạn\n• Đưa ra giải pháp phù hợp\n• Đồng hành cùng bạn\n\nBạn có thể chia sẻ thêm không?"
            ]
            return random.choice(support_messages)
        
        elif response_type == 'trends_info':
            return "**Xu hướng ngành nghề 2024-2025**\n\n**🔥 Ngành HOT nhất:**\n• **AI/Machine Learning:** Lương cao, cơ hội rộng mở\n• **Digital Marketing:** Nhu cầu tăng mạnh\n• **Cybersecurity:** Bảo mật thông tin\n• **E-commerce:** Thương mại điện tử\n• **Healthcare Technology:** Công nghệ y tế\n\n**📈 Xu hướng mới:**\n• **Remote Work** (Làm việc từ xa)\n• **Green Jobs** (Công việc xanh)\n• **Data Science** (Khoa học dữ liệu)\n• **Blockchain Technology**\n• **Renewable Energy**\n\nBạn quan tâm ngành nào trong số này?"
        
        elif response_type == 'major_info' and data:
            major = self.knowledge_base.get(data, {})
            if not major:
                return "Xin lỗi, tôi chưa có thông tin về ngành này. Bạn có thể hỏi về các ngành: **CNTT**, **Kinh tế**, **Y Dược**, **Luật**, **Sư phạm**, **Du lịch**, **Ngôn ngữ**."
            
            response = f"**Thông tin ngành {major['name']}**\n\n"
            response += f"**📝 Mô tả:**\n{major['description']}\n\n"
            
            response += f"**💼 Cơ hội việc làm:**\n"
            for career in major['careers'][:5]:  # Hiển thị 5 nghề đầu
                response += f"• {career}\n"
            
            response += f"\n**💰 Mức lương:**\n{major['salary_range']}\n\n"
            
            response += f"**🎯 Kỹ năng cần thiết:**\n"
            for skill in major['skills'][:4]:  # Hiển thị 4 kỹ năng đầu
                response += f"• {skill}\n"
            
            response += f"\n**🏫 Trường đào tạo:**\n"
            for uni in major['universities'][:3]:  # Hiển thị 3 trường đầu
                response += f"• {uni}\n"
            
            if 'trends' in major:
                response += f"\n**🚀 Xu hướng mới:**\n"
                for trend in major['trends'][:3]:
                    response += f"• {trend}\n"
            
            response += f"\n**🎭 Phù hợp với người:**\n"
            if 'personality_traits' in major:
                for trait in major['personality_traits'][:3]:
                    response += f"• {trait}\n"
            else:
                response += f"• Có đam mê với lĩnh vực này\n• Sẵn sàng học hỏi và phát triển\n• Có tư duy logic và sáng tạo\n"
            
            response += f"\nBạn có muốn tìm hiểu thêm về **điểm chuẩn** hoặc **cơ hội thực tập** không?"
            
            return response
        
        elif response_type == 'career_advice':
            return "**Tư vấn chọn ngành học**\n\nĐể chọn ngành phù hợp, bạn cần xem xét:\n\n**1. Sở thích và đam mê:**\n• Bạn thích làm việc với máy tính hay con người?\n• Bạn thích sáng tạo hay theo quy trình?\n• Bạn thích làm việc độc lập hay nhóm?\n\n**2. Năng lực học tập:**\n• Điểm mạnh của bạn ở môn học nào?\n• Bạn có khả năng tư duy logic tốt không?\n• Bạn có kiên nhẫn và tỉ mỉ không?\n\n**3. Mục tiêu nghề nghiệp:**\n• Bạn muốn làm việc ở đâu? (công ty, bệnh viện, trường học...)\n• Bạn muốn mức lương như thế nào?\n• Bạn có muốn đi du học không?\n\nBạn có thể chia sẻ thêm về sở thích của mình để tôi tư vấn cụ thể hơn!"
        
        elif response_type == 'university_info':
            return "**Thông tin trường đại học**\n\n**🏫 Các trường đại học hàng đầu:**\n• ĐH Bách khoa TP.HCM\n• ĐH Kinh tế TP.HCM\n• ĐH Y Dược TP.HCM\n• ĐH Luật TP.HCM\n• ĐH Sư phạm TP.HCM\n\n**📊 Điểm chuẩn 2023:**\n• **CNTT:** 25-28 điểm\n• **Kinh tế:** 24-27 điểm\n• **Y Dược:** 26-29 điểm\n• **Luật:** 25-28 điểm\n• **Sư phạm:** 22-25 điểm\n\n**💰 Học phí:**\n• **Công lập:** 15-25 triệu/năm\n• **Tư thục:** 30-60 triệu/năm\n\nBạn quan tâm trường nào cụ thể?"
        
        elif response_type == 'skills_required':
            return "**Kỹ năng cần thiết cho sinh viên**\n\n**🎯 Kỹ năng cứng:**\n• **Ngoại ngữ** (Tiếng Anh)\n• **Tin học văn phòng**\n• **Kỹ năng chuyên môn**\n• **Phân tích dữ liệu**\n\n**🤝 Kỹ năng mềm:**\n• **Giao tiếp**\n• **Làm việc nhóm**\n• **Quản lý thời gian**\n• **Tư duy phản biện**\n• **Sáng tạo**\n\n**💪 Kỹ năng bổ sung:**\n• **Lãnh đạo**\n• **Thuyết trình**\n• **Đàm phán**\n• **Giải quyết vấn đề**\n• **Thích ứng với thay đổi**\n\nBạn muốn phát triển kỹ năng nào?"
        
        elif response_type == 'contact_expert':
            # Không thể gọi start_info_collection ở đây vì không có user_id
            return "**Tuyệt vời! Tôi sẽ giúp bạn liên hệ với chuyên gia tư vấn.**\n\nĐể chuẩn bị thông tin, bạn có thể cho tôi biết **tên của bạn** không?"
        
        elif response_type == 'general':
            return "Tôi hiểu bạn đang tìm hiểu về tuyển sinh. Hãy để tôi tư vấn:\n\n**Tôi có thể giúp bạn:**\n• **Chọn ngành học phù hợp**\n• **Thông tin về các ngành nghề**\n• **Mức lương và cơ hội việc làm**\n• **Trường đại học và điểm chuẩn**\n• **Kỹ năng cần thiết**\n\n**Hãy hỏi cụ thể hơn, ví dụ:**\n• \"Tư vấn ngành CNTT\"\n• \"Mức lương ngành Kinh tế\"\n• \"Trường nào đào tạo Y Dược\"\n• \"Kỹ năng cần thiết cho sinh viên\"\n\nBạn muốn tìm hiểu về vấn đề gì?"

    def generate_response(self, question, conversation_history=None, user_id=None):
        """Tạo câu trả lời thông minh - Phiên bản nâng cao"""
        # Khởi tạo conversation flow cho user nếu chưa có
        if user_id not in self.conversation_flows:
            self.conversation_flows[user_id] = {
                'collecting_info': False,
                'current_step': None,
                'collected_data': {}
            }
        
        # Debug: In ra trạng thái conversation flow
        print(f"DEBUG: collecting_info = {self.conversation_flows[user_id]['collecting_info']}")
        print(f"DEBUG: current_step = {self.conversation_flows[user_id]['current_step']}")
        print(f"DEBUG: question = {question}")
        print(f"DEBUG: user_id = {user_id}")
        
        # Kiểm tra nếu đang thu thập thông tin - ƯU TIÊN CAO NHẤT
        if self.conversation_flows[user_id]['collecting_info']:
            print(f"DEBUG: Đang trong quá trình thu thập thông tin, step {self.conversation_flows[user_id]['current_step']}")
            return self.continue_info_collection(question, user_id)
        
        # Phân tích câu hỏi trước
        analysis = self.analyze_question(question)
        print(f"DEBUG: Analysis result = {analysis}")
        
        # Kiểm tra yêu cầu liên hệ chuyên gia - CHỈ KHI PHÂN TÍCH XÁC NHẬN
        if analysis == 'contact_expert':
            print(f"DEBUG: Phát hiện yêu cầu liên hệ chuyên gia qua phân tích")
            return self.start_info_collection(user_id)
        
        # Tạo câu trả lời dựa trên phân tích
        if analysis == 'greeting':
            response = self.format_response('greeting')
        elif isinstance(analysis, tuple) and analysis[0] == 'major_info':
            response = self.format_response('major_info', analysis[1])
        elif analysis == 'career_advice':
            response = self.format_response('career_advice')
        elif analysis == 'university_info':
            response = self.format_response('university_info')
        elif analysis == 'skills_required':
            response = self.format_response('skills_required')
        elif analysis == 'emotional_support':
            response = self.format_response('emotional_support')
        elif analysis == 'trends_info':
            response = self.format_response('trends_info')
        else:
            response = self.format_response('general')
        
        return response

# Tạo instance của AI
ai_advisor = AdmissionAI() 