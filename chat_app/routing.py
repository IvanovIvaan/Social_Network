from django.urls import path
from .consumers import ChatConsumer, PresenceConsumer

websocket_urlpatterns = [
    path(route='chat/<int:chat_id>/', view= ChatConsumer.as_asgi()),
    path(route='chat/online/', view= PresenceConsumer.as_asgi())
]