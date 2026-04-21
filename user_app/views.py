from django.shortcuts import render
from django.views.generic.base import TemplateView
from .forms import EmailUserCreationForm
from django.contrib.auth.forms import AuthenticationForm

# Create your views here.
def render_settings(request):
    return render(
        request= request,
        template_name= 'settings.html'
        )

# def render_user(request):
#     return render(
#         request= request,
#         template_name= 'user.html'
#         )

# def render_auth(request):
#     return render(
#         request= request,
#         template_name= 'auth.html'
#         )

# def render_login(request):
#     return render(
#         request= request,
#         template_name= 'login.html'
#         )

class AuthTemplateView(TemplateView):

    template_name = 'user_app/auth.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_registration'] = EmailUserCreationForm()
        context['form_login'] = AuthenticationForm()
        context['form_confirm'] = ''
        return context
        