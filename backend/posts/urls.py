from django.urls import path
from .views import PostListCreateView, PostDetailView
from comments.views import CommentListCreateView, CommentDetailView

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('<int:post_id>/comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
]