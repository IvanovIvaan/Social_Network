from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpRequest
from django.contrib.auth import get_user_model
from django.templatetags.static import static
from django.core.paginator import Paginator
from django.utils.timezone import localtime
from django.db.models import Count, Q
import json
from asgiref.sync import async_to_sync
from django.utils import timezone
from channels.layers import get_channel_layer

from user_app.utils.friend_queries import get_users_by_section
from .models import Chat, Message, MessageImage
from .forms import MessageForm
from utils.compressed_image import _compressed_image

User = get_user_model()

MAX_COMPRESSED_IMAGE_SIZE = 0.1 * 1024 * 1024
MAX_COMPRESSED_AVATAR_SIZE = 0.05 * 1024 * 1024


class ChatsView(LoginRequiredMixin, TemplateView):
    template_name = 'chat_app/chat.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['chat_form'] = MessageForm
        context['contacts'] = {
                'users': get_users_by_section(user = self.request.user, section= 'friends').order_by('nickname'),
            }
        context["group_chats"] = Chat.objects.filter(users=self.request.user, is_group=True).order_by("id")
        

        chats = Chat.objects.filter(users= self.request.user, is_group= False)
        

        chat_data = []
        for chat in chats:
            other = chat.users.exclude(id= self.request.user.id).first()

            unread_count = chat.messages.exclude(sender=self.request.user).exclude(readers=self.request.user).count()

            chat_data.append({
                "id": chat.id,
                "user_id": other.id,
                "username": other.username,
                "nickname": other.nickname,
                "avatar": other.avatar.url if other.avatar else static('images/profile/none_avatar.jpg'),
                "unread_count": unread_count,
            })

        context["personal_chats"] = chat_data

        return context
    
    def get_unread_count(user, chat_id):
        return Message.objects.filter(chat_id=chat_id).exclude(sender=user).exclude(readers=user).count()
    def get_total_unread(user):
        return Message.objects.exclude(sender=user).exclude(readers=user).filter(chat__users=user).count()
    

class ChatWithView(
    # LoginRequiredMixin, 
    View):
    def get_other_user(chat, request_user):
        return chat.users.exclude(id=request_user.id).first()


    def post(self, request, user_id, *args, **kwargs):
        other_user = User.objects.get(id= user_id)
        friends = get_users_by_section(user= request.user, section= "friends")
        if other_user not in friends:
            return JsonResponse({"success": False}, status= 403)
        
        user_id_chats = Chat.objects.filter(users= request.user, is_group= False).values_list('id', flat= True)
        chat = Chat.objects.filter(id__in = user_id_chats, users= other_user, is_group= False).first()
        if chat is None:
            chat = Chat.objects.create(is_group = False)
            chat.users.add(request.user, other_user)
        return JsonResponse({
            'success': True,
            'chat_id': chat.id,
            'username': other_user.username,
            'chat': {
                'id': chat.id,
                'username': other_user.username,
                'nickname': other_user.nickname,
                'avatar': other_user.avatar.url if other_user.avatar else static('images/profile/none_avatar.jpg'),
            }
        })

class MessageHistoryView(LoginRequiredMixin,View):

    PAGE_SIZE = 16

    def get(self, request, chat_id):
        if not Chat.objects.filter(id= chat_id, users= request.user).exists():
            return JsonResponse({'success': False}, status= 403)
        
        messages_queryset = Message.objects.filter(chat_id=chat_id).select_related("sender").order_by("-created_at", "-id")

        unread_messages = messages_queryset.exclude(
            sender=request.user
        ).exclude(
            readers=request.user
        )

        for message in unread_messages:
            message.readers.add(request.user)

        page_number = request.GET.get("page", 1)
        paginator = Paginator(messages_queryset, self.PAGE_SIZE)
        page_object = paginator.get_page(page_number)

        messages = list(page_object.object_list)[::-1]

        return JsonResponse({
            "success": True,
            'messages': [
                {
                    'id': message.id, 
                    'text': message.text, 
                    'sender': message.sender.username,
                    'nickname': message.sender.nickname, 
                    'created_at': timezone.localtime(message.created_at).strftime('%H:%M'),
                    'avatar': message.sender.avatar.url if message.sender.avatar else static('images/profile/none_avatar.jpg'),
                    'images': [image.image.url for image in message.images.all()]
                } for message in messages],
            'has_next': page_object.has_next(),
            'page': page_object.number,
        })
    

