from django.urls import path
from .views import render_post

urlpatterns = [
    path(route= '', view= render_post, name= 'post'),
]
