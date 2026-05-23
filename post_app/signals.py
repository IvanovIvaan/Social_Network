from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import PostImage

@receiver(post_delete, sender=PostImage)
def auto_delete_images_on_delete(sender, instance, **kwargs):

    if instance.original_image:
        instance.original_image.delete(save=False)

    if instance.compressed_image:
        instance.compressed_image.delete(save=False)