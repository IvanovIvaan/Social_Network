from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView, ListView, FormView
from django.views import View
from django.http import HttpRequest, JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.db import transaction
import os
from django.conf import settings
from django.db import models

from .forms import PostCreationForm, MultipleFileField, MultipleFileInput, TagCreationForm
from .models import Post




class PostListView(LoginRequiredMixin, ListView):
    model = Post
    context_object_name = 'posts'
    paginate_by = 5
    template_name = 'post_app/post.html'

    def get_queryset(self):
        return Post.objects.filter(author = self.request.user).prefetch_related('images').order_by("-created_at", "-updated_at")
    
    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_post_creation'] = PostCreationForm()
        context['form_tag_creation'] = TagCreationForm()
        # context['posts'] = Post.objects.filter(author_id = self.request.user)[:self.paginate_by]
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

    

class PostCreationView(LoginRequiredMixin, FormView):
    template_name = "post_app/form_post_creation.html"
    form_class = PostCreationForm
    success_url = reverse_lazy("post_list")
    login_url = reverse_lazy("auth")

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        if self.request.method == "POST":
            kwargs["links"] = self.request.POST.getlist("links")
            kwargs["images"] = self.request.FILES.getlist("images")

        return kwargs

    def form_valid(self, form):
        try:
            with transaction.atomic():
                post = form.save(author=self.request.user)

            return JsonResponse({
                "success": True,
                "redirect_url": str(self.success_url),
                "post_id": post.id
            })

        except Exception as e:
            return JsonResponse({
                "success": False,
                "errors": {
                    "server": [{"message": str(e)}]
                }
            }, status=400)

    def form_invalid(self, form):
        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data()
        }, status= 400)
    
class PostDeleteView(LoginRequiredMixin, View):
    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            id= post_id,
            author= request.user
        )

        post.delete()

        return JsonResponse({
            "success": True
        })
    
    
class TagCreationView(LoginRequiredMixin, View):

    def get(self, request):
        form = TagCreationForm()
        return render(request, "form_post_creation.html", {
            "form_tag_creation": form
        })
    
    def post(self, request):
        form = TagCreationForm(request.POST)

        if form.is_valid():
            tag = form.save()

            return JsonResponse({
                "success": True,
                "tag": {
                    "id": tag.id,
                    "name": tag.name
                }
            })
        # return JsonResponse({
        #     "success": False,
        #     "errors": form.errors.get_json_data()
        # }, status = 400)
        return JsonResponse({
            "success": False,
            'errors': {
                'message': 'Тег вже існує'
            }
        }, status= 400)
    
class ImageDeleteView(LoginRequiredMixin, View):
    def delete_image(request, file_name):
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            return JsonResponse(
                {
                    'success': True,
                }
            )
        return JsonResponse(
            {
                'success': False,
                'errors': {
                    'message': 'Картинка вже видалена'
            }
            }
        )