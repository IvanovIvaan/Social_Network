from django.urls import path
from .views import HomeTemplateView, SetNicknameView

urlpatterns = [
    path(route= '', view= HomeTemplateView.as_view(), name= 'home'),
    path(route= 'setup/', view= SetNicknameView.as_view(), name= 'setnickname'),
]
