from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count

from apps.tasks.models import Task
from apps.pomodoro.models import PomodoroSession, PomodoroPause
from apps.pomodoro.utils import broadcast_task_event

class ActivePomodoroExists(Exception):
    def __init__(self, session):
        self.session = session

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
    @transaction.atomic
    def start_task(task, user, duration_minutes):
        session = TaskService.get_active_session(task, user)
        active_session = (
            PomodoroSession.objects
            .select_for_update()
            .filter(user=user, completed=False, is_break=False)
            .first()
        )
        if active_session:
            broadcast_task_event(user.id, active_session)
            return task, active_session
        if session:
            return task, session
        
        session = PomodoroSession.objects.create(
            task=task,
            user=user,
            started_at=timezone.now(),
            duration_minutes=duration_minutes
        )

        task.status = 'in_progress'
        task.started_at = task.started_at or timezone.now()
        task.save(update_fields=['status', 'started_at'])
        
        broadcast_task_event(user.id, session)
        return task, session

    @transaction.atomic
    def pause_task(task, user):
        session = TaskService.get_active_session(task, user)

        if not session:
            raise ValueError("No running session")
        
        if session.pauses.filter(resumed_at__isnull=True).exists():
            return task, session

        PomodoroPause.objects.create(
            session=session,
            paused_at=timezone.now()
        )

        task.status = "paused"
        task.save(update_fields=["status"])
        
        broadcast_task_event(user.id, session)

        return task, session
    
    @transaction.atomic
    def resume_task(task, user):
        session = TaskService.get_active_session(task, user)

        pause = session.pauses.filter(resumed_at__isnull=True).last()
        if not pause:
            return task, session

        pause.resumed_at = timezone.now()
        pause.save(update_fields=["resumed_at"])

        task.status = "in_progress"
        task.save(update_fields=["status"])
        
        broadcast_task_event(user.id, session)

        return task, session

    
    # @transaction.atomic
    # def complete_task(task, user):
    #     session = TaskService.get_active_session(task, user)
    #     if not session:
    #         raise ValueError("No active session")

    #     now = timezone.now()

    #     # If user completes while paused, close the pause
    #     if session.paused_at:
    #         paused_seconds = int((now - session.paused_at).total_seconds())
    #         session.paused_duration_seconds += paused_seconds
    #         session.paused_at = None

    #     session.completed = True
    #     session.ended_at = now
    #     session.actual_duration_seconds = session.elapsed_seconds
    #     session.save()

    #     totals = PomodoroSession.objects.filter(
    #         task=task,
    #         completed=True,
    #         is_break=False
    #     ).aggregate(
    #         total_focus=Sum("actual_duration_seconds"),
    #         completed_count=Count("id")
    #     )

    #     task.status = "completed"
    #     task.ended_at = now
    #     task.total_focus_seconds = totals["total_focus"] or 0
    #     task.save()

    #     broadcast_task_event(
    #         user_id=user.id,
    #         event_type="SESSION_COMPLETED",
    #         session=session
    #     )

        # return task
    
    @transaction.atomic
    def complete_task(task, user):
        session = TaskService.get_active_session(task, user)

        if not session or session.completed:
            return task

        now = timezone.now()

        # Close any ongoing pause
        ongoing_pause = session.pauses.filter(resumed_at__isnull=True).last()
        if ongoing_pause:
            ongoing_pause.resumed_at = now
            ongoing_pause.save(update_fields=["resumed_at"])

        session.ended_at = now
        session.completed = True
        session.actual_duration_seconds = session.elapsed_seconds
        session.save()

        totals = PomodoroSession.objects.filter(
            task=task,
            completed=True,
            is_break=False
        ).aggregate(total=Sum("actual_duration_seconds"))

        task.status = "completed"
        task.ended_at = now
        task.total_focus_seconds = totals["total"] or 0
        task.save(update_fields=["status", "ended_at", "total_focus_seconds"])

        broadcast_task_event(user.id, session)
        return task
