from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated   
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.models import User

from apps.accounts.serializers import UserSerializer
from rest_framework import generics

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
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
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
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "No refresh token"}, status=401)

        request.data["refresh"] = refresh_token

        serializer = self.get_serializer(data=request.data)
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
 
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    res = Response({"success": True})

    res.delete_cookie("access_token", path="/")
    res.delete_cookie("refresh_token", path="/api/auth/refresh/")

    return res