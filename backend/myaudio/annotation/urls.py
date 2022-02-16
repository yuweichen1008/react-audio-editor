from django.urls import path
from annotation import views

urlpatterns = [
    path('video/', views.VideoList.as_view()),
    # path('annotation/<int:pk>/', views.snippet_detail),
]