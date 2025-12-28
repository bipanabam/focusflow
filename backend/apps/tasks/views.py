from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.tasks.models import Task
from apps.tasks.serializers import TaskSerializer
from apps.tasks.filters import TaskFilter

# Create your views here.
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend]
    
    def get_queryset(self):
        qs =  super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(owner=self.request.user)
        return qs