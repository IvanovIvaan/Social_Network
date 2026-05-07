from django import forms
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.forms import AuthenticationForm

from .utils import *

User = get_user_model()

class EmailUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(
        label= 'Password',
        widget= forms.PasswordInput(
            attrs= {
                'placeholder': 'Введіть пароль',
            })
    )

    password2 = forms.CharField(
        label= 'Password',
        widget= forms.PasswordInput(
            attrs= {
                'placeholder': 'Повторіть пароль',
            })
    )

    class Meta:
        model = User
        fields = ("email",)
        widgets = {
            "email": forms.EmailInput(
                attrs= {
                    'placeholder': "you@example.com",
                })
        }
    
    def clean_email(self):
        email= self.cleaned_data.get('email')
        if User.objects.filter(email= email).exists():
            raise forms.ValidationError('Такий користувач вже існує')
        return email
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            self.add_error('password2', 'Паролі не співпадають')
        return cleaned_data
    
    def save(self, commit= True):
        user = super().save(commit= False)
        user.username = user.email ######
        user.set_password(self.cleaned_data["password1"])
        if commit: 
            user.save()
        return user
    

class EmailAuthenticationForm(AuthenticationForm):
    username = forms.EmailField(
        label= "Електрона пошта",
        widget= forms.EmailInput(
            attrs= {
                "placeholder": "Ведіть вашу електрону пошту",
                # "autofocus": True,
                # "autocomplete": "email"
            })
        )
    password = forms.CharField(
        label= "Пароль", 
        widget= forms.PasswordInput(
            attrs= {
                "placeholder": "Введіть пароль",
                # "autocomplete": "current-password"
            })
        )
# у авторизації метод clean

    def clean(self):
        cleaned_data = super().clean()
        email= cleaned_data.get('username')
        password= cleaned_data.get('password')
        if email and password:
            self.user_cache = authenticate(
                request= self.request,
                username= email,
                password= password
            )
            if self.user_cache is None:
                raise forms.ValidationError(
                    self.error_messages['invalid_login'],
                    code= 'invalid_login'
                )
            else:
                self.confirm_login_allowed(self.user_cache)
            
        return self.cleaned_data
                
class EmailConfirmForm(forms.Form):
    code = forms.CharField(
        label = "Код підтвердження",
        widget = forms.TextInput(
            attrs = {
                "maxlength": 6,
                "class": "input-confirm-code",
                "id": "input_confirm_code",
                "autocomplete": "one-time-code",
            })
    )
    
    # def clean(self):
    #     cleaned_data = super().clean()
    #     code = cleaned_data.get('code')
    #     if code and check_verification_code(code) == False:
    #         self.add_error('input', 'Неправильний код підтвердження')
    #     return cleaned_data