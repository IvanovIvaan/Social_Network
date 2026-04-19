from django.shortcuts import render

# Create your views here.
def render_settings(request):
    return render(
        request= request,
        template_name= 'settings.html'
        )

def render_user(request):
    return render(
        request= request,
        template_name= 'user.html'
        )

def render_registration(request):
    return render(
        request= request,
        template_name= 'registration.html'
        )

def render_login(request):
    return render(
        request= request,
        template_name= 'login.html'
        )