# apps/pomodoro/serializers.py
from rest_framework import serializers
from django.utils import timezone
from apps.pomodoro.models import PomodoroSession
class PomodoroSessionSerializer(serializers.ModelSerializer):
    ends_at = serializers.DateTimeField(read_only=True)
    elapsed_seconds = serializers.IntegerField(read_only=True)
    remaining_seconds = serializers.IntegerField(read_only=True)

    class Meta:
        model = PomodoroSession
        fields = [
            "id",
            "started_at",
            "ends_at",
            "duration_minutes",
            "is_break",
            "elapsed_seconds",
            "remaining_seconds",
            "completed",
        ]
