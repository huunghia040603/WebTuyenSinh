import re
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from .pagination import *
import django_filters
from django.db.models import Case, When, Value, IntegerField, F # Import F for __in lookup
from rest_framework import generics
from .filter import *
from django.shortcuts import render, redirect # THÊM DÒNG NÀY
from django.contrib.auth.decorators import login_required # THÊM DÒNG NÀY
from rest_framework.generics import GenericAPIView
from rest_framework import status
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from .filter import SchoolMajorsFilter
from django.db.models import Q # Import Q for OR queries
from django.core.cache import cache
from django.db.models import Q, Prefetch
from rest_framework.decorators import action
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum



class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Cho phép admin hoặc chính chủ sở hữu được truy cập.
    """
    def has_object_permission(self, request, view, obj):
        # Admin luôn được phép truy cập
        if request.user and (request.user.is_superuser or request.user.is_staff):
            return True

        # Chỉ cho phép chủ sở hữu (người dùng đang đăng nhập) truy cập
        return obj == request.user

class GoogleSocialAuthView(GenericAPIView):
    authentication_classes = [JWTAuthentication]
    serializer_class = GoogleSocialAuthSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Lấy toàn bộ dictionary đã được validate, chứa token.
        data = serializer.validated_data

        # Debug: In ra log để kiểm tra cấu trúc dữ liệu trước khi trả về
        print(f"🔍 [DEBUG] serializer.validated_data: {data}")
        print(f"🔍 [DEBUG] Type of data: {type(data)}")
        print(f"🔍 [DEBUG] Keys in data: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")

        return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def registration_view(request):
    """
    Registration endpoint cho phép tạo user mới mà không cần authentication.
    """
    try:
        # Debug logging
        print(f"Registration request data: {request.data}")
        
        # Thêm default date_of_birth nếu không có
        data = request.data.copy()
        if 'date_of_birth' not in data or not data['date_of_birth']:
            data['date_of_birth'] = '2000-01-01'
        
        print(f"Data after processing: {data}")
        
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            print("Serializer is valid, creating user...")
            user = serializer.save()
            print(f"User created successfully: {user.email}")
            return Response({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Exception in registration_view: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Internal server error',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---
## User ViewSet
# ---
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

#     def get_permissions(self):
#         # Admin có thể tạo user
#         if self.action == 'create':
#             return [IsAdminUser()]

#         # Cho phép người dùng đã đăng nhập tự sửa/xóa bản thân, và admin có thể sửa/xóa bất kỳ ai
#         elif self.action in ['update', 'partial_update', 'destroy']:
#             return [IsAuthenticated()]

#         # Cho phép xem danh sách (chỉ admin) và xem chi tiết (cho bất kỳ ai)
#         return [AllowAny()]

#     def get_queryset(self):
#         user = self.request.user

#         # Admin có thể xem tất cả user
#         if user and user.is_authenticated and (user.is_superuser or user.is_staff):
#             return User.objects.all()

#         # User thường chỉ xem được thông tin của chính họ
#         if user and user.is_authenticated:
#             return User.objects.filter(id=user.id)

#         return User.objects.none()

#     def perform_update(self, serializer):
#         # Custom logic để chỉ user đang đăng nhập mới có thể update chính họ
#         # hoặc admin update bất kỳ ai
#         instance = self.get_object()
#         user = self.request.user

#         # Nếu người dùng không phải là admin và đang cố gắng cập nhật người khác, raise exception
#         if not user.is_superuser and not user.is_staff and instance.id != user.id:
#             raise PermissionDenied("You do not have permission to update this user.")

#         serializer.save() # Or User.objects.all() if get_permissions allows general access




class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            # Áp dụng quyền IsAuthenticated và IsOwnerOrAdmin
            return [IsAuthenticated(), IsOwnerOrAdmin()]

        # Đối với các action khác, bạn có thể thiết lập quyền khác
        return [AllowAny()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user profile
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


# ---
## FieldGroup ViewSet
# ---
class FieldGroupViewSet(viewsets.ModelViewSet):
    queryset = FieldGroup.objects.all()
    serializer_class = FieldGroupSerializer
    lookup_field = 'field_id' # Use 'field_id' for lookup
    permission_classes = [AllowAny] # Allow anyone to view field groups

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

# ---
## Major ViewSet (Chỉ lấy các ngành có tags = 'outstanding')
# ---
class OutstandingMajorViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho mô hình Major, chỉ hiển thị các ngành có tags = 'outstanding'.
    Hỗ trợ hiển thị dữ liệu đơn giản và phức tạp, cùng với phân trang, tìm kiếm, lọc và sắp xếp.
    """
    pagination_class = MajorPagination
    permission_classes = [AllowAny]

    # Thiết lập các backend cho lọc, tìm kiếm và sắp xếp
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Sử dụng filterset_class để chỉ định lớp MajorFilter tùy chỉnh
    filterset_class = MajorFilter # Đã bỏ comment và sử dụng MajorFilter

    # Các trường có thể tìm kiếm
    search_fields = [
        'name',          # Tên ngành
        'major_id',      # Mã ngành
    ]

    # Các trường có thể sắp xếp
    ordering_fields = [
        'name',
        'min_tuition_fee_per_year',
        'max_tuition_fee_per_year',
        'status',
        'tags'
    ]

    # Thiết lập quyền truy cập
    def get_permissions(self):
        """
        Chỉ cho phép admin tạo, cập nhật, xóa ngành.
        Tất cả người dùng đều có thể xem.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_serializer_class(self):
        """
        Trả về serializer class dựa trên hành động (action) và tham số truy vấn (query params).
        - Nếu là hành động 'retrieve' (lấy chi tiết theo ID), luôn trả về MajorSerializer đầy đủ.
        - Nếu có tham số 'simple=true' trong yêu cầu GET danh sách, trả về MajorSimpleSerializer.
        - Mặc định (GET danh sách không có 'simple=true'), trả về MajorSerializer đầy đủ.
        """
        if self.action == 'retrieve':
            return MajorSerializer

        if self.request.query_params.get('simple', 'false').lower() == 'true':
            return MajorSimpleSerializer

        return MajorSerializer

    def get_queryset(self):
        """
        Trả về queryset của các đối tượng Major đã được lọc và sắp xếp ngẫu nhiên.
        DjangoFilterBackend sẽ tự động áp dụng các bộ lọc từ request.query_params
        khi filterset_class được đặt.
        """
        queryset = Major.objects.filter(tags__in=['outstanding', 'pro'])
        # Thêm order_by('?') để sắp xếp ngẫu nhiên
        # Lưu ý: Sắp xếp ngẫu nhiên có thể tốn tài nguyên với tập dữ liệu lớn.
        return queryset.order_by('?')



# ---
## All Major ViewSet (Lấy tất cả các ngành, không lọc theo tags)
# ---
class AllMajorViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho mô hình Major, hiển thị TẤT CẢ các ngành học.
    Hỗ trợ hiển thị dữ liệu đơn giản và phức tạp, cùng với phân trang, tìm kiếm, lọc và sắp xếp.
    """
    queryset = Major.objects.all() # Lấy tất cả các ngành
    permission_classes = [AllowAny]
    # Thiết lập lớp phân trang mặc định
    pagination_class = MajorPagination

    # Thiết lập các backend cho lọc, tìm kiếm và sắp xếp
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    # Sử dụng filterset_class để chỉ định lớp MajorFilter tùy chỉnh
    filterset_class = MajorFilter

    # Các trường có thể tìm kiếm
    search_fields = [
        'name',           # Tên ngành
        'major_id',       # Mã ngành

    ]

    # Các trường có thể sắp xếp
    ordering_fields = [
        'name',
        'min_tuition_fee_per_year',
        'max_tuition_fee_per_year',
        'status',
        'tags'
    ]

    # Thiết lập quyền truy cập (giống như MajorViewSet)
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    # Thiết lập serializer class (giống như MajorViewSet)
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MajorSerializer

        if self.request.query_params.get('simple', 'false').lower() == 'true':
            return MajorSimpleSerializer

        return MajorSerializer

    # get_queryset không cần tùy chỉnh thêm vì đã lấy tất cả ở queryset ban đầu
    # def get_queryset(self):
    #     return super().get_queryset()




