import django_filters

from apps.tasks.models import Task

class TaskFilter(django_filters.FilterSet):
    created_at = django_filters.DateFilter(field_name='created_at__date')
    updated_at = django_filters.DateFilter(field_name='updated_at__date')
    
    class Meta:
        model = Task
        fields = {
            'title': ['icontains', 'iexact'],
            'description': ['icontains', 'iexact'],
            'status': ['exact'],
            'created_at': ['gte', 'lte'],
            'updated_at': ['gte', 'lte'],
            'priority': ['exact'],    
        }