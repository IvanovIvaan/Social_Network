from django.shortcuts import render
from django.views.generic.base import TemplateView
from .forms import PostCreationForm, MultipleFileField, MultipleFileInput
from django.views import View
from django.http import HttpRequest
# Create your views here.
# def render_post(request):
#     return render(
#         request= request,
#         template_name= 'post.html'
#         )

class PostView(TemplateView):
    template_name = 'post_app/post.html'

    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_post_creation'] = PostCreationForm()
        return context
    
class PostCreationView(View):
    def post(self, request: HttpRequest, *args, **kwargs):
        form = PostCreationForm(request.POST)