from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.pomodoro.models import PomodoroSession
from apps.pomodoro.serializers import PomodoroSessionSerializer
from apps.pomodoro.services import PomodoroService

class ActiveSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = PomodoroService.get_active_session(request.user)
        if not session:
            return Response(status=404)
        return Response(PomodoroSessionSerializer(session).data)

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
    
# class StartPomodoroAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, task_id):
#         task = Task.objects.get(id=task_id, owner=request.user)
#         session = PomodoroService.start_focus(
#             task,
#             request.user,
#             request.data.get('duration', 25)
#         )
#         return Response(PomodoroSessionSerializer(session).data

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
