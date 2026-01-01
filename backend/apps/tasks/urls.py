from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.tasks import views

urlpatterns = [
    path('tasks/<int:pk>/start/', views.StartTaskAPIView.as_view(), name='start_task'),
]

router = DefaultRouter()
router.register('tasks', views.TaskViewSet, basename='task')
urlpatterns += router.urls