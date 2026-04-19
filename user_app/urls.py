from django.urls import path
from .views import render_user, render_settings, render_login, render_registration

urlpatterns = [
    path(route= 'user/', view= render_user, name= 'user'),
    path(route= 'settings/', view= render_settings, name= 'settings'),
    path(route= 'registration/', view= render_registration, name= 'registration'),
    path(route= 'login/', view= render_login, name= 'login'),
]