let authLinks = document.querySelectorAll('.auth-links span');

let formRegistration = document.querySelector('.form-registration')
let formLogin = document.querySelector('.form-login')

let buttonBack = document.getElementById('back')

let formConfirm = document.querySelector('.form-confirm')

console.log(authLinks)

for(let link of authLinks){
    link.addEventListener(
        'click', 
        function() {
            if(link.innerText == 'Реєстрація'){
                formRegistration.style.display = 'flex';
                formLogin.style.display = 'none';
            }
            if(link.innerText == 'Авторизація'){
                formRegistration.style.display = 'none';
                formLogin.style.display = 'flex';
            }
        }
    )
}


buttonBack.addEventListener(
        'click', 
        function() {
            if(buttonBack.innerText == 'Назад'){
                formRegistration.style.display = 'flex';
                formLogin.style.display = 'none';
                formConfirm.style.display = 'none';
            }
        }
    )