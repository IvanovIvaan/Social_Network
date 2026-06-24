from django.urls import path
from .views import (ChatsView, 
                    ChatWithView, 
                    MessageHistoryView, 
                    CreateGroupView, 
                    MessageUploadView, 
                    GroupEditDataView, 
                    # GroupEditView,
                    RemoveUserFromGroupView, 
                    UpdateGroupView,)

urlpatterns = [
    path(route= '', view= ChatsView.as_view(), name= 'chat'),
    path(route= 'chat_with/<int:user_id>/', view= ChatWithView.as_view(), name= 'chat_with'),
    path(route= '<int:chat_id>/messages/', view= MessageHistoryView.as_view(), name= 'message_history'),
    path(route= "create_group/", view= CreateGroupView.as_view(), name="create_group"),
    path(route= "<int:chat_id>/messages/upload/", view= MessageUploadView.as_view(), name= "message_upload"),
    path(route= "group/<int:chat_id>/edit/", view= GroupEditDataView.as_view(), name= "edit_group"),
        # path(route= "group/<int:chat_id>/edit/", view= GroupEditView.as_view()),
    path(route= "group/<int:chat_id>/remove-user/", view= RemoveUserFromGroupView.as_view(), name= "remove_group_user"),
    path(route= "group/<int:chat_id>/update/", view= UpdateGroupView.as_view(), name= "update_group"),
]