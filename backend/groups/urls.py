from django.urls import path
from .views import GroupListCreateView, JoinGroupView

urlpatterns = [
    path('', GroupListCreateView.as_view()),
    path('<int:group_id>/join/', JoinGroupView.as_view()),
]