# ---
## Album ViewSet
# ---
class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny] # Allow viewing albums

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """
        Lấy tất cả ảnh thuộc một album cụ thể.
        """
        album = self.get_object()
        images = album.images.all()
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)

# ---
## Image ViewSet
# ---
class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [AllowAny] # Allow viewing images

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


# ---
## School ViewSet
# ---
class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SchoolFilter
    search_fields = [
        'name_en',
        'name_vn',
        'short_code',
        'admission_code',
        'address'
    ]
    ordering_fields = [
        'start',
        'end',
        'benchmark_min',
        'benchmark_max',
        'name_vn',
        'established_year',
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        # Lấy queryset ban đầu
        queryset = super().get_queryset()

        # Áp dụng logic sắp xếp tùy chỉnh của bạn
        tag_order = [
            'outstanding',
            'urgency',
            'pro',
            'new',
            'none'
        ]

        ordering = Case(
            *[When(tag=tag_value, then=pos) for pos, tag_value in enumerate(tag_order)],
            default=Value(len(tag_order)),
            output_field=IntegerField()
        )
        queryset = queryset.annotate(tag_order_value=ordering).order_by('tag_order_value', 'id')

        # Thêm logic tìm kiếm trên majors_data nếu cần
        # Lấy giá trị tìm kiếm từ request
        search_query = self.request.query_params.get('search', None)

        if search_query:
            queryset = queryset.filter(majors_data__name__icontains=search_query).distinct()


        return queryset

    # Các phương thức khác của bạn (`majors` và `admission_scores`) không bị ảnh hưởng
    @action(detail=True, methods=['get'])
    def majors(self, request, pk=None):
        """
        Lấy danh sách ngành của trường cụ thể với phân trang và tối ưu hóa.
        """
        school = self.get_object()
        
        # Tối ưu hóa query với select_related và prefetch_related
        majors = school.school_major.select_related('school').prefetch_related(
            'admission_scores'
        ).all()
        
        # Áp dụng search filter nếu có
        search = request.query_params.get('search', None)
        if search:
            majors = majors.filter(
                Q(name__icontains=search) | 
                Q(major_id__icontains=search)
            )
        
        # Áp dụng ordering
        ordering = request.query_params.get('ordering', 'name')
        if ordering in ['name', '-name', 'major_id', '-major_id']:
            majors = majors.order_by(ordering)
        
        # Tạm thời thay đổi pagination class cho action này
        original_pagination = self.pagination_class
        self.pagination_class = MajorPagination
        
        # Áp dụng phân trang
        page = self.paginate_queryset(majors)
        if page is not None:
            # Sử dụng serializer tối ưu nếu có thể
            try:
                from .serializers import MajorOptimizedSerializer
                serializer = MajorOptimizedSerializer(page, many=True)
            except ImportError:
                serializer = MajorSerializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            try:
                from .serializers import MajorOptimizedSerializer
                serializer = MajorOptimizedSerializer(majors, many=True)
            except ImportError:
                serializer = MajorSerializer(majors, many=True)
            response = Response(serializer.data)
        
        # Khôi phục pagination class gốc
        self.pagination_class = original_pagination
        
        return response

    @action(detail=True, methods=['get'])
    def admission_scores(self, request, pk=None):
        school = self.get_object()
        majors_of_school = school.school_major.all()
        admission_scores = AdmissionScore.objects.filter(major__in=majors_of_school).order_by('-year')
        serializer = AdmissionScoreStandaloneSerializer(admission_scores, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def majors_optimized(self, request, pk=None):
        """
        API tối ưu cho majors - chỉ trả về dữ liệu cần thiết.
        """
        school = self.get_object()
        
        # Tối ưu hóa query
        majors = school.school_major.select_related('school').all()
        
        # Áp dụng search filter nếu có
        search = request.query_params.get('search', None)
        if search:
            majors = majors.filter(
                Q(name__icontains=search) | 
                Q(major_id__icontains=search)
            )
        
        # Áp dụng ordering
        ordering = request.query_params.get('ordering', 'name')
        if ordering in ['name', '-name', 'major_id', '-major_id']:
            majors = majors.order_by(ordering)
        
        # Sử dụng serializer tối ưu
        from .serializers import MajorOptimizedSerializer
        serializer = MajorOptimizedSerializer(majors, many=True)
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by_short_code/(?P<short_code>[^/.]+)')
    def by_short_code(self, request, short_code=None):
        """
        API tối ưu để lấy chi tiết 1 trường theo short_code.
        Không bao gồm majors_data để tăng tốc độ.
        """
        try:
            from django.shortcuts import get_object_or_404
            
            # Tối ưu query: chỉ lấy trường cần thiết
            school = get_object_or_404(
                School.objects.only(
                    'id', 'name_vn', 'name_en', 'short_code', 'admission_code', 
                    'logo', 'cover_photo', 'established_year', 'school_type',
                    'website_url', 'quota_per_year', 'introduction', 'phone_number', 
                    'email', 'map_link', 'start', 'end', 'scholarships', 
                    'school_level', 'country', 'registration', 'benchmark_min', 
                    'benchmark_max', 'tag', 'address', 'socialmedialink'
                ),
                short_code__iexact=short_code
            )
            
            # Sử dụng serializer tối ưu (không có majors_data)
            serializer = SchoolOptimizedSerializer(school)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in by_short_code: {str(e)}")
            return Response({
                'error': f'Không tìm thấy trường học với mã: {short_code}',
                'detail': str(e)
            }, status=404)

    @action(detail=True, methods=['get'])
    def all_majors(self, request, pk=None):
        """
        Trả về toàn bộ danh sách ngành của trường (không phân trang).
        """
        school = self.get_object()
        majors = school.school_major.select_related('school').all()
        from .serializers import MajorOptimizedSerializer
        serializer = MajorOptimizedSerializer(majors, many=True)
        return Response(serializer.data)

# ---
## AdmissionScore ViewSet
# ---
class AdmissionScoreViewSet(viewsets.ModelViewSet):
    queryset = AdmissionScore.objects.all()
    serializer_class = AdmissionScoreStandaloneSerializer
    permission_classes = [AllowAny] # Allow viewing admission scores

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    # Filter by 'major' (ForeignKey) and 'year'
    filterset_fields = ['major', 'year']
    ordering_fields = ['year', 'score'] # Order by 'score' not 'admission_score'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

# ---
## Admin ViewSet
# ---
class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAdminUser] # Only admins can manage other admins

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Admin.objects.all()
        # Admins can only see their own profile
        if hasattr(self.request.user, 'admin_profile'):
            return Admin.objects.filter(user=self.request.user)
        return Admin.objects.none()

# ---
## Staff ViewSet
# ---
class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminUser] # Only admins can manage staff

    def get_queryset(self):
        if self.request.user.is_superuser:
            return Staff.objects.all()
        # Staff can only see their own profile
        if hasattr(self.request.user, 'staff_profile'):
            return Staff.objects.filter(user=self.request.user)
        return Staff.objects.none()


