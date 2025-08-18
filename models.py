from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date
from ckeditor.fields import RichTextField
from django.contrib.auth.models import UserManager as BaseUserManager

class CustomUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active_user', True) # Đảm bảo superuser active
        extra_fields.setdefault('role', 'admin') # Đặt vai trò là admin
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)



# ---
## Models Người Dùng (User)
# ---
class User(AbstractUser):
    objects = CustomUserManager()
    ROLE_CHOICES = [
        ('admin', 'Quản trị viên'),
        ('staff', 'Nhân viên'),
        ('partner', 'Đối tác'),
        ('regular_user', 'Người dùng thông thường'),
    ]
    USER_LEVEL_CHOICES = [
        ('primary', 'Tiểu học'),
        ('secondary', 'Trung học cơ sở'),
        ('highschool', 'Trung học phổ thông'),
        ('university', 'Đại học'),
        ('postgraduate', 'Sau đại học'),
        ('other', 'Khác'),
    ]
    SEX_CHOICES = [
        ('male', 'Nam'),
        ('female', 'Nữ'),
        ('other', 'Khác'),
    ]

    email = models.EmailField(unique=True, verbose_name="Email (Tên đăng nhập)")
    first_name = models.CharField(max_length=150,blank=True, null=True, verbose_name="Họ")
    last_name = models.CharField(max_length=150,blank=True, null=True, verbose_name="Tên")
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Ngày tháng năm sinh")
    living_place = models.CharField(max_length=255, blank=True, null=True, verbose_name="Nơi sống")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='regular_user', verbose_name="Vai trò")
    user_level = models.CharField(max_length=20, choices=USER_LEVEL_CHOICES, blank=True, null=True, verbose_name="Cấp học (Người dùng)")
    is_active_user = models.BooleanField(default=True, verbose_name="Trạng thái tài khoản")
    user_photo=models.CharField(max_length=255, blank=True, null=True, verbose_name="Ảnh đại diện")
    password= models.CharField(max_length=255, verbose_name="Mật khẩu")
    sex= models.CharField(max_length=255,choices=SEX_CHOICES, blank=True, null=True, verbose_name="Giới tính")
    # Thêm related_name để giải quyết xung đột
    groups = models.ManyToManyField('auth.Group',related_name='apptimtruonghoc_user_set', blank=True,help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',verbose_name='groups')
    user_permissions = models.ManyToManyField('auth.Permission',related_name='apptimtruonghoc_user_permissions_set', blank=True,help_text='Specific permissions for this user.',verbose_name='user permissions',)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'date_of_birth']

    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Người dùng"

    def __str__(self):
        return self.email


# ---
## Models Nhóm Lĩnh Vực
# ---
class FieldGroup(models.Model):
    field_id = models.CharField(max_length=255,blank=True, null=True, verbose_name="Mã lĩnh vực")
    name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Tên lĩnh vực")
    description = RichTextField(blank=True, null=True, verbose_name="Mô tả")
    cover= models.CharField(max_length=1000, blank=True, null=True, verbose_name="Ảnh bìa")

    class Meta:
        verbose_name = "Nhóm lĩnh vực"
        verbose_name_plural = "Các nhóm lĩnh vực"

    def __str__(self):
        return self.name


# ---
## Models Album
# ---
class Album(models.Model):
    name = models.CharField(max_length=255, verbose_name="Tên Album")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả Album")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name_plural = "Album ảnh"


    def __str__(self):
        return self.name

# ---
## Models Image
# ---
class Image(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='images', verbose_name="Album")
    image_file = models.CharField(max_length=500, verbose_name="Đường dẫn ảnh")
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name="Chú thích")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tải lên")

    class Meta:
        verbose_name = "Ảnh"
        verbose_name_plural = "Các Ảnh" # <-- This is the corrected line

    def __str__(self):
        return f"Ảnh của {self.album.name} - {self.caption or self.image_file.name}"





