from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import F, ExpressionWrapper, DurationField, Sum

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from apps.pomodoro.utils import broadcast_task_event

from apps.pomodoro.models import PomodoroSession, PomodoroPause
from apps.pomodoro.constants import DEFAULT_POMODORO_SETTINGS

channel_layer = get_channel_layer()

def ensure_session_not_expired(session):
    if not session:
        return None

    if session.completed:
        return session

    if session.remaining_seconds <= 0:
        PomodoroService.complete_session(session)

    return session

class PomodoroService:

    @staticmethod
    def get_active_session(user, task=None):
        """
        Return the active session for a user, optionally for a specific task.
        """
        qs = PomodoroSession.objects.filter(user=user, completed=False)
        if task:
            qs = qs.filter(task=task)
        session = qs.select_related("task").first()
        return ensure_session_not_expired(session)
    
    @staticmethod
    def get_task_sessions(user, task_id):
        """Return all the sessions of a task."""
        qs = PomodoroSession.objects.filter(user=user, task_id=task_id).all().order_by('created_at')
        return qs

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
    def complete_session(session, *, manual=False):
        if session.completed:
            raise ValidationError("Session already completed")
        
         # close any open pause
        ongoing_pause = session.pauses.filter(resumed_at__isnull=True).last()
        if ongoing_pause:
            ongoing_pause.resumed_at = timezone.now()
            ongoing_pause.save(update_fields=["resumed_at"])

        session.ended_at = timezone.now()
        session.completed = True

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

        # Only trigger FSM flow if NOT manual
        if not manual:
            PomodoroFlowService.handle_session_completion(session)

        return session
    
class PomodoroFlowService:
    
    @staticmethod
    def emit_transition(*, user, task, session):
        """
        Called whenever a NEW session is created or state changes.
        """
        # Broadcast session state to all clients
        broadcast_task_event(user.id, session)

    @staticmethod
    def emit_ready_for_focus(user, task):
        """
        No active session, but system expects next focus.
        """
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                "type": "pomodoro.event",
                "payload": {
                    "type": "READY_FOR_FOCUS",
                    "task_id": task.id,
                    "state": "IDLE",
                },
            }
        )

    @staticmethod
    def handle_session_completion(session):
        """
        Called whenever ANY pomodoro session ends.
        """
        if session.is_break:
            PomodoroFlowService._handle_break_completion(session)
        else:
            PomodoroFlowService._handle_focus_completion(session)

    @staticmethod
    def _handle_focus_completion(session):
        task = session.task
        user = session.user

        # Task might already be completed manually
        if task.status == "completed":
            return

        settings = user.pomodoro_settings or DEFAULT_POMODORO_SETTINGS

        completed_focus = task.pomodoro_sessions.filter(
            completed=True,
            is_break=False
        ).count()

        # Decide break type
        if completed_focus % settings["long_break_every"] == 0:
            break_type = "long"
            duration = settings["long_break_minutes"]
        else:
            break_type = "short"
            duration = settings["short_break_minutes"]

        break_session = PomodoroSession.objects.create(
            user=user,
            task=task,
            is_break=True,
            break_type=break_type,
            duration_minutes=duration,
            started_at=timezone.now(),
        )

        PomodoroFlowService.emit_transition(
            user=user,
            task=task,
            session=break_session,
        )

    @staticmethod
    def _handle_break_completion(session):
        task = session.task
        user = session.user

        # Task may have been completed during break
        if task.status == "completed":
            return

        settings = user.pomodoro_settings or DEFAULT_POMODORO_SETTINGS

        # Auto-start focus?
        if not settings.get("auto_start_focus"):
            PomodoroFlowService.emit_ready_for_focus(user, task)
            return

        focus_session = PomodoroSession.objects.create(
            user=user,
            task=task,
            is_break=False,
            duration_minutes=settings["focus_minutes"],
            started_at=timezone.now(),
        )

        PomodoroFlowService.emit_transition(
            user=user,
            task=task,
            session=focus_session,
        )
