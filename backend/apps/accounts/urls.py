from django.urls import path
from apps.accounts.views import UserCreateView, CustomTokenObtainPairView, CustomTokenRefreshView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    
]