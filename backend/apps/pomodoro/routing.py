# apps/pomodoro/routing.py
from django.urls import path
from apps.pomodoro.consumers import PomodoroConsumer

websocket_urlpatterns = [
    path("ws/pomodoro/", PomodoroConsumer.as_asgi()),
]
