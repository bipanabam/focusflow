from django.urls import path
from apps.accounts.views import UserCreateView, CustomTokenObtainPairView, CustomTokenRefreshView, logout, UserProfileView, UserSettingsView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', UserSettingsView.as_view(), name='change-password'),
]