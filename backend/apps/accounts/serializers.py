from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from apps.accounts.models import User
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password']
        
    def validate_first_name(self, value):
        if not value:
            raise serializers.ValidationError("First name is required.")
        return value

    def validate_last_name(self, value):
        if not value:
            raise serializers.ValidationError("Last name is required.")
        return value
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
        
    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'timezone', 'pomodoro_settings']
        read_only_fields = ['email']
        optional_fields = ['timezone', 'pomodoro_settings']

class UserSettingsSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["current_password", "password", "confirm_password"]

    def validate_current_password(self, value):
        user = self.instance
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        validate_password(data["password"], self.instance)
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data["password"])
        instance.save(update_fields=["password"])
        return instance

class PomodoroSettingsSerializer(serializers.Serializer):
    focus_minutes = serializers.IntegerField(min_value=10, max_value=120)
    short_break_minutes = serializers.IntegerField(min_value=1, max_value=30)
    long_break_minutes = serializers.IntegerField(min_value=5, max_value=60)
    long_break_every = serializers.IntegerField(min_value=1, max_value=10)
    auto_start_breaks = serializers.BooleanField()
    auto_start_focus = serializers.BooleanField()

    def update(self, instance, validated_data):
        instance.pomodoro_settings = {
            **instance.pomodoro_settings,
            **validated_data
        }
        instance.save(update_fields=["pomodoro_settings"])
        return instance
    
    def validate(self, data):
        if not 10 <= data["focus_minutes"] <= 180:
            raise serializers.ValidationError("Invalid focus duration")

        if data["short_break_minutes"] > data["long_break_minutes"]:
            raise serializers.ValidationError("Long break must be longer than short break")

        return data


class PomodoroSettingsSerializer(serializers.Serializer):
    focus_minutes = serializers.IntegerField()
    short_break_minutes = serializers.IntegerField()
    long_break_minutes = serializers.IntegerField()
    long_break_every = serializers.IntegerField()

    def to_representation(self, instance):
        settings = instance.pomodoro_settings or {}

        return {
            "focus_minutes": settings.get("focus_minutes", 25),
            "short_break_minutes": settings.get("short_break_minutes", 5),
            "long_break_minutes": settings.get("long_break_minutes", 15),
            "long_break_every": settings.get("long_break_every", 4),
        }

    def validate(self, data):
        if not 10 <= data["focus_minutes"] <= 180:
            raise serializers.ValidationError("Focus duration must be 10-180 minutes")

        if not 1 <= data["short_break_minutes"] <= 30:
            raise serializers.ValidationError("Short break must be 1-30 minutes")

        if data["long_break_minutes"] < data["short_break_minutes"]:
            raise serializers.ValidationError("Long break must be longer than short break")

        if not 2 <= data["long_break_every"] <= 10:
            raise serializers.ValidationError("Sessions must be between 1 and 10")

        return data

    def update(self, instance, validated_data):
        instance.pomodoro_settings = validated_data
        instance.save(update_fields=["pomodoro_settings"])
        return instance
