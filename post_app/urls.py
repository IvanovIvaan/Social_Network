from django.urls import path
from .views import PostListView, PostCreationView, PostDeleteView, TagCreationView, ImageDeleteView

urlpatterns = [
    path(route= '', view= PostListView.as_view(), name= 'post_list'),
    path(route= 'create/', view= PostCreationView.as_view(), name= 'post_create'),
    path(route= "post/post-<int:post_id>/delete/", view= PostDeleteView.as_view(), name="post_delete"),
    path(route= 'create-tag/', view= TagCreationView.as_view(), name= 'tag_create'),
    path('delete/<str:filename>/', view= ImageDeleteView.as_view(), name='delete_image'),
    
]
