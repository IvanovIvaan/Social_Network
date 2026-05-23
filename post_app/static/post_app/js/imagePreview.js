const input = document.getElementById('id_images')
const previewContainer = document.getElementById('preview-images')

input.addEventListener('change', function () {
    previewContainer.innerHTML = ''

    Array.from(this.files).forEach(file => {
        const reader = new FileReader()

        reader.onload = function (e) {
            const divImage = document.createElement('div')
            divImage.className = 'container-image'
            const img = document.createElement('img')
            img.src = e.target.result
            img.classList.add('preview-image')

            const deleteImage = document.createElement('img')
            // 
            deleteImage.src = "/static/post_app/images/delete.png"
            // 
            const buttonDelete = document.createElement('div')
            buttonDelete.className = 'delete-image'
            buttonDelete.id = 'btn-{{ forloop.counter }}'
            // Видалення картинки
            buttonDelete.addEventListener('click', function () {
                divImage.remove()
            })
            buttonDelete.appendChild(deleteImage)

            divImage.appendChild(img)
            divImage.appendChild(buttonDelete)
            previewContainer.appendChild(divImage)

        }

        reader.readAsDataURL(file)
    })
})

const container = document.getElementById('preview-images');
container.addEventListener('wheel', (event) => {
    event.preventDefault();
    container.scrollLeft += event.deltaY;
});