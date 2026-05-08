from django import forms

class SetNicknameForm(forms.Form):
    nickname = forms.CharField(
        label= 'Псевдонім автора',
        widget= forms.TextInput(
            attrs= {
                'placeholder': 'Введіть Псевдонім автора',
            })
    )

    username = forms.CharField(
        label= "Ім'я користувача",
        widget= forms.TextInput(
            attrs= {
                'placeholder': '@',
            })
    )