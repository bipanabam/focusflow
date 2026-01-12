from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework.response import Response
from rest_framework import status, serializers, generics
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer, UserProfileSerializer, UserSettingsSerializer, PomodoroSettingsSerializer
from apps.pomodoro.constants import DEFAULT_POMODORO_SETTINGS

# Create your views here.
class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = serializer.user
            tokens = serializer.validated_data

            res = Response(
                {
                    "success": True,
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "pomodoro_settings": user.pomodoro_settings,
                    }
                },
                status=status.HTTP_200_OK
            )

            res.set_cookie(
                "access_token",
                tokens["access"],
                max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH,
            )

            res.set_cookie(
                "refresh_token",
                tokens["refresh"],
                max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH,
            )

            return res
        except Exception as e:
            return Response({"success": False}, status=status.HTTP_401_UNAUTHORIZED)
    
class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response({"detail": "No refresh token provided"}, status=401)

            serializer = self.get_serializer(data={"refresh": refresh_token})
            serializer.is_valid(raise_exception=True)
            access = serializer.validated_data["access"]

            res = Response({"success": True})

            res.set_cookie(
                "access_token",
                access,
                max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH,
            )

            return res
        except Exception as e:
            print("REFRESH ERROR:", e)
            return Response(
                {"success": False, "detail": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
@extend_schema(
    summary="Logout user",
    description="Deletes access and refresh tokens from cookies.",
    request=None,
    responses={
        200: inline_serializer(
            name='LogoutResponse',
            fields={'success': serializers.BooleanField()}
        )
    }
)   
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    res = Response({"success": True})

    res.delete_cookie("access_token", path="/")
    res.delete_cookie("refresh_token", path="/")
    return res


@extend_schema(
    responses={
        200: inline_serializer(
            name='AuthCheckResponse',
            fields={'message': serializers.CharField()}
        )
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def authenticated(request):
    user = request.user
    return Response({"message": "authenticated!",
                      "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "pomodoro_settings": user.pomodoro_settings,
                    }
                })
    
import pytz
@api_view(["GET"])
def timezone_list(request):
    return Response(pytz.common_timezones)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        print(request.data)
        return super().update(request, *args, **kwargs)

    
class UserSettingsView(generics.UpdateAPIView):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            self.get_object(),
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"success": True}, status=status.HTTP_200_OK)
class PomodoroSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = PomodoroSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("credential")

    if not token:
        return Response({"success": False}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        email = idinfo["email"]
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
            },
        )

        refresh = RefreshToken.for_user(user)

        res = Response(
            {
                "success": True,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "pomodoro_settings": user.pomodoro_settings,
                },
            },
            status=200,
        )

        # Cookies (same as your login)
        res.set_cookie(
            "access_token",
            str(refresh.access_token),
            max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )

        res.set_cookie(
            "refresh_token",
            str(refresh),
            max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )

        return res

    except Exception as e:
        return Response({"success": False}, status=401)
