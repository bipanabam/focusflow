import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
  
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
