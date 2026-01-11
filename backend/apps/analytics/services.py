from django.utils import timezone
from django.db.models import Sum, Q
from calendar import monthrange
from django.db.models.functions import TruncDate
from collections import defaultdict
from datetime import timedelta

from apps.tasks.models import Task
from apps.pomodoro.models import PomodoroSession
from apps.accounts.utils import TimezoneHandler

WORK_START_HOUR = 8
WORK_END_HOUR = 22

class AnalyticsService:
    @staticmethod
    def get_daily_summary(user, date_str=None):
        """Get user's productivity summary for a specific date"""
        tz = TimezoneHandler(user)
        user_date = tz.parse_date(date_str) 
        
        tasks = Task.objects.for_user_date(user, 'created_at', date_str)
        
        pending_tasks = tasks.filter(status='pending').count()
        in_progress_tasks = tasks.filter(status='in_progress').count()
        completed_tasks = tasks.filter(status='completed').count()
        
        sessions = PomodoroSession.objects.for_user_date(
            user, 'started_at', date_str
        ).filter(completed=True)
        total_pomodoros = sessions.filter(is_break=False).count()
        
        total_focus_seconds = sessions.filter(is_break=False).aggregate(
            total=Sum("actual_duration_seconds")
        )["total"] or 0
        
        # Comparison with yesterday's focus time
        yesterday = user_date - timedelta(days=1)
        yesterday_str = yesterday.date().isoformat()
        
        yesterday_sessions = PomodoroSession.objects.for_user_date(
            user, 'started_at', yesterday_str
        ).filter(is_break=False, completed=True)
        
        yesterdays_focus_seconds = yesterday_sessions.aggregate(
            total=Sum("actual_duration_seconds")
        )["total"] or 0
        
        diff_seconds = total_focus_seconds - yesterdays_focus_seconds
        
        if yesterdays_focus_seconds > 0:
            percent_change = round(
                (diff_seconds / yesterdays_focus_seconds) * 100, 1
            )
        else:
            percent_change = 100 if total_focus_seconds > 0 else 0
        comparison = {
            "difference_seconds": diff_seconds,
            "percentage": percent_change,
            "trend": (
                "up" if diff_seconds > 0
                else "down" if diff_seconds < 0
                else "same"
            )
        }
        
        # Hourly aggregation
        hourly_data = defaultdict(lambda: {"focus": 0, "break": 0})
        for s in sessions:
            hour = tz.to_user_timezone(s.started_at).hour
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
            'date': user_date.date().isoformat(),
            'total_tasks': tasks.count(),
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'total_focus_seconds': total_focus_seconds,
            'total_focus_hours': round(total_focus_seconds / 3600, 2),
            'avg_daily_productivity': avg_daily_productivity,
            'comparison': comparison,
            'total_pomodoros': total_pomodoros,
            'daily_flow': daily_flow,   
        }
        
    @staticmethod
    def get_weekly_summary(user, start_date, end_date):
        """
        Returns a summary of tasks and focus sessions between start_date and end_date (inclusive)
        """
        tasks = Task.objects.filter(
            owner=user,
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )
        total_tasks_completed = tasks.filter(status="completed").count()
        
        # Prepare daily breakdown
        daily_breakdown = []
        current_date = start_date
        while current_date <= end_date:
            day_tasks = tasks.filter(created_at__date=current_date)
            completed = day_tasks.filter(status="completed").count()
            
            
            sessions = PomodoroSession.objects.filter(
                user=user,
                started_at__date=current_date,
                is_break=False,
                completed=True
            )
            focus_hours = round((sessions.aggregate(total=Sum("actual_duration_seconds"))["total"] or 0) / 3600, 2)

            daily_breakdown.append({
                "date": current_date,
                "focus_hours": focus_hours,
                "tasks_completed": completed,
                "total_tasks": day_tasks.count()
            })
            current_date += timedelta(days=1)
        # Weekly average daily focus
        avg_daily_focus_hours = round(sum(d["focus_hours"] for d in daily_breakdown) / len(daily_breakdown), 2)

        total_focus_seconds = sum(d["focus_hours"] * 3600 for d in daily_breakdown)
    
        return {
            "week_start": start_date,
            "week_end": end_date,
            "total_tasks_completed": total_tasks_completed,
            "total_focus_hours": total_focus_seconds,
            "avg_daily_focus_hours": avg_daily_focus_hours,
            "daily_breakdown": daily_breakdown,
        }
        
    @staticmethod
    def get_task_completion_streaks(user):
        """
        Calculates task completion streaks for a user.
        A streak day = at least one completed task on that date.
        """
        # Get all distinct dates with completed tasks
        completed_days_qs = (
            Task.objects
            .filter(owner=user, status="completed")
            .annotate(day=TruncDate("ended_at"))
            .values_list("day", flat=True)
            .distinct()
            .order_by("day")
        )

        completed_days = list(completed_days_qs)

        if not completed_days:
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "streak_start_date": None,
                "total_active_days": 0,
            }

        # Calculate streaks
        longest_streak = 1
        current_streak = 1
        temp_streak = 1

        streak_start_date = completed_days[0]
        longest_streak_start = completed_days[0]

        for i in range(1, len(completed_days)):
            if completed_days[i] == completed_days[i - 1] + timedelta(days=1):
                temp_streak += 1
            else:
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
                    longest_streak_start = completed_days[i - temp_streak]
                temp_streak = 1

        # Final longest streak check
        if temp_streak > longest_streak:
            longest_streak = temp_streak
            longest_streak_start = completed_days[-temp_streak]

        # Current streak (must include today or yesterday)
        today = timezone.now().date()

        if completed_days[-1] == today:
            current_streak = temp_streak
            streak_start_date = completed_days[-temp_streak]
        elif completed_days[-1] == today - timedelta(days=1):
            current_streak = temp_streak
            streak_start_date = completed_days[-temp_streak]
        else:
            current_streak = 0
            streak_start_date = None

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "streak_start_date": streak_start_date,
            "total_active_days": len(completed_days),
        }
        
    @staticmethod
    def get_monthly_active_days(user, year=None, month=None):
        today = timezone.now().date()

        year = year or today.year
        month = month or today.month

        start_date = today.replace(day=1)
        last_day = monthrange(year, month)[1]
        end_date = today.replace(day=last_day)

        active_days = (
            Task.objects
            .filter(
                owner=user,
                status="completed",
                updated_at__date__range=(start_date, end_date)
            )
            .annotate(day=TruncDate("updated_at"))
            .values_list("day", flat=True)
            .distinct()
            .order_by("day")
        )

        return {
            "year": year,
            "month": month,
            "active_days": list(active_days)
        }