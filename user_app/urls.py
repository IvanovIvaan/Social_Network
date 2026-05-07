from django.urls import path
from .views import AuthTemplateView, render_settings, LoginView, RegisterView, ConfirmView, LogoutView

urlpatterns = [
    path(route= '', view= AuthTemplateView.as_view(), name= 'auth'),
    path(route= 'login/', view= LoginView.as_view(), name= 'login'),
    path(route= 'register/', view= RegisterView.as_view(), name= 'register'),
    path(route= 'logout/', view= LogoutView.as_view(), name= 'logout'),
    path(route= 'confirm/', view= ConfirmView.as_view(), name= 'confirm'),
    
    path(route= 'settings/', view= render_settings, name= 'settings'),
]