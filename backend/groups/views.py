from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Group, Membership
from .serializers import GroupSerializer
from .pagination import GroupPagination


class GroupListCreateView(generics.ListCreateAPIView):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = GroupPagination

    def get_queryset(self):
        queryset = Group.objects.all().prefetch_related('memberships__user')

        search = self.request.query_params.get('search', '').strip()

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)

        Membership.objects.create(
            user=self.request.user,
            group=group,
            role='admin'
        )


class JoinGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        user = request.user

        membership, created = Membership.objects.get_or_create(
            user=user,
            group=group,
            defaults={'role': 'member'}
        )

        if not created:
            return Response(
                {"message": "You are already a member"},
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "message": "Joined successfully",
                "group_id": group.id,
                "group_name": group.name
            },
            status=status.HTTP_201_CREATED
        )

class LeaveGroupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        membership = get_object_or_404(
            Membership,
            user=request.user,
            group_id=group_id
        )

        membership.delete()

        return Response({"message": "Left group successfully"})