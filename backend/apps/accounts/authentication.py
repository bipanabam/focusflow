from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CookiesJWTAuthentication(JWTAuthentication):
    """
    Authenticate using:
    1. Authorization header (Bearer token)
    2. HttpOnly access_token cookie (fallback)
    """
    def authenticate(self, request):
        try:
            header = self.get_header(request)
            if header is None:
                raw_token = request.COOKIES.get(settings.AUTH_COOKIE)
            else:
                raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None

            validated_token = self.get_validated_token(raw_token)

            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
                # Invalid or expired token → unauthenticated
                return None