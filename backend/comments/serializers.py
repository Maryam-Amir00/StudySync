from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    post = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'content',
            'author',
            'post',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']