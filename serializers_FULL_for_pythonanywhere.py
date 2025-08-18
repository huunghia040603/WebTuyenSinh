# COMPLETE serializers.py for PythonAnywhere - ALL SERIALIZERS INCLUDED
# Copy toàn bộ file này lên PythonAnywhere để khôi phục tất cả data loading

from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from .google_social_auth import Google
from .utils import register_social_user
import os
import random
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, FieldGroup, Album, Image, AdmissionScore, Major, School, AllMajorOfAllSchool, Admin, Staff, Partner, Message, ChatRoom, ChatUserStatus

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
            # 1. Xác minh token với Google
            # Hàm này sẽ ném ra lỗi nếu token không hợp lệ/hết hạn.
            user_data = Google.validate(auth_token)

        except Exception as identifier:

            raise serializers.ValidationError(
                'The token is invalid or expired. Please login again.'
            )

        try:
            # 2. Lấy thông tin từ token đã được xác minh
            user_id = user_data['sub']
            email = user_data['email']
            name = user_data['name']
            provider = 'google'
            user_photo = user_data.get('picture', '')

            # 3. Đăng ký hoặc đăng nhập người dùng
            return register_social_user(
                provider=provider,
                user_id=user_id,
                email=email,
                name=name,
                user_photo=user_photo
            )

        except Exception as identifier:
            raise serializers.ValidationError(
                f'The token is invalid or expired. Please login again. Detail: Token validation failed: {identifier}'
            )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_photo', 'date_of_birth', 
            'living_place', 'role', 'sex', 'is_active_user'
        ]


class FieldGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldGroup
        fields = '__all__'


class AlbumSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    def get_images(self, obj):
        images = Image.objects.filter(album=obj)
        return ImageSerializer(images, many=True).data

    class Meta:
        model = Album
        fields = '__all__'


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'


class AdmissionScoreDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmissionScore
        fields = ['year', 'score', 'note']


class AdmissionScoreStandaloneSerializer(serializers.ModelSerializer):
    # Sử dụng cho các API chỉ cần dữ liệu AdmissionScore
    major = serializers.StringRelatedField(read_only=True)
    major_id = serializers.PrimaryKeyRelatedField(
        queryset=Major.objects.all(),
        source='major',
        write_only=True,
        required=True
    )

    class Meta:
        model = AdmissionScore
        fields = '__all__'


class MajorSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer đơn giản cho Major, tránh vòng lặp đệ quy khi sử dụng trong SchoolSerializer.
    Chỉ bao gồm những thông tin cơ bản nhất.
    """
    class Meta:
        model = Major
        fields = ['id', 'major_id', 'name', 'training_duration', 'tuition_fee_per_year', 'credit', 'tag']


class SchoolSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer đơn giản cho School, tránh vòng lặp đệ quy khi sử dụng trong MajorSerializer.
    Chỉ bao gồm những thông tin cơ bản nhất.
    """
    class Meta:
        model = School
        fields = [
            'id', 'name_en', 'name_vn', 'short_code', 'logo', 'school_type', 
            'website_url', 'phone_number', 'email', 'address', 'tag'
        ]


class MajorOptimizedSerializer(serializers.ModelSerializer):
    """
    Serializer tối ưu cho Major, không bao gồm school để giảm kích thước dữ liệu.
    Được sử dụng cho trang danh sách ngành để tăng tốc độ tải.
    """
    class Meta:
        model = Major
        fields = [
            'id', 'major_id', 'name', 'training_duration', 'tuition_fee_per_year', 
            'credit', 'tag', 'program_type'
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


class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True, required=True)

    class Meta:
        model = Admin
        fields = '__all__'


class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True, required=True)

    class Meta:
        model = Staff
        fields = '__all__'


class PartnerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True, required=True)
    
    # Album chi tiết (read-only)
    album_details = AlbumSerializer(source='album', read_only=True)
    
    # Album ID cho việc ghi (write-only)
    album_id = serializers.PrimaryKeyRelatedField(
        queryset=Album.objects.all(),
        source='album',
        write_only=True,
        allow_null=True,
        required=False
    )

    class Meta:
        model = Partner
        fields = '__all__'


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
    Serializer chỉ để lấy dữ liệu ngành của trường, được tối ưu cho tốc độ.
    """
    majors_data = MajorOptimizedSerializer(source='school_major', many=True, read_only=True)

    class Meta:
        model = School
        fields = ['id', 'name_vn', 'short_code', 'majors_data']
        read_only_fields = ['majors_data']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    
    def get_sender_name(self, obj):
        if obj.sender:
            return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.email
        return "Unknown"
    
    def get_receiver_name(self, obj):
        if obj.receiver:
            return f"{obj.receiver.first_name} {obj.receiver.last_name}".strip() or obj.receiver.email
        return "Unknown"
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_room', 'sender', 'receiver', 'content', 'timestamp', 
            'is_read', 'sender_name', 'receiver_name'
        ]
        read_only_fields = ['sender_name', 'receiver_name', 'timestamp']


class ChatRoomSerializer(serializers.ModelSerializer):
    # Hiển thị thông tin user 1 và user 2
    user1_name = serializers.SerializerMethodField()
    user2_name = serializers.SerializerMethodField()
    user1_photo = serializers.SerializerMethodField()
    user2_photo = serializers.SerializerMethodField()
    
    # Tin nhắn cuối cùng
    last_message = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    
    # Số tin nhắn chưa đọc cho từng user
    unread_count_user1 = serializers.SerializerMethodField()
    unread_count_user2 = serializers.SerializerMethodField()
    
    def get_user1_name(self, obj):
        if obj.user1:
            return f"{obj.user1.first_name} {obj.user1.last_name}".strip() or obj.user1.email
        return "Unknown"
    
    def get_user2_name(self, obj):
        if obj.user2:
            return f"{obj.user2.first_name} {obj.user2.last_name}".strip() or obj.user2.email
        return "Unknown"
    
    def get_user1_photo(self, obj):
        return obj.user1.user_photo if obj.user1 else ""
    
    def get_user2_photo(self, obj):
        return obj.user2.user_photo if obj.user2 else ""
    
    def get_last_message(self, obj):
        last_msg = Message.objects.filter(chat_room=obj).order_by('-timestamp').first()
        return last_msg.content if last_msg else ""
    
    def get_last_message_time(self, obj):
        last_msg = Message.objects.filter(chat_room=obj).order_by('-timestamp').first()
        return last_msg.timestamp if last_msg else None
    
    def get_unread_count_user1(self, obj):
        return Message.objects.filter(
            chat_room=obj, 
            receiver=obj.user1, 
            is_read=False
        ).count()
    
    def get_unread_count_user2(self, obj):
        return Message.objects.filter(
            chat_room=obj, 
            receiver=obj.user2, 
            is_read=False
        ).count()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'user1', 'user2', 'created_at', 
            'user1_name', 'user2_name', 'user1_photo', 'user2_photo',
            'last_message', 'last_message_time',
            'unread_count_user1', 'unread_count_user2'
        ]
        read_only_fields = [
            'user1_name', 'user2_name', 'user1_photo', 'user2_photo',
            'last_message', 'last_message_time', 
            'unread_count_user1', 'unread_count_user2', 'created_at'
        ]


class ChatUserStatusSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_photo = serializers.SerializerMethodField()
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return "Unknown"
    
    def get_user_photo(self, obj):
        return obj.user.user_photo if obj.user else ""
    
    class Meta:
        model = ChatUserStatus
        fields = [
            'id', 'user', 'is_online', 'last_seen', 'last_activity',
            'user_name', 'user_photo'
        ]
        read_only_fields = ['user_name', 'user_photo']


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """
    Serializer đơn giản để tạo chat room mới
    """
    class Meta:
        model = ChatRoom
        fields = ['user1', 'user2']
        
    def validate(self, data):
        user1 = data['user1']
        user2 = data['user2']
        
        # Kiểm tra không tự chat với chính mình
        if user1 == user2:
            raise serializers.ValidationError("Cannot create chat room with yourself")
        
        # Kiểm tra xem chat room đã tồn tại chưa (cả 2 chiều)
        existing_room = ChatRoom.objects.filter(
            models.Q(user1=user1, user2=user2) | 
            models.Q(user1=user2, user2=user1)
        ).first()
        
        if existing_room:
            raise serializers.ValidationError("Chat room already exists between these users")
        
        return data


# Additional serializers for specific API endpoints
class LoginSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    username = serializers.CharField(max_length=255, min_length=2)
    
    tokens = serializers.SerializerMethodField()

    def get_tokens(self, obj):
        user = User.objects.get(username=obj['username'])

        return {
            'refresh': user.tokens()['refresh'],
            'access': user.tokens()['access']
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
            'tokens': user.tokens
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