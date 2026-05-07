import random
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings

def create_code():
    return str(random.randint(100000, 999999))

def save_code(email, code):
    cache.set(
        key= f'підтвердити - {email}',
        value= code, 
        timeout= 600,
    )

# відсилаємо код підтвердження електроної пошти (confirm)
def send_code(email, code):
    send_mail(
        subject= 'Код для підтвердження адреси електронної пошти',
        message= f'Ваш код підтвердження: {code}',
        from_email= settings.EMAIL_HOST_USER,
        recipient_list= [email],
        fail_silently= False
    )

