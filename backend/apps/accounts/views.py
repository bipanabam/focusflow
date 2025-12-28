from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework.response import Response
from apps.accounts.models import User

from apps.accounts.serializers import UserSerializer
from rest_framework import generics

# Create your views here.
class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)

            if response.status_code == 200:
                access_token = response.data.get('access')
                refresh_token = response.data.get('refresh')
                email = request.data.get('email')

                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    return Response({'error':'email or password is incorrect.'}, status=401)
                
                res = Response()
                res.data = {"success":True,
                            "user": {
                                "email":user.email,
                                "first_name": user.first_name,
                                "last_name": user.last_name
                            }}

                res.set_cookie(
                    'access_token',
                    access_token,
                    max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                    httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                    secure=settings.AUTH_COOKIE_SECURE,
                    samesite=settings.AUTH_COOKIE_SAMESITE,
                    path=settings.AUTH_COOKIE_PATH,
                )

                res.set_cookie(
                    'refresh_token',
                    refresh_token,
                    max_age=settings.AUTH_COOKIE_REFRESH_MAX_AGE,
                    httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                    secure=settings.AUTH_COOKIE_SECURE,
                    samesite=settings.AUTH_COOKIE_SAMESITE,
                    path=settings.AUTH_COOKIE_PATH,
                )
                return res
        except:
            return Response({'success': False})
    
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                access_token = response.data.get('access')

                res = Response()
                res.data = {'success': True}

                res.set_cookie(
                    'access_token',
                    access_token,
                    max_age=settings.AUTH_COOKIE_ACCESS_MAX_AGE,
                    path=settings.AUTH_COOKIE_PATH,
                    secure=settings.AUTH_COOKIE_SECURE,
                    httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                    samesite=settings.AUTH_COOKIE_SAMESITE
                )

                return res
        except:
            return Response({'success': False})