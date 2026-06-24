from django.urls import path, re_path
from .consumers import ChatConsumer, PresenceConsumer, NotificationConsumer

websocket_urlpatterns = [
    path(route='chat/<int:chat_id>/', view= ChatConsumer.as_asgi()),
    path(route='chat/online/', view= PresenceConsumer.as_asgi()),
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
]