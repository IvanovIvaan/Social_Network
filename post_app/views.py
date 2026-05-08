from django.shortcuts import render
from django.views.generic import TemplateView, ListView, FormView
from django.views import View
from django.http import HttpRequest, JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.urls import reverse_lazy

from .forms import PostCreationForm, MultipleFileField, MultipleFileInput
from .models import Post

# Create your views here.
# def render_post(request):
#     return render(
#         request= request,
#         template_name= 'post.html'
#         )





class PostListView(ListView):
    model = Post
    context_object_name = 'posts'
    paginate_by = 5
    template_name = 'post_app/post.html'
    
    
    def get_context_data(self, **kwargs) -> dict:
        context = super().get_context_data(**kwargs)
        context['form_post_creation'] = PostCreationForm()
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
                'html': render_to_string(self.template_name, {'posts': page_object.object_list})
            })
        return super().get(request, *args, **kwargs)

    
    
# class PostCreationView(View):
#     def post(self, request: HttpRequest, *args, **kwargs):
#         form = PostCreationForm(request.POST)
        
class PostCreationView(LoginRequiredMixin, FormView):

    template_name = "post_app/form_post_creation.html"
    form_class = PostCreationForm
    success_url = reverse_lazy("post_list")
    login_url = reverse_lazy("auth")

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        if self.request.method == "POST":
            kwargs["links"] = self.request.POST.getlist("links")
            kwargs["photos"] = self.request.FILES.getlist("photos")

        return kwargs

    def form_valid(self, form):
        post = form.save(author=self.request.user)

        return JsonResponse({
            "success": True,
            "message": "Публікацію створено успішно",
            "redirect_url": str(self.success_url),
            "post_id": post.id,
        })

    def form_invalid(self, form):
        return JsonResponse({
            "success": False,
            "errors": form.errors.get_json_data(),
        }, status=400)