import { getCSRFToken, showLogin, showConfirm, renderErrors } from "./auth.js"


document.getElementById('confirm-form').addEventListener(
    'submit',
    function(event) {
        event.preventDefault()

        

        const formData = new FormData(this)

        console.log(this.action)

        fetch(this.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
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
           
            if(data.show_login) {
                showLogin(data.email)
            }


        })
        .catch(data => {
            renderErrors('confirm-errors', data.errors)
        })
    })





const input = document.getElementById('input_confirm_code')
const boxes = document.querySelectorAll('.box')

document.getElementById('boxes').addEventListener(
    'click',
    function() {
        input.focus()    
    }
)

input.addEventListener(
    'input',
    function() {
        const code = input.value.slice(0, 6)
        
        boxes.forEach((box, number) => {
            box.textContent = code[number] || "__"
            box.classList.toggle('active', number == code.length)
        })
    }
)

