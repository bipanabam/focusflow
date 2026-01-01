from django.db import models
from apps.tasks.models import Task
from apps.accounts.models import User

# Create your models here.
class PomodoroSession(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    
    paused_at = models.DateTimeField(null=True, blank=True)
    resumed_at = models.DateTimeField(null=True, blank=True)
    
    duration_minutes = models.IntegerField(default=25)
    actual_duration_seconds = models.IntegerField(null=True, blank=True)
    
    is_break = models.BooleanField(default=False)
    break_type = models.CharField(max_length=10, null=True, blank=True)
    completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pomodoro_sessions'
        ordering = ['-started_at']