class ExpertApplication(models.Model):
    """Đơn đăng kí tư vấn form(Chuyên gia)"""
    full_name = models.CharField(max_length=255, verbose_name="Họ và tên")
    email = models.EmailField(verbose_name="Email",blank=True, null=True)
    phone = models.CharField(max_length=50, verbose_name="Số điện thoại")
    zalo_phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Số điện thoại Zalo")
    interested_school_type = models.CharField(max_length=100,null=True, verbose_name="Trường quan tâm")
    interested_major = models.CharField(max_length=255,null=True, verbose_name="Ngành của trường đã chọn")
    facebook_link = models.URLField(blank=True, null=True, verbose_name="Link Facebook")
    introduction = models.TextField(verbose_name="Giới thiệu bản thân và kinh nghiệm")
    status = models.CharField(max_length=30, default='pending', choices=[
        ('pending', 'Đang xét duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Từ chối')
    ], verbose_name="Trạng thái")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Đăng kí tư vấn từ form"
        verbose_name_plural = "Đăng kí tư vấn từ form"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', '-created_at']),
            models.Index(fields=['status', '-created_at'])
        ]

    def __str__(self):
        return f"{self.full_name} - {self.email} - {self.status}"


class ConsultationRequest(models.Model):
    """Yêu cầu tư vấn từ người dùng (thu thập bởi Trợ lý AI)"""
    full_name = models.CharField(max_length=255, verbose_name="Họ và tên")
    email = models.EmailField(verbose_name="Email",blank=True, null=True)
    phone = models.CharField(max_length=50, verbose_name="Số điện thoại")
    conversation_summary = models.TextField(blank=True, null=True, verbose_name="Tóm tắt cuộc trò chuyện")
    suggested_expert = models.ForeignKey('self', blank=True, null=True, on_delete=models.SET_NULL, verbose_name="Gợi ý tư vấn viên", related_name='+')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Đăng kí tư vấn AI"
        verbose_name_plural = "Đăng kí tư vấn AI"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', '-created_at'])
        ]

    def __str__(self):
        return f"{self.full_name} - {self.email}"



# ---
## Models School
# ---
class School(models.Model):
    SCHOOL_TYPE_CHOICES = [
        ('public', 'Công lập'),
        ('private', 'Ngoài công lập'),
        ('international', 'Quốc tế'),

    ]
    LEVEL_CHOICES = [
        ('college', 'Cao đẳng'),
        ('university', 'Đại học'),
        ('vocational', 'Trung cấp')
    ]
    TAGS_CHOICES = [
        ('outstanding', 'Nổi bật'),
        ('pro', 'Chuyên nghiệp'),
        ('new', 'Tin mới'),
        ('urgency', 'Tuyến sinh gấp'),
        ('none', 'Bình thường')
    ]

    name_en = models.CharField(max_length=255, verbose_name="Tên trường tiếng Anh")
    name_vn = models.CharField(max_length=255, verbose_name="Tên trường tiếng Việt")
    short_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Mã trường viết tắt")
    admission_code = models.CharField(max_length=50,blank=True, null=True, verbose_name="Mã trường tuyển sinh")
    logo = models.CharField(max_length=255,blank=True, null=True, verbose_name="Logo")
    cover_photo = models.CharField(max_length=255,blank=True, null=True, verbose_name="Ảnh bìa")
    established_year = models.IntegerField(blank=True, null=True,verbose_name="Năm thành lập")
    school_type = models.CharField(max_length=20, blank=True, null=True, default='public', choices=SCHOOL_TYPE_CHOICES, verbose_name="Loại trường")
    website_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="Đường dẫn website")
    quota_per_year = models.IntegerField(blank=True, null=True, verbose_name="Chỉ tiêu/năm")
    introduction = RichTextField(verbose_name="Giới thiệu trường", blank=True, null=True, )
    phone_number = models.CharField(max_length=100,blank=True, null=True, verbose_name="Số điện thoại hotline")
    email = models.EmailField( verbose_name="Email", blank=True, null=True)
    map_link = models.CharField(max_length=1500, blank=True, null=True, verbose_name="Link bản đồ")
    album = models.OneToOneField(Album, on_delete=models.SET_NULL, null=True, blank=True, related_name='school_linked_to_this_album', verbose_name="Album ảnh của trường")
    scholarships = RichTextField(blank=True, null=True, verbose_name="Học bổng")
    start = models.IntegerField(blank=True, null=True,verbose_name="Học phí tối thiểu")
    end = models.IntegerField(blank=True, null=True,verbose_name="Học phí tối đa")
    country = models.CharField(blank=True, null=True, max_length=100, verbose_name="Khu vực")
    address = RichTextField(blank=True, null=True, verbose_name="Địa chỉ các cơ sở của trường")
    registration= models.BooleanField(blank=True, null=True,verbose_name="Đã đăng ký quảng cáo", default=False)
    tag= models.CharField(max_length=500, blank=True, null=True, default='none', choices=TAGS_CHOICES, verbose_name="Danh mục")
    school_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, verbose_name="Loại trường (cấp học)")
    benchmark_min = models.IntegerField(blank=True, null=True, verbose_name="Điểm chuẩn tối thiểu của trường tại năm gần nhất")
    socialmedialink= RichTextField(blank=True, null=True, verbose_name="Đường dẫn các trang MXH")
    benchmark_max = models.IntegerField(blank=True, null=True, verbose_name="Điểm chuẩn tối đa của trường tại năm gần nhất")

    class Meta:
        verbose_name = "Trường học"
        verbose_name_plural = "Các trường học"

    def __str__(self):
        return self.name_vn



