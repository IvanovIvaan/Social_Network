from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, get_user_model
from django.views.generic import TemplateView
from django.views import View
from .forms import EmailUserCreationForm, EmailAuthenticationForm, EmailConfirmForm, User
from django.http import JsonResponse, HttpRequest

from .utils import *

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

    

        