# ---
## Partner ViewSet
# ---
class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    permission_classes = [IsAdminUser] # Chỉ admin mới có thể quản lý đối tác

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active_partner', 'school']
    search_fields = ['school__name_vn', 'contact_person']

    def get_queryset(self):
        # Đây là dòng cực kỳ quan trọng để giải quyết lỗi drf_yasg
        # Nó kiểm tra xem request có phải là từ drf_yasg để tạo tài liệu hay không.
        if getattr(self, 'swagger_fake_view', False):
            # Nếu là drf_yasg, trả về một queryset rỗng để nó có thể tạo schema
            # mà không cần truy cập các thuộc tính của user hoặc database.
            return Partner.objects.none()

        # Dưới đây là logic khi có một request API thực sự đến view này.
        # Tại thời điểm này, do permission_classes=[IsAdminUser] đã được kiểm tra,
        # self.request.user SẼ LÀ một User đã đăng nhập và có quyền admin.
        # Nếu không, request đã bị từ chối trước khi đến đây.
        if self.request.user.is_superuser or self.request.user.role == 'admin':
            return Partner.objects.all() # Admin xem tất cả
        else:
            # Dòng này về lý thuyết sẽ không bao giờ được thực thi nếu IsAdminUser hoạt động đúng,
            # vì chỉ admin mới được phép truy cập view này.
            # Tuy nhiên, nếu có lý do nào đó (ví dụ: permission class bị override hoặc bỏ qua),
            # nó sẽ xử lý trường hợp người dùng không phải superuser/admin nhưng đã đăng nhập.
            return Partner.objects.filter(owner=self.request.user)

