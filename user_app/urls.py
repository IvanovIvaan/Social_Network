from django.urls import path
from .views import AuthTemplateView, render_settings

urlpatterns = [
    path(route= 'settings/', view= render_settings, name= 'settings'),
    path(route= 'auth/', view= AuthTemplateView.as_view(), name= 'auth'),
]