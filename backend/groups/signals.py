from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Membership
from .models import Group


@receiver(post_delete, sender=Membership)
def handle_admin_removal(sender, instance, **kwargs):
    if instance.role != 'admin':
        return

    group = instance.group
    remaining_members = group.memberships.all()

    if remaining_members.exists():
        new_admin = remaining_members.order_by('joined_at').first()
        new_admin.role = 'admin'
        new_admin.save()
    else:
        group.delete()