from django.urls import path
from apps.analytics import views

urlpatterns = [
    path('daily/', views.DailySummaryView.as_view(), name='daily_summary'),
    
]
