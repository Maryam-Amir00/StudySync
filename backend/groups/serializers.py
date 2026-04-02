from rest_framework import serializers
from .models import Group, Membership

class GroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    admin = serializers.SerializerMethodField()
    created_by = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_by', 'admin', 'members']

    def get_memberships(self, obj):
        return obj.membership_set.all()

    def get_members(self, obj):
        memberships = self.get_memberships(obj)

        return [
            {
                "username": m.user.username,
                "role": m.role
            }
            for m in memberships
        ]

    def get_admin(self, obj):
        memberships = self.get_memberships(obj)

        for m in memberships:
            if m.role == 'admin':
                return m.user.username

        return None