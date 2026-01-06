from django.utils import timezone
from django.db.models import Sum
from collections import defaultdict

from apps.tasks.models import Task
from apps.pomodoro.models import PomodoroSession

WORK_START_HOUR = 9
WORK_END_HOUR = 22

class AnalyticsService:
    @staticmethod
    def get_daily_summary(user, date):
        """Get user's productivity summary for a specific date"""
        tasks = Task.objects.filter(
            owner=user,
            created_at__date=date)
        pending_tasks = tasks.filter(status='pending').count()
        in_progress_tasks = tasks.filter(status='in_progress').count()
        completed_tasks = tasks.filter(status='completed').count()
        
        sessions = PomodoroSession.objects.filter(
            user=user,
            started_at__date=date,
            is_break=False,
            completed=True
        )
        total_pomodoros = sessions.count()
        
        total_focus_seconds = sessions.aggregate(
            total=Sum('actual_duration_seconds')
        )['total'] or 0
        
        # Aggregate focus time by hour
        buckets = defaultdict(int)
        for s in sessions:
            hour = s.started_at.hour
            if WORK_START_HOUR <= hour <= WORK_END_HOUR:
                buckets[hour] += s.actual_duration_seconds

        ## Chart data
        # daily_flow = [
        #     {
        #         "time": hour,
        #         "value": round(seconds / 60, 1)
        #     }
        #     for hour, seconds in sorted(buckets.items())
        # ]
        # daily_flow.append({'total_sessions': sessions.count()})
        daily_flow = []
        for hour in range(WORK_START_HOUR, WORK_END_HOUR + 1):
            seconds = buckets.get(hour, 0)
            daily_flow.append({
                "time": f"{hour:02d}:00",
                "value": round(seconds / 60, 1)  # minutes
            })
        
        return {
            'date': date,
            'total_tasks': tasks.count(),
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'total_focus_seconds': total_focus_seconds,
            'total_focus_hours': round(total_focus_seconds / 3600, 2),
            'total_pomodoros': sessions.count(),
            'total_pomodoros': total_pomodoros,
            'daily_flow': daily_flow,   
        }
        