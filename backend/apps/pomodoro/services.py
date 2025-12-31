from django.utils import timezone
from datetime import timedelta

from apps.pomodoro.models import PomodoroSession

class PomodoroService:
    @staticmethod
    def start_session(task, user, duration_minutes=25):
        """Create and start a new Pomodoro session"""
        session = PomodoroSession.objects.create(
            task=task,
            user=user,
            started_at=timezone.now(),
            duration_minutes=duration_minutes
        )
        
        # Update task status
        task.status = 'in_progress'
        if not task.started_at:
            task.started_at = timezone.now()
        task.save()
        
        return session
    
    @staticmethod
    def complete_session(session_id):
        """Mark session as completed and calculate duration"""
        session = PomodoroSession.objects.get(id=session_id)
        session.ended_at = timezone.now()
        session.completed = True
        
        # Calculate actual duration
        duration = (session.ended_at - session.started_at).total_seconds()
        session.actual_duration_seconds = int(duration)
        session.save()
        
        return session
    
    @staticmethod
    def get_active_session(user):
        """Get user's active session"""
        return PomodoroSession.objects.filter(
            user=user,
            ended_at__isnull=True,
            is_break=False
        ).first()