# ---
## Models Ngành riêng của từng trường
# ---
class Major(models.Model):
    STATUS_CHOICES = [
        ('active', 'Đang hoạt động'),
        ('inactive', 'Ngừng hoạt động'),
    ]
    TAG_CHOICES = [
        ('outstanding', 'Nổi bật'),
        ('pro', 'Chuyên nghiệp'),
        ('none', 'Bình thường'),
    ]

    major_id = models.CharField(max_length=100, verbose_name="Mã ngành")
    name = models.CharField(max_length=190, verbose_name="Tên ngành")
    description = RichTextField(blank=True, null=True, verbose_name="Mô tả ngành")
    entry_requirement= RichTextField( blank=True, null=True, verbose_name="Phương thức xét tuyển")
    min_tuition_fee_per_year= models.CharField(max_length=255,blank=True, null=True, verbose_name="Học phí tối thiểu ngành/năm")
    max_tuition_fee_per_year= models.CharField(max_length=255,blank=True, null=True, verbose_name="Học phí tối đa ngành/năm")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name="Trạng thái")
    tags = models.CharField(max_length=50, choices=TAG_CHOICES, blank=True, null=True, verbose_name="Tags")
    school= models.ForeignKey(School, on_delete=models.CASCADE, related_name='school_major', verbose_name="Thuộc trường")


    class Meta:
        verbose_name = "Ngành riêng của từng trường"
        verbose_name_plural = "Các ngành riêng cho từng trường"
        unique_together = ('name', 'major_id','school')

    def __str__(self):
        return self.name



# ---
## Models Điểm chuẩn theo từng ngành của từng trường
# ---
class AdmissionScore(models.Model):

    SCORE_TYPE = [
        ('THPT', 'Điểm thi THPTQG'),
        ('HB', 'Điểm xét tuyển học bạ'),
        ('DGNL', 'Điểm thi đánh giá năng lực'),
        ('Khác', 'Khác'),

    ]
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='admission_scores', verbose_name="Ngành")
    year = models.IntegerField(verbose_name="Năm tuyển sinh")
    score = models.FloatField(verbose_name="Điểm chuẩn")
    types = models.CharField(max_length=50, choices=SCORE_TYPE, default='THPT',verbose_name="Loại điểm")

    class Meta:
        verbose_name = "Điểm chuẩn theo ngành"
        verbose_name_plural = "Các điểm chuẩn theo ngành" # Corrected
        unique_together = ( 'major', 'year')

    def __str__(self):
        return f" {self.major.name} (self.types) - Năm {self.year}: {self.score}"



