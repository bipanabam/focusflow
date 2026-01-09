from datetime import datetime, timedelta
import pytz
from django.utils import timezone


class TimezoneHandler:
    """Utility class for handling timezone conversions"""
    
    def __init__(self, user):
        self.user = user
        self.user_tz = pytz.timezone(user.timezone)
    
    def parse_date(self, date_str=None):
        """
        Parse date string or return current date in user's timezone
        
        Args:
            date_str: ISO format date string or None
            
        Returns:
            timezone-aware datetime in user's timezone
        """
        if date_str:
            naive_date = datetime.fromisoformat(date_str)
            return self.user_tz.localize(naive_date)
        else:
            return timezone.now().astimezone(self.user_tz)
    
    def get_day_boundaries(self, date):
        """
        Get start and end of day in user's timezone, converted to UTC
        
        Args:
            date: timezone-aware datetime in user's timezone
            
        Returns:
            tuple: (start_of_day_utc, end_of_day_utc)
        """
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        start_of_day_utc = start_of_day.astimezone(pytz.UTC)
        end_of_day_utc = end_of_day.astimezone(pytz.UTC)
        
        return start_of_day_utc, end_of_day_utc
    
    def get_week_boundaries(self, date):
        """Get start and end of week in user's timezone, converted to UTC"""
        # Find Monday of the week
        start_of_week = date - timedelta(days=date.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Find Sunday of the week
        end_of_week = start_of_week + timedelta(days=6)
        end_of_week = end_of_week.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        return start_of_week.astimezone(pytz.UTC), end_of_week.astimezone(pytz.UTC)
    
    def get_month_boundaries(self, date):
        """Get start and end of month in user's timezone, converted to UTC"""
        from calendar import monthrange
        
        start_of_month = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day = monthrange(date.year, date.month)[1]
        end_of_month = date.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)
        
        return start_of_month.astimezone(pytz.UTC), end_of_month.astimezone(pytz.UTC)
    
    def to_user_timezone(self, dt):
        """Convert UTC datetime to user's timezone"""
        if not dt:
            return None
        return dt.astimezone(self.user_tz)
    
    def to_utc(self, dt):
        """Convert user's timezone datetime to UTC"""
        if not dt:
            return None
        return dt.astimezone(pytz.UTC)