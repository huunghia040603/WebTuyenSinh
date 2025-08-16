from django.urls import path, include
from rest_framework import routers
from .views import *
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)

# Create a default router
r = routers.DefaultRouter()

# Register each ViewSet with the router
r.register('users', UserViewSet, basename='users')
r.register('fieldgroups', FieldGroupViewSet, basename='fieldgroups')
r.register('majors-outstanding', OutstandingMajorViewSet, basename='majors-outstanding')
r.register('majors', AllMajorViewSet, basename='majors')
r.register('albums', AlbumViewSet, basename='albums')
r.register('images', ImageViewSet, basename='images')
r.register('schools', SchoolViewSet, basename='schools')
r.register('schools-optimized', SchoolOptimizedViewSet, basename='school-optimized')
r.register('school-majors', SchoolMajorsViewSet, basename='school-majors')
r.register('schools_outstanding', OutstandingSchoolViewSet, basename='schools_outstanding')
r.register('admission-scores', AdmissionScoreViewSet, basename='admission-scores')
r.register('admins', AdminViewSet, basename='admins')
r.register('staffs', StaffViewSet, basename='staffs')
r.register('partners', PartnerViewSet, basename='partners')
r.register('all_major', AllMajorViewByField, basename='all_major')
r.register('all_major_has_pagi', AllMajorViewByFieldHasPagi, basename='all_major_has_pagi')
r.register('xu-huong-nghe', XuHuongNgheViewSet, basename='xu-huong-nghe')
r.register('chat-rooms', ChatRoomViewSet, basename='chat-rooms')
r.register('messages', MessageViewSet, basename='messages')
r.register('chat-status', ChatUserStatusViewSet, basename='chat-status')
r.register('online-users', OnlineUsersViewSet, basename='online-users')

# Register ViewSets cho tracking lượt xem
r.register('school-view-counts', SchoolViewCountViewSet, basename='school-view-counts')
r.register('major-view-counts', MajorViewCountViewSet, basename='major-view-counts')
r.register('daily-view-stats', DailyViewStatsViewSet, basename='daily-view-stats')
r.register('expert-applications', ExpertApplicationViewSet, basename='expert-applications')
r.register('consultation-requests', ConsultationRequestViewSet, basename='consultation-requests')

urlpatterns = [
    # Include the router-generated URLs
    path('', include(r.urls)),
    # Also expose all API routes under /api/ to avoid conflicts with Flask routes
    path('api/', include(r.urls)),

    # Thêm URL cho GoogleSocialAuthView
    path('auth/google-social-auth/', GoogleSocialAuthView.as_view(), name='google-social-auth'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Registration endpoint
    path('auth/registration/', registration_view, name='registration'),

    # Simple registration/login endpoints
    path('auth/simple-register/', simple_registration_view, name='simple-registration'),
    path('auth/simple-login/', simple_login_view, name='simple-login'),

    # Chat search endpoint
    path('chat/search-users/', search_users_by_email, name='search-users-by-email'),

    # User info endpoint
    path('auth/me/', me_view, name='me'),

    # Tracking lượt xem endpoints
    path('tracking/increment-school-view/', increment_school_view, name='increment-school-view'),
    path('tracking/increment-major-view/', increment_major_view, name='increment-major-view'),
    path('tracking/top-schools/', top_schools, name='top-schools'),
    path('tracking/top-majors/', top_majors, name='top-majors'),
    path('tracking/statistics/', view_statistics, name='view-statistics'),



    # Gemini AI chat endpoint - Đã loại bỏ
    # path('api/gemini-chat/', gemini_chat, name='gemini-chat'),
]




# from django.contrib import admin
# from django.urls import path, include
# from rest_framework import routers
# from .views import *

# # Create a default router
# r = routers.DefaultRouter()

# # Register each ViewSet with the router
# r.register('users', UserViewSet, basename='users')
# r.register('fieldgroups', FieldGroupViewSet, basename='fieldgroups')
# r.register('majors-outstanding', OutstandingMajorViewSet, basename='majors-outstanding')
# r.register('majors', AllMajorViewSet, basename='majors')
# r.register('albums', AlbumViewSet, basename='albums')
# r.register('images', ImageViewSet, basename='images')
# r.register('schools', SchoolViewSet, basename='schools')
# r.register('schools_outstanding', OutstandingSchoolViewSet, basename='schools_outstanding')
# r.register('admission-scores', AdmissionScoreViewSet, basename='admission-scores')
# r.register('admins', AdminViewSet, basename='admins')
# r.register('staffs', StaffViewSet, basename='staffs')
# r.register('partners', PartnerViewSet, basename='partners')
# r.register('all_major', AllMajorViewByField, basename='all_major')
# r.register('all_major_has_pagi', AllMajorViewByFieldHasPagi, basename='all_major_has_pagi')


# # Configure urlpatterns for your application
# urlpatterns = [
#     # Include the router-generated URLs
#     path('', include(r.urls)),
#     path('account/', views.account_view, name='account'),
#     path('account/success/', views.account_success_view, name='account_success'),
#     path('auth/google/login/', views.GoogleLogin.as_view(), name='google_login'),
#     path('auth/facebook/login/', views.FacebookLogin.as_view(), name='facebook_login'),

#     # You can add other custom paths here if needed
#     # Example: path('custom-endpoint/', CustomAPIView.as_view()),
# ]
