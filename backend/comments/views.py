from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from .models import Comment
from .serializers import CommentSerializer
from .permissions import IsAuthorOrReadOnly
from .pagination import CommentPagination
from posts.models import Post


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CommentPagination

    def get_queryset(self):
        post_id = self.kwargs['post_id']

        return Comment.objects.filter(
            post_id=post_id
        ).select_related('author', 'post')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = get_object_or_404(Post, id=post_id)

        user = self.request.user

        if not post.group.memberships.filter(user=user).exists():
            raise PermissionDenied("Join group first.")

        serializer.save(author=user, post=post)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']

        return Comment.objects.filter(
            post_id=post_id
        ).select_related('author', 'post')