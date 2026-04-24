from django import forms
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.forms import AuthenticationForm

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
            raise forms.ValidatorError('Такий користувач вже існує')
        return email
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            self.add_error('password2', 'Паролі не співпадають')
        return cleaned_data
    
    def save(self, commit= True):
        user = super().save(commit=False)
        user.username = ""
        user.set_password(self.cleaned_data["password1"])
        if commit: 
            user.save()
        return user
    

# class EmailAuthenticationForm(AuthenticationForm):
    