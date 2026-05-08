from django.shortcuts import render
from django.views.generic import TemplateView
from django.views import View
from django.http import JsonResponse, HttpRequest

from .forms import SetNicknameForm

# Create your views here.
# def render_home(request):
#     return render(
#         request= request,
#         template_name= 'home.html'
#     ) 

class HomeTemplateView(TemplateView):
    template_name = 'home_app/home.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_setnickname'] = SetNicknameForm()
        return context

class SetNicknameView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        form = SetNicknameForm(request.POST)