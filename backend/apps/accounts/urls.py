from django.urls import path
from apps.accounts.views import UserCreateView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
]