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
            # is_break=False,
            completed=True
        )
        total_pomodoros = sessions.filter(is_break=False).count()
        
        total_focus_seconds = sessions.filter(is_break=False).aggregate(
            total=Sum("actual_duration_seconds")
        )["total"] or 0
        
        total_break_seconds = sessions.filter(is_break=True).aggregate(
            total=Sum("actual_duration_seconds")
        )["total"] or 0
        
        # Hourly aggregation
        hourly_data = defaultdict(lambda: {"focus": 0, "break": 0})
        for s in sessions:
            hour = s.started_at.hour
            if WORK_START_HOUR <= hour <= WORK_END_HOUR:
                key = "break" if s.is_break else "focus"
                hourly_data[hour][key] += s.actual_duration_seconds
                
        ## Chart data
        daily_flow = []
        for hour in range(WORK_START_HOUR, WORK_END_HOUR + 1):
            focus_sec = hourly_data[hour]["focus"]
            break_sec = hourly_data[hour]["break"]
            total_sec = focus_sec + break_sec
            productivity_score = round((focus_sec / total_sec * 100), 1) if total_sec > 0 else 0

            daily_flow.append({
                "time": f"{hour:02d}:00",
                "focus": round(focus_sec / 60, 1),
                "break": round(break_sec / 60, 1),
                "productivity": productivity_score
            })
        total_productivity = 0
        for flow in daily_flow:
            total_productivity += flow['productivity']
        avg_daily_productivity = int(total_productivity / len(daily_flow))
        
        return {
            'date': date,
            'total_tasks': tasks.count(),
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'total_focus_seconds': total_focus_seconds,
            'total_focus_hours': round(total_focus_seconds / 3600, 2),
            'avg_daily_productivity': avg_daily_productivity,
            'total_pomodoros': total_pomodoros,
            'daily_flow': daily_flow,   
        }
        