from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.tasks import views

urlpatterns = []

router = DefaultRouter()
router.register('tasks', views.TaskViewSet, basename='task')
urlpatterns += router.urls