# ---
## Partner AllMajorOfAllSchool
# ---
class AllMajorViewByField(viewsets.ModelViewSet, generics.ListAPIView):
    serializer_class = AllMajorOfAllSchoolSerializer
    permission_classes = [AllowAny]
    # Đã bỏ dòng này: pagination_class = AllMajorPagination

    def get_queryset(self):
        """
        Tùy chỉnh queryset để lọc các ngành học theo `field_id`.
        """
        # Bắt field_id từ query parameters của URL, ví dụ: ?field_id=1
        field_id = self.request.query_params.get('field_id')
        all_major_id = self.request.query_params.get('all_major_id')

        queryset = AllMajorOfAllSchool.objects.all()

        if field_id:
            # Lọc queryset dựa trên field_id
            # Lưu ý: 'field__field_id' cần phải phù hợp với tên trường trong mô hình của bạn
            queryset = queryset.filter(field__field_id=field_id)
        if all_major_id:
            # Lọc queryset dựa trên field_id
            # Lưu ý: 'field__field_id' cần phải phù hợp với tên trường trong mô hình của bạn
            queryset = queryset.filter(all_major_id=all_major_id)

        return queryset

    @action(detail=True, methods=['get'])
    def schools_teaching_major(self, request, pk=None):
        """
        API tối ưu để lấy danh sách trường có dạy ngành cụ thể.
        """
        try:
            # Lấy ngành từ pk
            major = self.get_object()
            major_id = major.all_major_id
            
            # Tối ưu hóa query để lấy trường có dạy ngành này
            from django.db.models import Q
            from .models import School, Major
            
            # Lọc trường có ngành tương ứng
            schools = School.objects.filter(
                school_major__major_id__icontains=major_id
            ).select_related().prefetch_related(
                'school_major'
            ).distinct()
            
            # Serialize dữ liệu tối thiểu
            schools_data = []
            for school in schools:
                # Lấy điểm chuẩn của ngành tại trường này
                major_at_school = school.school_major.filter(
                    major_id__icontains=major_id
                ).first()
                
                # Lấy điểm chuẩn gần nhất
                latest_score = None
                if major_at_school:
                    latest_score = major_at_school.admission_scores.order_by('-year').first()
                
                schools_data.append({
                    'id': school.id,
                    'name': school.name_vn,
                    'short_code': school.short_code,
                    'logo': school.logo,
                    'school_type': school.school_type,
                    'country': school.country,
                    'admission_score': latest_score.score if latest_score else None,
                    'score_year': latest_score.year if latest_score else None,
                    'major_id_at_school': major_at_school.major_id if major_at_school else None,
                    'tuition_min': major_at_school.min_tuition_fee_per_year if major_at_school else school.start,
                    'tuition_max': major_at_school.max_tuition_fee_per_year if major_at_school else school.end,
                })
            
            # Sắp xếp theo điểm chuẩn (cao nhất trước)
            schools_data.sort(key=lambda x: (x['admission_score'] or 0), reverse=True)
            
            return Response({
                'major_id': major_id,
                'major_name': major.name,
                'schools': schools_data[:20]  # Giới hạn 20 trường đầu
            })
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=500)

    @action(detail=False, methods=['get'])
    def schools_by_major_id(self, request):
        """
        API tối ưu để lấy trường theo mã ngành cụ thể.
        So khớp all_major_id với major_id trong bảng Major để lấy trường có dạy ngành.
        """
        all_major_id = request.query_params.get('all_major_id', None)
        if not all_major_id:
            return Response({'error': 'Missing all_major_id parameter'}, status=400)
        
        try:
            from django.db.models import Q
            from .models import School, Major
            
            # Bước 1: Tìm các major có major_id chứa all_major_id
            majors = Major.objects.filter(
                major_id__icontains=all_major_id
            ).select_related('school').prefetch_related(
                'admission_scores'
            )
            
            print(f"Found {majors.count()} majors with major_id containing {all_major_id}")
            
            # Bước 2: Lấy danh sách trường từ các major tìm được
            schools_data = []
            seen_school_ids = set()
            
            for major in majors:
                school = major.school
                
                # Tránh trùng lặp trường
                if school.id in seen_school_ids:
                    continue
                seen_school_ids.add(school.id)
                
                # Lấy điểm chuẩn gần nhất của ngành tại trường này
                latest_score = major.admission_scores.order_by('-year').first()
                
                schools_data.append({
                    'id': school.id,
                    'name': school.name_vn,
                    'short_code': school.short_code,
                    'logo': school.logo,
                    'school_type': school.school_type,
                    'country': school.country,
                    'tag': school.tag,
                    'admission_score': latest_score.score if latest_score else None,
                    'score_year': latest_score.year if latest_score else None,
                    'major_id_at_school': major.major_id,
                    'tuition_min': major.min_tuition_fee_per_year if major.min_tuition_fee_per_year else school.start,
                    'tuition_max': major.max_tuition_fee_per_year if major.max_tuition_fee_per_year else school.end,
                })
            
            # Sắp xếp theo điểm chuẩn (cao nhất trước)
            schools_data.sort(key=lambda x: (x['admission_score'] or 0), reverse=True)
            
            print(f"Returning {len(schools_data)} schools for major {all_major_id}")
            
            return Response({
                'all_major_id': all_major_id,
                'schools': schools_data  # Bỏ giới hạn, hiển thị tất cả
            })
            
        except Exception as e:
            print(f"Error in schools_by_major_id: {str(e)}")
            return Response({
                'error': str(e)
            }, status=500)




