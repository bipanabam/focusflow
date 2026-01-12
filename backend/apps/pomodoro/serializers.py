from rest_framework import serializers
from django.utils import timezone
from django.db.models import F, ExpressionWrapper, DurationField, Sum
from apps.pomodoro.models import PomodoroSession

class PomodoroSessionSerializer(serializers.ModelSerializer):
    ends_at = serializers.DateTimeField(read_only=True)
    actual_duration_seconds = serializers.IntegerField(read_only=True)
    elapsed_seconds = serializers.SerializerMethodField()
    remaining_seconds = serializers.SerializerMethodField()

    class Meta:
        model = PomodoroSession
        fields = [
            "id",
            "task",
            "started_at",
            "ended_at",
            "ends_at",
            "duration_minutes",
            "is_break",
            "elapsed_seconds",
            "remaining_seconds",
            "actual_duration_seconds",
            "completed",
        ]

    def get_elapsed_seconds(self, obj):
        if not obj.started_at:
            return 0
        now = timezone.now()
        paused = obj.pauses.filter(resumed_at__isnull=False).aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("resumed_at") - F("paused_at"),
                    output_field=DurationField(),
                )
            )
        )["total"]
        paused_seconds = paused.total_seconds() if paused else 0
        return int((now - obj.started_at).total_seconds() - paused_seconds)

    def get_remaining_seconds(self, obj):
        total = obj.duration_minutes * 60
        elapsed = self.get_elapsed_seconds(obj)
        remaining = total - elapsed
        return max(0, remaining)
