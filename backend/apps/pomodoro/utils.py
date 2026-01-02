from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

channel_layer = get_channel_layer()

def broadcast_task_event(user_id, event_type, session, **extra_data):
    """
    Broadcast pomodoro events to user's WebSocket group
    
    Args:
        user_id: User ID to send to
        event_type: Type of event (task_started, task_paused, etc.)
        session: PomodoroSession instance
        **extra_data: Additional data to include in payload
    """
    payload = {
        "type": event_type,
        "task_id": session.task.id,
        "session_id": session.id,
        **extra_data
    }
    
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}",
        {
            "type": "pomodoro.event",
            "payload": payload
        }
    )