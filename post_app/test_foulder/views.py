from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import FormView, ListView

from .forms import PostForm
from .models import Post


class PostCreateView(LoginRequiredMixin, FormView):

    template_name = "post_app/post_create.html"
    form_class = PostForm
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