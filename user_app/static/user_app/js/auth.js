export function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}

export function showRegistration() {
    document.querySelector('.form-registration').style.display = 'flex'
    document.querySelector('.form-login').style.display = 'none'
    document.querySelector('.form-confirm').style.display = 'none'
}

export function showLogin(email = null) {
    document.querySelector('.form-registration').style.display = 'none'
    document.querySelector('.form-login').style.display = 'flex'
    document.querySelector('.form-confirm').style.display = 'none'

    if (email) {
        const emailInput = document.querySelector('#login-form input[name="username"]')

        if (emailInput) {
            emailInput.value = email
        }
    }
}

export function showConfirm() {
    document.querySelector('.form-registration').style.display = 'none'
    document.querySelector('.form-login').style.display = 'none'
    document.querySelector('.form-confirm').style.display = 'flex'
}




document.getElementById("register-button").addEventListener(
    "click",
    function() {
        showRegistration()
    }
)

document.getElementById("login-button").addEventListener(
    "click",
    function() {
        showLogin()
    }
)

document.getElementById("back").addEventListener(
    "click",
    function(){
        showRegistration()
    }
)


export function renderErrors(containerId, errors) {
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


// buttonBack.addEventListener(
//         'click', 
//         function() {
//             if(buttonBack.innerText == 'Назад'){
//                 formRegistration.style.display = 'flex'
//                 formLogin.style.display = 'none'
//                 formConfirm.style.display = 'none'
//             }
//         }
//     )