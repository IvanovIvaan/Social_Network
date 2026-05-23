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

    // document.getElementById('links-list').scrollTo = 0;

    document.getElementById('links-list').scrollTo({
        top: 0,
        behavior: 'smooth'
    })
});

// ТЕГИ
const tags = document.querySelectorAll('#id_tags label')
const textContainer = document.getElementById('id_content')

for (let i = 0; i < tags.length; i++) {
    let divTag = tags[i]
    let inputTag = tags[i].childNodes[0]
    let textTag = tags[i].childNodes[1].textContent.trim()
    
    inputTag.addEventListener('change', function() {

        if (inputTag.checked) {
            divTag.style = `
                background-color: #543C52;
                color: #E9E5EE;
            `
            if (textContainer.value) {
                if (/#[\wа-яіїєґА-ЯІЇЄҐ]+/g.test(textContainer.value)) {
                    textContainer.value += `${textTag}`
                } else {
                    textContainer.value += `\n${textTag}`
                }
            } else {
                textContainer.value += `${textTag}`
            }
            
        } else {
            textContainer.value = textContainer.value.replace(`${textTag}`, "")

            if (/#[\wа-яіїєґА-ЯІЇЄҐ]+/g.test(textContainer.value) == false) {
                textContainer.value = textContainer.value.replace(`\n`, "")
            }
            // if (textContainer.value) {
            //     textContainer.value = textContainer.value.replace(`${textTag}`, "")
            // } else if (textContainer.value == `${textTag}`) {
            //     textContainer.value = textContainer.value.replace(`\n${textTag}`, "")
            // }
            divTag.style = `
                background-color: #E9E5EE;
                color: #543C52;
            `
        }

    })
    
}

// const textarea = document.getElementById('id_content')

// document.addEventListener('change', function (event) {

//     if (event.target.name === 'tags') {

//         const checkedTags = document.querySelectorAll(
//             'input[name="tags"]:checked'
//         )

//         const tagsText = [...checkedTags].map(tag => `#${tag.parentElement.textContent.trim().replace('#', '')}`).join(' ')

//         let mainText = textarea.value.replace(/\n\n#.*$/s, '').trim();

//         textarea.value = `${mainText}\n${tagsText}`
//     }
// });

const tagsContainer = document.getElementById('id_tags')
const addTagButton = document.createElement('button')
addTagButton.setAttribute('id', 'add_tag')
addTagButton.setAttribute('class', 'add-button')
addTagButton.setAttribute('type', 'button')
addTagButton.textContent = '+'
tagsContainer.appendChild(addTagButton)

addTagButton.addEventListener(
    'click',
    function() {
        document.getElementById('modal-tag-background').style = 'display: flex;'
    }
)



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