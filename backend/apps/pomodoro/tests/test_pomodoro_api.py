from apps.pomodoro.tests.base import BaseAPITestCase
from apps.pomodoro.models import PomodoroSession

class TestActiveSession(BaseAPITestCase):

    def test_no_active_session(self):
        response = self.client.get("/pomodoro/active/")
        self.assertEqual(response.status_code, 404)

    def test_get_active_session(self):
        self.client.post(f"/tasks/{self.task.id}/start/")

        response = self.client.get("/pomodoro/active/")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_break"])

class TestCompleteSession(BaseAPITestCase):

    def test_complete_session(self):
        self.client.post(f"/tasks/{self.task.id}/start/")
        session = PomodoroSession.objects.get(user=self.user)

        response = self.client.post(
            f"/pomodoro/sessions/{session.id}/complete/"
        )

        self.assertEqual(response.status_code, 200)

        session.refresh_from_db()
        self.assertTrue(session.completed)
        self.assertIsNotNone(session.ended_at)
        
class TestStartBreak(BaseAPITestCase):

    def test_start_break(self):
        response = self.client.post(
            "/pomodoro/break/start/",
            {"break_type": "short"}
        )

        self.assertEqual(response.status_code, 201)

        session = PomodoroSession.objects.get(user=self.user)

        self.assertTrue(session.is_break)
        self.assertEqual(session.break_type, "short")
        
# class TestListSessions(BaseAPITestCase):

#     def test_list_sessions(self):
#         self.client.post(f"/tasks/{self.task.id}/start/")
#         session = PomodoroSession.objects.get(user=self.user)
#         self.client.post(f"/pomodoro/sessions/{session.id}/complete/")

#         response = self.client.get("/pomodoro/sessions/")

#         self.assertEqual(response.status_code, 200)
#         self.assertEqual(response.data["count"], 1)

