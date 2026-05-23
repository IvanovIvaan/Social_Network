from django.shortcuts import render

# Create your views here.
def render_chat(request):
    return render(
        request= request,
        template_name= 'chat.html'
        )