from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    username = models.CharField(
        max_length= 150,
        blank= True,
        null= True,
    )
    email = models.EmailField(
        unique= True
    )
    nickname = models.CharField(
        max_length = 30,
        blank= True,
        null= True,
    )

    avatar = models.ImageField(
        upload_to= "user_app/avatars/",
        blank= True,
        null= True
    )

    profile_completed = models.BooleanField(
        default= False
    )


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


# class Profile(models.Model):
#     user = models.OneToOneField(
#         settings.AUTH_USER_MODEL,
#         on_delete= models.CASCADE,
#         related_name= "profile"
#     )