from rest_framework import serializers
from .models import Group


class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    admin = serializers.SerializerMethodField()
    created_by = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_by', 'admin', 'members']
        read_only_fields = ['created_by', 'admin', 'members']

    def get_members(self, obj):
        memberships = obj.memberships.select_related('user')

        return [
            {
                "username": m.user.username,
                "role": m.role
            }
            for m in memberships
        ]

    def get_admin(self, obj):
        admin = obj.memberships.filter(role='admin').select_related('user').first()

        return admin.user.username if admin else None