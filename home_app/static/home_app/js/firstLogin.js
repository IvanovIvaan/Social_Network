function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}


const firstLoginForm = document.getElementById('set-profile-form')

firstLoginForm.addEventListener(
    "submit",
    async function(event) {
        event.preventDefault()

        const form = event.target
        const formData = new FormData(form)

        await fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: formData   
        })

        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector('.first-login').remove()
                window.location.reload()
            }
        });
    }
)