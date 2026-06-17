from django import forms
from user_app.models import User

from utils.compressed_image import _compressed_image

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('nickname', 'username', 'avatar')
        labels = {
            'nickname': 'Псевдонім автора',
            'username': "Ім'я користувача",
            'avatar': ''
        }
        widgets = {
            'nickname': forms.TextInput(attrs={'placeholder': 'Введіть Псевдонім автора'}),
            'username': forms.TextInput(attrs={'placeholder': '@'}),
            'avatar': forms.FileInput(attrs= {'class': 'setAvatarButton'})
        }

        def clean_avatar(self):
            avatar = self.cleaned_data.get('avatar')
            if avatar:
                return _compressed_image(avatar)
            return avatar

        def clean_username(self):
            cleaned_data = super().clean()
            username = cleaned_data['username']

            if User.objects.filter(username=username).exclude(
                pk=self.instance.pk
            ).exists():
                raise forms.ValidationError("Таке ім'я користувача вже зайняте")

            return username