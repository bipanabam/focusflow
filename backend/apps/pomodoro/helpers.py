from django.utils import timezone
from apps.pomodoro.services import PomodoroService

def ensure_session_not_expired(session):
    if not session:
        return None

    if session.completed:
        return session

    if session.remaining_seconds <= 0:
        PomodoroService.complete_session(session)

    return session
