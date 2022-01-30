from django.contrib import admin
from annotation.models import Video, Tag, Annotation
# Register your models here.

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    model = Video

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    model = Tag

@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    model = Annotation