from rest_framework.pagination import PageNumberPagination


class GroupPagination(PageNumberPagination):
    page_size = 10