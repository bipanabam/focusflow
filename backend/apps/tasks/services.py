from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Count
from django.core.exceptions import ValidationError

from apps.tasks.models import Task

from apps.pomodoro.models import PomodoroSession, PomodoroPause
from apps.pomodoro.utils import broadcast_task_event, derive_session_state
from apps.pomodoro.services import PomodoroService
from apps.pomodoro.fsm import PomodoroFSM
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
            # is_break=False
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
        state = derive_session_state(session)
        
        if not PomodoroFSM.can_transition(state, "PAUSE"):
            raise ValidationError("Cannot pause in current state")

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
        state = derive_session_state(session)
        if not PomodoroFSM.can_transition(state, "RESUME"):
            raise ValidationError("Cannot resume")

        pause = session.pauses.filter(resumed_at__isnull=True).last()
        if not pause:
            return task, session

        pause.resumed_at = timezone.now()
        pause.save(update_fields=["resumed_at"])

        task.status = "in_progress"
        task.save(update_fields=["status"])
        
        broadcast_task_event(user.id, session)

        return task, session
    
    @transaction.atomic
    def complete_task(task, user):
        session = TaskService.get_active_session(task, user)
        now = timezone.now()
        state = derive_session_state(session)
        if not PomodoroFSM.can_transition(state, "COMPLETE"):
            raise ValidationError("Cannot complete")

        PomodoroService.complete_session(session, manual=True)

        totals = PomodoroSession.objects.filter(
            task=task,
            completed=True,
            is_break=False
        ).aggregate(total=Sum("actual_duration_seconds"))

        task.status = "completed"
        task.ended_at = now
        task.total_focus_seconds = totals["total"] or 0
        task.save(update_fields=["status", "ended_at", "total_focus_seconds"])

        # Broadcast with manual completion
        broadcast_task_event(user.id, session, manual_completion=True)

        return task
