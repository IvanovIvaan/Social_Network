from django.shortcuts import render
from django.views.generic import TemplateView, ListView
from django.views import View
from django.http import JsonResponse, HttpRequest
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.contrib.auth.mixins import LoginRequiredMixin

from .forms import ProfileForm
from post_app.forms import PostCreationForm, TagCreationForm
from post_app.models import Post

# Create your views here.
# def render_home(request):
#     return render(
#         request= request,
#         template_name= 'home.html'
#     ) 

# class HomeTemplateView(TemplateView):
#     template_name = 'home_app/home.html'

#     def get_context_data(self, **kwargs) -> dict:
#         context = super().get_context_data(**kwargs)
#         context['form_setnickname'] = SetNicknameForm()
#         # context['form_post_creation'] = PostCreationForm()
#         # context['posts'] = Post.objects.all()
#         return context
    
class AllPostListView(LoginRequiredMixin, ListView):
    model = Post
    context_object_name = 'posts'
    paginate_by = 5
    template_name = 'home_app/home.html'
    
    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_post_creation'] = PostCreationForm()
        context['form_tag_creation'] = TagCreationForm()
        if(self.request.user.is_authenticated and not self.request.user.profile_completed):
            context['form_profile'] = ProfileForm()
        return context
    
    def get(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            queryset = self.get_queryset()
            paginator = Paginator(queryset, self.paginate_by)
            page_number = request.GET.get('page')
            page_object = paginator.get_page(page_number)
            if int(page_number) > paginator.num_pages:
                return JsonResponse({'success': False})
            return JsonResponse({
                'success': True,
                'html': render_to_string("post_app/particles/list_post.html", {
                    'posts': page_object.object_list,
                    'form_post_creation': PostCreationForm()
                },
                request= request
                )
            })
        return super().get(request, *args, **kwargs)

class SetProfileView(LoginRequiredMixin, View):
    def post(self, request: HttpRequest, *args, **kwargs):
        if request.user.profile_completed:
            return JsonResponse({
                'success': False,
                'message': 'Профіль вже налаштований'
            }, status=400)


        form = ProfileForm(request.POST, request.FILES, instance= request.user)

        if form.is_valid():
            user = form.save(commit= False)

            user.profile_completed = True
            user.save()

            return JsonResponse({
                'success': True,
                'message': 'Успішно змінені дані профілю',
                "close_first_login": True
            })
        
        return JsonResponse({
            'errors': form.errors.get_json_data()
        }, status= 400)