from rest_framework import serializers
from .models import *
import os
from .utils import register_social_user, get_tokens_for_user
from .google_social_auth import Google, GOOGLE_CLIENT_ID
import logging
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

logger = logging.getLogger(__name__)



class GoogleSocialAuthSerializer(serializers.Serializer):
    auth_token = serializers.CharField()

    def validate(self, attrs):
        """
        Override validate method to process auth_token and return user data directly
        """
        auth_token = attrs.get('auth_token')
        
        # Call the auth_token validation logic
        return self.validate_auth_token(auth_token)

    def validate_auth_token(self, auth_token):
        user_data = None # Khởi tạo biến để tránh lỗi

        try:
            print(f"Starting Google token validation...")
            print(f"Auth token received: {auth_token[:50]}...")
            
            # 1. Xác minh token với Google
            # Hàm này sẽ ném ra lỗi nếu token không hợp lệ/hết hạn.
            user_data = Google.validate(auth_token)

            # In ra log để debug (có thể bỏ đi sau)
            print(f"User data from Google: {user_data}")

            # 2. Kiểm tra Client ID
            # Dòng này chỉ được thực thi nếu Google.validate() thành công và trả về dictionary.
            print(f"Checking client ID: received={user_data.get('aud')}, expected={GOOGLE_CLIENT_ID}")
            if user_data.get('aud') != GOOGLE_CLIENT_ID:
                logger.error(f"Client ID mismatch. Received aud: {user_data.get('aud')}, Expected: {GOOGLE_CLIENT_ID}")
                raise serializers.ValidationError(
                    'Oops, who are you? Please re-login.'
                )

        except ValueError as e:
            # Bắt lỗi ValueError từ Google.validate() (token không hợp lệ/hết hạn)
            logger.error(f"Token validation error: {e}")
            print(f"ValueError caught: {e}")
            raise serializers.ValidationError(
                f'The token is invalid or expired. Please login again. Detail: {e}'
            )
        except Exception as e:
            # Bắt các lỗi khác
            logger.error(f"Unexpected error validating Google ID token: {e}")
            print(f"Exception caught: {e}")
            raise serializers.ValidationError(
                f'An unexpected error occurred. Please try again. Detail: {e}'
            )

        # 3. Gọi hàm đăng ký/đăng nhập người dùng social
        try:
            print(f"Calling register_social_user with: provider=google, user_id={user_data['sub']}, email={user_data['email']}, name={user_data['name']}")
            return register_social_user(
                provider='google',
                user_id=user_data['sub'],
                email=user_data['email'],
                name=user_data['name'],
                user_photo=user_data.get('picture')
            )
        except Exception as e:
            logger.error(f"An error occurred during social user registration: {e}")
            print(f"Registration error: {e}")
            # Convert exception to string to avoid JWT encoding issues
            error_message = str(e) if e else "Unknown error"
            raise serializers.ValidationError(
                f'An error occurred. Please try again. Error: {error_message}'
            )



# ---
## Serializers Người Dùng (User)
# ---
class UserSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)  # age là một @property, chỉ đọc

    # Tạo một trường password riêng để handle việc cập nhật mật khẩu
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'date_of_birth',
            'living_place', 'role', 'user_level', 'is_active_user', 'age','sex',
             'user_photo', 'password' # Thêm password vào fields
        ]

        # Đặt first_name và last_name là read_only
        read_only_fields = ['email']

        # Xóa extra_kwargs cho password vì chúng ta đã tạo trường password riêng
        # và handle logic trong update() method.

    def create(self, validated_data):
        # Tách password ra để tạo user
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        # Xử lý trường password riêng nếu có trong validated_data
        password = validated_data.pop('password', None)

        # Cập nhật các trường còn lại
        user = super().update(instance, validated_data)

        # Đặt lại mật khẩu nếu password được cung cấp
        if password:
            user.set_password(password)
            user.save()

        return user



# ---
## Serializers Nhóm Lĩnh Vực (FieldGroup)
# ---
class FieldGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldGroup
        fields = [
            'field_id',
            'name',
            'description',
            'cover' # Thêm trường 'cover' vào đây để nó được hiển thị
        ]

