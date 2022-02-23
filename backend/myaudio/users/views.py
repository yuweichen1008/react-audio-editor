from django.shortcuts import render
from rest_framework import generics
from users.models import Profile
from users.serializers import ProfileSerializer
# Create your views here.

class ProfileList(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class ProfileDetail(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer