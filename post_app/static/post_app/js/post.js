const designButton = document.getElementById('design-button');
const crossButton = document.getElementById('cross')
const textField = document.getElementById('container-box')

document.getElementById('modal-background').style = 'display: none;'

textField.addEventListener(
    'click',
    function() {
        document.getElementById('publication-text-input').focus()
    }
)

designButton.addEventListener(
    'click',
    function() {
        document.getElementById('modal-background').style = 'display: flex;'
    }
)

crossButton.addEventListener(
    'click',
    function() {
        document.getElementById('modal-background').style = 'display: none;'
    }
)




document.getElementById('publication-text-input').addEventListener(
    'input',
    function() {
        document.getElementById('id_content').value = document.getElementById('publication-text-input').value

        console.log(document.getElementById('id_content').value)
        console.log(document.getElementById('publication-text-input').value)
    }
)



