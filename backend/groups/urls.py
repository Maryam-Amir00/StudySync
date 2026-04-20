from django.urls import path
from .views import GroupListCreateView, JoinGroupView, LeaveGroupView, GroupUpdateView

urlpatterns = [
    path('', GroupListCreateView.as_view(), name='group-list-create'),
    path('<int:group_id>/join/', JoinGroupView.as_view(), name='group-join'),
    path('<int:group_id>/leave/', LeaveGroupView.as_view()),
    path('<int:pk>/', GroupUpdateView.as_view()),
]