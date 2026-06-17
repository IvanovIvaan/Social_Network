"""
ASGI config for Social_Network project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# import os

# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from chat_app.routing import websocket_urlpatterns

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Social_Network.settings')

# application = get_asgi_application()

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': URLRouter(websocket_urlpatterns)
# })


import os

from django.core.asgi import get_asgi_application

from channels.routing import (
    ProtocolTypeRouter,
    URLRouter
)

from channels.auth import AuthMiddlewareStack

from chat_app.routing import websocket_urlpatterns


os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'Social_Network.settings'
)

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({

    'http': django_asgi_app,

    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    )

})