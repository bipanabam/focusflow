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
        
class PauseTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        session = TaskService.pause_task(task, request.user)

        return Response({
            "id": task.id,
            "status": task.status,
            "paused_at": session.paused_at
        })

class ResumeTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        session = TaskService.resume_task(task, request.user)

        return Response({
            "id": task.id,
            "status": task.status,
            "resumed_at": session.resumed_at,
        })

class CompleteTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        task = TaskService.complete_task(task, request.user)

        completed_pomodoros = task.pomodoro_sessions.filter(
            completed=True, is_break=False
        ).count()

        return Response({
            **TaskStatusSerializer(task).data,
            "completed_pomodoros": completed_pomodoros
        })
