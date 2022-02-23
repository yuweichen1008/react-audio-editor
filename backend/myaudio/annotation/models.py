from django.conf import settings
from django.db import models
from users.models import Profile
import os

PENDING_DOWNLOAD = 'PD'
PROCESSING = 'PS'
ANNOTATION = 'AN'
DONE = 'DO'
VIDEO_STATUS = [
    (PENDING_DOWNLOAD, 'Pending Download'),
    (PROCESSING, 'Processing'),
    (ANNOTATION, 'Annotation'),
    (DONE, 'Done'),
]


# Video is the model for YouTube ( source ) video details
class Video(models.Model):
    
    name = models.CharField(max_length=50, unique=True)
    url  = models.URLField(max_length=400, null=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    owner = models.CharField(max_length=200)
    video_status = models.CharField(max_length=4, choices=VIDEO_STATUS, default=PENDING_DOWNLOAD)
    file_path = models.FilePathField(path=settings.FILE_PATH_FIELD_DIRECTORY,null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(Profile, related_name="VideoAsProfiles", on_delete=models.RESTRICT)

    def __str__(self):
        return self.name
        
    @property
    def creater(self):
        return self.created_by.username
    class Meta:
        ordering = ["-created_date"]

# Create your models here.
class Tag(models.Model):
    # id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)

    def __str__(self):
        return self.name

class Annotation(models.Model):
    # id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    begin = models.IntegerField(blank=False)
    end = models.IntegerField(blank=False)
    tags = models.ManyToManyField(Tag, blank=True)
    created_date = models.DateTimeField(blank=True, null=True)

    created_by = models.ForeignKey(Profile, related_name="AnnotationAsProfiles", on_delete=models.CASCADE)
    video = models.ForeignKey(Video, related_name="AnnotationAsVideo", on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['created_date']