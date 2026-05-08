from django.contrib import admin
from .models import Post, Tag, PostLinks, PostImage, PostView

# Register your models here.

admin.site.register(Post)
admin.site.register(Tag)
admin.site.register(PostLinks)
admin.site.register(PostImage)
admin.site.register(PostView)


