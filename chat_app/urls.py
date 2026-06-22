from django.urls import path
from .views import ChatsView, ChatWithView, MessageHistoryView, CreateGroupView, MessageUploadView

urlpatterns = [
    path(route= '', view= ChatsView.as_view(), name= 'chat'),
    path(route= 'chat_with/<int:user_id>/', view= ChatWithView.as_view(), name= 'chat_with'),
    path(route= '<int:chat_id>/messages/', view= MessageHistoryView.as_view(), name= 'message_history'),
    path(route= "create_group/", view= CreateGroupView.as_view(), name="create_group"),
    path("<int:chat_id>/messages/upload/", MessageUploadView.as_view(), name= "message_upload"),
]