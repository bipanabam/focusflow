import time
from django.utils import timezone
from rest_framework.test import APIClient
from apps.pomodoro.models import PomodoroSession, PomodoroPause
from apps.tasks.tests.base import BaseAPITestCase
from apps.tasks.tests.utils import ConcurrentRunner


class TestTaskStart(BaseAPITestCase):
    def test_start_task_creates_pomodoro_session(self):
        response = self.client.post(f"/tasks/{self.task.id}/start/", {"pomodoro_duration": 25})
        self.assertEqual(response.status_code, 201)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "in_progress")
        self.assertIsNotNone(self.task.started_at)

        self.assertFalse(session.is_break)
        self.assertEqual(session.duration_minutes, 25)
        self.assertFalse(session.completed)


class TestTaskPause(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        time.sleep(1)

    def test_pause_task_creates_pause_record(self):
        response = self.client.post(f"/tasks/{self.task.id}/pause/")
        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "paused")

        pause = PomodoroPause.objects.filter(session=session).first()
        self.assertIsNotNone(pause)
        self.assertIsNotNone(pause.paused_at)
        self.assertIsNone(pause.resumed_at)


class TestTaskResume(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        time.sleep(1)
        self.client.post(f"/tasks/{self.task.id}/pause/")
        time.sleep(2)

    def test_resume_task_completes_pause_record(self):
        response = self.client.post(f"/tasks/{self.task.id}/resume/")
        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "in_progress")

        pause = PomodoroPause.objects.filter(session=session).first()
        self.assertIsNotNone(pause.resumed_at)
        self.assertGreaterEqual(pause.duration_seconds, 2)


class TestTaskComplete(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        time.sleep(2)

    def test_complete_task_sets_actual_duration(self):
        response = self.client.post(f"/tasks/{self.task.id}/complete/")
        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        session = PomodoroSession.objects.get(user=self.user)

        self.assertEqual(self.task.status, "completed")
        self.assertTrue(session.completed)
        self.assertIsNotNone(session.ended_at)

        self.assertGreaterEqual(session.actual_duration_seconds, 2)
        self.assertEqual(self.task.total_focus_seconds, session.actual_duration_seconds)


class TestCompleteWhilePaused(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        time.sleep(1)
        self.client.post(f"/tasks/{self.task.id}/pause/")
        time.sleep(2)

    def test_complete_while_paused_closes_pause(self):
        response = self.client.post(f"/tasks/{self.task.id}/complete/")
        self.assertEqual(response.status_code, 200)
        self.task.refresh_from_db()

        session = PomodoroSession.objects.get(user=self.user)
        self.assertTrue(session.completed)
        self.assertEqual(self.task.status, "completed")

        pause = PomodoroPause.objects.filter(session=session).first()
        self.assertIsNotNone(pause.resumed_at or pause.duration_seconds)
        self.assertGreaterEqual(pause.duration_seconds, 2)


class TestStartTaskIdempotency(BaseAPITestCase):
    def test_start_task_is_idempotent(self):
        url = f"/tasks/{self.task.id}/start/"
        r1 = self.client.post(url)
        r2 = self.client.post(url)

        self.assertIn(r1.status_code, [200, 201])
        self.assertIn(r2.status_code, [200, 201])

        sessions = PomodoroSession.objects.filter(user=self.user, task=self.task, is_break=False)
        self.assertEqual(sessions.count(), 1)
        self.assertFalse(sessions.first().completed)


class TestPauseIdempotency(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")

    def test_pause_task_is_idempotent(self):
        r1 = self.client.post(f"/tasks/{self.task.id}/pause/")
        r2 = self.client.post(f"/tasks/{self.task.id}/pause/")

        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)

        session = PomodoroSession.objects.get(user=self.user)
        pauses = PomodoroPause.objects.filter(session=session)
        self.assertEqual(pauses.count(), 1)
        self.assertIsNone(pauses.first().resumed_at)


class TestResumeIdempotency(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.client.post(f"/tasks/{self.task.id}/start/")
        self.client.post(f"/tasks/{self.task.id}/pause/")

    def test_resume_task_is_idempotent(self):
        r1 = self.client.post(f"/tasks/{self.task.id}/resume/")
        r2 = self.client.post(f"/tasks/{self.task.id}/resume/")

        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r2.status_code, 200)

        session = PomodoroSession.objects.get(user=self.user)
        # No ongoing pause should remain
        ongoing_pause = session.pauses.filter(resumed_at__isnull=True).exists()
        self.assertFalse(ongoing_pause)


# class TestConcurrentStart(BaseAPITestCase):
#     def test_concurrent_start_creates_single_session(self):
#         url = f"/tasks/{self.task.id}/start/"

#         def call_start():
#             client = APIClient()
#             client.force_authenticate(self.user)
#             return client.post(url).status_code

#         runner = ConcurrentRunner()
#         statuses = runner.run(call_start, count=2)

#         self.assertTrue(all(code == 200 for code in statuses))

#         sessions = PomodoroSession.objects.filter(user=self.user, task=self.task, is_break=False)
#         self.assertEqual(sessions.count(), 1)


# class TestConcurrentPauseResume(BaseAPITestCase):
#     def setUp(self):
#         super().setUp()
#         self.client.post(f"/tasks/{self.task.id}/start/")

#     def test_pause_resume_race(self):
#         pause_url = f"/tasks/{self.task.id}/pause/"
#         resume_url = f"/tasks/{self.task.id}/resume/"

#         def pause():
#             c = APIClient()
#             c.force_authenticate(self.user)
#             return c.post(pause_url).status_code

#         def resume():
#             c = APIClient()
#             c.force_authenticate(self.user)
#             return c.post(resume_url).status_code

#         runner = ConcurrentRunner()
#         results = runner.run(pause, count=1) + runner.run(resume, count=1)

#         session = PomodoroSession.objects.get(user=self.user)
#         self.assertFalse(session.completed)
#         # Cannot have an ongoing pause AND running simultaneously
#         ongoing_pause = session.pauses.filter(resumed_at__isnull=True).exists()
#         self.assertTrue(ongoing_pause or not ongoing_pause)


# class TestConcurrentComplete(BaseAPITestCase):
#     def setUp(self):
#         super().setUp()
#         self.client.post(f"/tasks/{self.task.id}/start/")

#     def test_double_complete(self):
#         url = f"/tasks/{self.task.id}/complete/"

#         def complete():
#             c = APIClient()
#             c.force_authenticate(self.user)
#             return c.post(url).status_code

#         runner = ConcurrentRunner()
#         statuses = runner.run(complete, count=2)

#         self.assertTrue(all(code == 200 for code in statuses))

#         sessions = PomodoroSession.objects.filter(user=self.user, completed=True)
#         self.assertEqual(sessions.count(), 1)
