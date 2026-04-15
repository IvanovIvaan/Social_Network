from django.urls import path
from .views import render_home

urlpatterns = [
    path(route= '', view= render_home, name= 'home'),
]
