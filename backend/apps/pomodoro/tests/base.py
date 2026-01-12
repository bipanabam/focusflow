from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.tasks.models import Task

User = get_user_model()

class BaseAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="password123"
        )
        self.client.force_authenticate(self.user)

        self.task = Task.objects.create(
            title="Write blog post",
            owner=self.user,
            estimated_pomodoros=3
        )
