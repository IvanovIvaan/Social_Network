from django.urls import path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    path(route='chat/<int:chat_id>/', view= ChatConsumer.as_asgi())
]