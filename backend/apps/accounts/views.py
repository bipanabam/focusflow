from apps.accounts.serializers import UserSerializer
from rest_framework import generics

# Create your views here.
class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    