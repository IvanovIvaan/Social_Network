from django.urls import path
from .views import render_friends

urlpatterns = [
    path(route= '', view= render_friends, name= 'friends'),
]