class CreateGroupView(
        LoginRequiredMixin,
        View
    ):

    def post(self, request, *args, **kwargs):
        # Отримуємо назву групи

        group_name = request.POST.get('name', '').strip()
        friends_id = request.POST.getlist('users')
        avatar = request.FILES.get("avatar")
        if not group_name:
            return JsonResponse({
                'success': False,
                'error': 'name required'
            }, status= 400)
        friends_list_id = get_users_by_section(user= request.user, section= 'friends').filter(id__in= friends_id).values_list('id', flat= True)
        chat = Chat.objects.create(name = group_name, is_group = True, admin = request.user)
        if avatar:
            chat.avatar = _compressed_image(image= avatar, size= MAX_COMPRESSED_AVATAR_SIZE, blur= True)
            chat.save(update_fields=["avatar"])
        chat.users.add(request.user)
        chat.users.add(*User.objects.filter(id__in = friends_list_id))
        user_count = chat.users.count()
        return JsonResponse({
            'success': True,
            'chat_id': chat.id,
            'name': chat.name,
            'user_count': user_count,
            "avatar": chat.avatar.url if chat.avatar else None,
        })
    
class MessageUploadView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest, chat_id: int, *args, **kwargs):

        if not Chat.objects.filter(id = chat_id, users = request.user).exists():
            return JsonResponse({'success': False}, status= 403)
        
        text = request.POST.get("text", "").strip()
        images = request.FILES.getlist("images")
        
        if not images and not text:
            return JsonResponse({'success': False, "error": "required message"}, status= 400)
        
        message = Message.objects.create(chat_id= chat_id, sender= request.user, text= text)
        
        for image in images:
            # MessageImage.objects.create(message= message, image= _compressed_image(image= image, size= MAX_COMPRESSED_IMAGE_SIZE, blur= False))
            MessageImage.objects.create(message= message, image= image)
        
        image_urls= [image.image.url for image in message.images.all()]
        print(image_urls)
        
        channel_layer= get_channel_layer()

        
        async_to_sync(channel_layer.group_send)(
            f"chat{chat_id}",
            {
                "type": "chat_message",
                "id": message.id,
                "text": message.text,
                "sender": message.sender.username,
                "created_at": timezone.localtime(message.created_at).strftime('%H:%M'),
                "images": image_urls
            }
        )
        chat = Chat.objects.get(id=chat_id)

        for user in chat.users.exclude(id=request.user.id):
            unread_count = Message.objects.filter(chat=chat).exclude(sender=user).exclude(readers=user).count()
            total_unread = Message.objects.filter(chat__users=user).exclude(sender=user).exclude(readers=user).count()

            async_to_sync(channel_layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "unread_update",
                    "chat_id": chat.id,
                    "unread_count": unread_count,
                    "total_unread": total_unread,
                }
            )
        return JsonResponse({"success": True })
    



# Класи відображення редагування групи

class GroupEditDataView(LoginRequiredMixin, View):
    def get(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return JsonResponse({"success": False}, status=404)

        return JsonResponse({
            "name": chat.name,
            "avatar": chat.avatar.url if chat.avatar else None,
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                    "nickname": user.nickname,
                    "avatar": user.avatar.url if user.avatar else static('images/profile/none_avatar.jpg')
                }
                for user in chat.users.all()
            ]
        })
    
class RemoveUserFromGroupView(LoginRequiredMixin, View):
    def post(self, request, chat_id):
        data = json.loads(request.body)
        user_id = data.get("user_id")

        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return JsonResponse({"success": False}, status=404)

        if request.user != chat.admin:
            return JsonResponse({"success": False, "error": "not allowed"}, status=403)

        chat.users.remove(user_id)

        return JsonResponse({"success": True})


class UpdateGroupView(LoginRequiredMixin, View):
    def post(self, request, chat_id):

        print(request.POST)
        print(request.FILES)

        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return JsonResponse({"success": False}, status=404)

        name = request.POST.get("name")
        avatar = request.FILES.get("avatar")

        if name:
            chat.name = name
        if avatar:
            chat.avatar = _compressed_image(image= avatar, size= MAX_COMPRESSED_AVATAR_SIZE, blur= True)

        print("BEFORE SAVE:", chat.name)

        chat.save()

        print("AFTER SAVE:", Chat.objects.get(id=chat.id).name)

        return JsonResponse({
            "success": True,
            "name": chat.name,
            "avatar": chat.avatar.url if chat.avatar else None
            })