# ---
## Models Ngành Chung của tất cả trường học
# ---
class AllMajorOfAllSchool(models.Model):

    TAG_CHOICES = [
        ('hot', 'Ngành hot'),
        ('find', 'Ngành đang thiếu nhân lực'),
        ('grown', 'Ngành có phát triển'),
        ('push', 'Đẩy mạnh'),
        ('normal', 'Bình thường'),
    ]

    all_major_id = models.CharField(max_length=255, verbose_name="Mã ngành")
    name = models.TextField( verbose_name="Tên ngành")
    short_description= RichTextField(blank=True, null=True,verbose_name="Mô tả của ngành chung")
    training_duration = models.CharField(max_length=255,blank=True, null=True, verbose_name="Thời lượng đào tạo")
    job = RichTextField(blank=True, null=True,verbose_name="Việc làm sau khi học")
    suitable = RichTextField(blank=True, null=True, verbose_name="Tố chất phù hợp")
    program = RichTextField(blank=True, null=True, verbose_name="Chương trình học")
    salary = models.CharField(max_length=255,blank=True, null=True, verbose_name="Thu nhập trung bình")
    cover= models.CharField(max_length=1000, blank=True, null=True, verbose_name="Ảnh bìa")

    tuition_fee_per_year = models.CharField(blank=True, null=True, max_length=255, verbose_name="Khoảng học phí ngành/năm")
    field = models.ForeignKey(FieldGroup, on_delete=models.CASCADE, related_name='field_gr', verbose_name="Thuộc lĩnh vực")
    note = RichTextField(verbose_name="Ghi chú",blank=True, null=True)
    opportunities = models. IntegerField(blank=True, null=True,verbose_name="Cơ hội việc làm của ngành")
    tag = models.CharField(max_length=50, choices=TAG_CHOICES, default='normal',verbose_name="Loại ngành")

    class Meta:
        verbose_name = "Ngành"
        verbose_name_plural = "Các ngành"


    def __str__(self):
        return self.name



# ---
## Bảng con phân quyền
# ---
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='admin_profile')
    create = models.DateTimeField(auto_now=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Quản trị viên"
        verbose_name_plural = "Quản trị viên"

    def __str__(self):
        return f"Admin: {self.user.email} - Tài khoản mở :{self.create} "



class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='staff_profile')
    create = models.DateTimeField(auto_now=True, verbose_name="Ngày vào làm")

    class Meta:
        verbose_name = "Nhân viên"
        verbose_name_plural = "Nhân viên"

    def __str__(self):
        return f"Nhân viên: {self.user.email} - Ngày vào làm :{self.create}"



# ---
## Models Đối tác (Trường học)
# ---
class Partner(models.Model):
    school = models.OneToOneField(School, on_delete=models.CASCADE, related_name='partner_info', verbose_name="Trường đối tác")
    contact_person = models.CharField(max_length=255, null=True, blank=True, verbose_name="Số điện thoại liên hệ đối tác") # Removed related_name
    contract_start_date = models.DateField(blank=True, null=True, verbose_name="Ngày bắt đầu hợp đồng")
    contract_end_date = models.DateField(blank=True, null=True, verbose_name="Ngày kết thúc hợp đồng")
    contract_details = models.CharField(max_length=255,blank=True, null=True, verbose_name="Chi tiết hợp đồng")
    is_active_partner = models.BooleanField(default=True, verbose_name="Đối tác đang hoạt động")

    class Meta:
        verbose_name = "Đối tác (Trường học)"
        verbose_name_plural = "Các đối tác (Trường học)"

    def __str__(self):
        return f"Đối tác: {self.school.name_vn}"


