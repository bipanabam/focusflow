from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user_from_token(token):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import AnonymousUser
    from rest_framework_simplejwt.tokens import UntypedToken
    from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
    from jwt import decode as jwt_decode
    from django.conf import settings

    try:
        UntypedToken(token)
        decoded = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_model = get_user_model()
        return user_model.objects.get(id=decoded["user_id"])
    except Exception:
        return AnonymousUser()

class CookiesJWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate websocket using:
    1. Cookie 'access_token'
    2. Or 'Authorization: Bearer <token>'
    """
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser
        from django.conf import settings
        
        token = None

        # Try cookie first
        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        
        if cookie_header:
            cookies = dict(item.split("=", 1) for item in cookie_header.split("; ") if "=" in item)
            token = cookies.get(settings.AUTH_COOKIE)

        # Or from query string fallback
        if not token:
            qs = scope.get("query_string", b"").decode()
            if "token=" in qs:
                token = qs.split("token=")[-1].split("&")[0]

        scope["user"] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)