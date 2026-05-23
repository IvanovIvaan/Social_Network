from django.urls import path
from .views import SetProfileView, AllPostListView
from post_app.views import PostCreationView, PostDeleteView, TagCreationView

urlpatterns = [
    path(route= '', view= AllPostListView.as_view(), name= 'home'),
    path(route= 'setprofile/', view= SetProfileView.as_view(), name= 'setprofile'),
    path(route= 'create/', view= PostCreationView.as_view(), name= 'post_create'),
    path(route= "post/post-<int:post_id>/delete/", view= PostDeleteView.as_view(), name="post_delete"),
    path(route= 'create-tag/', view= TagCreationView.as_view(), name= 'tag_create'),
]
