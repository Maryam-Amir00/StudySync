from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'group', 'group_name', 'created_at']
        read_only_fields = ['author', 'created_at']

    def validate_group(self, value):
        user = self.context['request'].user

        is_member = value.membership_set.filter(user=user).exists()

        if not is_member:
            raise serializers.ValidationError("You must join the group to post.")

        return value