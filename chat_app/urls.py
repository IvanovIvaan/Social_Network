from django.urls import path
from .views import render_chat

urlpatterns = [
    path(route= '', view= render_chat, name= 'chat'),
]