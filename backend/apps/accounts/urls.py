from django.urls import path
from apps.accounts import views

urlpatterns = [
    path('register/', views.UserCreateView.as_view(), name='user-register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.logout, name='logout'),
    path('authenticated/', views.authenticated, name='authenticated'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('settings/password/', views.UserSettingsView.as_view(), name='change-password'),
    path("settings/pomodoro/", views.PomodoroSettingsView.as_view()),
    path("timezones/", views.timezone_list),
]