# apps/tasks/tests/test_task_pomodoro_api.py
from django.urls import reverse
from apps.pomodoro.models import PomodoroSession
from apps.tasks.tests.base import BaseAPITestCase

class TestTaskStart(BaseAPITestCase):

    def test_start_task_creates_pomodoro_session(self):
        url = f"/tasks/{self.task.id}/start/"

        response = self.client.post(url, {"pomodoro_duration": 25})

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()

        self.assertEqual(self.task.status, "in_progress")
        self.assertIsNotNone(self.task.started_at)

        session = PomodoroSession.objects.get(user=self.user)

        self.assertFalse(session.is_break)
        self.assertEqual(session.duration_minutes, 25)
        self.assertIsNone(session.ended_at)
        
class TestTaskPause(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")

    def test_pause_task(self):
        response = self.client.post(f"/tasks/{self.task.id}/pause/")

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "paused")
        self.assertIsNotNone(session.paused_at)

class TestTaskResume(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        self.client.post(f"/tasks/{self.task.id}/pause/")

    def test_resume_task(self):
        response = self.client.post(f"/tasks/{self.task.id}/resume/")

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "in_progress")
        self.assertIsNotNone(session.resumed_at)
        self.assertIsNone(session.paused_at)

class TestTaskComplete(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")

    def test_complete_task(self):
        response = self.client.post(f"/tasks/{self.task.id}/complete/")

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "completed")
        self.assertIsNotNone(self.task.ended_at)

        self.assertTrue(session.completed)
        self.assertIsNotNone(session.actual_duration_seconds)
        # self.assertGreater(session.actual_duration_seconds, 0)