# ---
## Serializers Album
# ---
class AlbumSerializer(serializers.ModelSerializer):
    images = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Album
        fields = '__all__'

# ---
## Serializers Image
# ---
class ImageSerializer(serializers.ModelSerializer):
    album_name = serializers.CharField(source='album.name', read_only=True)

    class Meta:
        model = Image
        fields = '__all__'

# ---
## Serializers cho AdmissionScore (Điểm chuẩn)
# ---
# Serializer chi tiết cho AdmissionScore khi lồng trong Major
class AdmissionScoreDetailSerializer(serializers.ModelSerializer):
    """
    Serialzer này được sử dụng khi lồng các điểm chuẩn vào MajorSerializer.
    """
    class Meta:
        model = AdmissionScore
        # Trong model AdmissionScore, trường điểm chuẩn là 'score'
        fields = ['year', 'score']

# Serializer độc lập cho AdmissionScore (khi không lồng)
class AdmissionScoreStandaloneSerializer(serializers.ModelSerializer):
    """
    Serializer này được sử dụng khi truy vấn AdmissionScore một cách độc lập.
    Nó sẽ hiển thị tên ngành liên quan.
    """
    # major_name là tên hiển thị của ngành, lấy từ major.name
    major_name = serializers.CharField(source='major.name', read_only=True)

    class Meta:
        model = AdmissionScore
        # Bao gồm major (khóa ngoại) để có thể tạo/cập nhật điểm chuẩn cho một ngành cụ thể
        fields = ['id', 'major', 'major_name', 'year', 'score']
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=AdmissionScore.objects.all(),
                fields=['major', 'year'],
                message="Điểm chuẩn cho ngành này và năm này đã tồn tại."
            )
        ]

# ---
## Serializers Ngành riêng của từng trường (Major) - Phiên bản ĐƠN GIẢN
# ---
class MajorSimpleSerializer(serializers.ModelSerializer):
    """
    Serialzer đơn giản cho Major, chỉ bao gồm các thông tin cơ bản.
    Được sử dụng khi lồng trong SchoolSimpleSerializer để tránh vòng lặp đệ quy.
    """
    class Meta:
        model = Major
        fields = ['id', 'major_id', 'name'] # Chỉ các trường cơ bản

