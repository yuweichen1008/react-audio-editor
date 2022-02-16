# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import generics
from annotation.models import Video, Annotation
# from rest_framework import renderers
from annotation.serializers import VideoSerializer
from rest_framework import permissions
from myapp.permissions import IsOwnerOrReadOnly

# @api_view(['GET'])
# def api_root(request, format=None):
#     return Response({
#         'video': reverse('video-list', request=request, format=format),
#         'annotation': reverse('annotation-list', request=request, format=format)
#     })

class VideoList(generics.ListCreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                          IsOwnerOrReadOnly]
    # renderer_classes = [renderers.StaticHTMLRenderer]

