from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone
import pytz

from apps.pomodoro.constants import DEFAULT_POMODORO_SETTINGS

# Create your models here.
class CustomUserManager(UserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        if 'pomodoro_settings' not in extra_fields:
            extra_fields['pomodoro_settings'] = DEFAULT_POMODORO_SETTINGS.copy()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """User for our application."""
    username = None
    email = models.EmailField(unique=True)
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('individual', 'Individual'),
            ('admin', 'Admin'),
        ],
        default='individual'
    )
    timezone = models.CharField(
    max_length=50,
    choices=[(tz, tz) for tz in pytz.common_timezones],
    default="UTC")
    created_at = models.DateTimeField(auto_now_add=True)
    pomodoro_settings = models.JSONField(default=dict, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()
    
    def get_pomodoro_setting(self, key):
        return self.pomodoro_settings.get(
            key,
            DEFAULT_POMODORO_SETTINGS[key]
        )
    
    def get_focus_duration_minutes(self):
        return int(self.get_pomodoro_setting("focus_minutes"))
    
    def localtime(self, dt):
        if not dt:
            return None
        user_tz = pytz.timezone(self.timezone)
        return timezone.localtime(dt, user_tz)
    
    def __str__(self):
        return self.email