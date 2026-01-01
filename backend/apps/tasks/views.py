from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.tasks.models import Task
from apps.tasks.serializers import TaskSerializer, TaskStatusSerializer
from apps.tasks.services import TaskService
from apps.tasks.filters import TaskFilter

from apps.pomodoro.serializers import PomodoroSessionSerializer

# Create your views here.
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TaskFilter
    filter_backends = [DjangoFilterBackend]
    
    def get_queryset(self):
        qs =  super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(owner=self.request.user)
        return qs
    

class StartTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        duration = request.data.get('pomodoro_duration', 25)
        print(duration)

        session = TaskService.start_task(task, request.user, duration)

        return Response({
            "task": TaskStatusSerializer(task).data,
            "pomodoro_session": PomodoroSessionSerializer(session).data
        })