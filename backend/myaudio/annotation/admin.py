from django.contrib import admin
from annotation.models import AnnotationModel, TagModel, VideoModel

admin.site.register(VideoModel)
admin.site.register(AnnotationModel)
admin.site.register(TagModel)