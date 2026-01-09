from django.db import models
from django.utils import timezone
from django.db.models import Sum, F, Q, ExpressionWrapper, DurationField
from datetime import timedelta
from apps.tasks.models import Task
from apps.accounts.models import User

from apps.accounts.managers import UserTimezoneManager

# Create your models here.
class PomodoroSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='pomodoro_sessions', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    paused_at = models.DateTimeField(null=True, blank=True)
    paused_duration_seconds = models.IntegerField(default=0)

    # resumed_at = models.DateTimeField(null=True, blank=True)
    
    duration_minutes = models.IntegerField(default=25)
    actual_duration_seconds = models.IntegerField(null=True, blank=True)

    is_break = models.BooleanField(default=False)
    break_type = models.CharField(max_length=10, null=True, blank=True)
    completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = UserTimezoneManager()
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(completed=False, is_break=False),
                name="one_active_pomodoro_per_user"
            )
        ]
        
    @property
    def elapsed_seconds(self):
        """
        Total focused time in seconds (excluding pauses)
        """
        end_time = self.ended_at or timezone.now()

        total_seconds = (end_time - self.started_at).total_seconds()

        paused = self.pauses.filter(resumed_at__isnull=False).aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("resumed_at") - F("paused_at"),
                    output_field=DurationField(),
                )
            )
        )["total"]

        paused_seconds = paused.total_seconds() if paused else 0
        return max(0, int(total_seconds - paused_seconds))

    @property
    def remaining_seconds(self):
        return max(0, int(self.duration_minutes * 60) - int(self.elapsed_seconds))

class PomodoroPause(models.Model):
    session = models.ForeignKey(
        PomodoroSession,
        related_name="pauses",
        on_delete=models.CASCADE
    )
    paused_at = models.DateTimeField()
    resumed_at = models.DateTimeField(null=True)

    @property
    def duration_seconds(self):
        if not self.resumed_at:
            return 0
        return int((self.resumed_at - self.paused_at).total_seconds())