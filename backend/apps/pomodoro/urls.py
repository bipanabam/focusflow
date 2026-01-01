from django.urls import path
from apps.pomodoro import views

urlpatterns = [
    path('active/', views.ActiveSessionAPIView.as_view()),
    path('sessions/<int:pk>/complete/', views.CompleteSessionAPIView.as_view()),
    path("break/start/", views.StartBreakAPIView.as_view()),
]