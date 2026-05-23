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

        document.getElementById('publication-text-input').value = document.getElementById('id_content').value
    }
)

document.getElementById('button_tag_cancel').addEventListener(
    'click',
    function() {
        document.getElementById('modal-tag-background').style = "display: none;"
    }
)




document.getElementById('publication-text-input').addEventListener(
    'input',
    function() {
        document.getElementById('id_content').value = document.getElementById('publication-text-input').value
    }
)



// const content = document.querySelector('.post-text p').textContent;

// const formattedContent = content.replace(
//     "/#[\wа-яіїєґА-ЯІЇЄҐ]+/g",
//     match => `<a href= ''>${match}</a>`
// );

// document.querySelector('.post-text p').innerHTML = formattedContent;

