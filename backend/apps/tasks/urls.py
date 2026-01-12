from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.tasks import views

urlpatterns = [
    path('<int:pk>/start/', views.StartTaskAPIView.as_view(), name='start_task'),
    path('<int:pk>/pause/', views.PauseTaskAPIView.as_view(), name='pause_task'),
    path('<int:pk>/resume/', views.ResumeTaskAPIView.as_view(), name='resume_task'),
    path('<int:pk>/complete/', views.CompleteTaskAPIView.as_view(), name='complete_task'),
]

router = DefaultRouter()
router.register('', views.TaskViewSet, basename='task')
urlpatterns += router.urls