from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import F, ExpressionWrapper, DurationField, Sum
from apps.pomodoro.models import PomodoroSession, PomodoroPause

class PomodoroService:

    @staticmethod
    def get_active_session(user, task=None):
        """
        Return the active session for a user, optionally for a specific task.
        """
        qs = PomodoroSession.objects.filter(user=user, completed=False)
        if task:
            qs = qs.filter(task=task)
        return qs.first()

    @staticmethod
    def start_focus(task, user, duration_minutes=25):
        if PomodoroService.get_active_session(user, task):
            raise ValidationError("Active session already exists for this task")

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

        # calculate elapsed seconds accounting for pauses
        paused = session.pauses.filter(resumed_at__isnull=False).aggregate(
            total=Sum(
                ExpressionWrapper(
                    F("resumed_at") - F("paused_at"),
                    output_field=DurationField(),
                )
            )
        )["total"]

        paused_seconds = paused.total_seconds() if paused else 0

        session.actual_duration_seconds = int(
            (timezone.now() - session.started_at).total_seconds() - paused_seconds
        )
        session.save()

        return session