# ---
## Partner AllMajorOfAllSchool
# ---
class AllMajorViewByFieldHasPagi(viewsets.ModelViewSet, generics.ListAPIView):
    serializer_class = AllMajorOfAllSchoolSerializer
    pagination_class = AllMajorPagination
    filterset_class = AllMajorFilter
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]

    ordering_fields = ['name', 'opportunities', 'tag']

    def get_queryset(self):
        queryset = AllMajorOfAllSchool.objects.all()

        ordering_param = self.request.query_params.get('ordering')

        # --- Logic SẮP XẾP HỌC PHÍ TÙY CHỈNH ĐÃ FIX ---
        # Hàm helper mới, trả về một tuple để sắp xếp chính xác
        def get_tuition_sort_key(tuition_str):
            if not tuition_str:
                return (2, 999999999) # Ưu tiên thấp, giá trị cao (xếp cuối)

            # Ưu tiên cao nhất cho các ngành miễn phí
            if 'miễn phí' in tuition_str.lower():
                return (0, 0) # Ưu tiên 0, giá trị 0 (xếp đầu tiên)

            # Với các ngành có số, ưu tiên thấp hơn (1)
            numbers = re.findall(r'\d+', tuition_str)
            if numbers:
                return (1, int(numbers[0])) # Ưu tiên 1, giá trị là số học phí

            return (2, 999999999) # Các trường hợp còn lại xếp cuối cùng

        if ordering_param in ['tuition_fee_per_year', '-tuition_fee_per_year']:
            majors_list = list(queryset)

            reverse_order = ordering_param.startswith('-')

            # Sử dụng hàm helper mới để sắp xếp
            sorted_majors = sorted(majors_list, key=lambda major: get_tuition_sort_key(major.tuition_fee_per_year), reverse=reverse_order)

            pks_ordered = [major.pk for major in sorted_majors]

            preserved_order = Case(*[When(pk=pk, then=Value(i)) for i, pk in enumerate(pks_ordered)])
            queryset = AllMajorOfAllSchool.objects.filter(pk__in=pks_ordered).order_by(preserved_order)

            return queryset

        # --- Ưu tiên sắp xếp theo opportunities giảm dần nếu không có ordering ---
        if not ordering_param:
            return queryset.order_by('-opportunities', 'name')

        # --- Logic SẮP XẾP MẶC ĐỊNH (nếu không có sắp xếp tùy chỉnh) ---
        tag_order = ['hot', 'find', 'grown', 'push', 'normal']
        tag_ordering = Case(*[When(tag=tag_name, then=Value(i)) for i, tag_name in enumerate(tag_order)],
                            output_field=IntegerField())
        return queryset.order_by(tag_ordering)



class OutstandingSchoolViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet chỉ để đọc (Read-Only) cho mô hình School,
    chỉ hiển thị các trường có tag = 'outstanding'.
    Xuất ra tên trường và logo.
    """
    queryset = School.objects.filter(tag='outstanding')
    serializer_class = SchoolOutstandingSerializer
    permission_classes = [AllowAny]


class SchoolOptimizedViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet tối ưu cho School, không bao gồm majors_data để tăng tốc độ tải.
    Được sử dụng cho trang danh sách trường.
    """
    queryset = School.objects.all()
    serializer_class = SchoolOptimizedSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SchoolFilter
    search_fields = [
        'name_en',
        'name_vn',
        'short_code',
        'admission_code',
        'address'
    ]
    ordering_fields = [
        'name_vn',
        'established_year',
        'quota_per_year',
        'start',
        'end',
        'benchmark_min',
        'benchmark_max'
    ]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        # Lấy queryset ban đầu
        queryset = School.objects.all()
        
        # Tối ưu hóa với select_related nếu cần
        if self.action == 'list':
            queryset = queryset.select_related('album')
        
        # Áp dụng ordering mặc định
        ordering = self.request.query_params.get('ordering', None)
        if not ordering:
            # Ordering mặc định: outstanding trước, sau đó theo tên
            queryset = queryset.extra(
                select={'tag_order': "CASE WHEN tag = 'outstanding' THEN 0 ELSE 1 END"}
            ).order_by('tag_order', 'name_vn')
        
        return queryset

    @method_decorator(cache_page(60 * 15))  # Cache 15 phút
    @method_decorator(vary_on_cookie)
    def list(self, request, *args, **kwargs):
        """
        List tất cả trường với cache để tăng tốc độ.
        """
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def fast_list(self, request):
        """
        API tối ưu cho danh sách trường - chỉ trả về dữ liệu cần thiết.
        """
        # Sử dụng cache key
        cache_key = f"schools_fast_list_{request.query_params}"
        
        # Thử lấy từ cache trước
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Nếu không có cache, query database
        schools = self.get_queryset()
        
        # Serialize với dữ liệu tối thiểu
        data = []
        for school in schools:
            data.append({
                'id': school.id,
                'name_vn': school.name_vn,
                'short_code': school.short_code,
                'logo': school.logo,
                'school_type': school.school_type,
                'country': school.country,
                'start': school.start,
                'end': school.end,
                'tag': school.tag,
                'benchmark_min': school.benchmark_min,
                'benchmark_max': school.benchmark_max,
            })
        
        # Lưu vào cache 10 phút
        cache.set(cache_key, data, 60 * 10)
        
        return Response(data)


class SchoolMajorsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet chuyên dụng để lấy dữ liệu ngành của trường.
    Được sử dụng khi cần hiển thị danh sách ngành của một trường cụ thể.
    """
    queryset = School.objects.all()
    serializer_class = SchoolMajorsSerializer
    permission_classes = [AllowAny]
    pagination_class = MajorPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SchoolMajorsFilter
    
    # Các trường có thể tìm kiếm
    search_fields = [
        'school_major__name',          # Tìm kiếm theo tên ngành
        'school_major__major_id',      # Tìm kiếm theo mã ngành
    ]

    # Các trường có thể sắp xếp
    ordering_fields = [
        'school_major__name',
        'school_major__min_tuition_fee_per_year',
        'school_major__max_tuition_fee_per_year',
        'school_major__status',
        'school_major__tags'
    ]

    def get_queryset(self):
        """
        Tùy chỉnh queryset để chỉ lấy trường và ngành của trường đó.
        """
        queryset = super().get_queryset()
        
        # Lấy school_id từ query parameters
        school_id = self.request.query_params.get('school_id')
        if school_id:
            queryset = queryset.filter(id=school_id)
        
        # Prefetch majors để tối ưu performance
        queryset = queryset.prefetch_related('school_major')
        
        return queryset

    @action(detail=True, methods=['get'])
    @method_decorator(cache_page(60*10))  # Cache 10 phút
    def majors(self, request, pk=None):
        """
        Lấy danh sách ngành của trường cụ thể với phân trang.
        """
        school = self.get_object()
        majors = school.school_major.all()
        
        # Áp dụng phân trang
        page = self.paginate_queryset(majors)
        if page is not None:
            serializer = MajorSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MajorSerializer(majors, many=True)
        return Response(serializer.data)


# ---
## Chat ViewSets
# ---
class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatRoom model
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """
        Return chat rooms where current user is a participant
        """
        return ChatRoom.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related('participants', 'messages').distinct()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer
    
    def perform_create(self, serializer):
        """
        Create a new chat room and add current user as participant
        """
        room = serializer.save()
        room.participants.add(self.request.user)
        return room
    
    @action(detail=False, methods=['post'])
    def create_or_get_private_room(self, request):
        """
        Create or get existing private chat room with another user
        """
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id is required'}, status=400)
        
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        
        if other_user == request.user:
            return Response({'error': 'Cannot create room with yourself'}, status=400)
        
        # Check if private room already exists
        existing_room = ChatRoom.objects.filter(
            room_type='private',
            participants=request.user
        ).filter(
            participants=other_user
        ).first()
        
        if existing_room:
            serializer = ChatRoomSerializer(existing_room, context={'request': request})
            return Response(serializer.data)
        
        # Create new private room
        room = ChatRoom.objects.create(room_type='private')
        room.participants.add(request.user, other_user)
        
        serializer = ChatRoomSerializer(room, context={'request': request})
        return Response(serializer.data, status=201)
    
    @action(detail=True, methods=['post'])
    def mark_messages_read(self, request, pk=None):
        """
        Mark all messages in room as read for current user
        """
        room = self.get_object()
        updated_count = room.messages.filter(
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        
        return Response({'marked_read': updated_count})
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete chat room - only participants can delete
        """
        room = self.get_object()
        
        # Check if user is a participant
        if request.user not in room.participants.all():
            return Response({'error': 'Bạn không có quyền xóa cuộc trò chuyện này'}, status=403)
        
        # Soft delete - mark as inactive instead of hard delete
        room.is_active = False
        room.save()
        
        return Response({'message': 'Cuộc trò chuyện đã được xóa thành công'}, status=200)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message model
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """
        Return messages from rooms where current user is a participant
        Exclude messages that are deleted for the current user
        """
        room_id = self.request.query_params.get('room_id')
        queryset = Message.objects.filter(
            room__participants=self.request.user,
            is_deleted=False
        ).exclude(
            deleted_for_users=self.request.user
        ).select_related('sender', 'room').prefetch_related('reactions')
        
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """
        Create a new message and set sender to current user
        """
        room = serializer.validated_data['room']
        reply_to_id = self.request.data.get('reply_to')
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.filter(room=room).get(id=reply_to_id)
            except Message.DoesNotExist:
                reply_to = None
        
        # Check if user is participant of the room
        if not room.participants.filter(id=self.request.user.id).exists():
            raise PermissionDenied("You are not a participant of this room")
        
        serializer.save(sender=self.request.user, reply_to=reply_to)
        
        # Update room's updated_at timestamp
        room.save(update_fields=['updated_at'])
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark a specific message as read
        """
        message = self.get_object()
        if message.sender != request.user:
            message.mark_as_read()
        return Response({'status': 'marked_read'})

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add or toggle a reaction for a message"""
        message = self.get_object()
        reaction = request.data.get('reaction')
        if reaction not in ['like', 'love', 'haha']:
            return Response({'detail': 'Invalid reaction'}, status=status.HTTP_400_BAD_REQUEST)

        # Toggle: if same reaction exists, remove; else set/update
        existing = MessageReaction.objects.filter(message=message, user=request.user).first()
        if existing and existing.reaction == reaction:
            existing.delete()
            action_status = 'removed'
        else:
            MessageReaction.objects.update_or_create(
                message=message, user=request.user,
                defaults={'reaction': reaction}
            )
            action_status = 'set'

        # Return updated counts
        counts = {}
        for r in message.reactions.all():
            counts[r.reaction] = counts.get(r.reaction, 0) + 1

        return Response({'status': action_status, 'reactions': counts})
    
    @action(detail=True, methods=['post'])
    def delete_for_me(self, request, pk=None):
        """
        Delete message for current user only (delete for me)
        """
        message = self.get_object()
        
        # Check if user is participant of the room
        if not message.room.participants.filter(id=request.user.id).exists():
            raise PermissionDenied("You are not a participant of this room")
        
        # Delete message for current user
        message.delete_for_user(request.user)
        
        return Response({
            'status': 'deleted_for_me',
            'message': 'Message deleted for you only'
        })
    
    @action(detail=True, methods=['post'])
    def restore_for_me(self, request, pk=None):
        """
        Restore message for current user (undo delete for me)
        """
        message = self.get_object()
        
        # Check if user is participant of the room
        if not message.room.participants.filter(id=request.user.id).exists():
            raise PermissionDenied("You are not a participant of this room")
        
        # Restore message for current user
        message.restore_for_user(request.user)
        
        return Response({
            'status': 'restored_for_me',
            'message': 'Message restored for you'
        })


class ChatUserStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatUserStatus model
    """
    serializer_class = ChatUserStatusSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return status of users that have chatted with current user
        """
        # Get users who are in same chat rooms as current user
        room_participants = User.objects.filter(
            chat_rooms__participants=self.request.user
        ).exclude(id=self.request.user.id).distinct()
        
        return ChatUserStatus.objects.filter(user__in=room_participants)
    
    @action(detail=False, methods=['post'])
    def update_status(self, request):
        """
        Update current user's chat status
        """
        status = request.data.get('status', 'online')
        user_status, created = ChatUserStatus.objects.get_or_create(
            user=request.user,
            defaults={'status': status}
        )
        
        if not created:
            user_status.status = status
            user_status.save()
        
        serializer = ChatUserStatusSerializer(user_status)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def set_typing(self, request):
        """
        Set user as typing in a specific room
        """
        room_id = request.data.get('room_id')
        is_typing = request.data.get('is_typing', True)
        
        if not room_id:
            return Response({'error': 'room_id is required'}, status=400)
        
        try:
            room = ChatRoom.objects.get(id=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Room not found'}, status=404)
        
        user_status, created = ChatUserStatus.objects.get_or_create(
            user=request.user,
            defaults={'status': 'online'}
        )
        
        if is_typing:
            user_status.is_typing_in_room = room
        else:
            user_status.is_typing_in_room = None
        
        user_status.save()
        
        return Response({'status': 'updated'})


class OnlineUsersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet to get list of online users for chat
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']
    
    def get_queryset(self):
        """
        Return active users excluding current user
        """
        return User.objects.filter(
            is_active_user=True
        ).exclude(id=self.request.user.id).select_related('chat_status')


# --- Views cho đăng ký/đăng nhập đơn giản ---
@api_view(['POST'])
@permission_classes([AllowAny])
def simple_registration_view(request):
    """
    Đăng ký tài khoản đơn giản với email, họ tên, password
    """
    serializer = SimpleRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            # Tạo token cho user mới
            tokens = get_tokens_for_user(user)
            
            return Response({
                'message': 'Đăng ký thành công!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'tokens': tokens
            }, status=201)
        except Exception as e:
            return Response({
                'error': 'Có lỗi xảy ra khi tạo tài khoản',
                'detail': str(e)
            }, status=400)
    else:
        return Response({
            'error': 'Dữ liệu không hợp lệ',
            'details': serializer.errors
        }, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def simple_login_view(request):
    """
    Đăng nhập đơn giản với email và password
    """
    serializer = SimpleLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Đăng nhập thành công!',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            },
            'tokens': tokens
        })
    else:
        return Response({
            'error': 'Thông tin đăng nhập không đúng',
            'details': serializer.errors
        }, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users_by_email(request):
    """
    Tìm kiếm người dùng theo email để chat
    """
    email = request.GET.get('email', '').strip()
    
    if not email:
        return Response({
            'error': 'Email không được để trống'
        }, status=400)
    
    try:
        # Tìm kiếm người dùng theo email (không phân biệt hoa thường)
        users = User.objects.filter(
            email__icontains=email,
            is_active_user=True
        ).exclude(id=request.user.id)  # Loại trừ chính mình
        
        # Giới hạn kết quả tìm kiếm
        users = users[:10]
        
        # Serialize kết quả
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'full_name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
                'user_photo': user.user_photo or '',
                'is_online': hasattr(user, 'chat_status') and user.chat_status.status == 'online'
            })
        
        return Response({
            'users': user_data,
            'count': len(user_data)
        })
        
    except Exception as e:
        return Response({
            'error': 'Có lỗi xảy ra khi tìm kiếm',
            'detail': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Lấy thông tin user hiện tại
    """
    try:
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'full_name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
            'role': user.role,
            'user_photo': user.user_photo or '',
            'is_active': user.is_active_user,
            'date_of_birth': str(user.date_of_birth) if user.date_of_birth else None,
            'living_place': user.living_place or '',
            'sex': user.sex or ''
        })
    except Exception as e:
        return Response({
            'error': 'Có lỗi xảy ra khi lấy thông tin user',
            'detail': str(e)
        }, status=500)


# --- ViewSets cho tracking lượt xem ---
class SchoolViewCountViewSet(viewsets.ModelViewSet):
    queryset = SchoolViewCount.objects.all().order_by('-view_count')
    serializer_class = SchoolViewCountSerializer
    permission_classes = [AllowAny]

class MajorViewCountViewSet(viewsets.ModelViewSet):
    queryset = MajorViewCount.objects.all().order_by('-view_count')
    serializer_class = MajorViewCountSerializer
    permission_classes = [AllowAny]

class DailyViewStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyViewStats.objects.all().order_by('-date')
    serializer_class = DailyViewStatsSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def increment_school_view(request):
    """
    Tăng lượt xem cho trường
    """
    school_id = request.data.get('school_id')
    if not school_id:
        return Response({'error': 'school_id là bắt buộc'}, status=400)
    
    try:
        school = School.objects.get(id=school_id)
        view_count, created = SchoolViewCount.objects.get_or_create(
            school=school,
            defaults={'view_count': 1}
        )
        
        if not created:
            view_count.view_count += 1
            view_count.save()
        
        # Cập nhật thống kê theo ngày
        today = timezone.now().date()
        daily_stats, created = DailyViewStats.objects.get_or_create(
            date=today,
            defaults={'total_school_views': 1}
        )
        
        if not created:
            daily_stats.total_school_views += 1
            daily_stats.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': f'Đã tăng lượt xem cho trường {school.name_vn}'
        })
        
    except School.DoesNotExist:
        return Response({'error': 'Không tìm thấy trường'}, status=404)
    except Exception as e:
        return Response({'error': f'Có lỗi xảy ra: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def increment_major_view(request):
    """
    Tăng lượt xem cho ngành
    """
    major_id = request.data.get('major_id')
    if not major_id:
        return Response({'error': 'major_id là bắt buộc'}, status=400)
    
    try:
        major = Major.objects.get(id=major_id)
        view_count, created = MajorViewCount.objects.get_or_create(
            major=major,
            defaults={'view_count': 1}
        )
        
        if not created:
            view_count.view_count += 1
            view_count.save()
        
        # Cập nhật thống kê theo ngày
        today = timezone.now().date()
        daily_stats, created = DailyViewStats.objects.get_or_create(
            date=today,
            defaults={'total_major_views': 1}
        )
        
        if not created:
            daily_stats.total_major_views += 1
            daily_stats.save()
        
        return Response({
            'success': True,
            'view_count': view_count.view_count,
            'message': f'Đã tăng lượt xem cho ngành {major.name}'
        })
        
    except Major.DoesNotExist:
        return Response({'error': 'Không tìm thấy ngành'}, status=404)
    except Exception as e:
        return Response({'error': f'Có lỗi xảy ra: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_schools(request):
    """
    Lấy danh sách top trường được xem nhiều nhất
    """
    limit = int(request.GET.get('limit', 10))
    
    # Lấy top trường theo lượt xem
    top_schools = SchoolViewCount.objects.select_related('school').order_by('-view_count')[:limit]
    
    # Thêm rank cho mỗi trường
    result = []
    for i, school_view in enumerate(top_schools, 1):
        school_data = TopSchoolsSerializer(school_view.school).data
        school_data['view_count'] = school_view.view_count
        school_data['rank'] = i
        result.append(school_data)
    
    return Response({
        'top_schools': result,
        'total': len(result)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def top_majors(request):
    """
    Lấy danh sách top ngành được xem nhiều nhất
    """
    limit = int(request.GET.get('limit', 10))
    
    # Lấy top ngành theo lượt xem
    top_majors = MajorViewCount.objects.select_related('major', 'major__school').order_by('-view_count')[:limit]
    
    # Thêm rank cho mỗi ngành
    result = []
    for i, major_view in enumerate(top_majors, 1):
        major_data = TopMajorsSerializer(major_view.major).data
        major_data['view_count'] = major_view.view_count
        major_data['rank'] = i
        result.append(major_data)
    
    return Response({
        'top_majors': result,
        'total': len(result)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def view_statistics(request):
    """
    Lấy thống kê tổng quan về lượt xem
    """
    # Tổng lượt xem trường
    total_school_views = SchoolViewCount.objects.aggregate(
        total=Sum('view_count')
    )['total'] or 0
    
    # Tổng lượt xem ngành
    total_major_views = MajorViewCount.objects.aggregate(
        total=Sum('view_count')
    )['total'] or 0
    
    # Thống kê 7 ngày gần nhất
    seven_days_ago = timezone.now().date() - timedelta(days=7)
    recent_stats = DailyViewStats.objects.filter(
        date__gte=seven_days_ago
    ).order_by('date')
    
    # Thống kê theo ngày
    daily_data = []
    for stat in recent_stats:
        daily_data.append({
            'date': stat.date.strftime('%Y-%m-%d'),
            'school_views': stat.total_school_views,
            'major_views': stat.total_major_views,
            'total_views': stat.total_school_views + stat.total_major_views
        })
    
    return Response({
        'total_school_views': total_school_views,
        'total_major_views': total_major_views,
        'total_views': total_school_views + total_major_views,
        'daily_stats': daily_data,
        'last_7_days': len(daily_data)
    })


