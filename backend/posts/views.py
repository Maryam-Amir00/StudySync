from rest_framework import generics, permissions
from .models import Post
from .serializers import PostSerializer
from .permissions import IsAuthorOrReadOnly


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        group_id = self.request.query_params.get('group')

        queryset = Post.objects.filter(
            group__membership__user=user
        ).select_related('author', 'group').distinct()

        if group_id and group_id.isdigit():
            queryset = queryset.filter(group_id=group_id)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)



class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def get_queryset(self):
        user = self.request.user

        return Post.objects.filter(
            group__membership__user=user
        ).select_related('author', 'group').distinct()