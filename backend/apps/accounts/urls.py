from django.urls import path
from apps.accounts.views import UserCreateView, CustomTokenObtainPairView, CustomTokenRefreshView, logout, UserProfileView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]