# ---
## Models Chat System
# ---
class ChatRoom(models.Model):
    """
    Model cho phòng chat giữa hai người dùng
    """
    ROOM_TYPE_CHOICES = [
        ('private', 'Riêng tư'),
        ('group', 'Nhóm'),
    ]

    name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Tên phòng chat")
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='private', verbose_name="Loại phòng")
    participants = models.ManyToManyField(User, related_name='chat_rooms', verbose_name="Người tham gia")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    is_active = models.BooleanField(default=True, verbose_name="Trạng thái hoạt động")

    class Meta:
        verbose_name = "Phòng chat"
        verbose_name_plural = "Các phòng chat"
        ordering = ['-updated_at']

    def __str__(self):
        if self.name:
            return self.name
        elif self.room_type == 'private':
            participants = list(self.participants.all()[:2])
            if len(participants) == 2:
                return f"Chat giữa {participants[0].email} và {participants[1].email}"
            elif len(participants) == 1:
                return f"Chat của {participants[0].email}"
        return f"Phòng chat #{self.id}"

    def get_other_participant(self, user):
        """Lấy người tham gia khác trong chat riêng tư"""
        if self.room_type == 'private':
            return self.participants.exclude(id=user.id).first()
        return None

    def get_latest_message(self):
        """Lấy tin nhắn mới nhất"""
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """
    Model cho tin nhắn trong phòng chat
    """
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Văn bản'),
        ('image', 'Hình ảnh'),
        ('file', 'Tệp tin'),
        ('system', 'Hệ thống'),
    ]

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages', verbose_name="Phòng chat")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name="Người gửi")
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text', verbose_name="Loại tin nhắn")
    content = models.TextField(verbose_name="Nội dung")
    file_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="Đường dẫn file")
    is_read = models.BooleanField(default=False, verbose_name="Đã đọc")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày gửi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    is_deleted = models.BooleanField(default=False, verbose_name="Đã xóa")
    deleted_for_users = models.ManyToManyField(User, related_name='deleted_messages', blank=True, verbose_name="Đã xóa cho người dùng")
    # Tin nhắn được reply tới
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies', verbose_name="Trả lời tin nhắn")

    class Meta:
        verbose_name = "Tin nhắn"
        verbose_name_plural = "Các tin nhắn"
        ordering = ['created_at']

    def __str__(self):
        content_preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.sender.email}: {content_preview}"

    def mark_as_read(self):
        """Đánh dấu tin nhắn đã đọc"""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])

    def is_deleted_for_user(self, user):
        """Kiểm tra tin nhắn có bị xóa cho user cụ thể không"""
        return self.deleted_for_users.filter(id=user.id).exists()

    def delete_for_user(self, user):
        """Xóa tin nhắn cho user cụ thể (delete for me)"""
        if not self.is_deleted_for_user(user):
            self.deleted_for_users.add(user)

    def restore_for_user(self, user):
        """Khôi phục tin nhắn cho user cụ thể"""
        if self.is_deleted_for_user(user):
            self.deleted_for_users.remove(user)


class MessageReaction(models.Model):
    """Reaction cho tin nhắn"""
    REACTION_CHOICES = [
        ('like', 'Like'),
        ('love', 'Love'),
        ('haha', 'Haha'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions', verbose_name="Tin nhắn")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='message_reactions', verbose_name="Người dùng")
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES, verbose_name="Loại reaction")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")

    class Meta:
        verbose_name = "Reaction tin nhắn"
        verbose_name_plural = "Các reaction tin nhắn"
        unique_together = ('message', 'user')

    def __str__(self):
        return f"{self.user.email} {self.reaction} {self.message.id}"


class ChatUserStatus(models.Model):
    """
    Model cho trạng thái online/offline của user trong chat
    """
    STATUS_CHOICES = [
        ('online', 'Trực tuyến'),
        ('away', 'Vắng mặt'),
        ('busy', 'Bận'),
        ('offline', 'Ngoại tuyến'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='chat_status', verbose_name="Người dùng")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline', verbose_name="Trạng thái")
    last_seen = models.DateTimeField(auto_now=True, verbose_name="Lần cuối trực tuyến")
    is_typing_in_room = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, null=True, blank=True, related_name='typing_users', verbose_name="Đang nhập trong phòng")

    class Meta:
        verbose_name = "Trạng thái chat"
        verbose_name_plural = "Trạng thái chat của người dùng"

    def __str__(self):
        return f"{self.user.email} - {self.get_status_display()}"


# ---
## Models Tracking lượt xem trường và ngành
# ---
class SchoolViewCount(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='view_counts', verbose_name="Trường")
    view_count = models.IntegerField(default=0, verbose_name="Lượt xem")
    last_viewed = models.DateTimeField(auto_now=True, verbose_name="Lần xem cuối")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Lượt xem trường"
        verbose_name_plural = "Lượt xem các trường"
        unique_together = ('school',)

    def __str__(self):
        return f"{self.school.name_vn} - {self.view_count} lượt xem"

class MajorViewCount(models.Model):
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='view_counts', verbose_name="Ngành")
    view_count = models.IntegerField(default=0, verbose_name="Lượt xem")
    last_viewed = models.DateTimeField(auto_now=True, verbose_name="Lần xem cuối")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Lượt xem ngành"
        verbose_name_plural = "Lượt xem các ngành"
        unique_together = ('major',)

    def __str__(self):
        return f"{self.major.name} - {self.view_count} lượt xem"

