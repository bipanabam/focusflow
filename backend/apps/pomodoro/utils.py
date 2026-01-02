from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.db.models import Sum, F, DurationField, ExpressionWrapper

channel_layer = get_channel_layer()
    
def build_session_payload(session):
    now = timezone.now()

    elapsed = session.elapsed_seconds
    remaining = max(0, session.duration_minutes * 60 - elapsed)

    is_running = not session.completed and not session.pauses.filter(
        resumed_at__isnull=True
    ).exists()
    
    # Compute paused_seconds
    paused = session.pauses.filter(resumed_at__isnull=False).aggregate(
        total=Sum(
            ExpressionWrapper(F("resumed_at") - F("paused_at"), output_field=DurationField())
        )
    )["total"]

    paused_seconds = paused.total_seconds() if paused else 0
    
     # If there's an ongoing pause, add its duration up to now
    ongoing_pause = session.pauses.filter(resumed_at__isnull=True).last()
    if ongoing_pause:
        paused_seconds += (now - ongoing_pause.paused_at).total_seconds()


    return {
        "type": "SESSION_UPDATE",
        "task_id": session.task_id,
        "session_id": session.id,
        "is_running": is_running,
        "remaining_seconds": int(remaining),
        "total_duration_seconds": session.duration_minutes * 60,
        "paused_seconds": int(paused_seconds),
        "started_at": session.started_at.isoformat(),
        "ended": session.completed,
    }


def broadcast_task_event(user_id, session):
    payload = build_session_payload(session)

    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "pomodoro.event",
            "payload": payload,
        }
    )
