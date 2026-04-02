from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Group, Membership
from .serializers import GroupSerializer


class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Group.objects.all().prefetch_related('membership_set__user')

        search = self.request.query_params.get('search', '').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)

        Membership.objects.create(
            user=self.request.user,
            group=group,
            role='admin'
        )


class JoinGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_membership(self, user, group):
        return Membership.objects.filter(user=user, group=group).first()

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)

        membership = self.get_membership(request.user, group)

        if membership:
            return Response(
                {"message": "You are already a member"},
                status=status.HTTP_200_OK
            )

        Membership.objects.create(
            user=request.user,
            group=group,
            role='member'
        )

        return Response(
            {
                "message": "Joined successfully",
                "group_id": group.id,
                "group_name": group.name
            },
            status=status.HTTP_201_CREATED
        )