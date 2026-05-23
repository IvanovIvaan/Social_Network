function renderErrors(containerId, errors) {
    const errorsContainer = document.getElementById(containerId)
    errorsContainer.innerHTML = ''
    for (let fieldName in errors) {
        errors[fieldName].forEach(errorObject => {
            let p = document.createElement('p')
            p.textContent = errorObject.message
            errorsContainer.appendChild(p)
        })
    }
}


document.getElementById('tag-create-form').addEventListener('submit', async function(event){

    event.preventDefault();

    const form = event.target;

    const formData = new FormData(form);

    const response = await fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    });

    const data = await response.json();

    if (data.success) {

        const tag = data.tag;

        const addTagButton = document.getElementById('add_tag');

        addTagButton.insertAdjacentHTML(
            'beforebegin',
            `
            <div>
                <label for= "id_tags_${tag.id}">
                    <input
                        type="checkbox"
                        name="tags"
                        value="${tag.id}"
                        checked
                    >
                    #${tag.name}
                </label>
            </div>
            `
        );

        form.reset();
        document.querySelector(".modal-tag-background").style = "display: none"
    }
    if (data.errors) {
        renderErrors('tag-errors', data.errors)
    }
});