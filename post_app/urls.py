from django.urls import path
from .views import PostListView, PostCreationView

urlpatterns = [
    path(route= '', view= PostListView.as_view(), name= 'post_list'),
    path(route= '', view= PostCreationView.as_view(), name= 'post_create'),
]
