from django.db import models
from apps.accounts.models import User

from apps.accounts.managers import UserTimezoneManager

# Create your models here.
class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    CATEGORY_CHOICES = [
        ('personal', 'Personal'),
        ('work', 'Work'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    # organization = models.ForeignKey(
    #     'organizations.Organization',
    #     null=True, blank=True,
    #     on_delete=models.CASCADE
    # )
    # project = models.ForeignKey('projects.Project', null=True, blank=True, on_delete=models.SET_NULL)
    assigned_to = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_tasks'
    )
    
    estimated_pomodoros = models.IntegerField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='personal')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_focus_seconds = models.IntegerField(default=0)
    
    objects = UserTimezoneManager()
    
    class Meta:
        db_table = 'tasks'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['owner', 'status']),
            # models.Index(fields=['organization', 'started_at']),
        ]
        ordering = ['created_at']

    def __str__(self):
        return self.title
