from django.db import models
from django.contrib.auth.models import User
from groups.models import Group


class Post(models.Model):
    title = models.CharField(max_length=255, blank=False)
    content = models.TextField()

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='posts') 

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  

    class Meta:
        ordering = ['-created_at']  
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title