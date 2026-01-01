# apps/pomodoro/serializers.py
from rest_framework import serializers
from django.utils import timezone
from apps.pomodoro.models import PomodoroSession

class PomodoroSessionSerializer(serializers.ModelSerializer):
    elapsed_seconds = serializers.SerializerMethodField()
    remaining_seconds = serializers.SerializerMethodField()

    class Meta:
        model = PomodoroSession
        fields = (
            'id', 'task', 'started_at', 'ended_at',
            'duration_minutes', 'actual_duration_seconds',
            'is_break', 'completed',
            'elapsed_seconds', 'remaining_seconds'
        )

    def get_elapsed_seconds(self, obj):
        end = obj.ended_at or timezone.now()
        return int((end - obj.started_at).total_seconds())

    def get_remaining_seconds(self, obj):
        total = obj.duration_minutes * 60
        return max(total - self.get_elapsed_seconds(obj), 0)
