from django.db import models
import uuid
from django.utils import tree

# Create your models here.
class TagModel(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)

    def __str__(self):
        return self.name

class VideoModel(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    url  = models.URLField(max_length=400)
    create_date = models.DateField()

class AnnotationModel(models.Model):
    # id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    video = models.ForeignKey(
        VideoModel, related_name="video", on_delete=models.CASCADE
    )
    begin = models.IntegerField(blank=False)
    end = models.IntegerField(blank=False)
    annotate = models.CharField(max_length=100)
    tags = models.ManyToManyField(TagModel, blank=True)