import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.pomodoro import routing as pomodoro_routing
from apps.pomodoro.middleware import CookiesJWTAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": CookiesJWTAuthMiddleware(
        URLRouter(
            pomodoro_routing.websocket_urlpatterns
        )
    ),
})
