from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Post
from .serializers import PostSerializer
from .permissions import IsAuthorOrReadOnly
from .pagination import PostPagination


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        group_id = self.request.query_params.get('group')

        queryset = Post.objects.all().select_related('author', 'group').prefetch_related('comments')

        try:
            if group_id:
                queryset = queryset.filter(group_id=int(group_id))
        except (ValueError, TypeError):
            pass

        return queryset

    def perform_create(self, serializer):
        group = serializer.validated_data['group']
        user = self.request.user

        if not group.memberships.filter(user=user).exists():
            raise PermissionDenied("You must join the group to post.")

        serializer.save(author=user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def get_queryset(self):
        return Post.objects.all().select_related('author', 'group').prefetch_related('comments')