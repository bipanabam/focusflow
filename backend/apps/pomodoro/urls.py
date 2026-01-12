from django.urls import path
from apps.pomodoro import views

urlpatterns = [
    path('active-session/', views.ActiveSessionAPIView.as_view()),
    path('active-session/<int:task_id>/', views.ActiveSessionAPIView.as_view()),
    path('sessions/<int:pk>/complete/', views.CompleteSessionAPIView.as_view()),
    path("break/start/", views.StartBreakAPIView.as_view()),
    path('sessions/<int:task_id>/', views.TaskSessionsView.as_view(), name='task-sessions'),
    path('heartbeat/', views.PomodoroHeartbeatAPIView.as_view()),
]