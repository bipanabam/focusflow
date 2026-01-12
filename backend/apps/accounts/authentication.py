from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed
from drf_spectacular.extensions import OpenApiAuthenticationExtension

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
            user = self.get_user(validated_token)
            
            return user, validated_token
        except (InvalidToken, TokenError):
            raise AuthenticationFailed("Access token expired or invalid")
        
class CookiesJWTScheme(OpenApiAuthenticationExtension):
    target_class = CookiesJWTAuthentication
    name = 'CookieAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': 'access_token',  # Must match the cookie name in your logout view
        }
