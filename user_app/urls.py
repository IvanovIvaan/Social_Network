from django.urls import path
from .views import render_user, render_settings

urlpatterns = [
    path(route= 'user/', view= render_user, name= 'user'),
    path(route= 'settings/', view= render_settings, name= 'settings'),
]