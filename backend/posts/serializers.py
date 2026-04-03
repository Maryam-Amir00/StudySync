from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)

    group = serializers.SerializerMethodField()
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'content',
            'author',
            'group',
            'comment_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_group(self, obj):
        return {
            "id": obj.group.id,
            "name": obj.group.name
        }

    def validate_group(self, value):
        user = self.context['request'].user

        if not value.membership_set.filter(user=user).exists():
            raise serializers.ValidationError("You must join the group to post.")

        return value