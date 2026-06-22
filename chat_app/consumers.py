from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils.timezone import localtime
from django.templatetags.static import static

from .forms import MessageForm
import json
from .models import Chat, Message


class PresenceConsumer(AsyncWebsocketConsumer):
    online_users = set()
    async def connect(self):
        self.user = self.scope['user']
        self.user_id = str(self.user.id)
        self.group_name = 'online_users'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self.online_users.add(self.user_id)
        for user_id in self.online_users:
            await self.send_status(user_id, 'online')
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence_status",
                "user_id": self.user_id,
                "status": "online"
            }
        )
    async def presence_status(self, event):
        await self.send_status(event["user_id"], event["status"])

    async def send_status(self, user_id, status):
        await self.send(text_data = json.dumps(
            {
                "user_id": user_id,
                "status": status,
            }
        ))

    async def disconnect(self, close_code):
        self.online_users.discard(self.user_id)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence_status",
                "user_id": self.user_id,
                "status": "offline"
            }
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)


        
class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        
        print('CONNECT CALLED')

        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat{self.chat_id}'
        username = await self.get_other_username()
        if username is None:
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.send(text_data= json.dumps(
            {
                "type": "connection_established",
                "message": f"Зв'язок з {username} встановлено",
                "username": username
            }
        ))

    @database_sync_to_async
    def get_other_username(self):
        user = self.scope.get("user")
        if user is None or user.is_anonymous:
            return None
        # chat = Chat.objects.get(id=self.chat_id)
        try:
            chat = Chat.objects.get(id=self.chat_id)
        except Chat.DoesNotExist:
            return None
        other_user = chat.users.exclude(id= user.id).first()
        if other_user is None:
            return None
        return other_user.username
    
    async def recieve(self, text_data):
        data = json.loads(text_data)
        text = data.get('message')
        if text.strip():
            message = await self.save_message(text)
            await self.channel_layer.group_send(
                group = self.room_group_name,
                message = {
                    'type': 'send_message',
                    'message': message
                }
            )
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
    #
    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     text = data.get('text', '').strip()
    #     if not text:
    #         return
    #     message = await self.save_message(text)
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': "send_message",
    #             "id": message["id"],
    #             "text": message["text"],
    #             "sender": message["sender"],
    #             "nickname": message['nickname'],
    #             'avatar': message["avatar"],
    #             "created_at": message["created_at"],
    #             "unread_count": message["unread_count"],
    #         }
    #     )

    #     unread_count = await self.get_unread_count()
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': "update_unread",
    #             "chat_id": self.chat_id,
    #             "unread_count": unread_count
    #         }
    #     )
    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get('text', '').strip()
        if not text:
            return

        message = await self.save_message(text)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': "send_message",
                "id": message["id"],
                "text": message["text"],
                "sender": message["sender"],
                "nickname": message['nickname'],
                "avatar": message["avatar"],
                "created_at": message["created_at"],
                "images": message["images"]
            }
        )

        unread_count = await self.get_unread_count()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': "update_unread",
                "chat_id": self.chat_id,
                "unread_count": unread_count
            }
        )
    #   
    async def send_message(self, text):
        await self.send(text_data= json.dumps(
            {
                'id': text["id"],
                'text': text["text"],
                "sender": text["sender"],
                "nickname": text['nickname'],
                "avatar": text["avatar"],
                "created_at": text["created_at"],
                "images": text.get("images", [])
                # "unread_count": text["unread_count"],
            }
        ))

    #
    @database_sync_to_async
    def save_message(self, text):
        user = self.scope.get("user")
        message = Message.objects.create(chat_id = self.chat_id, sender= user, text= text)
        return {
            'id': message.id,
            'text': message.text,
            'sender': user.username,
            'nickname': user.nickname,
            'avatar': user.avatar.url if user.avatar else static('images/profile/none_avatar.jpg'),
            'created_at': localtime(message.created_at).strftime('%H:%M'),
            "images": []
        }
    
    @database_sync_to_async
    def get_unread_count(self):
        user = self.scope["user"]

        return Message.objects.filter(chat_id= self.chat_id).exclude(sender= user).exclude(readers= user).count()
    
    async def update_unread(self, event):
        await self.send(text_data=json.dumps({
            "type": "update_unread",
            "chat_id": event["chat_id"],
            "unread_count": event["unread_count"]
        }))