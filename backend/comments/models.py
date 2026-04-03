from django.db import models
from django.contrib.auth.models import User
from posts.models import Post


class Comment(models.Model):
    content = models.TextField()

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']   
        indexes = [
            models.Index(fields=['post']),
        ]

    def __str__(self):
        return f"{self.author.username} - {self.post.title}"