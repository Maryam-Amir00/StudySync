from rest_framework import serializers
from .models import Comment
from posts.models import Post

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    post = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        write_only=True
    )

    post_details = serializers.StringRelatedField(source='post', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'content',
            'author',
            'post',
            'post_details',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']