import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

# class PomodoroConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         user = self.scope["user"]

#         if not user or user.is_anonymous:
#             await self.close()
#             return

#         self.group_name = f"user_{user.id}"
#         self.user_id = user.id

#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )

#         await self.accept()
#         print("WS connected:", user.id)

#         # Send current session state immediately after connection
#         session_state = await self.get_current_session_state(user.id)
#         if session_state:
#             await self.send(text_data=json.dumps(session_state))

#     async def disconnect(self, close_code):
#         if hasattr(self, "group_name"):
#             await self.channel_layer.group_discard(
#                 self.group_name,
#                 self.channel_name
#             )

#     async def pomodoro_event(self, event):
#         await self.send(text_data=json.dumps(event["payload"]))

#     @database_sync_to_async
#     def get_current_session_state(self, user_id):
#         """Fetch the active session for this user, if any"""
#         from apps.pomodoro.models import PomodoroSession
#         from django.utils import timezone

#         try:
#             # Use 'user' instead of 'user_id' for ForeignKey filtering
#             session = PomodoroSession.objects.filter(
#                 user=user_id,  # Changed from user_id=user_id
#                 completed=False,
#                 ended_at__isnull=True
#             ).select_related('task').latest('started_at')

#             # Determine if running or paused
#             is_running = session.paused_at is None or (
#                 session.resumed_at is not None and session.resumed_at > session.paused_at
#             )

#             # Calculate remaining time
#             if is_running:
#                 # Calculate elapsed time from start
#                 reference_time = session.resumed_at if session.resumed_at else session.started_at
#                 elapsed = (timezone.now() - reference_time).total_seconds()
                
#                 # If there was a pause, calculate how much time was used before pause
#                 if session.paused_at and session.resumed_at:
#                     time_before_pause = (session.paused_at - session.started_at).total_seconds()
#                     elapsed += time_before_pause
#                 elif session.resumed_at is None:
#                     # Never paused, just running from start
#                     elapsed = (timezone.now() - session.started_at).total_seconds()
                    
#                 remaining = max(0, (session.duration_minutes * 60) - elapsed)
#             else:
#                 # For paused sessions
#                 if session.paused_at:
#                     elapsed = (session.paused_at - session.started_at).total_seconds()
#                     remaining = max(0, (session.duration_minutes * 60) - elapsed)
#                 else:
#                     remaining = session.duration_minutes * 60

#             return {
#                 "type": "session_state",
#                 "task_id": session.task.id if session.task else None,
#                 "session_id": session.id,
#                 "is_running": is_running,
#                 "remaining_seconds": int(remaining),
#                 "total_duration_seconds": session.duration_minutes * 60,
#                 "started_at": session.started_at.isoformat(),
#             }
#         except PomodoroSession.DoesNotExist:
#             return None
        
class PomodoroConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if not user or user.is_anonymous:
            await self.close()
            return

        self.group_name = f"user_{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        payload = await self.get_active_session_payload(user.id)
        if payload:
            await self.send(json.dumps(payload))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def pomodoro_event(self, event):
        await self.send(json.dumps(event["payload"]))
        
    @database_sync_to_async
    def get_active_session_payload(self, user_id):
        from apps.pomodoro.models import PomodoroSession
        from apps.pomodoro.utils import build_session_payload

        session = (
            PomodoroSession.objects
            .filter(user_id=user_id, completed=False, is_break=False)
            .select_related("task")
            .first()
        )

        if not session:
            return None

        return build_session_payload(session)

    @database_sync_to_async
    def get_active_session(self, user_id):
        from apps.pomodoro.models import PomodoroSession
        return (
            PomodoroSession.objects
            .filter(user_id=user_id, completed=False, is_break=False)
            .select_related("task")
            .first()
        )
