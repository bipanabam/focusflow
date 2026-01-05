from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Q

from apps.tasks.models import Task
from apps.tasks.serializers import TaskSerializer, TaskStatusSerializer
from apps.tasks.services import TaskService
from apps.tasks.filters import TaskFilter
from apps.tasks.services import ActivePomodoroExists

from apps.pomodoro.serializers import PomodoroSessionSerializer

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
            
        qs = qs.annotate(
            focus_duration_seconds=Sum(
                "pomodoro_sessions__actual_duration_seconds",
                filter=Q(
                    pomodoro_sessions__is_break=False,
                    pomodoro_sessions__completed=True
                )
            )
        )
        return qs
   
class StartTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        duration_minutes = request.user.get_focus_duration_minutes()
        
        try:
            task, session = TaskService.start_task(
                task,
                request.user,
                duration_minutes=duration_minutes,
            )
        except ActivePomodoroExists as e:
            return Response(
                {
                    "error": "ACTIVE_POMODORO_EXISTS",
                    "message": "You already have an active pomodoro running.",
                    "session_id": e.session.id,
                    "task_id": e.session.task_id
                },
                status=status.HTTP_409_CONFLICT
            )

        return Response({
            "task": TaskStatusSerializer(task).data,
            "pomodoro_session": PomodoroSessionSerializer(session).data
        },
        status=status.HTTP_201_CREATED) 
          
class PauseTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        task, session = TaskService.pause_task(task, request.user)

        return Response({
            "id": task.id,
            "status": task.status,
            "paused_at": session.paused_at,
            "active_session": {
                "id": session.id,
                "paused_duration": session.elapsed_seconds
            }
        })
        
class ResumeTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        task = Task.objects.get(pk=pk, owner=request.user)
        task, session = TaskService.resume_task(task, request.user)

        return Response({
            "id": task.id,
            "status": task.status,
            "resumed_at": timezone.now(),
            "active_session": {
                "id": session.id,
                "remaining_seconds": session.remaining_seconds
            }
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
