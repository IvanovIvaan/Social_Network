from django.urls import path
from .views import PostListView, PostCreationView, PostDeleteView

urlpatterns = [
    path(route= '', view= PostListView.as_view(), name= 'post_list'),
    path(route= 'create/', view= PostCreationView.as_view(), name= 'post_create'),
    path(route= "post/post-<int:post_id>/delete/", view= PostDeleteView.as_view(), name="post_delete"),
]
