from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.pomodoro.models import PomodoroSession

class PomodoroService:

    @staticmethod
    def get_active_session(user):
        return PomodoroSession.objects.filter(
            user=user,
            completed=False
        ).first()

    @staticmethod
    def start_focus(task, user, duration_minutes=25):
        if PomodoroService.get_active_session(user):
            raise ValidationError("Active session already exists")

        session = PomodoroSession.objects.create(
            task=task,
            user=user,
            started_at=timezone.now(),
            duration_minutes=duration_minutes,
            is_break=False
        )

        task.status = 'in_progress'
        task.started_at = task.started_at or timezone.now()
        task.save(update_fields=['status', 'started_at'])

        return session
    
    @staticmethod
    def start_break(user, break_type, duration_minutes):
        if PomodoroService.get_active_session(user):
            raise ValidationError("Active session already exists")

        return PomodoroSession.objects.create(
            user=user,
            is_break=True,
            break_type=break_type,
            duration_minutes=duration_minutes,
            started_at=timezone.now()
        )


    @staticmethod
    def complete_session(session):
        if session.completed:
            raise ValidationError("Session already completed")

        session.ended_at = timezone.now()
        session.completed = True
        session.actual_duration_seconds = int(
            (session.ended_at - session.started_at).total_seconds()
        )
        session.save()

        return session
