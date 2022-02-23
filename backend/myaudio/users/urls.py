from django.urls import path, include
from users import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    # path('', views.api_root),
    path('profile/', views.ProfileList.as_view(), name='profile-list'),
    path('profile/<int:pk>/', views.ProfileDetail.as_view(), name='profile-detail'),
]

urlpatterns = format_suffix_patterns(urlpatterns)