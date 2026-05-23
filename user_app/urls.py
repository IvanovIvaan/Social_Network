from django.urls import path
from .views import (AuthTemplateView, 
                    render_settings, 
                    LoginView, 
                    RegisterView, 
                    ConfirmView, 
                    LogoutView, 
                    FriendsView, 
                    ShowSection,
                    FriendActionView
                    )

urlpatterns = [
    path(route= '', view= AuthTemplateView.as_view(), name= 'auth'),
    path(route= 'login/', view= LoginView.as_view(), name= 'login'),
    path(route= 'register/', view= RegisterView.as_view(), name= 'register'),
    path(route= 'logout/', view= LogoutView.as_view(), name= 'logout'),
    path(route= 'confirm/', view= ConfirmView.as_view(), name= 'confirm'),

    path(route= 'friends/', view= FriendsView.as_view(), name= 'friends'),
    path(route= 'friends/show-section/', view= ShowSection.as_view(), name= 'show-section'),
    path(route= 'friends/action/<int:user_id>/<str:action>/', view= FriendActionView.as_view(), name= 'friend_action'),
    
    path(route= 'settings/', view= render_settings, name= 'settings'),
]