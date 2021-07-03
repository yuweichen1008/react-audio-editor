import graphene
from graphene import relay, ObjectType
from graphene_django import DjangoObjectType

from annotation.models import VideoModel, TagModel, AnnotationModel

class VideoType(DjangoObjectType):
    class Meta:
        model = VideoModel
        # interfaces = (relay.Type, )
        # filter_fields = ['name', 'url', 'create_date']

class TagType(DjangoObjectType):
    class Meta:
        model = TagModel
        # interfaces = (relay.Type, )
        # filter_fields = ['name', 'slug']

class AnnotationType(DjangoObjectType):
    class Meta:
        model = AnnotationModel
        # interfaces = (relay.Type, )
        # filter_fields = ['name', 'begin', 'end', 'annotate', 'tags']

class Query(graphene.ObjectType):
    videos = graphene.List(VideoType)
    tags   = graphene.List(TagType)
    annotations = graphene.List(AnnotationType)

    def resolve_videos(self, info):
        return VideoModel.objects.all()

    def resolve_tags(self, info):
        return TagModel.objects.all()
    
    def resolve_annotaions(self, info):
        return AnnotationModel.objects.all()


class Mutation(graphene.ObjectType):
    pass

schema = graphene.Schema(
    query=Query,
    # mutation=Mutation
)