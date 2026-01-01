from django.utils import timezone
from django.db.models import Sum
from apps.tasks.models import Task
from apps.pomodoro.models import PomodoroSession

class TaskService:

    @staticmethod
    def get_active_session(task, user):
        return PomodoroSession.objects.filter(
            task=task,
            user=user,
            completed=False,
            is_break=False
        ).first()

    @staticmethod
    def start_task(task, user, duration_minutes):
        if TaskService.get_active_session(task, user):
            raise ValueError("Task already running")

        session = PomodoroSession.objects.create(
            task=task,
            user=user,
            started_at=timezone.now(),
            duration_minutes=duration_minutes
        )

        task.status = 'in_progress'
        task.started_at = task.started_at or timezone.now()
        task.save(update_fields=['status', 'started_at'])

        return session

    @staticmethod
    def pause_task(task, user):
        session = TaskService.get_active_session(task, user)
        if not session:
            raise ValueError("No active session")

        session.paused_at = timezone.now()
        session.save(update_fields=['paused_at'])

        task.status = 'paused'
        task.save(update_fields=['status'])

        return session

    @staticmethod
    def resume_task(task, user):
        session = TaskService.get_active_session(task, user)
        if not session or not session.paused_at:
            raise ValueError("No paused session")

        session.resumed_at = timezone.now()
        session.paused_at = None
        session.save(update_fields=['paused_at', 'resumed_at'])

        task.status = 'in_progress'
        task.save(update_fields=['status'])

        return session

    @staticmethod
    def complete_task(task, user):
        session = TaskService.get_active_session(task, user)
        if not session:
            raise ValueError("No active session")

        now = timezone.now()
        session.ended_at = now
        session.completed = True
        session.actual_duration_seconds = int(
            (now - session.started_at).total_seconds()
        )
        session.save()

        total_focus = PomodoroSession.objects.filter(
            task=task,
            completed=True,
            is_break=False
        ).aggregate(
            total=Sum('actual_duration_seconds')
        )['total'] or 0

        task.status = 'completed'
        task.ended_at = now
        task.total_focus_seconds = total_focus
        task.save()

        return task
