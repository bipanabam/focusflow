from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from apps.analytics.services import AnalyticsService

# Create your views here.
class DailySummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Returns daily summary of a user"""
        user = request.user
        date_str = request.query_params.get("date")
        if date_str:
            date = timezone.datetime.fromisoformat(date_str)
        else:
            date = timezone.now()
            
        data = AnalyticsService.get_daily_summary(user=user, date=date)
        
        return Response(data, status=status.HTTP_200_OK)
        
