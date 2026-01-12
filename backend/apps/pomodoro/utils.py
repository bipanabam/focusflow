from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.db.models import Sum, F, DurationField, ExpressionWrapper

from apps.pomodoro.fsm import PomodoroFSM

channel_layer = get_channel_layer()

    
def build_session_payload(session):
    now = timezone.now()

    elapsed = session.elapsed_seconds
    remaining = max(0, session.duration_minutes * 60 - elapsed)

    paused_seconds = 0
    paused = session.pauses.filter(resumed_at__isnull=False).aggregate(
        total=Sum(
            ExpressionWrapper(
                F("resumed_at") - F("paused_at"),
                output_field=DurationField()
            )
        )
    )["total"]

    if paused:
        paused_seconds += paused.total_seconds()

    ongoing_pause = session.pauses.filter(resumed_at__isnull=True).last()
    if ongoing_pause:
        paused_seconds += (now - ongoing_pause.paused_at).total_seconds()

    fsm_state = derive_session_state(session)
    allowed_actions = list(
        PomodoroFSM.TRANSITIONS.get(fsm_state, [])
    )

    return {
        "type": "SESSION_UPDATE",
        "fsm_state": fsm_state,
        "allowed_actions": allowed_actions,
        "task_id": session.task_id,
        "session_id": session.id,
        "is_break": session.is_break,
        "remaining_seconds": int(remaining),
        "total_duration_seconds": session.duration_minutes * 60,
        "paused_seconds": int(paused_seconds),
        "started_at": session.started_at.isoformat(),
        "ended": session.completed,
    }


def broadcast_task_event(user_id, session, *, manual_completion=False):
    payload = build_session_payload(session)
    
    if manual_completion:
        payload["fsm_state"] = "TERMINATED"
        payload["ended"] = True

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "pomodoro.event",
            "payload": payload,
        }
    )

def derive_session_state(session):
    """State derivation helper, used by API, Websocket and FSM Validation.."""
    if not session:
        return "IDLE"

    if session.completed:
        return "TERMINATED"

    is_paused = session.pauses.filter(resumed_at__isnull=True).exists()

    if session.is_break:
        return "BREAK_PAUSED" if is_paused else "BREAK_RUNNING"

    return "FOCUS_PAUSED" if is_paused else "FOCUS_RUNNING"
