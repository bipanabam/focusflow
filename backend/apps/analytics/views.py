from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone
from datetime import timedelta

from apps.analytics.services import AnalyticsService

# Create your views here.
class DailySummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Returns daily summary of a user"""
        user = request.user
        date_str = request.query_params.get("date")
            
        data = AnalyticsService.get_daily_summary(user=user, date_str=date_str)
        
        return Response(data, status=status.HTTP_200_OK)
    
class WeeklySummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Returns weekly summary of a user"""
        user = request.user
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        
        if start_date_str is not None and end_date_str:
            start_date = timezone.datetime.fromisoformat(start_date_str)
            end_date = timezone.datetime.fromisoformat(end_date_str)
        else:
            # Default to current week (Monday → Sunday)
            today = timezone.now().date()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
            
        data = AnalyticsService.get_weekly_summary(user=user, start_date=start_date, end_date=end_date)
        
        return Response(data, status=status.HTTP_200_OK)
        
class TaskStreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = AnalyticsService.get_task_completion_streaks(user)
        return Response(data, status=status.HTTP_200_OK)

class MonthlyActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")
        month = request.query_params.get("month")

        data = AnalyticsService.get_monthly_active_days(
            user=request.user,
            year=int(year) if year else None,
            month=int(month) if month else None,
        )

        return Response(data, status=status.HTTP_200_OK)

