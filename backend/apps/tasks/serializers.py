from rest_framework import serializers
from apps.tasks.models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'status',
            'owner_id',
            'created_at',
            'updated_at', 
        ]
        read_only_fields = ['id', 'owner_id', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        task = Task.objects.create(**validated_data)
        task.save()
        return task
        