class DailyViewStats(models.Model):
    date = models.DateField(unique=True, verbose_name="Ngày")
    total_school_views = models.IntegerField(default=0, verbose_name="Tổng lượt xem trường")
    total_major_views = models.IntegerField(default=0, verbose_name="Tổng lượt xem ngành")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Thống kê lượt xem theo ngày"
        verbose_name_plural = "Thống kê lượt xem theo ngày"
        ordering = ['-date']

    def __str__(self):
        return f"Thống kê ngày {self.date} - Trường: {self.total_school_views}, Ngành: {self.total_major_views}"


# ---
## Models Hệ Thống Quản Lý Thuật Ngữ Ngành Học
# ---

class TermCategory(models.Model):
    """Danh mục thuật ngữ (ví dụ: Công nghệ thông tin, Y học, Kinh tế...)"""
    name = models.CharField(max_length=255, verbose_name="Tên danh mục")
    name_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="Tên danh mục (Tiếng Anh)")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    icon = models.CharField(max_length=100, blank=True, null=True, verbose_name="Icon (FontAwesome)")
    color = models.CharField(max_length=7, default="#0a4191", verbose_name="Màu sắc")
    is_active = models.BooleanField(default=True, verbose_name="Trạng thái hoạt động")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Danh mục thuật ngữ"
        verbose_name_plural = "Danh mục thuật ngữ"
        ordering = ['name']

    def __str__(self):
        return self.name


