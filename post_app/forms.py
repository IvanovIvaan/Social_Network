from io import BytesIO
from django import forms
from django.core.files.base import ContentFile
from PIL import Image
from .models import Post, Tag, PostLinks, PostImage, PostView


MAX_COMPRESSED_IMAGE_SIZE = 5 * 1024 * 1024

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def clean(self, data, initial= None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            return [single_file_clean(data= file, initial=initial) for file in data]
        return single_file_clean(data= data, initial= initial)

class PostCreationForm(forms.ModelForm):
    tags = forms.ModelMultipleChoiceField(
        required = False,
        # queryset = Tag.objects.all(),
        queryset = Tag.objects.none(),
        widget = forms.CheckboxSelectMultiple(
            attrs= {
                'class': 'tags',
            }
        )
    )
    links = forms.CharField(
        # ModelMultipleChoiceField
        label = 'Посилання',
        required = False,
        widget = forms.CheckboxSelectMultiple(),
        ################################################
    )
    images = MultipleFileField(
        required = False,
        widget = MultipleFileInput(
            attrs= {
                'class': 'image-input',
                'multiple': True,
                'accept': 'image/*'
            })
    )
    class Meta:
        model = Post
        fields = ('title', 'topic', 'content')
        labels = {
            'title': 'Назва публікації',
            'topic': 'Тема публікації',
        }
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Природа, книга і спокій'}),
            'topic': forms.TextInput(attrs={'placeholder': 'Тема публікації'}),
            'content': forms.Textarea(attrs={'class': 'content-input', 'rows': 5, 'placeholder': 'Текст публікації'}),
        }
    def __init__(self, *args, links = None, images = [], **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['tags'].queryset = Tag.objects.all()
        self.links_list = []
        self.images_list = []

        if links is None:
            links = []

        for link in links:
            clean_link = link.strip()

            if clean_link:
                self.links_list.append(clean_link)
        
        if images is not None:
            self.images_list = list(images)
            # self.images_list = []
        # else:
        #     self.images_list = []

    def clean(self):
        cleaned_data = super().clean()
        url_field = forms.URLField()
        image_field = forms.ImageField()
        for link in self.links_list:
            try:
                url_field.clean(link)
            except forms.ValidationError:
                self.add_error('links', f'Невірне посилання: {link}')
        for image in self.images_list:
            try:
                image_field.clean(image)
            except forms.ValidationError:
                self.add_error('images', f'Завантажте коректне зображення')

        return cleaned_data
    
    def save(self, author, commit = True):
        post: Post = super().save(commit= False)
        post.author = author
        if commit:
            post.save()
            post.tags.set(self.cleaned_data['tags'])
            for url in self.links_list:
                PostLinks.objects.create(post = post, url = url)
            for image in self.images_list:
                PostImage.objects.create(
                    post = post,
                    original_image = image,
                    compressed_image = f'_compressed_image{image}'
                )
        return post
    def _compressed_image(self, image):
        image.seek(0)
        compressed_image = Image.open(image)
        compressed_image = compressed_image.convert('RGB')
        quality = 85
        width, height = compressed_image.size

        while True:
            buffer = BytesIO()
            compressed_image.save(buffer, format = 'JPEG', quality = quality, optimize = True)
            if buffer.tell() <= MAX_COMPRESSED_IMAGE_SIZE:
                break

            if quality > 35:
                quality -= 10
            else:
                if width <= 1 or height <= 1:
                    break
                width = int(width * 0.9)
                height = int(height * 0.9)
                compressed_image = compressed_image.resize((width, height), Image.Resampling.LANCZOS)

        image.seek(0)
        compressed_image = f'compressed_{image.name.rsplit(".", 1)[0]}.jpg'
        return ContentFile(buffer.getvalue(), name = compressed_image)