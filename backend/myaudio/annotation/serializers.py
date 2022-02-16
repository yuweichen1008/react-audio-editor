from random import choice
from users.models import Profile
from annotation.models import VIDEO_STATUS, Video
from rest_framework import serializers
from django.contrib.auth.models import User
'''
url  = models.URLField(max_length=400, blank=True, null=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    owner = models.CharField(max_length=200, blank=True)
    video_status = models.CharField(max_length=4, choices=VIDEO_STATUS, default=PENDING_DOWNLOAD)
    file_path = models.FilePathField()
    created_date = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(Profile, on_delete=models.RESTRICT)

'''
class VideoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    # slug = serializers.SlugField()
    owner = serializers.CharField(required=True)
    # video_status = serializers.CharField(choice=VIDEO_STATUS, default=VIDEO_STATUS[0])
    # file_path = serializers.FilePathField()
    created_date = serializers.DateTimeField(required=True)
    created_by = serializers.ReadOnlyField()
    #  = serializers.CharField(max_length=50, unique=True)

    def create(self, validated_data):
        """
        Create and return a new `Video` instance, given the validated data.
        """
        return Video.objects.create(**validated_data)


    def update(self, instance, validate_data):
        """
        Update and return an existing `Video` instance, given the validated data.
        """
        instance.owner = validate_data.get('owner', instance.owner)
        instance.created_date = validate_data.get('created_date', instance.created_date)
        instance.created_by = validate_data.get('created_by', instance.created_by)
        instance.save()
        return instance

    class Meta:
        model = Video