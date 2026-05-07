from django.urls import path
from .views import PostView

urlpatterns = [
    path(route= '', view= PostView.as_view(), name= 'post_create'),
]
