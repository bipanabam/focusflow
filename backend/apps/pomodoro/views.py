from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import F, Sum, ExpressionWrapper, DurationField

from apps.tasks.models import Task

from apps.pomodoro.serializers import PomodoroSessionSerializer
from apps.pomodoro.models import PomodoroSession
from apps.pomodoro.services import PomodoroService
from apps.pomodoro.utils import build_session_payload, derive_session_state

class ActiveSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id=None):
        """
        Return active session for the user, optionally filtered by task.
        """
        try:
            if task_id:
                task = Task.objects.get(pk=task_id, owner=request.user)
                session = PomodoroService.get_active_session(user=request.user, task=task)
            else:
                session = PomodoroService.get_active_session(user=request.user)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        if not session:
            return Response({"active": False}, status=status.HTTP_200_OK)

        # Calculate paused duration
        paused = session.pauses.filter(resumed_at__isnull=False).aggregate(
            total=Sum(
                ExpressionWrapper(F("resumed_at") - F("paused_at"), output_field=DurationField())
            )
        )["total"]
        paused_seconds = paused.total_seconds() if paused else 0
        
        fsm_state = derive_session_state(session)

        # Prepare the response dict
        data = {
            "id": session.id,
            "task_id": session.task.id if session.task else None,
            "fsm_state": fsm_state,
            "started_at": session.started_at,
            "ended_at": session.ended_at,
            "is_running": not session.pauses.filter(resumed_at__isnull=True).exists() and not session.completed,
            "completed": session.completed,
            "duration_minutes": session.duration_minutes,
            "total_duration_seconds": session.duration_minutes * 60,
            "paused_seconds": paused_seconds,
        }

        return Response(data, status=status.HTTP_200_OK)

class TaskSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        """
        Return all sessions for a task belonging to the current user.
        """
        user = request.user
        sessions_qs = PomodoroService.get_task_sessions(user=user, task_id=task_id)
        serializer = PomodoroSessionSerializer(sessions_qs, many=True)
        return Response(serializer.data)
    
class CompleteSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        session = PomodoroSession.objects.get(pk=pk, user=request.user)
        session.ended_at = timezone.now()
        session.completed = True
        session.actual_duration_seconds = int(
            (session.ended_at - session.started_at).total_seconds()
        )
        session.save()

        return Response(PomodoroSessionSerializer(session).data)
    
class PomodoroHeartbeatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = PomodoroService.get_active_session(request.user)

        if not session:
            return Response({
                "active": False,
                "fsm_state": "IDLE",
            })

        return Response({
            "active": True,
            **build_session_payload(session),
        })

class StartBreakAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        break_type = request.data.get("break_type")

        if break_type not in ["short", "long"]:
            return Response(
                {"detail": "Invalid break_type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enforce single active session
        if PomodoroSession.objects.filter(
            user=request.user,
            completed=False
        ).exists():
            return Response(
                {"detail": "Active session exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user pomodoro settings
        settings = getattr(
            request.user,
            "pomodoro_settings",
            {
                "short_break_minutes": 5,
                "long_break_minutes": 15
            }
        )

        duration = (
            settings["long_break_minutes"]
            if break_type == "long"
            else settings["short_break_minutes"]
        )

        session = PomodoroSession.objects.create(
            user=request.user,
            is_break=True,
            break_type=break_type,
            duration_minutes=duration,
            started_at=timezone.now()
        )

        serializer = PomodoroSessionSerializer(session)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
