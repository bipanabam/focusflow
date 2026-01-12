from django.db import migrations
from django.utils import timezone

def cleanup_duplicate_active_sessions(apps, schema_editor):
    PomodoroSession = apps.get_model("pomodoro", "PomodoroSession")

    active = PomodoroSession.objects.filter(
        completed=False,
        is_break=False
    ).order_by("user_id", "started_at")

    seen = set()

    for session in active:
        key = session.user_id
        if key in seen:
            # deactivate extra sessions
            session.completed = True
            session.ended_at = timezone.now()
            session.actual_duration_seconds = 0
            session.save()
        else:
            seen.add(key)

class Migration(migrations.Migration):

    dependencies = [
        ("pomodoro", "0005_remove_pomodorosession_resumed_at_and_more"),
    ]

    operations = [
        migrations.RunPython(cleanup_duplicate_active_sessions),
    ]
