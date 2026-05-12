export function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}

function renderErrors(errors) {
    const errorsContainer = document.getElementById('post-errors');
    errorsContainer.innerHTML = '';
    for (const field in errors) {
        errors[fieldName].forEach((errorObject) => {
            const p = documnent.createElement('p');
            p.textContent = errorObject.message;
            errorsContainer.appendChild(p);
        });
    }
}
document.getElementById('add-link').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'url';
    input.name = 'links';
    input.placeholder = 'https://example.com';
    document.getElementById('links-list').appendChild(document.createElement('br'));
    document.getElementById('links-list').appendChild(input);
});

// ТЕГИ

const tags = document.querySelectorAll('#id_tags label')
const textContainer = document.getElementById('id_content')

for (let i = 0; i < tags.length; i++) {
    let inputTag = tags[i].childNodes[0]
    let textTag = tags[i].childNodes[1].textContent.trim()
    
    inputTag.addEventListener('change', function() {
        if (inputTag.checked) {
            textContainer.value += textTag
            
        } else {
            textContainer.value = textContainer.value.replace(textTag, "")
        }

    })
    
}



document.getElementById('post-create-form').addEventListener(
    'submit',
    function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData
    })
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        }) 
        .then((data) => {
            // if (data.redirect_url) {
            //     window.location.href = data.redirect_url;
            // }
            if (data.success) {
                window.location.reload()
            }
        })
        .catch((data) => {
            if (data.errors) {
                renderErrors(data.errors);
            }
        });
});