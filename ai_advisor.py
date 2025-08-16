#!/usr/bin/env python3
"""
AI Advisor cho tư vấn tuyển sinh - Phiên bản nâng cao
Hệ thống AI thông minh với khả năng trò chuyện tự nhiên và học hỏi liên tục
Có khả năng thu thập thông tin người dùng và tự động điền form
"""

import re
import random
import json
import os
from datetime import datetime
from urllib.request import urlopen
from urllib.error import URLError

class AdmissionAI:
    def __init__(self):
        # User profile để thu thập thông tin
        self.user_profiles = {}
        
        # Conversation memory để nhớ cuộc trò chuyện
        self.conversation_memory = {}
        
        # Learning data để cải thiện AI
        self.learning_data = {
            'user_feedback': [],
            'common_questions': [],
            'successful_responses': [],
            'failed_responses': []
        }
        
        # Emotional intelligence để trò chuyện tự nhiên
        self.emotional_context = {
            'current_mood': 'neutral',
            'conversation_tone': 'friendly',
            'user_engagement': 'medium'
        }
        
        # Knowledge base MỞ RỘNG CỰC LỚN cho tư vấn tuyển sinh
        self.knowledge_base = {
            # === NGÀNH CÔNG NGHỆ THÔNG TIN ===
            'nganh_cntt': {
                'name': 'Công nghệ thông tin',
                'aliases': ['CNTT', 'IT', 'công nghệ thông tin', 'tin học', 'lập trình', 'software', 'tech', 'kỹ thuật số', 'digital', 'máy tính', 'computer science', 'khoa học máy tính'],
                'description': 'Ngành học về máy tính, phần mềm, mạng và công nghệ số. Đây là ngành hot nhất hiện nay với cơ hội việc làm rộng mở và mức lương cao.',
                'detailed_description': 'Công nghệ thông tin là ngành học về việc sử dụng máy tính và phần mềm để xử lý, lưu trữ, truyền tải và bảo vệ thông tin. Ngành này bao gồm nhiều lĩnh vực như lập trình, mạng máy tính, cơ sở dữ liệu, trí tuệ nhân tạo, và bảo mật thông tin.',
                'careers': [
                    'Lập trình viên (Developer)', 'Kỹ sư phần mềm (Software Engineer)', 'Quản trị mạng (Network Administrator)', 
                    'Data Scientist', 'AI Engineer', 'DevOps Engineer', 'Product Manager', 'UX/UI Designer', 'System Administrator',
                    'Database Administrator', 'Security Engineer', 'Cloud Engineer', 'Mobile Developer', 'Web Developer',
                    'Game Developer', 'Machine Learning Engineer', 'Data Engineer', 'Business Analyst', 'Technical Lead',
                    'CTO (Chief Technology Officer)', 'IT Consultant', 'Software Architect', 'QA Engineer', 'Scrum Master'
                ],
                'skills': [
                    'Lập trình (Programming)', 'Tư duy logic (Logical Thinking)', 'Giải quyết vấn đề (Problem Solving)', 
                    'Làm việc nhóm (Teamwork)', 'Tiếng Anh (English)', 'Học hỏi nhanh (Fast Learning)', 'Sáng tạo (Creativity)',
                    'Phân tích dữ liệu (Data Analysis)', 'Thiết kế hệ thống (System Design)', 'Quản lý dự án (Project Management)',
                    'Giao tiếp (Communication)', 'Tư duy phản biện (Critical Thinking)', 'Quản lý thời gian (Time Management)',
                    'Làm việc dưới áp lực (Working Under Pressure)', 'Thích ứng với thay đổi (Adaptability)'
                ],
                'salary_range': '15-150 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'salary_details': {
                    'Fresher': '15-25 triệu VND/tháng',
                    'Junior (1-3 năm)': '25-45 triệu VND/tháng',
                    'Senior (3-5 năm)': '45-80 triệu VND/tháng',
                    'Lead/Manager (5+ năm)': '80-150 triệu VND/tháng',
                    'Director/CTO': '150+ triệu VND/tháng'
                },
                'universities': [
                    'ĐH Bách khoa TP.HCM', 'ĐH Công nghệ Thông tin', 'ĐH Khoa học Tự nhiên', 'ĐH FPT', 'ĐH RMIT',
                    'ĐH Bách khoa Hà Nội', 'ĐH Công nghệ - ĐHQG Hà Nội', 'ĐH FPT Hà Nội', 'ĐH Greenwich', 'ĐH Swinburne',
                    'ĐH Cần Thơ', 'ĐH Đà Nẵng', 'ĐH Huế', 'ĐH Thủ Dầu Một', 'ĐH Văn Lang', 'ĐH Hoa Sen'
                ],
                'personality_traits': [
                    'Tư duy logic (Logical Thinking)', 'Sáng tạo (Creativity)', 'Kiên nhẫn (Patience)', 
                    'Học hỏi nhanh (Fast Learning)', 'Thích thử thách (Challenge-seeking)', 'Tỉ mỉ (Detail-oriented)',
                    'Tư duy phản biện (Critical Thinking)', 'Thích nghiên cứu (Research-oriented)', 'Có óc phân tích (Analytical)',
                    'Thích giải quyết vấn đề (Problem-solver)', 'Có tinh thần làm việc nhóm (Team player)'
                ],
                'subjects': ['Toán', 'Tin học', 'Vật lý', 'Tiếng Anh', 'Logic học', 'Thống kê'],
                'work_environment': [
                    'Văn phòng hiện đại (Modern Office)', 'Linh hoạt (Flexible)', 'Làm việc từ xa (Remote Work)', 
                    'Startup năng động (Dynamic Startup)', 'Công ty đa quốc gia (Multinational)', 'Freelance',
                    'Công ty outsourcing', 'Ngân hàng', 'Bảo hiểm', 'E-commerce', 'Gaming'
                ],
                'trends': [
                    'AI/ML (Artificial Intelligence/Machine Learning)', 'Cloud Computing', 'Mobile Development', 
                    'Cybersecurity', 'Blockchain', 'IoT (Internet of Things)', 'Big Data', 'DevOps',
                    'Microservices', 'Serverless', 'Edge Computing', 'Quantum Computing', '5G Technology',
                    'AR/VR (Augmented Reality/Virtual Reality)', 'Low-code/No-code', 'Green Tech'
                ],
                'certifications': [
                    'AWS (Amazon Web Services)', 'Google Cloud', 'Microsoft Azure', 'Cisco', 'Oracle',
                    'CompTIA A+', 'CompTIA Network+', 'CompTIA Security+', 'PMP (Project Management Professional)',
                    'ITIL', 'Scrum Master', 'Product Owner', 'Microsoft Certified', 'Java Certified',
                    'Python Certified', 'Kubernetes', 'Docker', 'Terraform', 'Ansible'
                ],
                'learning_path': {
                    'beginner': ['HTML/CSS', 'JavaScript', 'Python', 'Git', 'SQL'],
                    'intermediate': ['React/Vue/Angular', 'Node.js', 'Java', 'C#', 'Docker'],
                    'advanced': ['Microservices', 'Cloud Architecture', 'DevOps', 'AI/ML', 'Security']
                },
                'job_market': {
                    'demand': 'Rất cao (Very High)',
                    'growth_rate': '15-20% mỗi năm',
                    'remote_opportunities': 'Nhiều',
                    'international_opportunities': 'Rất nhiều'
                }
            },
            # === NGÀNH KINH TẾ ===
            'nganh_kinh_te': {
                'name': 'Kinh tế',
                'aliases': ['kinh tế', 'business', 'commerce', 'tài chính', 'finance', 'marketing', 'quản trị', 'management', 'thương mại', 'trade', 'doanh nghiệp', 'enterprise'],
                'description': 'Ngành học về quản lý, tài chính, marketing và kinh doanh. Phù hợp với những ai thích giao tiếp và làm việc với con người.',
                'detailed_description': 'Kinh tế là ngành học về việc quản lý nguồn lực, phân tích thị trường, và đưa ra các quyết định kinh doanh. Ngành này bao gồm nhiều lĩnh vực như tài chính, marketing, quản trị nhân sự, và kinh doanh quốc tế.',
                'careers': [
                    'Chuyên viên tài chính (Financial Analyst)', 'Marketing Manager', 'Business Analyst', 'Accountant', 
                    'Sales Manager', 'HR Manager', 'Project Manager', 'Investment Banker', 'Financial Advisor',
                    'Brand Manager', 'Digital Marketing Specialist', 'Business Development Manager', 'Operations Manager',
                    'Supply Chain Manager', 'Risk Manager', 'Compliance Officer', 'Auditor', 'Tax Consultant',
                    'Management Consultant', 'Entrepreneur', 'CEO', 'CFO', 'COO', 'Strategy Manager'
                ],
                'skills': [
                    'Phân tích dữ liệu (Data Analysis)', 'Giao tiếp (Communication)', 'Quản lý (Management)', 
                    'Tư duy kinh doanh (Business Thinking)', 'Thuyết trình (Presentation)', 'Đàm phán (Negotiation)',
                    'Lãnh đạo (Leadership)', 'Ra quyết định (Decision Making)', 'Quản lý thời gian (Time Management)',
                    'Tư duy chiến lược (Strategic Thinking)', 'Quản lý rủi ro (Risk Management)', 'Phân tích thị trường (Market Analysis)',
                    'Quản lý dự án (Project Management)', 'Làm việc nhóm (Teamwork)', 'Thích ứng với thay đổi (Adaptability)'
                ],
                'salary_range': '12-100 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'salary_details': {
                    'Fresher': '12-20 triệu VND/tháng',
                    'Junior (1-3 năm)': '20-35 triệu VND/tháng',
                    'Senior (3-5 năm)': '35-60 triệu VND/tháng',
                    'Manager (5+ năm)': '60-100 triệu VND/tháng',
                    'Director/Executive': '100+ triệu VND/tháng'
                },
                'universities': [
                    'ĐH Kinh tế TP.HCM', 'ĐH Tài chính Marketing', 'ĐH Mở TP.HCM', 'ĐH RMIT', 'ĐH UEH',
                    'ĐH Kinh tế Quốc dân', 'ĐH Ngoại thương', 'ĐH Thương mại', 'ĐH FPT', 'ĐH Greenwich',
                    'ĐH Cần Thơ', 'ĐH Đà Nẵng', 'ĐH Huế', 'ĐH Văn Lang', 'ĐH Hoa Sen', 'ĐH Tôn Đức Thắng'
                ],
                'personality_traits': [
                    'Giao tiếp tốt (Good Communication)', 'Tư duy kinh doanh (Business Mindset)', 'Năng động (Dynamic)', 
                    'Thích giao tiếp (Sociable)', 'Lãnh đạo (Leadership)', 'Tham vọng (Ambitious)',
                    'Tư duy chiến lược (Strategic Thinking)', 'Thích thử thách (Challenge-seeking)', 'Có óc phân tích (Analytical)',
                    'Quyết đoán (Decisive)', 'Có tinh thần làm việc nhóm (Team player)', 'Sáng tạo (Creative)'
                ],
                'subjects': ['Toán', 'Văn', 'Tiếng Anh', 'Địa lý', 'Lịch sử', 'GDCD'],
                'work_environment': [
                    'Văn phòng hiện đại (Modern Office)', 'Giao tiếp nhiều (High Communication)', 'Làm việc nhóm (Teamwork)', 
                    'Du lịch công tác (Business Travel)', 'Công ty đa quốc gia (Multinational)', 'Ngân hàng',
                    'Bảo hiểm', 'Công ty tư vấn', 'Startup', 'E-commerce', 'FMCG', 'Real Estate'
                ],
                'trends': [
                    'Digital Marketing', 'E-commerce', 'Fintech', 'Sustainable Business', 'Data Analytics',
                    'AI in Business', 'Blockchain in Finance', 'Green Finance', 'ESG Investing', 'Remote Work',
                    'Gig Economy', 'Circular Economy', 'Impact Investing', 'Cryptocurrency', 'DeFi'
                ],
                'certifications': [
                    'CFA (Chartered Financial Analyst)', 'ACCA (Association of Chartered Certified Accountants)', 
                    'PMP (Project Management Professional)', 'Google Analytics', 'Facebook Ads', 'HubSpot',
                    'Salesforce', 'Tableau', 'Power BI', 'CPA', 'FRM', 'PRM', 'CIMA', 'CMA'
                ],
                'learning_path': {
                    'beginner': ['Excel', 'PowerPoint', 'Word', 'Basic Accounting', 'Marketing Fundamentals'],
                    'intermediate': ['Financial Analysis', 'Digital Marketing', 'Project Management', 'Data Analysis'],
                    'advanced': ['Strategy', 'Leadership', 'Risk Management', 'International Business']
                },
                'job_market': {
                    'demand': 'Cao (High)',
                    'growth_rate': '10-15% mỗi năm',
                    'remote_opportunities': 'Trung bình',
                    'international_opportunities': 'Nhiều'
                }
            },
            'nganh_y_duoc': {
                'name': 'Y Dược',
                'description': 'Ngành học về y học, dược phẩm và chăm sóc sức khỏe. Ngành cao quý với trách nhiệm cứu người.',
                'careers': ['Bác sĩ', 'Dược sĩ', 'Y tá', 'Chuyên viên y tế', 'Nha sĩ', 'Dược sĩ lâm sàng', 'Quản lý bệnh viện'],
                'skills': ['Kiên nhẫn', 'Tỉ mỉ', 'Trách nhiệm cao', 'Học tập liên tục', 'Thương người', 'Chịu áp lực'],
                'salary_range': '20-100 triệu VND/tháng',
                'universities': ['ĐH Y Dược TP.HCM', 'ĐH Y khoa Phạm Ngọc Thạch', 'ĐH Y Hà Nội', 'ĐH Dược Hà Nội'],
                'personality_traits': ['Kiên nhẫn', 'Tỉ mỉ', 'Nhân ái', 'Trách nhiệm cao', 'Dũng cảm'],
                'subjects': ['Sinh học', 'Hóa học', 'Toán', 'Vật lý'],
                'work_environment': ['Bệnh viện', 'Phòng khám', 'Nhà thuốc', 'Phòng thí nghiệm'],
                'trends': ['Telemedicine', 'Precision Medicine', 'AI in Healthcare', 'Personalized Medicine'],
                'certifications': ['USMLE', 'PLAB', 'AMC', 'Medical Board Exams']
            },
            'nganh_luat': {
                'name': 'Luật',
                'description': 'Ngành học về pháp luật, tư pháp và quản lý nhà nước. Ngành đòi hỏi tư duy logic và công bằng.',
                'careers': ['Luật sư', 'Thẩm phán', 'Công chứng viên', 'Chuyên viên pháp lý', 'Cố vấn pháp luật', 'Quản lý nhà nước'],
                'skills': ['Tư duy logic', 'Ghi nhớ tốt', 'Giao tiếp', 'Phân tích', 'Thuyết trình', 'Nghiên cứu'],
                'salary_range': '15-80 triệu VND/tháng',
                'universities': ['ĐH Luật TP.HCM', 'ĐH Kinh tế Luật', 'ĐH Luật Hà Nội', 'Học viện Tư pháp'],
                'personality_traits': ['Tư duy logic', 'Ghi nhớ tốt', 'Công bằng', 'Kiên định', 'Trung thực'],
                'subjects': ['Văn', 'Sử', 'Địa', 'GDCD'],
                'work_environment': ['Tòa án', 'Văn phòng luật', 'Cơ quan nhà nước', 'Công ty'],
                'trends': ['International Law', 'Cyber Law', 'Environmental Law', 'Corporate Law'],
                'certifications': ['Bar Exam', 'Legal Practice Course', 'Solicitor Qualification']
            },
            'nganh_su_pham': {
                'name': 'Sư phạm',
                'description': 'Ngành học về giảng dạy và giáo dục. Ngành cao quý đào tạo thế hệ tương lai.',
                'careers': ['Giáo viên', 'Giảng viên', 'Chuyên viên giáo dục', 'Quản lý trường học', 'Tư vấn giáo dục', 'Biên tập viên giáo dục'],
                'skills': ['Giao tiếp tốt', 'Kiên nhẫn', 'Truyền đạt', 'Yêu trẻ', 'Sáng tạo', 'Quản lý lớp'],
                'salary_range': '8-35 triệu VND/tháng',
                'universities': ['ĐH Sư phạm TP.HCM', 'ĐH Sài Gòn', 'ĐH Sư phạm Hà Nội', 'ĐH Giáo dục'],
                'personality_traits': ['Yêu trẻ', 'Kiên nhẫn', 'Giao tiếp tốt', 'Truyền đạt', 'Nhiệt huyết'],
                'subjects': ['Văn', 'Toán', 'Tiếng Anh', 'Sinh học', 'Hóa học', 'Vật lý'],
                'work_environment': ['Trường học', 'Trung tâm giáo dục', 'Làm việc với học sinh', 'Online teaching'],
                'trends': ['E-learning', 'Blended Learning', 'STEAM Education', 'Special Education'],
                'certifications': ['Teaching License', 'TESOL', 'CELTA', 'Special Education Certificate']
            },
            # === NGÀNH DU LỊCH - KHÁCH SẠN ===
            'nganh_du_lich': {
                'name': 'Du lịch - Khách sạn',
                'aliases': ['du lịch', 'tourism', 'travel', 'khách sạn', 'hotel', 'hospitality', 'dịch vụ', 'service', 'hướng dẫn viên', 'tour guide'],
                'description': 'Ngành học về quản lý du lịch, khách sạn và dịch vụ khách hàng. Ngành năng động với nhiều cơ hội.',
                'detailed_description': 'Du lịch - Khách sạn là ngành học về việc quản lý và cung cấp dịch vụ trong lĩnh vực du lịch, khách sạn, nhà hàng và các dịch vụ liên quan. Ngành này đòi hỏi kỹ năng giao tiếp tốt, khả năng tổ chức và phục vụ khách hàng.',
                'careers': [
                    'Hướng dẫn viên du lịch (Tour Guide)', 'Quản lý khách sạn (Hotel Manager)', 
                    'Nhân viên lễ tân (Receptionist)', 'Quản lý tour (Tour Manager)', 
                    'Event Planner (Người tổ chức sự kiện)', 'Travel Agent (Đại lý du lịch)',
                    'Restaurant Manager (Quản lý nhà hàng)', 'Chef (Đầu bếp)', 'Bartender (Nhân viên pha chế)',
                    'Housekeeping Manager (Quản lý buồng phòng)', 'Sales Manager (Quản lý kinh doanh)',
                    'Marketing Manager (Quản lý marketing)', 'Revenue Manager (Quản lý doanh thu)',
                    'Human Resources Manager (Quản lý nhân sự)', 'Financial Controller (Kiểm soát tài chính)',
                    'General Manager (Tổng giám đốc)', 'Operations Manager (Quản lý vận hành)',
                    'Customer Service Manager (Quản lý dịch vụ khách hàng)', 'Quality Assurance Manager (Quản lý chất lượng)'
                ],
                'skills': [
                    'Giao tiếp (Communication)', 'Tiếng Anh (English)', 'Tổ chức (Organization)', 
                    'Xử lý tình huống (Problem Solving)', 'Thuyết trình (Presentation)',
                    'Quản lý thời gian (Time Management)', 'Làm việc nhóm (Teamwork)',
                    'Lãnh đạo (Leadership)', 'Đàm phán (Negotiation)', 'Thuyết phục (Persuasion)',
                    'Quản lý stress (Stress Management)', 'Thích ứng với thay đổi (Adaptability)',
                    'Kỹ năng bán hàng (Sales Skills)', 'Kỹ năng marketing (Marketing Skills)',
                    'Kỹ năng quản lý tài chính (Financial Management)', 'Kỹ năng quản lý nhân sự (HR Management)'
                ],
                'salary_range': '8-80 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'salary_details': {
                    'Fresher': '8-15 triệu VND/tháng',
                    'Junior (1-3 năm)': '15-25 triệu VND/tháng',
                    'Senior (3-5 năm)': '25-45 triệu VND/tháng',
                    'Manager (5+ năm)': '45-80 triệu VND/tháng',
                    'Director/Executive': '80+ triệu VND/tháng'
                },
                'universities': [
                    'ĐH Văn Lang', 'ĐH Hoa Sen', 'ĐH Tôn Đức Thắng', 'ĐH Kinh tế TP.HCM',
                    'ĐH Mở TP.HCM', 'ĐH Cần Thơ', 'ĐH Đà Nẵng', 'ĐH Huế', 'ĐH Thủ Dầu Một',
                    'ĐH Văn Hiến', 'ĐH Công nghiệp TP.HCM', 'ĐH Sài Gòn', 'ĐH Tài nguyên Môi trường',
                    'ĐH Nông Lâm TP.HCM', 'ĐH An Giang', 'ĐH Đồng Tháp', 'ĐH Tiền Giang'
                ],
                'personality_traits': [
                    'Năng động (Dynamic)', 'Giao tiếp tốt (Good Communication)', 'Thích du lịch (Travel-loving)',
                    'Thân thiện (Friendly)', 'Kiên nhẫn (Patient)', 'Sáng tạo (Creative)',
                    'Tổ chức tốt (Well-organized)', 'Thích giao tiếp (Sociable)', 'Linh hoạt (Flexible)',
                    'Có tinh thần phục vụ (Service-oriented)', 'Thích học hỏi (Learning-oriented)',
                    'Có khả năng lãnh đạo (Leadership potential)'
                ],
                'subjects': ['Địa lý', 'Văn', 'Tiếng Anh', 'Lịch sử', 'Toán', 'GDCD'],
                'work_environment': [
                    'Khách sạn (Hotel)', 'Công ty du lịch (Travel Company)', 'Du lịch nhiều (Frequent Travel)',
                    'Giao tiếp quốc tế (International Communication)', 'Nhà hàng (Restaurant)',
                    'Resort (Khu nghỉ dưỡng)', 'Cruise ship (Tàu du lịch)', 'Airline (Hãng bay)',
                    'Tourism office (Văn phòng du lịch)', 'Event venue (Địa điểm tổ chức sự kiện)',
                    'Theme park (Công viên giải trí)', 'Museum (Bảo tàng)', 'Cultural center (Trung tâm văn hóa)'
                ],
                'trends': [
                    'Eco-tourism (Du lịch sinh thái)', 'Cultural Tourism (Du lịch văn hóa)', 
                    'Digital Tourism (Du lịch số)', 'Luxury Tourism (Du lịch cao cấp)',
                    'Sustainable Tourism (Du lịch bền vững)', 'Adventure Tourism (Du lịch mạo hiểm)',
                    'Medical Tourism (Du lịch y tế)', 'Educational Tourism (Du lịch giáo dục)',
                    'Wellness Tourism (Du lịch sức khỏe)', 'Food Tourism (Du lịch ẩm thực)',
                    'Virtual Tourism (Du lịch ảo)', 'Smart Tourism (Du lịch thông minh)',
                    'Community-based Tourism (Du lịch cộng đồng)', 'Rural Tourism (Du lịch nông thôn)'
                ],
                'certifications': [
                    'Tour Guide License (Giấy phép hướng dẫn viên)', 'Hotel Management (Quản lý khách sạn)',
                    'Travel Agent (Đại lý du lịch)', 'Hospitality Management (Quản lý dịch vụ)',
                    'Tourism Management (Quản lý du lịch)', 'Event Management (Quản lý sự kiện)',
                    'Customer Service (Dịch vụ khách hàng)', 'Sales Management (Quản lý bán hàng)',
                    'Marketing Management (Quản lý marketing)', 'Human Resources Management (Quản lý nhân sự)',
                    'Financial Management (Quản lý tài chính)', 'Quality Management (Quản lý chất lượng)',
                    'ISO 9001', 'ISO 14001', 'OHSAS 18001', 'HACCP', 'Food Safety Management'
                ],
                'learning_path': {
                    'beginner': ['Customer Service', 'Basic English', 'Tourism Fundamentals', 'Geography', 'History'],
                    'intermediate': ['Hotel Operations', 'Tour Planning', 'Event Management', 'Sales Techniques', 'Marketing'],
                    'advanced': ['Strategic Management', 'Financial Planning', 'Human Resources', 'Quality Assurance', 'Sustainability']
                },
                'job_market': {
                    'demand': 'Cao (High)',
                    'growth_rate': '8-12% mỗi năm',
                    'remote_opportunities': 'Trung bình',
                    'international_opportunities': 'Rất nhiều'
                }
            },
            # === NGÀNH NGÔN NGỮ - NGOẠI NGỮ ===
            'nganh_ngon_ngu': {
                'name': 'Ngôn ngữ - Ngoại ngữ',
                'aliases': ['ngôn ngữ', 'language', 'ngoại ngữ', 'foreign language', 'tiếng anh', 'english', 'tiếng trung', 'chinese', 'tiếng nhật', 'japanese', 'tiếng hàn', 'korean', 'dịch thuật', 'translation', 'biên dịch', 'interpreting'],
                'description': 'Ngành học về ngôn ngữ, văn hóa và giao tiếp quốc tế. Ngành mở ra nhiều cơ hội làm việc toàn cầu.',
                'detailed_description': 'Ngôn ngữ - Ngoại ngữ là ngành học về việc nghiên cứu, giảng dạy và sử dụng các ngôn ngữ khác nhau. Ngành này bao gồm việc học ngôn ngữ, văn hóa, lịch sử và cách giao tiếp hiệu quả trong môi trường quốc tế.',
                'careers': [
                    'Giáo viên ngoại ngữ (Language Teacher)', 'Biên dịch viên (Translator)', 
                    'Phiên dịch viên (Interpreter)', 'Chuyên viên đối ngoại (Foreign Affairs Officer)',
                    'Nhân viên xuất nhập khẩu (Import-Export Officer)', 'Hướng dẫn viên du lịch quốc tế (International Tour Guide)',
                    'Nhân viên kinh doanh quốc tế (International Business Officer)', 'Chuyên viên marketing quốc tế (International Marketing Specialist)',
                    'Nhân viên quan hệ công chúng (PR Officer)', 'Chuyên viên truyền thông (Communication Specialist)',
                    'Nhân viên đại sứ quán (Embassy Officer)', 'Chuyên viên tổ chức sự kiện quốc tế (International Event Organizer)',
                    'Nhân viên công ty đa quốc gia (Multinational Company Officer)', 'Chuyên viên tư vấn du học (Study Abroad Consultant)',
                    'Nhân viên xuất bản (Publishing Officer)', 'Chuyên viên văn hóa (Cultural Specialist)',
                    'Nhân viên bảo tàng (Museum Officer)', 'Chuyên viên nghiên cứu (Research Specialist)',
                    'Freelance Translator (Dịch thuật tự do)', 'Content Creator (Người sáng tạo nội dung)'
                ],
                'skills': [
                    'Thành thạo ngoại ngữ (Language Proficiency)', 'Giao tiếp tốt (Good Communication)',
                    'Văn hóa quốc tế (International Culture)', 'Kỹ năng viết (Writing Skills)',
                    'Kỹ năng đọc hiểu (Reading Comprehension)', 'Kỹ năng nghe (Listening Skills)',
                    'Kỹ năng nói (Speaking Skills)', 'Kỹ năng dịch thuật (Translation Skills)',
                    'Kỹ năng phiên dịch (Interpreting Skills)', 'Kỹ năng giảng dạy (Teaching Skills)',
                    'Kỹ năng nghiên cứu (Research Skills)', 'Kỹ năng phân tích (Analytical Skills)',
                    'Kỹ năng thuyết trình (Presentation Skills)', 'Kỹ năng đàm phán (Negotiation Skills)',
                    'Kỹ năng làm việc nhóm (Teamwork Skills)', 'Kỹ năng quản lý thời gian (Time Management)',
                    'Kỹ năng thích ứng (Adaptability)', 'Kỹ năng sáng tạo (Creativity)'
                ],
                'salary_range': '10-100 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'salary_details': {
                    'Fresher': '10-18 triệu VND/tháng',
                    'Junior (1-3 năm)': '18-35 triệu VND/tháng',
                    'Senior (3-5 năm)': '35-60 triệu VND/tháng',
                    'Manager (5+ năm)': '60-100 triệu VND/tháng',
                    'Director/Executive': '100+ triệu VND/tháng'
                },
                'universities': [
                    'ĐH Ngoại ngữ - ĐHQG Hà Nội', 'ĐH Sư phạm TP.HCM', 'ĐH Sư phạm Hà Nội',
                    'ĐH Khoa học Xã hội và Nhân văn TP.HCM', 'ĐH Khoa học Xã hội và Nhân văn Hà Nội',
                    'ĐH Ngoại thương', 'ĐH Kinh tế TP.HCM', 'ĐH Mở TP.HCM', 'ĐH Văn Lang',
                    'ĐH Hoa Sen', 'ĐH Tôn Đức Thắng', 'ĐH Cần Thơ', 'ĐH Đà Nẵng', 'ĐH Huế',
                    'ĐH Thủ Dầu Một', 'ĐH Văn Hiến', 'ĐH Sài Gòn', 'ĐH An Giang', 'ĐH Đồng Tháp'
                ],
                'personality_traits': [
                    'Thích học hỏi (Learning-oriented)', 'Giao tiếp tốt (Good Communication)',
                    'Kiên nhẫn (Patient)', 'Tỉ mỉ (Detail-oriented)', 'Sáng tạo (Creative)',
                    'Thích văn hóa (Culture-loving)', 'Hướng ngoại (Extroverted)', 'Thích giao tiếp (Sociable)',
                    'Có óc phân tích (Analytical)', 'Thích nghiên cứu (Research-oriented)',
                    'Có tinh thần làm việc nhóm (Team player)', 'Thích thử thách (Challenge-seeking)'
                ],
                'subjects': ['Văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý', 'GDCD', 'Toán'],
                'work_environment': [
                    'Trường học (School)', 'Trung tâm ngoại ngữ (Language Center)', 'Công ty đa quốc gia (Multinational Company)',
                    'Đại sứ quán (Embassy)', 'Công ty xuất nhập khẩu (Import-Export Company)', 'Công ty du lịch (Travel Company)',
                    'Công ty truyền thông (Media Company)', 'Công ty xuất bản (Publishing Company)', 'Bảo tàng (Museum)',
                    'Thư viện (Library)', 'Công ty tư vấn (Consulting Company)', 'Freelance (Tự do)',
                    'Online teaching (Giảng dạy trực tuyến)', 'Remote work (Làm việc từ xa)'
                ],
                'trends': [
                    'Online Language Learning (Học ngoại ngữ trực tuyến)', 'AI Translation (Dịch thuật AI)',
                    'Cultural Exchange (Giao lưu văn hóa)', 'International Business (Kinh doanh quốc tế)',
                    'Global Communication (Giao tiếp toàn cầu)', 'Digital Content Creation (Sáng tạo nội dung số)',
                    'E-learning (Học tập điện tử)', 'Blended Learning (Học tập kết hợp)',
                    'Mobile Learning (Học tập di động)', 'Virtual Reality in Language Learning (VR trong học ngôn ngữ)',
                    'Gamification in Education (Trò chơi hóa trong giáo dục)', 'Personalized Learning (Học tập cá nhân hóa)',
                    'Microlearning (Học tập vi mô)', 'Social Learning (Học tập xã hội)'
                ],
                'certifications': [
                    'IELTS', 'TOEFL', 'TOEIC', 'Cambridge English', 'HSK (Chinese)', 'JLPT (Japanese)',
                    'TOPIK (Korean)', 'DELF/DALF (French)', 'DELE (Spanish)', 'Goethe-Zertifikat (German)',
                    'CELTA', 'DELTA', 'TESOL', 'TEFL', 'Translation Certificate', 'Interpreting Certificate',
                    'Business English Certificate', 'Legal English Certificate', 'Medical English Certificate',
                    'Technical Translation Certificate', 'Literary Translation Certificate'
                ],
                'learning_path': {
                    'beginner': ['Basic Grammar', 'Vocabulary Building', 'Pronunciation', 'Listening Skills', 'Reading Skills'],
                    'intermediate': ['Advanced Grammar', 'Writing Skills', 'Speaking Skills', 'Translation Techniques', 'Cultural Studies'],
                    'advanced': ['Professional Translation', 'Simultaneous Interpreting', 'Teaching Methodology', 'Research Methods', 'Business Communication']
                },
                'job_market': {
                    'demand': 'Rất cao (Very High)',
                    'growth_rate': '12-18% mỗi năm',
                    'remote_opportunities': 'Nhiều',
                    'international_opportunities': 'Rất nhiều'
                }
            },
            'nganh_ngon_ngu': {
                'name': 'Ngôn ngữ học',
                'description': 'Ngành học về ngôn ngữ, văn hóa và giao tiếp quốc tế. Phù hợp với người thích văn hóa.',
                'careers': ['Biên dịch viên', 'Phiên dịch viên', 'Giáo viên ngoại ngữ', 'Chuyên viên đối ngoại', 'Content Writer'],
                'skills': ['Ngôn ngữ', 'Văn hóa', 'Giao tiếp', 'Viết lách', 'Nghiên cứu'],
                'salary_range': '10-50 triệu VND/tháng',
                'universities': ['ĐH KHXH&NV', 'ĐH Ngoại ngữ', 'ĐH Sư phạm'],
                'personality_traits': ['Thích văn hóa', 'Giao tiếp tốt', 'Học ngoại ngữ', 'Tò mò'],
                'subjects': ['Văn', 'Ngoại ngữ', 'Lịch sử', 'Địa lý'],
                'work_environment': ['Văn phòng', 'Giao tiếp quốc tế', 'Du lịch', 'Giảng dạy'],
                'trends': ['AI Translation', 'Cultural Exchange', 'Digital Content', 'International Business'],
                'certifications': ['IELTS', 'TOEFL', 'DELF', 'HSK', 'JLPT']
            },
            # === NGÀNH KIẾN TRÚC - XÂY DỰNG ===
            'nganh_kien_truc': {
                'name': 'Kiến trúc - Xây dựng',
                'aliases': ['kiến trúc', 'architecture', 'xây dựng', 'construction', 'civil engineering', 'kỹ thuật dân dụng', 'thiết kế', 'design', 'quy hoạch', 'urban planning'],
                'description': 'Ngành học về thiết kế, xây dựng và quy hoạch không gian. Ngành kết hợp giữa nghệ thuật và kỹ thuật.',
                'detailed_description': 'Kiến trúc - Xây dựng là ngành học về việc thiết kế, xây dựng và quy hoạch các công trình, không gian sống và làm việc. Ngành này kết hợp giữa nghệ thuật sáng tạo và kỹ thuật khoa học.',
                'careers': [
                    'Kiến trúc sư (Architect)', 'Kỹ sư xây dựng (Civil Engineer)', 'Kỹ sư kết cấu (Structural Engineer)',
                    'Kỹ sư cơ khí (Mechanical Engineer)', 'Kỹ sư điện (Electrical Engineer)', 'Kỹ sư môi trường (Environmental Engineer)',
                    'Kỹ sư giao thông (Transportation Engineer)', 'Kỹ sư thủy lợi (Hydraulic Engineer)', 'Kỹ sư địa chất (Geotechnical Engineer)',
                    'Nhà quy hoạch đô thị (Urban Planner)', 'Nhà thiết kế nội thất (Interior Designer)', 'Nhà thiết kế cảnh quan (Landscape Designer)',
                    'Giám sát xây dựng (Construction Supervisor)', 'Quản lý dự án (Project Manager)', 'Tư vấn thiết kế (Design Consultant)',
                    'Nhà thầu xây dựng (Construction Contractor)', 'Chuyên viên khảo sát (Surveyor)', 'Chuyên viên quản lý chất lượng (Quality Manager)',
                    'Chuyên viên an toàn lao động (Safety Officer)', 'Chuyên viên bảo trì (Maintenance Engineer)'
                ],
                'skills': [
                    'Thiết kế (Design)', 'Vẽ kỹ thuật (Technical Drawing)', 'Tư duy không gian (Spatial Thinking)',
                    'Sáng tạo (Creativity)', 'Tư duy logic (Logical Thinking)', 'Giải quyết vấn đề (Problem Solving)',
                    'Quản lý dự án (Project Management)', 'Làm việc nhóm (Teamwork)', 'Giao tiếp (Communication)',
                    'Kỹ năng tính toán (Calculation Skills)', 'Kỹ năng phân tích (Analytical Skills)',
                    'Kỹ năng thuyết trình (Presentation Skills)', 'Kỹ năng đàm phán (Negotiation Skills)',
                    'Kỹ năng quản lý thời gian (Time Management)', 'Kỹ năng quản lý chi phí (Cost Management)',
                    'Kỹ năng quản lý rủi ro (Risk Management)', 'Kỹ năng lãnh đạo (Leadership)'
                ],
                'salary_range': '12-120 triệu VND/tháng (tùy kinh nghiệm và vị trí)',
                'salary_details': {
                    'Fresher': '12-20 triệu VND/tháng',
                    'Junior (1-3 năm)': '20-35 triệu VND/tháng',
                    'Senior (3-5 năm)': '35-60 triệu VND/tháng',
                    'Manager (5+ năm)': '60-120 triệu VND/tháng',
                    'Director/Partner': '120+ triệu VND/tháng'
                },
                'universities': [
                    'ĐH Kiến trúc TP.HCM', 'ĐH Kiến trúc Hà Nội', 'ĐH Bách khoa TP.HCM', 'ĐH Bách khoa Hà Nội',
                    'ĐH Xây dựng Hà Nội', 'ĐH Giao thông Vận tải TP.HCM', 'ĐH Giao thông Vận tải Hà Nội',
                    'ĐH Thủy lợi', 'ĐH Mỏ - Địa chất', 'ĐH Công nghệ - ĐHQG Hà Nội', 'ĐH Cần Thơ', 'ĐH Đà Nẵng',
                    'ĐH Huế', 'ĐH Thủ Dầu Một', 'ĐH Văn Lang', 'ĐH Hoa Sen', 'ĐH Tôn Đức Thắng'
                ],
                'personality_traits': [
                    'Sáng tạo (Creative)', 'Tư duy không gian (Spatial Thinking)', 'Tỉ mỉ (Detail-oriented)',
                    'Kiên nhẫn (Patient)', 'Tư duy logic (Logical Thinking)', 'Thích thử thách (Challenge-seeking)',
                    'Có óc thẩm mỹ (Aesthetic Sense)', 'Thích học hỏi (Learning-oriented)', 'Có tinh thần làm việc nhóm (Team player)',
                    'Có khả năng lãnh đạo (Leadership potential)', 'Thích nghiên cứu (Research-oriented)', 'Có óc phân tích (Analytical)'
                ],
                'subjects': ['Toán', 'Vật lý', 'Hóa học', 'Vẽ kỹ thuật', 'Tiếng Anh', 'GDCD'],
                'work_environment': [
                    'Văn phòng thiết kế (Design Office)', 'Công trường xây dựng (Construction Site)', 'Công ty tư vấn (Consulting Company)',
                    'Công ty xây dựng (Construction Company)', 'Cơ quan nhà nước (Government Agency)', 'Viện nghiên cứu (Research Institute)',
                    'Trường đại học (University)', 'Công ty bất động sản (Real Estate Company)', 'Công ty quy hoạch (Planning Company)',
                    'Công ty thiết kế nội thất (Interior Design Company)', 'Công ty thiết kế cảnh quan (Landscape Design Company)',
                    'Freelance (Tự do)', 'Remote work (Làm việc từ xa)'
                ],
                'trends': [
                    'Green Building (Công trình xanh)', 'Smart Building (Tòa nhà thông minh)', 'Sustainable Architecture (Kiến trúc bền vững)',
                    'BIM (Building Information Modeling)', '3D Printing in Construction (In 3D trong xây dựng)',
                    'Modular Construction (Xây dựng mô-đun)', 'Prefabricated Construction (Xây dựng lắp ghép)',
                    'Digital Twin (Bản sao số)', 'AI in Design (AI trong thiết kế)', 'VR/AR in Architecture (VR/AR trong kiến trúc)',
                    'Parametric Design (Thiết kế tham số)', 'Computational Design (Thiết kế tính toán)',
                    'Biophilic Design (Thiết kế sinh học)', 'Circular Economy in Construction (Kinh tế tuần hoàn trong xây dựng)',
                    'Net Zero Energy Building (Tòa nhà không năng lượng)', 'Passive House (Nhà thụ động)'
                ],
                'certifications': [
                    'LEED (Leadership in Energy and Environmental Design)', 'BREEAM (Building Research Establishment Environmental Assessment Method)',
                    'WELL Building Standard', 'Green Star', 'EDGE (Excellence in Design for Greater Efficiencies)',
                    'ISO 9001 (Quality Management)', 'ISO 14001 (Environmental Management)', 'OHSAS 18001 (Occupational Health and Safety)',
                    'PMP (Project Management Professional)', 'PRINCE2', 'Agile Project Management',
                    'BIM Certification', 'AutoCAD Certification', 'Revit Certification', 'SketchUp Certification',
                    'Structural Engineering License', 'Architectural License', 'Construction Management Certification'
                ],
                'learning_path': {
                    'beginner': ['Basic Drawing', 'Technical Drawing', 'Mathematics', 'Physics', 'Chemistry', 'English'],
                    'intermediate': ['Architectural Design', 'Structural Analysis', 'Construction Technology', 'Project Management', 'BIM'],
                    'advanced': ['Advanced Design', 'Sustainable Design', 'Urban Planning', 'Research Methods', 'Leadership']
                },
                'job_market': {
                    'demand': 'Cao (High)',
                    'growth_rate': '10-15% mỗi năm',
                    'remote_opportunities': 'Trung bình',
                    'international_opportunities': 'Nhiều'
                }
            }
        }
        
        # Patterns MỞ RỘNG CỰC LỚN để nhận diện câu hỏi và thu thập thông tin
        self.patterns = {
            'greeting': [
                # Chào hỏi cơ bản
                r'^xin chào', r'^chào$', r'^hello$', r'^hi$', r'^chào bạn$', r'^chào ai$',
                r'^chào buổi sáng', r'^chào buổi chiều', r'^chào buổi tối', r'^good morning', r'^good afternoon',
                r'^good evening', r'^hey$', r'^yo$', r'^xin chào bạn', r'^chào bạn ơi', r'^hello bạn',
                r'^hi there', r'^chào mừng', r'^welcome', r'^rất vui được gặp', r'^nice to meet you',
                # Chào hỏi thân thiện
                r'^chào bạn nhé', r'^hello bạn nhé', r'^hi bạn nhé', r'^chào bạn ạ', r'^hello bạn ạ',
                r'^hi bạn ạ', r'^chào bạn nha', r'^hello bạn nha', r'^hi bạn nha'
            ],
            'major_info': [
                # Hỏi thông tin ngành học
                r'ngành (\w+)', r'thông tin ngành (\w+)', r'ngành học (\w+)', r'ngành (\w+) là gì',
                r'thông tin về ngành (\w+)', r'ngành (\w+) học gì', r'ngành (\w+) làm gì',
                r'ngành (\w+) có tương lai không', r'ngành (\w+) có hot không', r'ngành (\w+) có dễ xin việc không',
                # Tên ngành cụ thể
                r'cntt', r'công nghệ thông tin', r'it', r'computer science', r'khoa học máy tính',
                r'kinh tế', r'business', r'economics', r'commerce', r'tài chính', r'finance',
                r'y dược', r'medicine', r'pharmacy', r'y khoa', r'dược', r'healthcare',
                r'luật', r'law', r'legal', r'pháp luật', r'tư pháp',
                r'sư phạm', r'education', r'teaching', r'giáo dục', r'pedagogy',
                r'du lịch', r'tourism', r'travel', r'khách sạn', r'hotel', r'hospitality',
                r'ngôn ngữ', r'language', r'ngoại ngữ', r'foreign language', r'english', r'tiếng anh',
                r'văn hóa', r'culture', r'arts', r'nghệ thuật', r'art',
                # Hỏi chung về ngành
                r'ngành nào hot', r'ngành nào dễ xin việc', r'ngành nào lương cao', r'ngành nào có tương lai',
                r'ngành nào phù hợp', r'ngành nào dễ học', r'ngành nào khó học', r'ngành nào thú vị',
                r'ngành nào ổn định', r'ngành nào sáng tạo', r'ngành nào thực tế', r'ngành nào lý thuyết'
            ],
            'career_advice': [
                # Tư vấn nghề nghiệp
                r'tư vấn', r'định hướng', r'chọn ngành', r'ngành nào', r'việc làm', r'career',
                r'mức lương', r'lương', r'salary', r'income', r'thu nhập', r'cơ hội', r'opportunity',
                r'tương lai', r'future', r'nghề nghiệp', r'job', r'work', r'profession',
                r'công việc', r'vị trí', r'position', r'role', r'chức vụ', r'title',
                # Hỏi về việc làm
                r'làm gì', r'công việc gì', r'việc gì', r'job gì', r'work gì', r'career gì',
                r'có việc làm không', r'dễ xin việc không', r'có tương lai không', r'có ổn định không',
                r'có phát triển không', r'có thăng tiến không', r'có lương cao không', r'có thú vị không',
                # Hỏi về mức lương
                r'lương bao nhiêu', r'mức lương bao nhiêu', r'thu nhập bao nhiêu', r'salary bao nhiêu',
                r'lương có cao không', r'mức lương có tốt không', r'thu nhập có ổn không',
                r'lương fresher', r'lương junior', r'lương senior', r'lương manager', r'lương director',
                # Hỏi về cơ hội
                r'cơ hội việc làm', r'job opportunity', r'career opportunity', r'cơ hội thăng tiến',
                r'cơ hội phát triển', r'cơ hội học tập', r'cơ hội du học', r'cơ hội làm việc nước ngoài',
                r'cơ hội remote', r'cơ hội freelance', r'cơ hội startup', r'cơ hội công ty lớn'
            ],
            'university_info': [
                # Hỏi về trường học
                r'trường', r'đại học', r'university', r'college', r'institution', r'school',
                r'học ở đâu', r'where to study', r'study where', r'học trường nào', r'which university',
                r'điểm chuẩn', r'admission score', r'entrance score', r'cut-off score', r'điểm đầu vào',
                r'trường nào tốt', r'which university is good', r'trường nào chất lượng', r'quality university',
                r'chất lượng', r'quality', r'ranking', r'xếp hạng', r'rank', r'position',
                r'trường top', r'top university', r'trường hàng đầu', r'leading university',
                r'trường quốc tế', r'international university', r'trường công', r'public university',
                r'trường tư', r'private university', r'trường dân lập', r'private institution',
                # Hỏi về học phí
                r'học phí', r'tuition fee', r'fee', r'cost', r'chi phí', r'expense',
                r'học phí bao nhiêu', r'tuition fee bao nhiêu', r'chi phí học tập', r'study cost',
                r'học phí có cao không', r'tuition fee có đắt không', r'chi phí có hợp lý không',
                # Hỏi về địa điểm
                r'học ở đâu', r'study where', r'location', r'địa điểm', r'place', r'area',
                r'học ở tp.hcm', r'học ở hà nội', r'học ở đà nẵng', r'học ở cần thơ', r'học ở huế'
            ],
            'skills_required': [
                # Hỏi về kỹ năng
                r'kỹ năng cần thiết', r'kỹ năng', r'skills', r'ability', r'competency',
                r'cần gì', r'what needed', r'requirement', r'yêu cầu', r'điều kiện', r'condition',
                r'phẩm chất', r'quality', r'trait', r'characteristic', r'personality',
                r'cần học gì', r'what to learn', r'learn what', r'study what', r'học gì',
                r'chuẩn bị gì', r'prepare what', r'what to prepare', r'ready for what',
                r'cần có gì', r'need what', r'require what', r'necessary what',
                # Kỹ năng cụ thể
                r'kỹ năng mềm', r'soft skills', r'kỹ năng cứng', r'hard skills', r'technical skills',
                r'kỹ năng giao tiếp', r'communication skills', r'kỹ năng lãnh đạo', r'leadership skills',
                r'kỹ năng quản lý', r'management skills', r'kỹ năng phân tích', r'analytical skills',
                r'kỹ năng sáng tạo', r'creative skills', r'kỹ năng giải quyết vấn đề', r'problem solving',
                r'kỹ năng làm việc nhóm', r'teamwork skills', r'kỹ năng thuyết trình', r'presentation skills',
                r'kỹ năng đàm phán', r'negotiation skills', r'kỹ năng quản lý thời gian', r'time management',
                r'kỹ năng học tập', r'learning skills', r'kỹ năng thích ứng', r'adaptability skills'
            ],
            'personal_info': [
                # Thông tin cá nhân
                r'tôi thích', r'i like', r'i enjoy', r'i love', r'i prefer', r'i want',
                r'tôi giỏi', r'i am good at', r'i am skilled at', r'i excel at', r'i am strong in',
                r'tôi học', r'i study', r'i learn', r'i am studying', r'i am learning',
                r'điểm của tôi', r'my score', r'my grade', r'my result', r'my performance',
                r'tôi muốn', r'i want', r'i wish', r'i desire', r'i hope', r'i would like',
                r'tôi có', r'i have', r'i possess', r'i own', r'i got', r'i am',
                r'tôi là', r'i am', r'i am a', r'i am an', r'i am the', r'i am this',
                r'tôi đang', r'i am currently', r'i am now', r'i am doing', r'i am working on',
                r'tôi sẽ', r'i will', r'i am going to', r'i plan to', r'i intend to', r'i am about to',
                r'tôi đã', r'i have', r'i had', r'i did', r'i was', r'i were',
                r'tôi cảm thấy', r'i feel', r'i think', r'i believe', r'i consider', r'i find',
                # Tính cách và sở thích
                r'tôi hướng nội', r'i am introvert', r'tôi hướng ngoại', r'i am extrovert',
                r'tôi kiên nhẫn', r'i am patient', r'tôi năng động', r'i am dynamic',
                r'tôi sáng tạo', r'i am creative', r'tôi logic', r'i am logical',
                r'tôi thích máy tính', r'i like computer', r'tôi thích con người', r'i like people',
                r'tôi thích số liệu', r'i like data', r'tôi thích nghệ thuật', r'i like art',
                r'tôi thích giao tiếp', r'i like communication', r'tôi thích nghiên cứu', r'i like research'
            ],
            'contact_expert': [
                # Liên hệ chuyên gia
                r'liên hệ chuyên gia', r'contact expert', r'meet expert', r'gặp chuyên gia',
                r'tư vấn trực tiếp', r'direct consultation', r'face to face', r'gặp mặt',
                r'đăng ký tư vấn', r'register consultation', r'sign up consultation', r'book consultation',
                r'form đăng ký', r'registration form', r'sign up form', r'application form',
                r'điền thông tin', r'fill information', r'provide information', r'submit information',
                r'gặp mặt', r'meet in person', r'face to face meeting', r'personal meeting',
                r'tư vấn offline', r'offline consultation', r'tư vấn trực tiếp', r'direct advice',
                r'gặp chuyên gia tư vấn', r'meet career counselor', r'gặp cố vấn nghề nghiệp'
            ],
            'emotional_support': [
                # Hỗ trợ cảm xúc
                r'lo lắng', r'worried', r'anxious', r'concerned', r'stress', r'stressed',
                r'sợ', r'afraid', r'scared', r'fear', r'fearful', r'terrified',
                r'không biết', r'don\'t know', r'unsure', r'uncertain', r'confused', r'confusing',
                r'bối rối', r'confused', r'puzzled', r'perplexed', r'bewildered', r'disoriented',
                r'stress', r'stressed', r'pressure', r'pressured', r'tension', r'tense',
                r'áp lực', r'pressure', r'stress', r'burden', r'load', r'weight',
                r'khó khăn', r'difficult', r'hard', r'challenging', r'tough', r'struggling',
                r'vấn đề', r'problem', r'issue', r'trouble', r'difficulty', r'challenge',
                r'help', r'giúp đỡ', r'assist', r'support', r'aid', r'help me',
                r'giúp đỡ', r'help', r'assistance', r'support', r'aid', r'guidance',
                # Cảm xúc tiêu cực
                r'buồn', r'sad', r'depressed', r'upset', r'down', r'low',
                r'thất vọng', r'disappointed', r'frustrated', r'discouraged', r'let down',
                r'hoang mang', r'confused', r'bewildered', r'perplexed', r'disoriented',
                r'mất phương hướng', r'lost direction', r'directionless', r'aimless', r'purposeless'
            ],
            'trends_info': [
                # Thông tin xu hướng
                r'xu hướng', r'trend', r'trending', r'popular', r'hot', r'fashionable',
                r'phát triển', r'development', r'growth', r'progress', r'advancement',
                r'tương lai', r'future', r'upcoming', r'coming', r'next', r'forward',
                r'2024', r'2025', r'2026', r'năm nay', r'năm sau', r'tương lai gần',
                r'công nghệ mới', r'new technology', r'emerging tech', r'latest tech',
                r'ngành mới', r'new field', r'emerging field', r'new industry',
                r'cơ hội mới', r'new opportunity', r'emerging opportunity', r'new chance',
                r'ngành hot', r'hot field', r'popular field', r'trending field',
                r'ngành phát triển', r'growing field', r'developing field', r'expanding field',
                r'công nghệ tương lai', r'future technology', r'next gen tech', r'advanced tech',
                r'AI', r'artificial intelligence', r'machine learning', r'ML', r'deep learning',
                r'blockchain', r'cryptocurrency', r'crypto', r'bitcoin', r'ethereum',
                r'cloud computing', r'cloud', r'aws', r'azure', r'google cloud',
                r'cybersecurity', r'security', r'hacking', r'ethical hacking', r'penetration testing',
                r'data science', r'big data', r'analytics', r'business intelligence', r'BI',
                r'devops', r'agile', r'scrum', r'lean', r'kanban',
                r'remote work', r'work from home', r'WFH', r'hybrid work', r'flexible work',
                r'startup', r'entrepreneurship', r'innovation', r'disruption', r'disruptive'
            ],
            'study_advice': [
                # Tư vấn học tập chung
                r'tôi muốn đi học', r'i want to study', r'i want to go to school',
                r'muốn học', r'want to learn', r'want to study',
                r'đi học', r'go to school', r'go to university', r'go to college',
                r'học gì', r'what to study', r'what should i study',
                r'chọn ngành', r'choose major', r'select major',
                r'định hướng', r'orientation', r'career guidance',
                r'tư vấn', r'advice', r'consultation',
                r'không biết học gì', r'don\'t know what to study',
                r'bối rối', r'confused', r'unsure', r'uncertain'
            ]
        }
        
        # Conversation flow để thu thập thông tin
        self.conversation_flow = {
            'collecting_info': False,
            'current_step': None,
            'collected_data': {}
        }
        
        # Questions cải thiện để thu thập thông tin
        self.info_questions = [
            {
                'step': 'name',
                'question': 'Tôi thấy bạn rất quan tâm đến việc định hướng nghề nghiệp. Để tư vấn chính xác hơn, bạn có thể cho tôi biết tên của bạn không?',
                'field': 'name'
            },
            {
                'step': 'grade',
                'question': 'Bạn đang học lớp mấy vậy? (Lớp 10, 11, 12 hay đã tốt nghiệp?)',
                'field': 'grade'
            },
            {
                'step': 'subjects',
                'question': 'Bạn thích học môn nào nhất? (Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa...)',
                'field': 'favorite_subjects'
            },
            {
                'step': 'personality',
                'question': 'Bạn thấy mình là người như thế nào? (Hướng nội, hướng ngoại, kiên nhẫn, năng động, sáng tạo...)',
                'field': 'personality'
            },
            {
                'step': 'interests',
                'question': 'Bạn thích làm việc trong môi trường nào? (Văn phòng, ngoài trời, làm việc với máy tính, làm việc với con người...)',
                'field': 'work_preference'
            },
            {
                'step': 'goals',
                'question': 'Bạn có mục tiêu gì trong tương lai? (Làm việc ở công ty lớn, khởi nghiệp, làm việc nhà nước, đi du học...)',
                'field': 'career_goals'
            }
        ]
        
        # Load external data
        self.load_external_data()

    def load_external_data(self):
        """Tải dữ liệu từ bên ngoài để cải thiện AI"""
        try:
            # Có thể tải từ API hoặc file JSON
            if os.path.exists('external_data.json'):
                with open('external_data.json', 'r', encoding='utf-8') as f:
                    external_data = json.load(f)
                    self.knowledge_base.update(external_data.get('majors', {}))
                    self.learning_data.update(external_data.get('learning', {}))
        except Exception as e:
            print(f"Không thể tải dữ liệu bên ngoài: {e}")

    def save_learning_data(self):
        """Lưu dữ liệu học tập"""
        try:
            with open('learning_data.json', 'w', encoding='utf-8') as f:
                json.dump(self.learning_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Không thể lưu dữ liệu học tập: {e}")

    def update_emotional_context(self, user_message):
        """Cập nhật ngữ cảnh cảm xúc"""
        # Phát hiện cảm xúc từ tin nhắn
        if any(word in user_message.lower() for word in ['lo lắng', 'sợ', 'không biết']):
            self.emotional_context['current_mood'] = 'worried'
            self.emotional_context['conversation_tone'] = 'supportive'
        elif any(word in user_message.lower() for word in ['vui', 'thích', 'tuyệt']):
            self.emotional_context['current_mood'] = 'happy'
            self.emotional_context['conversation_tone'] = 'enthusiastic'
        elif any(word in user_message.lower() for word in ['tức giận', 'bực', 'khó chịu']):
            self.emotional_context['current_mood'] = 'frustrated'
            self.emotional_context['conversation_tone'] = 'calming'
        else:
            self.emotional_context['current_mood'] = 'neutral'
            self.emotional_context['conversation_tone'] = 'friendly'

    def get_conversation_memory(self, user_id):
        """Lấy bộ nhớ cuộc trò chuyện"""
        return self.conversation_memory.get(user_id, [])

    def add_to_memory(self, user_id, message, response):
        """Thêm vào bộ nhớ cuộc trò chuyện"""
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = []
        
        self.conversation_memory[user_id].append({
            'timestamp': datetime.now().isoformat(),
            'user_message': message,
            'ai_response': response
        })
        
        # Giữ chỉ 10 tin nhắn gần nhất
        if len(self.conversation_memory[user_id]) > 10:
            self.conversation_memory[user_id] = self.conversation_memory[user_id][-10:]

    def extract_major(self, question):
        """Trích xuất tên ngành từ câu hỏi - MỞ RỘNG CỰC LỚN"""
        majors = {
            # Kiến trúc - Xây dựng (đặt đầu tiên để tránh conflict)
            'architecture': 'nganh_kien_truc',
            'kiến trúc': 'nganh_kien_truc',
            'xây dựng': 'nganh_kien_truc',
            'construction': 'nganh_kien_truc',
            'civil engineering': 'nganh_kien_truc',
            'kỹ thuật dân dụng': 'nganh_kien_truc',
            'thiết kế': 'nganh_kien_truc',
            'design': 'nganh_kien_truc',
            'quy hoạch': 'nganh_kien_truc',
            'urban planning': 'nganh_kien_truc',
            
            # Công nghệ thông tin
            'cntt': 'nganh_cntt',
            'công nghệ thông tin': 'nganh_cntt',
            'it': 'nganh_cntt',
            'computer science': 'nganh_cntt',
            'khoa học máy tính': 'nganh_cntt',
            'tin học': 'nganh_cntt',
            'lập trình': 'nganh_cntt',
            'software': 'nganh_cntt',
            'tech': 'nganh_cntt',
            'digital': 'nganh_cntt',
            'máy tính': 'nganh_cntt',
            
            # Kinh tế
            'kinh tế': 'nganh_kinh_te',
            'business': 'nganh_kinh_te',
            'economics': 'nganh_kinh_te',
            'commerce': 'nganh_kinh_te',
            'tài chính': 'nganh_kinh_te',
            'finance': 'nganh_kinh_te',
            'marketing': 'nganh_kinh_te',
            'quản trị': 'nganh_kinh_te',
            'management': 'nganh_kinh_te',
            'thương mại': 'nganh_kinh_te',
            'trade': 'nganh_kinh_te',
            'doanh nghiệp': 'nganh_kinh_te',
            'enterprise': 'nganh_kinh_te',
            
            # Y Dược
            'y dược': 'nganh_y_duoc',
            'y': 'nganh_y_duoc',
            'dược': 'nganh_y_duoc',
            'medicine': 'nganh_y_duoc',
            'pharmacy': 'nganh_y_duoc',
            'y khoa': 'nganh_y_duoc',
            'healthcare': 'nganh_y_duoc',
            
            # Luật
            'luật': 'nganh_luat',
            'law': 'nganh_luat',
            'legal': 'nganh_luat',
            'pháp luật': 'nganh_luat',
            'tư pháp': 'nganh_luat',
            
            # Sư phạm
            'sư phạm': 'nganh_su_pham',
            'giáo dục': 'nganh_su_pham',
            'education': 'nganh_su_pham',
            'teaching': 'nganh_su_pham',
            'pedagogy': 'nganh_su_pham',
            
            # Du lịch - Khách sạn
            'du lịch': 'nganh_du_lich',
            'tourism': 'nganh_du_lich',
            'travel': 'nganh_du_lich',
            'khách sạn': 'nganh_du_lich',
            'hotel': 'nganh_du_lich',
            'hospitality': 'nganh_du_lich',
            'dịch vụ': 'nganh_du_lich',
            'service': 'nganh_du_lich',
            'hướng dẫn viên': 'nganh_du_lich',
            'tour guide': 'nganh_du_lich',
            
            # Ngôn ngữ - Ngoại ngữ
            'ngôn ngữ': 'nganh_ngon_ngu',
            'language': 'nganh_ngon_ngu',
            'ngoại ngữ': 'nganh_ngon_ngu',
            'foreign language': 'nganh_ngon_ngu',
            'tiếng anh': 'nganh_ngon_ngu',
            'english': 'nganh_ngon_ngu',
            'tiếng trung': 'nganh_ngon_ngu',
            'chinese': 'nganh_ngon_ngu',
            'tiếng nhật': 'nganh_ngon_ngu',
            'japanese': 'nganh_ngon_ngu',
            'tiếng hàn': 'nganh_ngon_ngu',
            'korean': 'nganh_ngon_ngu',
            'dịch thuật': 'nganh_ngon_ngu',
            'translation': 'nganh_ngon_ngu',
            'biên dịch': 'nganh_ngon_ngu',
            'interpreting': 'nganh_ngon_ngu',
            

            
            # Kỹ thuật (không phải kiến trúc)
            'kỹ thuật cơ khí': 'nganh_ki_thuat',
            'mechanical engineering': 'nganh_ki_thuat',
            'cơ khí': 'nganh_ki_thuat',
            'mechanical': 'nganh_ki_thuat',
            'điện': 'nganh_ki_thuat',
            'electrical': 'nganh_ki_thuat',
            'điện tử': 'nganh_ki_thuat',
            'electronics': 'nganh_ki_thuat',
            
            # Mỹ thuật
            'mỹ thuật': 'nganh_my_thuat',
            'art': 'nganh_my_thuat',
            'nghệ thuật': 'nganh_my_thuat',
            'arts': 'nganh_my_thuat',
            'hội họa': 'nganh_my_thuat',
            'painting': 'nganh_my_thuat',
            'điêu khắc': 'nganh_my_thuat',
            'sculpture': 'nganh_my_thuat',
            
            # Truyền thông
            'truyền thông': 'nganh_truyen_thong',
            'báo chí': 'nganh_truyen_thong',
            'media': 'nganh_truyen_thong',
            'journalism': 'nganh_truyen_thong',
            'quảng cáo': 'nganh_truyen_thong',
            'advertising': 'nganh_truyen_thong',
            'pr': 'nganh_truyen_thong',
            'public relations': 'nganh_truyen_thong',
            
            # Nông nghiệp
            'nông nghiệp': 'nganh_nong_nghiep',
            'agriculture': 'nganh_nong_nghiep',
            'thủy sản': 'nganh_nong_nghiep',
            'fisheries': 'nganh_nong_nghiep',
            'aquaculture': 'nganh_nong_nghiep',
            'nuôi trồng': 'nganh_nong_nghiep',
            'farming': 'nganh_nong_nghiep',
            'chăn nuôi': 'nganh_nong_nghiep',
            'trồng trọt': 'nganh_nong_nghiep',
            'crop production': 'nganh_nong_nghiep',
            'animal husbandry': 'nganh_nong_nghiep'
        }
        
        question_lower = question.lower()
        for key, value in majors.items():
            if key in question_lower:
                return value
        
        return None

    def extract_personal_info(self, message):
        """Trích xuất thông tin cá nhân từ tin nhắn"""
        info = {}
        
        # Trích xuất tên
        name_patterns = [
            r'tôi tên là (\w+)',
            r'tên tôi là (\w+)',
            r'tôi là (\w+)',
            r'(\w+) là tên tôi'
        ]
        for pattern in name_patterns:
            match = re.search(pattern, message.lower())
            if match:
                info['name'] = match.group(1).title()
                break
        
        # Trích xuất lớp
        grade_patterns = [
            r'lớp (\d+)',
            r'(\d+)',
            r'tốt nghiệp'
        ]
        for pattern in grade_patterns:
            match = re.search(pattern, message.lower())
            if match:
                if 'tốt nghiệp' in message.lower():
                    info['grade'] = 'Đã tốt nghiệp'
                else:
                    info['grade'] = f'Lớp {match.group(1)}'
                break
        
        # Trích xuất môn học yêu thích
        subjects = ['toán', 'văn', 'anh', 'lý', 'hóa', 'sinh', 'sử', 'địa', 'tin học']
        for subject in subjects:
            if subject in message.lower():
                if 'favorite_subjects' not in info:
                    info['favorite_subjects'] = []
                info['favorite_subjects'].append(subject.title())
        
        # Trích xuất tính cách
        personality_traits = ['hướng nội', 'hướng ngoại', 'kiên nhẫn', 'năng động', 'sáng tạo', 'tỉ mỉ', 'giao tiếp tốt']
        for trait in personality_traits:
            if trait in message.lower():
                if 'personality' not in info:
                    info['personality'] = []
                info['personality'].append(trait.title())
        
        return info

    def analyze_question(self, question, user_id=None):
        """Phân tích câu hỏi để xác định ý định và thu thập thông tin - Nâng cao"""
        question_lower = question.lower()
        
        # Cập nhật ngữ cảnh cảm xúc
        self.update_emotional_context(question)
        
        # Kiểm tra yêu cầu liên hệ chuyên gia
        for pattern in self.patterns['contact_expert']:
            if re.search(pattern, question_lower):
                return ('contact_expert', user_id)
        
        # Kiểm tra hỗ trợ cảm xúc
        for pattern in self.patterns['emotional_support']:
            if re.search(pattern, question_lower):
                return 'emotional_support'
        
        # Kiểm tra xu hướng và thông tin mới
        for pattern in self.patterns['trends_info']:
            if re.search(pattern, question_lower):
                return 'trends_info'
        
        # Kiểm tra tư vấn học tập chung
        for pattern in self.patterns['study_advice']:
            if re.search(pattern, question_lower):
                return 'study_advice'
        
        # Kiểm tra thông tin cá nhân
        personal_info = self.extract_personal_info(question)
        if personal_info and user_id:
            self.update_user_profile(user_id, personal_info)
        
        # Kiểm tra greeting
        for pattern in self.patterns['greeting']:
            if re.search(pattern, question_lower):
                return 'greeting'
        
        # Kiểm tra kỹ năng (ưu tiên cao hơn)
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

    def update_user_profile(self, user_id, info):
        """Cập nhật thông tin người dùng"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {}
        
        self.user_profiles[user_id].update(info)

    def get_user_profile(self, user_id):
        """Lấy thông tin người dùng"""
        return self.user_profiles.get(user_id, {})

    def get_major_info(self, major_key):
        """Lấy thông tin chi tiết về ngành"""
        if major_key in self.knowledge_base:
            return self.knowledge_base[major_key]
        return None

    def generate_personalized_response(self, user_id, question):
        """Tạo câu trả lời cá nhân hóa dựa trên thông tin người dùng"""
        profile = self.get_user_profile(user_id)
        
        if not profile:
            return None
        
        # Tạo câu trả lời dựa trên thông tin đã thu thập
        response_parts = []
        
        if 'name' in profile:
            response_parts.append(f"Chào {profile['name']}! ")
        
        if 'favorite_subjects' in profile:
            subjects = profile['favorite_subjects']
            if 'Toán' in subjects or 'Tin học' in subjects:
                response_parts.append("Tôi thấy bạn thích Toán và Tin học, điều này rất phù hợp với ngành **Công nghệ thông tin** hoặc **Kinh tế**. ")
            elif 'Văn' in subjects or 'Anh' in subjects:
                response_parts.append("Với sở thích Văn và Anh, bạn có thể phù hợp với ngành **Kinh tế**, **Luật** hoặc **Sư phạm**. ")
            elif 'Sinh' in subjects or 'Hóa' in subjects:
                response_parts.append("Sở thích Sinh và Hóa cho thấy bạn có thể phù hợp với ngành **Y Dược**. ")
        
        if 'personality' in profile:
            personality = profile['personality']
            if 'Kiên nhẫn' in personality or 'Tỉ mỉ' in personality:
                response_parts.append("Tính cách kiên nhẫn và tỉ mỉ của bạn rất phù hợp với ngành **Y Dược** hoặc **Sư phạm**. ")
            elif 'Năng động' in personality or 'Giao tiếp tốt' in personality:
                response_parts.append("Tính cách năng động và giao tiếp tốt sẽ giúp bạn thành công trong ngành **Kinh tế** hoặc **Sư phạm**. ")
        
        if response_parts:
            return ''.join(response_parts) + "\n\nBạn có muốn tôi tư vấn chi tiết về ngành nào không?"
        
        return None

    def start_info_collection(self, user_id):
        """Bắt đầu thu thập thông tin người dùng"""
        self.conversation_flow['collecting_info'] = True
        self.conversation_flow['current_step'] = 0
        self.conversation_flow['collected_data'] = {}
        
        return self.info_questions[0]['question']

    def continue_info_collection(self, user_id, answer):
        """Tiếp tục thu thập thông tin"""
        current_step = self.conversation_flow['current_step']
        current_question = self.info_questions[current_step]
        
        # Lưu câu trả lời
        self.conversation_flow['collected_data'][current_question['field']] = answer
        
        # Chuyển sang câu hỏi tiếp theo
        next_step = current_step + 1
        
        if next_step < len(self.info_questions):
            self.conversation_flow['current_step'] = next_step
            return self.info_questions[next_step]['question']
        else:
            # Hoàn thành thu thập thông tin
            self.conversation_flow['collecting_info'] = False
            self.update_user_profile(user_id, self.conversation_flow['collected_data'])
            
            return self.generate_final_recommendation(user_id)

    def generate_final_recommendation(self, user_id):
        """Tạo khuyến nghị cuối cùng dựa trên thông tin thu thập"""
        profile = self.get_user_profile(user_id)
        
        recommendations = []
        
        if 'favorite_subjects' in profile:
            subjects = profile['favorite_subjects']
            if any(subject in subjects for subject in ['Toán', 'Tin học']):
                recommendations.append('**Công nghệ thông tin**')
            if any(subject in subjects for subject in ['Văn', 'Anh']):
                recommendations.append('**Kinh tế**')
            if any(subject in subjects for subject in ['Sinh', 'Hóa']):
                recommendations.append('**Y Dược**')
        
        if recommendations:
            return f"""Cảm ơn bạn đã chia sẻ thông tin! Dựa trên sở thích và tính cách của bạn, tôi khuyến nghị bạn nên xem xét các ngành:

{', '.join(recommendations)}

Bạn có muốn tôi tư vấn chi tiết về ngành nào không? Hoặc bạn có muốn **liên hệ chuyên gia** để được tư vấn trực tiếp không?"""
        
        return """Cảm ơn bạn đã chia sẻ thông tin! Tôi có thể tư vấn chi tiết về các ngành học phù hợp với bạn.

Bạn có muốn tìm hiểu về ngành nào cụ thể không? Hoặc bạn có muốn **liên hệ chuyên gia** để được tư vấn trực tiếp không?"""

    def format_response_old(self, response_type, data=None, user_id=None):
        """Định dạng câu trả lời (cũ)"""
        if response_type == 'greeting':
            return """Xin chào! Mình là Trợ lý AI thông minh của timtruonghoc.vn, chuyên tư vấn về định hướng nghề nghiệp và tuyển sinh đại học. 😊

Mình có thể giúp bạn tìm hiểu về:
**🎓 Các ngành học hot nhất hiện nay**
**🏫 Trường đại học và điểm chuẩn**
**💰 Mức lương và cơ hội việc làm**
**💼 Kỹ năng cần thiết cho sinh viên**
**📈 Xu hướng ngành nghề 2024-2025**

Bạn muốn tìm hiểu về vấn đề gì nào? Mình sẵn sàng tư vấn chi tiết cho bạn! 🚀"""
        
        elif response_type == 'contact_expert':
            return """Tuyệt vời! Tôi sẽ giúp bạn liên hệ với chuyên gia tư vấn.

Để chuẩn bị thông tin cho chuyên gia, bạn có thể cho tôi biết:

**Tên của bạn:**
**Lớp hiện tại:**
**Môn học yêu thích:**
**Tính cách của bạn:**
**Môi trường làm việc mong muốn:**
**Mục tiêu nghề nghiệp:**

Sau khi thu thập thông tin, tôi sẽ tự động điền form đăng ký tư vấn cho bạn!"""
        
        elif response_type == 'major_info' and data:
            major_info = self.get_major_info(data)
            if major_info:
                return f"""**Thông tin ngành {major_info['name']}:**

**Mô tả:**
{major_info['description']}

**Cơ hội việc làm:**
{', '.join(major_info['careers'])}

**Mức lương:**
{major_info['salary_range']}

**Kỹ năng cần thiết:**
{', '.join(major_info['skills'])}

**Trường đào tạo:**
{', '.join(major_info['universities'])}

**Phù hợp với người:**
{', '.join(major_info['personality_traits'])}

Bạn có muốn tìm hiểu thêm về điểm nào cụ thể không?"""
        
        elif response_type == 'career_advice':
            return """**Tư vấn chọn ngành học:**

Để chọn ngành phù hợp, bạn cần xem xét:

**1. Sở thích và đam mê:**
Bạn thích làm việc với máy tính hay con người?
Bạn thích sáng tạo hay theo quy trình?
Bạn thích làm việc độc lập hay nhóm?

**2. Năng lực học tập:**
Điểm mạnh của bạn ở môn học nào?
Bạn có khả năng tư duy logic tốt không?
Bạn có kiên nhẫn và tỉ mỉ không?

**3. Mục tiêu nghề nghiệp:**
Bạn muốn làm việc ở đâu? (công ty, bệnh viện, trường học...)
Bạn muốn mức lương như thế nào?
Bạn có muốn đi du học không?

Hãy chia sẻ thêm về bản thân để tôi tư vấn cụ thể hơn!"""
        
        elif response_type == 'university_info':
            return """**Thông tin trường đại học:**

**Các trường top tại TP.HCM:**

**1. ĐH Bách khoa TP.HCM:**
Điểm chuẩn: 24-28 điểm
Thế mạnh: Kỹ thuật, CNTT
Học phí: 15-25 triệu/năm

**2. ĐH Kinh tế TP.HCM:**
Điểm chuẩn: 22-26 điểm  
Thế mạnh: Kinh tế, Tài chính
Học phí: 12-20 triệu/năm

**3. ĐH Y Dược TP.HCM:**
Điểm chuẩn: 26-30 điểm
Thế mạnh: Y khoa, Dược
Học phí: 20-30 triệu/năm

**4. ĐH Công nghệ Thông tin:**
Điểm chuẩn: 23-27 điểm
Thế mạnh: CNTT, AI
Học phí: 15-25 triệu/năm

Bạn quan tâm trường nào cụ thể?"""
        
        elif response_type == 'skills_required':
            return """**Kỹ năng cần thiết cho sinh viên:**

**Kỹ năng chung:**
**Giao tiếp:** Thuyết trình, đàm phán, làm việc nhóm
**Ngoại ngữ:** Tiếng Anh (tối thiểu B2)
**Tin học:** Word, Excel, PowerPoint, Internet
**Tư duy phản biện:** Phân tích, đánh giá vấn đề
**Sáng tạo:** Tìm giải pháp mới, đổi mới

**Kỹ năng chuyên môn:**
**CNTT:** Lập trình, cơ sở dữ liệu, mạng
**Kinh tế:** Phân tích tài chính, marketing, quản lý
**Y Dược:** Kiên nhẫn, tỉ mỉ, trách nhiệm cao
**Luật:** Ghi nhớ tốt, tư duy logic, công bằng
**Sư phạm:** Truyền đạt, kiên nhẫn, yêu trẻ

**Kỹ năng mềm quan trọng:**
Quản lý thời gian
Làm việc dưới áp lực
Học tập liên tục
Thích ứng với thay đổi

Bạn muốn phát triển kỹ năng nào?"""
        
        else:
            return """Tôi hiểu bạn đang tìm hiểu về tuyển sinh. Hãy để tôi tư vấn:

**Tôi có thể giúp bạn:**
Chọn ngành học phù hợp
Thông tin về các ngành nghề
Mức lương và cơ hội việc làm
Trường đại học và điểm chuẩn
Kỹ năng cần thiết

**Hãy hỏi cụ thể hơn, ví dụ:**
"Tư vấn ngành CNTT"
"Mức lương ngành Kinh tế"
"Trường nào đào tạo Y Dược"
"Kỹ năng cần thiết cho sinh viên"

Bạn muốn tìm hiểu về vấn đề gì?"""

    def generate_response(self, question, conversation_history=None, user_id=None):
        """Tạo câu trả lời thông minh - Phiên bản nâng cao"""
        # Cập nhật bộ nhớ cuộc trò chuyện
        if user_id:
            self.add_to_memory(user_id, question, "")
        
        # Kiểm tra nếu đang thu thập thông tin
        if self.conversation_flow['collecting_info'] and user_id:
            return self.continue_info_collection(user_id, question)
        
        # Phân tích câu hỏi
        analysis = self.analyze_question(question, user_id)
        
        # Xử lý yêu cầu liên hệ chuyên gia
        if isinstance(analysis, tuple) and analysis[0] == 'contact_expert':
            return self.start_info_collection(user_id)
        
        # Xử lý hỗ trợ cảm xúc
        if analysis == 'emotional_support':
            return self.format_response('emotional_support')
        
        # Xử lý thông tin xu hướng
        if analysis == 'trends_info':
            return self.format_response('trends_info')
        
        # Tạo câu trả lời cá nhân hóa nếu có thông tin người dùng
        if user_id:
            personalized = self.generate_personalized_response(user_id, question)
            if personalized:
                return personalized
        
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
        elif analysis == 'study_advice':
            response = self.format_response('study_advice')
        else:
            response = self.format_response('general')
        
        # Thêm context từ lịch sử hội thoại và bộ nhớ
        if user_id:
            memory = self.get_conversation_memory(user_id)
            if memory and len(memory) > 1:
                # Kiểm tra xem có cần follow-up không
                last_user_msg = memory[-1].get('user_message', '').lower()
                if any(word in last_user_msg for word in ['cụ thể', 'chi tiết', 'thêm', 'nữa']):
                    response += "\n\n**Thông tin bổ sung:**\nBạn có thể hỏi thêm về:\n• Điểm chuẩn các năm\n• Cơ hội thực tập\n• Chương trình đào tạo\n• Học bổng và hỗ trợ\n• Xu hướng ngành nghề 2024-2025"
        
        # Thêm gợi ý tiếp theo dựa trên ngữ cảnh cảm xúc
        if self.emotional_context['current_mood'] == 'worried':
            response += "\n\n**Đừng lo lắng!** Tôi sẽ giúp bạn tìm hiểu kỹ hơn. Bạn có thể hỏi bất cứ điều gì, tôi sẽ trả lời chi tiết nhất có thể."
        elif self.emotional_context['current_mood'] == 'happy':
            response += "\n\n**Tuyệt vời!** Tôi thấy bạn rất hào hứng. Hãy tiếp tục khám phá để tìm ra con đường phù hợp nhất nhé!"
        
        # Lưu dữ liệu học tập
        self.learning_data['common_questions'].append({
            'question': question,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
        # Cập nhật bộ nhớ với response
        if user_id:
            self.update_memory_response(user_id, response)
        
        return response

    def update_memory_response(self, user_id, response):
        """Cập nhật response vào bộ nhớ"""
        if user_id in self.conversation_memory and self.conversation_memory[user_id]:
            self.conversation_memory[user_id][-1]['ai_response'] = response

    def format_response(self, response_type, data=None, user_id=None):
        """Format response với ngữ cảnh cảm xúc"""
        # Thêm tone phù hợp với ngữ cảnh cảm xúc
        tone_prefix = ""
        if self.emotional_context['conversation_tone'] == 'supportive':
            tone_prefix = "Tôi hiểu cảm giác của bạn. "
        elif self.emotional_context['conversation_tone'] == 'enthusiastic':
            tone_prefix = "Thật tuyệt! "
        elif self.emotional_context['conversation_tone'] == 'calming':
            tone_prefix = "Bình tĩnh nhé, "
        
        if response_type == 'greeting':
            greetings = [
                f"{tone_prefix}Xin chào! Mình là Trợ lý AI của timtruonghoc.vn, rất vui được gặp bạn! 😊",
                f"{tone_prefix}Chào bạn! Mình là AI tư vấn tuyển sinh, sẵn sàng hỗ trợ bạn tìm hiểu về các ngành nghề! 🌟",
                f"{tone_prefix}Hello! Mình là trợ lý thông minh, chuyên tư vấn về định hướng nghề nghiệp. Bạn cần gì mình giúp nhé! 💪"
            ]
            return random.choice(greetings)
        
        elif response_type == 'emotional_support':
            support_messages = [
                "Tôi hiểu bạn đang cảm thấy lo lắng. Đây là giai đoạn quan trọng và việc băn khoăn là hoàn toàn bình thường. Hãy để tôi giúp bạn tìm hiểu từng bước một cách rõ ràng nhé! 💙",
                "Đừng lo lắng! Mỗi người đều có con đường riêng và tôi sẽ giúp bạn khám phá những lựa chọn phù hợp nhất. Hãy bắt đầu với những gì bạn thích! 🌈",
                "Tôi thấy bạn đang gặp khó khăn. Hãy chia sẻ thêm với tôi, tôi sẽ lắng nghe và đưa ra lời khuyên hữu ích nhất có thể! 🤗"
            ]
            return random.choice(support_messages)
        
        elif response_type == 'trends_info':
            return f"{tone_prefix}**Xu hướng ngành nghề 2024-2025:**\n\n**🔥 Ngành HOT nhất:**\n• **AI/Machine Learning:** Lương cao, cơ hội rộng mở\n• **Digital Marketing:** Nhu cầu tăng mạnh\n• **Cybersecurity:** Bảo mật thông tin\n• **E-commerce:** Thương mại điện tử\n• **Healthcare Technology:** Công nghệ y tế\n\n**📈 Xu hướng mới:**\n• Remote Work (Làm việc từ xa)\n• Green Jobs (Công việc xanh)\n• Data Science (Khoa học dữ liệu)\n• Blockchain Technology\n• Renewable Energy\n\nBạn quan tâm ngành nào trong số này?"
        
        elif response_type == 'major_info' and data:
            major = self.knowledge_base.get(data, {})
            if not major:
                return "Xin lỗi, tôi chưa có thông tin về ngành này. Bạn có thể hỏi về các ngành: CNTT, Kinh tế, Y Dược, Luật, Sư phạm, Du lịch, Ngôn ngữ."
            
            response = f"{tone_prefix}**Thông tin ngành {major['name']}:**\n\n"
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
            for trait in major['personality_traits'][:3]:
                response += f"• {trait}\n"
            
            response += f"\nBạn có muốn tìm hiểu thêm về điểm chuẩn hoặc cơ hội thực tập không?"
            
            return response
        
        elif response_type == 'career_advice':
            return f"{tone_prefix}**Tư vấn chọn ngành học:**\n\nĐể chọn ngành phù hợp, bạn cần xem xét:\n\n**1. Sở thích và đam mê:**\n• Bạn thích làm việc với máy tính hay con người?\n• Bạn thích sáng tạo hay theo quy trình?\n• Bạn thích làm việc độc lập hay nhóm?\n\n**2. Năng lực học tập:**\n• Điểm mạnh của bạn ở môn học nào?\n• Bạn có khả năng tư duy logic tốt không?\n• Bạn có kiên nhẫn và tỉ mỉ không?\n\n**3. Mục tiêu nghề nghiệp:**\n• Bạn muốn làm việc ở đâu? (công ty, bệnh viện, trường học...)\n• Bạn muốn mức lương như thế nào?\n• Bạn có muốn đi du học không?\n\nBạn có thể chia sẻ thêm về sở thích của mình để tôi tư vấn cụ thể hơn!"
        
        elif response_type == 'university_info':
            return f"{tone_prefix}**Thông tin trường đại học:**\n\n**🏫 Các trường đại học hàng đầu:**\n• ĐH Bách khoa TP.HCM\n• ĐH Kinh tế TP.HCM\n• ĐH Y Dược TP.HCM\n• ĐH Luật TP.HCM\n• ĐH Sư phạm TP.HCM\n\n**📊 Điểm chuẩn 2023:**\n• CNTT: 25-28 điểm\n• Kinh tế: 24-27 điểm\n• Y Dược: 26-29 điểm\n• Luật: 25-28 điểm\n• Sư phạm: 22-25 điểm\n\n**💰 Học phí:**\n• Công lập: 15-25 triệu/năm\n• Tư thục: 30-60 triệu/năm\n\nBạn quan tâm trường nào cụ thể?"
        
        elif response_type == 'skills_required':
            return f"{tone_prefix}**Kỹ năng cần thiết cho sinh viên:**\n\n**🎯 Kỹ năng cứng:**\n• Ngoại ngữ (Tiếng Anh)\n• Tin học văn phòng\n• Kỹ năng chuyên môn\n• Phân tích dữ liệu\n\n**🤝 Kỹ năng mềm:**\n• Giao tiếp\n• Làm việc nhóm\n• Quản lý thời gian\n• Tư duy phản biện\n• Sáng tạo\n\n**💪 Kỹ năng bổ sung:**\n• Lãnh đạo\n• Thuyết trình\n• Đàm phán\n• Giải quyết vấn đề\n• Thích ứng với thay đổi\n\nBạn muốn phát triển kỹ năng nào?"
        
        elif response_type == 'study_advice':
            return f"{tone_prefix}Bạn muốn đi học là một bước đi tuyệt vời! Để tôi có thể giúp bạn tốt hơn, bạn có thể cho tôi biết thêm thông tin như:\n\n**Bạn muốn học gì?** (Ví dụ: ngành nghề cụ thể, lĩnh vực bạn quan tâm, cấp học: THPT, Cao đẳng, Đại học,…)\n**Bạn đang ở cấp học nào?**\n**Bạn có sở thích, năng khiếu gì?**\n**Bạn muốn làm gì sau khi tốt nghiệp?** (Mục tiêu nghề nghiệp)\n\nCàng nhiều thông tin bạn cung cấp, tôi càng có thể tư vấn chính xác và hiệu quả cho bạn.\n"
        
        elif response_type == 'general':
            return f"{tone_prefix}Tôi hiểu bạn đang tìm hiểu về tuyển sinh. Hãy để tôi tư vấn:\n\n**Tôi có thể giúp bạn:**\n• Chọn ngành học phù hợp\n• Thông tin về các ngành nghề\n• Mức lương và cơ hội việc làm\n• Trường đại học và điểm chuẩn\n• Kỹ năng cần thiết\n\n**Hãy hỏi cụ thể hơn, ví dụ:**\n• \"Tư vấn ngành CNTT\"\n• \"Mức lương ngành Kinh tế\"\n• \"Trường nào đào tạo Y Dược\"\n• \"Kỹ năng cần thiết cho sinh viên\"\n\nBạn muốn tìm hiểu về vấn đề gì?"

    def get_user_form_data(self, user_id):
        """Lấy dữ liệu form đã thu thập cho người dùng"""
        profile = self.get_user_profile(user_id)
        if not profile:
            return None
        
        # Chuyển đổi dữ liệu profile thành form data
        form_data = {
            'name': profile.get('name', ''),
            'grade': profile.get('grade', ''),
            'favorite_subjects': ', '.join(profile.get('favorite_subjects', [])),
            'personality': ', '.join(profile.get('personality', [])),
            'work_preference': profile.get('work_preference', ''),
            'career_goals': profile.get('career_goals', ''),
            'consultation_type': 'Tư vấn hướng nghiệp',
            'message': f"Được tư vấn bởi AI Advisor. Sở thích: {profile.get('favorite_subjects', [])}. Tính cách: {profile.get('personality', [])}"
        }
        
        return form_data

# Tạo instance của AI
ai_advisor = AdmissionAI() 