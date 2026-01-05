from rest_framework import serializers
from apps.tasks.models import Task

class TaskSerializer(serializers.ModelSerializer):
    focus_duration_seconds = serializers.IntegerField(read_only=True)
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'category',
            'priority',
            'status',
            'owner_id',
            'focus_duration_seconds',
            'created_at',
            'updated_at',
            'started_at',
            'ended_at',
        ]
        read_only_fields = ['id', 'owner_id', 'created_at', 'updated_at', 'started_at', 'ended_at']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        task = Task.objects.create(**validated_data)
        task.save()
        return task
    
class TaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'id', 'title', 'status',
            'started_at', 'ended_at',
            'total_focus_seconds',
            'estimated_pomodoros'
        )
        