from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, get_user_model
from django.views.generic import TemplateView, ListView
from django.views import View
from .forms import EmailUserCreationForm, EmailAuthenticationForm, EmailConfirmForm, User
from django.http import JsonResponse, HttpRequest
from django.contrib.auth.mixins import LoginRequiredMixin
from django.template.loader import render_to_string
from django.core.paginator import Paginator


from .utils.confirm_code import *
from .utils.friend_queries import get_users_by_section
from .utils.friend_actions import add_friend_request, dismiss_recommendation, accept_friend_request, delete_friendship
from django.urls import reverse_lazy

User = get_user_model()

# Create your views here.
def render_settings(request):
    return render(
        request= request,
        template_name= 'settings.html'
        )



class AuthTemplateView(TemplateView):
    # умова: якщо користувач авторизований, повертає на головну сторінку
    template_name = 'user_app/auth.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_registration'] = EmailUserCreationForm()
        context['form_login'] = EmailAuthenticationForm()
        context['form_confirm'] = EmailConfirmForm()
        return context
    

# RegisterView
class RegisterView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        form = EmailUserCreationForm(request.POST)

        if form.is_valid():
            code = create_code()

            request.session['verification_code'] = code

            request.session['register_data'] = {
                'email': form.cleaned_data.get('email'),
                'password': form.cleaned_data.get('password1')
            }

            email = form.cleaned_data.get('email')
            send_code(
                email= email,
                code= code
            )

            return JsonResponse({
                'success': True,
                'message': 'Користувач успішно зареєстрований',
                "show_confirm": True
            })
        return JsonResponse({
            'errors': form.errors.get_json_data()
        }, status= 400)

# LoginView
class LoginView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        form = EmailAuthenticationForm(request= request, data= request.POST)
    
        if form.is_valid():
            user = form.get_user()
            login(request= request, user= user)
            return JsonResponse({
            "success": True,
            "redirect_url": "/home"
        })
        
        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data(),
        }, status= 400)
    
# LogoutView
class LogoutView(View):
    def get(self, request: HttpRequest):
        logout(request)
        return redirect("auth")
    
# ConfirmView
class ConfirmView(View):
    def post(self, request, *args, **kwargs):
        form = EmailConfirmForm(request.POST)

        if not form.is_valid():
            return JsonResponse({
                'errors': form.errors.get_json_data()
            }, status=400)

        entered_code = form.cleaned_data['code']
        session_code = request.session.get('verification_code')

        if not session_code:
            return JsonResponse({
                'errors': {
                    'code': [{'message': 'Код підтвердження протермінований'}]
                }
            }, status=400)

        if entered_code != session_code:
            return JsonResponse({
                'errors': {
                    'code': [{'message': 'Невірний код'}]
                }
            }, status=400)

        register_data = request.session.get('register_data')

        if not register_data:
            return JsonResponse({
                'errors': {
                    'session': [{'message': 'Сесія завершилась'}]
                }
            }, status=400)

        if User.objects.filter(email=register_data['email']).exists():
            return JsonResponse({
                'errors': {
                    'email': [{'message': 'Користувач уже існує'}]
                }
            }, status=400)

        user = User.objects.create_user(
            username=register_data['email'],
            email=register_data['email'],
            password=register_data['password']
        )

        # login(request, user)

        request.session.pop('verification_code', None)
        request.session.pop('register_data', None)

        return JsonResponse({
            'success': True,
            'show_login': True,
            
            'email': register_data['email']
        })

    

class FriendsView(LoginRequiredMixin, TemplateView):
    template_name = 'user_app/friends.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['sections'] = {
            'requests': {'title': 'Запити', 'users': get_users_by_section(user = self.request.user, section= 'requests')[:3]},
            'recommendations': {'title': 'Рекомендації', 'users': get_users_by_section(user = self.request.user, section= 'recommendations')[:6]},
            'friends': {'title': 'Всі друзі', 'users': get_users_by_section(user = self.request.user, section= 'friends')[:6]},
        }
        return context



class ShowSection(LoginRequiredMixin, ListView):
    template_name = 'user_app/particles/friends/friends_card.html'

    section_limits = {
        'requests': 18,
        'recommendations': 18,
        'friends': 18,
    }
    
    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            section = request.GET.get('section')
            paginate_by = self.section_limits.get(section, 5)
            queryset = get_users_by_section(
                user= self.request.user,
                section= section
            )
            paginator = Paginator(queryset, paginate_by)
            page_number = request.GET.get('page')
            
            page_object = paginator.get_page(page_number)
            if int(page_number) > paginator.num_pages:
                return JsonResponse({'success': False})
            return JsonResponse({
                'success': True,
                'html': render_to_string("user_app/particles/friends/friends_card.html", {'users': page_object.object_list, 'section': section},
                request= request
                )
            })
        return super().get(request, *args, **kwargs)
    
class FriendActionView(LoginRequiredMixin, View):
    login_url = reverse_lazy('auth')

    def post(self, request, user_id, action, *args, **kwargs):
        other_user = User.objects.get(id= user_id)

        if action == 'add':
            return JsonResponse(add_friend_request(request.user, other_user))
        if action == 'dismiss':
            return JsonResponse(dismiss_recommendation(request.user, other_user))
        if action == 'accept':
            action_result = accept_friend_request(request.user, other_user)
            action_result['friend_html']= render_to_string(
                'user_app/particles/friends/friends_card.html',
                {'users': [action_result['friend']], 'section': 'friends'},
                request=request
            )
            del action_result['friend']

            return JsonResponse(action_result)
        
        return JsonResponse(delete_friendship(request.user, other_user))