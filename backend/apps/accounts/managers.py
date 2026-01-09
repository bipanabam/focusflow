from django.db import models
from django.utils import timezone as django_timezone
import pytz
from datetime import datetime


class UserTimezoneQuerySet(models.QuerySet):
    """QuerySet with timezone-aware filtering methods"""
    
    def for_user_date(self, user, date_field, date_str=None):
        """
        Filter records for a specific date in user's timezone
        
        Usage:
            Task.objects.for_user_date(user, 'created_at', '2024-01-15')
            PomodoroSession.objects.for_user_date(user, 'started_at')
        """
        from apps.accounts.utils import TimezoneHandler
        
        tz = TimezoneHandler(user)
        user_date = tz.parse_date(date_str)
        start_utc, end_utc = tz.get_day_boundaries(user_date)
        
        return self.filter(**{
            f'{date_field}__gte': start_utc,
            f'{date_field}__lte': end_utc
        })
    
    def for_user_date_range(self, user, date_field, start_date, end_date):
        """Filter records for a date range in user's timezone"""
        from apps.accounts.utils import TimezoneHandler
        
        tz = TimezoneHandler(user)
        start_utc, _ = tz.get_day_boundaries(start_date)
        _, end_utc = tz.get_day_boundaries(end_date)
        
        return self.filter(**{
            f'{date_field}__gte': start_utc,
            f'{date_field}__lte': end_utc
        })


class UserTimezoneManager(models.Manager):
    def get_queryset(self):
        return UserTimezoneQuerySet(self.model, using=self._db)
    
    def for_user_date(self, user, date_field, date_str=None):
        return self.get_queryset().for_user_date(user, date_field, date_str)
    
    def for_user_date_range(self, user, date_field, start_date, end_date):
        return self.get_queryset().for_user_date_range(user, date_field, start_date, end_date)