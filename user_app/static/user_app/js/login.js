import { getCSRFToken, showLogin, showConfirm, renderErrors } from "./auth.js"


document.getElementById('login-form').addEventListener(
    'submit',
    function(event){
        event.preventDefault()
        const form = event.target
        const formData = new FormData(form)

        let email = null

        fetch(form.action, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
                "X-Requested-With": "XMLHttpRequest",
            },
            body: formData
        })
        .then(async response => {
            const data = await response.json()
            if (!response.ok) {
                throw data
            }
            return data
        })  

        .then(data => {
            if(data.redirect_url) {
                window.location.href = data.redirect_url
            }
        })
        .catch(data => {
            if(data.errors){
                renderErrors("login-errors", data.errors)
            }
        })
    }
)



