from django.db import models
from django.utils import timezone
from django.db.models import Sum, Q
from datetime import timedelta
from apps.tasks.models import Task
from apps.accounts.models import User

# Create your models here.
class PomodoroSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='pomodoro_sessions', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    started_at = models.DateTimeField()
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
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=Q(completed=False, is_break=False),
                name="one_active_pomodoro_per_user"
            )
        ]
        
    @property
    def remaining_seconds(self):
        return max(0, self.duration_minutes * 60 - self.elapsed_seconds)
    
    @property
    def elapsed_seconds(self):
        end_time = self.ended_at or timezone.now()
        total = int((end_time - self.started_at).total_seconds())

        pause_seconds = sum(
            p.duration_seconds for p in self.pauses.all()
        )

        return max(0, total - pause_seconds)

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