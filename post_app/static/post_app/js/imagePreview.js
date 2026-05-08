const input = document.getElementById('id_images')
const previewContainer = document.getElementById('preview-images')

input.addEventListener('change', function () {
    previewContainer.innerHTML = ''

    Array.from(this.files).forEach(file => {
        const reader = new FileReader()

        reader.onload = function (e) {
            const img = document.createElement('img')
            img.src = e.target.result
            img.classList.add('preview-image')

            previewContainer.appendChild(img)
        }

        reader.readAsDataURL(file)
    })
})