class Term(models.Model):
    """Model chính cho thuật ngữ ngành học"""
    STATUS_CHOICES = [
        ('draft', 'Bản nháp'),
        ('pending', 'Chờ duyệt'),
        ('approved', 'Đã duyệt'),
        ('rejected', 'Từ chối'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', 'Cơ bản'),
        ('intermediate', 'Trung cấp'),
        ('advanced', 'Nâng cao'),
        ('expert', 'Chuyên sâu'),
    ]

    # Thông tin cơ bản
    term_vn = models.CharField(max_length=255, verbose_name="Thuật ngữ (Tiếng Việt)")
    term_en = models.CharField(max_length=255, verbose_name="Thuật ngữ (Tiếng Anh)")
    abbreviation = models.CharField(max_length=50, blank=True, null=True, verbose_name="Viết tắt")

    # Phân loại
    category = models.ForeignKey(TermCategory, on_delete=models.CASCADE, related_name='terms', verbose_name="Danh mục")
    field_group = models.ForeignKey(FieldGroup, on_delete=models.CASCADE, related_name='terms', verbose_name="Nhóm lĩnh vực")
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='terms', verbose_name="Ngành học")

    # Nội dung
    definition = models.TextField(verbose_name="Định nghĩa")
    definition_en = models.TextField(blank=True, null=True, verbose_name="Định nghĩa (Tiếng Anh)")
    context = models.TextField(blank=True, null=True, verbose_name="Ngữ cảnh sử dụng")
    examples = models.TextField(blank=True, null=True, verbose_name="Ví dụ")

    # Thông tin bổ sung
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate', verbose_name="Mức độ khó")
    tags = models.CharField(max_length=500, blank=True, null=True, verbose_name="Tags (phân cách bằng dấu phẩy)")
    pronunciation = models.CharField(max_length=255, blank=True, null=True, verbose_name="Phát âm")

    # Trạng thái và quản lý
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    is_featured = models.BooleanField(default=False, verbose_name="Thuật ngữ nổi bật")
    view_count = models.IntegerField(default=0, verbose_name="Lượt xem")
    search_count = models.IntegerField(default=0, verbose_name="Lượt tìm kiếm")

    # Người tạo và cập nhật
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_terms', verbose_name="Người tạo")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_terms', verbose_name="Người cập nhật")
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_terms', verbose_name="Người duyệt")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    approved_at = models.DateTimeField(blank=True, null=True, verbose_name="Ngày duyệt")

    class Meta:
        verbose_name = "Thuật ngữ"
        verbose_name_plural = "Thuật ngữ"
        ordering = ['-created_at']
        unique_together = [['term_vn', 'major'], ['term_en', 'major']]
        indexes = [
            models.Index(fields=['term_vn']),
            models.Index(fields=['term_en']),
            models.Index(fields=['abbreviation']),
            models.Index(fields=['status']),
            models.Index(fields=['is_featured']),
        ]

    def __str__(self):
        return f"{self.term_vn} ({self.term_en}) - {self.major.name}"

    def increment_view_count(self):
        """Tăng lượt xem"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

    def increment_search_count(self):
        """Tăng lượt tìm kiếm"""
        self.search_count += 1
        self.save(update_fields=['search_count'])


class TermSynonym(models.Model):
    """Từ đồng nghĩa của thuật ngữ"""
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='synonyms', verbose_name="Thuật ngữ chính")
    synonym_vn = models.CharField(max_length=255, verbose_name="Từ đồng nghĩa (Tiếng Việt)")
    synonym_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="Từ đồng nghĩa (Tiếng Anh)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Từ đồng nghĩa"
        verbose_name_plural = "Từ đồng nghĩa"
        unique_together = [['term', 'synonym_vn'], ['term', 'synonym_en']]

    def __str__(self):
        return f"{self.synonym_vn} -> {self.term.term_vn}"


class TermRelated(models.Model):
    """Thuật ngữ liên quan"""
    RELATIONSHIP_CHOICES = [
        ('synonym', 'Đồng nghĩa'),
        ('antonym', 'Trái nghĩa'),
        ('broader', 'Rộng hơn'),
        ('narrower', 'Hẹp hơn'),
        ('related', 'Liên quan'),
        ('prerequisite', 'Điều kiện tiên quyết'),
    ]

    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='related_terms', verbose_name="Thuật ngữ chính")
    related_term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='related_from', verbose_name="Thuật ngữ liên quan")
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES, verbose_name="Mối quan hệ")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả mối quan hệ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Thuật ngữ liên quan"
        verbose_name_plural = "Thuật ngữ liên quan"
        unique_together = ['term', 'related_term', 'relationship']

    def __str__(self):
        return f"{self.term.term_vn} -{self.get_relationship_display()}- {self.related_term.term_vn}"


class TermTranslation(models.Model):
    """Bản dịch thuật ngữ sang các ngôn ngữ khác"""
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'Français'),
        ('de', 'Deutsch'),
        ('ja', '日本語'),
        ('ko', '한국어'),
        ('zh', '中文'),
        ('es', 'Español'),
        ('ru', 'Русский'),
    ]

    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='translations', verbose_name="Thuật ngữ gốc")
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, verbose_name="Ngôn ngữ")
    translation = models.CharField(max_length=255, verbose_name="Bản dịch")
    pronunciation = models.CharField(max_length=255, blank=True, null=True, verbose_name="Phát âm")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")

    class Meta:
        verbose_name = "Bản dịch thuật ngữ"
        verbose_name_plural = "Bản dịch thuật ngữ"
        unique_together = ['term', 'language']

    def __str__(self):
        return f"{self.term.term_vn} -> {self.get_language_display()}: {self.translation}"


class UserTermCollection(models.Model):
    """Bộ sưu tập thuật ngữ của người dùng"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='term_collections', verbose_name="Người dùng")
    name = models.CharField(max_length=255, verbose_name="Tên bộ sưu tập")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    is_public = models.BooleanField(default=False, verbose_name="Công khai")
    color = models.CharField(max_length=7, default="#0a4191", verbose_name="Màu sắc")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")

    class Meta:
        verbose_name = "Bộ sưu tập thuật ngữ"
        verbose_name_plural = "Bộ sưu tập thuật ngữ"
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class UserTermCollectionItem(models.Model):
    """Thuật ngữ trong bộ sưu tập của người dùng"""
    collection = models.ForeignKey(UserTermCollection, on_delete=models.CASCADE, related_name='items', verbose_name="Bộ sưu tập")
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='user_collections', verbose_name="Thuật ngữ")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú cá nhân")
    is_favorite = models.BooleanField(default=False, verbose_name="Yêu thích")
    added_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày thêm")

    class Meta:
        verbose_name = "Thuật ngữ trong bộ sưu tập"
        verbose_name_plural = "Thuật ngữ trong bộ sưu tập"
        unique_together = ['collection', 'term']

    def __str__(self):
        return f"{self.collection.name} - {self.term.term_vn}"