# ---
## Serializers Trường học (School) - Phiên bản ĐƠN GIẢN
# ---
class SchoolSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer đơn giản cho School, chỉ bao gồm các trường cơ bản và danh sách ngành.
    Được sử dụng khi lồng trong MajorSerializer để tránh vòng lặp đệ quy.
    """
    # Sử dụng MajorSimpleSerializer để lồng danh sách ngành, related_name là 'school_major'
    majors_data = MajorSimpleSerializer(source='school_major', many=True, read_only=True)

    class Meta:
        model = School
        fields = [
            'id', 'name_vn', 'name_en', 'logo', 'short_code', 'admission_code',
            'school_type', 'website_url', 'phone_number', 'email', 'country',
            'school_level', 'tag', 'majors_data','socialmedialink'
        ]

# ---
## Serializers Ngành riêng của từng trường (Major) - Phiên bản ĐẦY ĐỦ
# ---
class MajorOptimizedSerializer(serializers.ModelSerializer):
    """
    Serializer tối ưu cho Major - chỉ trả về dữ liệu cần thiết cho frontend.
    """
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    school_type = serializers.CharField(source='school.school_type', read_only=True)

    class Meta:
        model = Major
        fields = [
            'id', 'major_id', 'name', 'min_tuition_fee_per_year',
            'max_tuition_fee_per_year', 'status', 'tags',
            'school_name', 'school_logo', 'school_type'
        ]

class MajorSerializer(serializers.ModelSerializer):
    # Sử dụng SchoolSimpleSerializer để hiển thị thông tin trường
    # Điều này tránh được lỗi vòng lặp đệ quy giữa MajorSerializer và SchoolSerializer đầy đủ
    school = SchoolSimpleSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(queryset=School.objects.all(), source='school', write_only=True, required=True)

    # Lấy điểm chuẩn liên quan đến Major này
    admission_scores = AdmissionScoreDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Major
        fields = '__all__' # Bao gồm tất cả các trường và trường lồng ghép

# ---
## Serializers Ngành Chung của tất cả trường học (AllMajorOfAllSchool)
# ---
class AllMajorOfAllSchoolSerializer(serializers.ModelSerializer):
    # Sử dụng FieldGroupSerializer đã tạo để hiển thị chi tiết FieldGroup
    # read_only=True sẽ hiển thị dữ liệu của FieldGroup, bao gồm cả 'cover'
    field = FieldGroupSerializer(read_only=True)

    # field_id vẫn dùng cho việc ghi dữ liệu (tạo/sửa)
    field_id = serializers.PrimaryKeyRelatedField(
        queryset=FieldGroup.objects.all(),
        source='field',
        write_only=True,
        required=True
    )

    class Meta:
        model = AllMajorOfAllSchool
        # Liệt kê tất cả các fields mà bạn muốn hiển thị
        fields = [
            'id','all_major_id','name','short_description','training_duration','job','suitable',
            'program','salary','cover','tuition_fee_per_year','field',
            'field_id', 'note','opportunities','tag'
        ]

# ---
## Serializers Bảng con phân quyền (Admin, Staff, Partner)
# ---
class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=True
    )

    class Meta:
        model = Admin
        fields = ['user', 'user_id', 'create']
        read_only_fields = ['create']

class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=True
    )

    class Meta:
        model = Staff
        fields = ['user', 'user_id', 'create']
        read_only_fields = ['create']

class PartnerSerializer(serializers.ModelSerializer):
    # Sử dụng SchoolSimpleSerializer để hiển thị thông tin trường liên quan
    school = SchoolSimpleSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(), source='school', write_only=True, required=True
    )

    class Meta:
        model = Partner
        fields = [
            'school', 'school_id', 'contact_person', 'contract_start_date',
            'contract_end_date', 'contract_details', 'is_active_partner'
        ]

# ---
## Serializers Trường học (School) - GIỮ NGUYÊN NHƯ YÊU CẦU (Phiên bản ĐẦY ĐỦ)
# ---
class SchoolSerializer(serializers.ModelSerializer):
    # Sử dụng MajorSerializer đầy đủ để hiển thị chi tiết ngành
    majors_data = MajorSerializer(source='school_major', many=True, read_only=True)
    album_details = AlbumSerializer(source='album', read_only=True)

    album_id = serializers.PrimaryKeyRelatedField(
        queryset=Album.objects.all(),
        source='album',
        allow_null=True,
        required=False
    )

    class Meta:
        model = School
        fields = [
            'id', 'name_en', 'name_vn', 'short_code', 'admission_code', 'logo','cover_photo', 'established_year', 'school_type',
            'website_url', 'quota_per_year','introduction', 'phone_number', 'email', 'map_link', 'start', 'end',
            'album_id','scholarships', 'school_level','majors_data','country','registration',
            'album_details', 'benchmark_min', 'benchmark_max', 'tag', 'address','socialmedialink'
        ]
        read_only_fields = [
            'majors_data', 'album_details'
        ]




class SchoolOutstandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['name_vn', 'logo','short_code']


class SchoolOptimizedSerializer(serializers.ModelSerializer):
    """
    Serializer tối ưu cho School, không bao gồm majors_data để giảm kích thước dữ liệu.
    Được sử dụng cho trang danh sách trường để tăng tốc độ tải.
    """
    class Meta:
        model = School
        fields = [
            'id', 'name_en', 'name_vn', 'short_code', 'admission_code', 'logo', 'cover_photo',
            'established_year', 'school_type', 'website_url', 'quota_per_year', 'introduction',
            'phone_number', 'email', 'map_link', 'start', 'end', 'scholarships', 'school_level',
            'country', 'registration', 'benchmark_min', 'benchmark_max', 'tag', 'address', 'socialmedialink'
        ]
        # Bỏ majors_data để tối ưu performance


class SchoolMajorsSerializer(serializers.ModelSerializer):
    """
    Serializer chuyên dụng để lấy dữ liệu ngành của trường.
    Được sử dụng khi cần hiển thị danh sách ngành của một trường cụ thể.
    """
    majors_data = MajorSerializer(source='school_major', many=True, read_only=True)

    class Meta:
        model = School
        fields = ['id', 'name_vn', 'short_code', 'majors_data']


# ---
## Chat Serializers
# ---
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.first_name', read_only=True)
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    sender_photo = serializers.CharField(source='sender.user_photo', read_only=True)
    time_ago = serializers.SerializerMethodField()
    is_deleted_for_me = serializers.SerializerMethodField()
    reply_to = serializers.PrimaryKeyRelatedField(read_only=True)
    reply_to_sender_name = serializers.SerializerMethodField()
    reply_to_message_content = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'room', 'sender', 'sender_name', 'sender_email', 'sender_photo',
            'message_type', 'content', 'file_url', 'is_read', 'created_at',
            'updated_at', 'is_deleted', 'time_ago', 'is_deleted_for_me',
            'reply_to', 'reply_to_sender_name', 'reply_to_message_content',
            'reactions', 'my_reaction'
        ]
        read_only_fields = ['sender', 'created_at', 'updated_at']
    
    def get_is_deleted_for_me(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_deleted_for_user(request.user)
        return False

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff.days > 0:
            return f"{diff.days} ngày trước"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} giờ trước"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} phút trước"
        else:
            return "Vừa xong"

    def get_reply_to_sender_name(self, obj):
        if obj.reply_to and obj.reply_to.sender:
            return obj.reply_to.sender.first_name or obj.reply_to.sender.email
        return None

    def get_reply_to_message_content(self, obj):
        if obj.reply_to:
            return obj.reply_to.content[:200]
        return None

    def get_reactions(self, obj):
        data = {}
        for r in obj.reactions.all():
            data.setdefault(r.reaction, 0)
            data[r.reaction] += 1
        return data

    def get_my_reaction(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        user_reaction = obj.reactions.filter(user=request.user).first()
        return user_reaction.reaction if user_reaction else None


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source='participants'
    )
    latest_message = MessageSerializer(source='get_latest_message', read_only=True)
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'participants', 'participant_ids',
            'created_at', 'updated_at', 'is_active', 'latest_message',
            'unread_count', 'other_participant'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.room_type == 'private':
            other_user = obj.get_other_participant(request.user)
            if other_user:
                return {
                    'id': other_user.id,
                    'email': other_user.email,
                    'name': f"{other_user.first_name} {other_user.last_name}".strip() or other_user.email,
                    'photo': other_user.user_photo,
                    'status': getattr(other_user, 'chat_status', None) and other_user.chat_status.status or 'offline'
                }
        return None


class ChatUserStatusSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ChatUserStatus
        fields = [
            'id', 'user', 'user_name', 'user_email', 'status',
            'last_seen', 'is_typing_in_room'
        ]
        read_only_fields = ['user', 'last_seen']


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True
    )

    class Meta:
        model = ChatRoom
        fields = ['name', 'room_type', 'participants']

    def create(self, validated_data):
        participants = validated_data.pop('participants')
        room = ChatRoom.objects.create(**validated_data)
        room.participants.set(participants)
        return room


# Additional serializers for authentication and user management
class LoginSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    username = serializers.CharField(max_length=255, min_length=2)
    
    tokens = serializers.SerializerMethodField()

    def get_tokens(self, obj):
        user = User.objects.get(username=obj['username'])
        tokens = get_tokens_for_user(user)
        return {
            'refresh': tokens['refresh'],
            'access': tokens['access']
        }

    class Meta:
        model = User
        fields = ['username', 'password', 'tokens']

    def validate(self, attrs):
        username = attrs.get('username', '')
        password = attrs.get('password', '')
        filtered_user_by_email = User.objects.filter(email=username)
        filtered_user_by_username = User.objects.filter(username=username)

        user = authenticate(username=username, password=password)

        if filtered_user_by_email.exists() and filtered_user_by_email[0].auth_provider != 'email':
            raise AuthenticationFailed(
                detail='Please continue your login using ' + filtered_user_by_email[0].auth_provider)

        if filtered_user_by_username.exists() and filtered_user_by_username[0].auth_provider != 'email':
            raise AuthenticationFailed(
                detail='Please continue your login using ' + filtered_user_by_username[0].auth_provider)

        if not user:
            raise AuthenticationFailed('Invalid credentials, try again')
        if not user.is_active:
            raise AuthenticationFailed('Account disabled, contact admin')
        if not user.is_verified:
            raise AuthenticationFailed('Email is not verified')

        return {
            'email': user.email,
            'username': user.username,
            'tokens': get_tokens_for_user(user)
        }

        return super().validate(attrs)


class ResetPasswordEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(min_length=2)

    redirect_url = serializers.CharField(max_length=500, required=False)

    class Meta:
        fields = ['email']


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        min_length=6, max_length=68, write_only=True)
    token = serializers.CharField(
        min_length=1, write_only=True)
    uidb64 = serializers.CharField(
        min_length=1, write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')

            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed('The reset link is invalid', 401)

            user.set_password(password)
            user.save()

            return (user)
        except Exception as e:
            raise AuthenticationFailed('The reset link is invalid', 401)
        return super().validate(attrs)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    default_error_message = {
        'bad_token': ('Token is expired or invalid')
    }

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):

        try:
            RefreshToken(self.token).blacklist()

        except TokenError:
            self.fail('bad_token')


class UserUpdateSerializer(serializers.ModelSerializer):
    user_photo = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'user_photo', 'date_of_birth', 'living_place', 'sex']
        
    def update(self, instance, validated_data):
        # Update các field được cung cấp
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


# --- Serializers cho đăng ký/đăng nhập đơn giản ---
class SimpleRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'confirm_password']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            username=validated_data['email']  # Sử dụng email làm username
        )
        return user


class SimpleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Email hoặc mật khẩu không đúng')
            if not user.is_active:
                raise serializers.ValidationError('Tài khoản đã bị khóa')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Vui lòng nhập đầy đủ thông tin')
        
        return attrs


# --- Serializers cho tracking lượt xem ---
class SchoolViewCountSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    school_short_code = serializers.CharField(source='school.short_code', read_only=True)
    
    class Meta:
        model = SchoolViewCount
        fields = ['id', 'school', 'school_name', 'school_logo', 'school_short_code', 'view_count', 'last_viewed', 'created_at']

class MajorViewCountSerializer(serializers.ModelSerializer):
    major_name = serializers.CharField(source='major.name', read_only=True)
    major_id = serializers.CharField(source='major.major_id', read_only=True)
    school_name = serializers.CharField(source='major.school.name_vn', read_only=True)
    school_short_code = serializers.CharField(source='major.school.short_code', read_only=True)
    school_logo = serializers.CharField(source='major.school.logo', read_only=True)
    
    class Meta:
        model = MajorViewCount
        fields = ['id', 'major', 'major_name', 'major_id', 'school_name', 'school_short_code', 'school_logo', 'view_count', 'last_viewed', 'created_at']

class DailyViewStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyViewStats
        fields = ['id', 'date', 'total_school_views', 'total_major_views', 'created_at']

class TopSchoolsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField(required=False, default=0)
    rank = serializers.IntegerField(required=False, default=0)
    
    class Meta:
        model = School
        fields = ['id', 'name_vn', 'short_code', 'logo', 'school_type', 'country', 'tag', 'view_count', 'rank']

class TopMajorsSerializer(serializers.ModelSerializer):
    view_count = serializers.IntegerField(required=False, default=0)
    rank = serializers.IntegerField(required=False, default=0)
    school_name = serializers.CharField(source='school.name_vn', read_only=True)
    school_short_code = serializers.CharField(source='school.short_code', read_only=True)
    school_logo = serializers.CharField(source='school.logo', read_only=True)
    
    class Meta:
        model = Major
        fields = ['id', 'major_id', 'name', 'school_name', 'school_short_code', 'school_logo', 'tags', 'view_count', 'rank']