class TermContribution(models.Model):
    """Đóng góp thuật ngữ từ người dùng"""
    CONTRIBUTION_TYPE_CHOICES = [
        ('new_term', 'Thuật ngữ mới'),
        ('edit_definition', 'Chỉnh sửa định nghĩa'),
        ('add_example', 'Thêm ví dụ'),
        ('add_translation', 'Thêm bản dịch'),
        ('report_error', 'Báo cáo lỗi'),
        ('suggestion', 'Đề xuất cải thiện'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('reviewing', 'Đang xem xét'),
        ('approved', 'Đã chấp nhận'),
        ('rejected', 'Từ chối'),
        ('implemented', 'Đã triển khai'),
    ]

    contributor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='term_contributions', verbose_name="Người đóng góp")
    contribution_type = models.CharField(max_length=20, choices=CONTRIBUTION_TYPE_CHOICES, verbose_name="Loại đóng góp")
    term = models.ForeignKey(Term, on_delete=models.CASCADE, null=True, blank=True, related_name='contributions', verbose_name="Thuật ngữ liên quan")

    # Nội dung đóng góp
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    content = models.TextField(verbose_name="Nội dung")
    suggested_term_vn = models.CharField(max_length=255, blank=True, null=True, verbose_name="Thuật ngữ đề xuất (VN)")
    suggested_term_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="Thuật ngữ đề xuất (EN)")
    suggested_definition = models.TextField(blank=True, null=True, verbose_name="Định nghĩa đề xuất")

    # Trạng thái và xử lý
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Trạng thái")
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_contributions', verbose_name="Người xem xét")
    review_notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú xem xét")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đóng góp")
    reviewed_at = models.DateTimeField(blank=True, null=True, verbose_name="Ngày xem xét")

    class Meta:
        verbose_name = "Đóng góp thuật ngữ"
        verbose_name_plural = "Đóng góp thuật ngữ"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.contributor.email} - {self.get_contribution_type_display()} - {self.title}"


class TermSearchHistory(models.Model):
    """Lịch sử tìm kiếm thuật ngữ"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='term_search_history', verbose_name="Người dùng")
    search_query = models.CharField(max_length=255, verbose_name="Từ khóa tìm kiếm")
    results_count = models.IntegerField(default=0, verbose_name="Số kết quả")
    clicked_term = models.ForeignKey(Term, on_delete=models.SET_NULL, null=True, blank=True, related_name='search_clicks', verbose_name="Thuật ngữ được click")
    search_filters = models.JSONField(blank=True, null=True, verbose_name="Bộ lọc tìm kiếm")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tìm kiếm")

    class Meta:
        verbose_name = "Lịch sử tìm kiếm"
        verbose_name_plural = "Lịch sử tìm kiếm"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['search_query']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.search_query}"


class TermViewHistory(models.Model):
    """Lịch sử xem thuật ngữ"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='term_view_history', verbose_name="Người dùng")
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='view_history', verbose_name="Thuật ngữ")
    view_duration = models.IntegerField(default=0, verbose_name="Thời gian xem (giây)")
    source = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nguồn (search, collection, etc.)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian xem")

    class Meta:
        verbose_name = "Lịch sử xem thuật ngữ"
        verbose_name_plural = "Lịch sử xem thuật ngữ"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['term', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.term.term_vn}"


class TermRating(models.Model):
    """Đánh giá thuật ngữ"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='term_ratings', verbose_name="Người dùng")
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='ratings', verbose_name="Thuật ngữ")
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], verbose_name="Điểm đánh giá")
    comment = models.TextField(blank=True, null=True, verbose_name="Nhận xét")
    is_helpful = models.BooleanField(default=True, verbose_name="Hữu ích")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đánh giá")

    class Meta:
        verbose_name = "Đánh giá thuật ngữ"
        verbose_name_plural = "Đánh giá thuật ngữ"
        unique_together = ['user', 'term']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.term.term_vn} - {self.rating}/5"



