// import { getCSRFToken } from './auth.js'
function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}
const csrfToken = getCSRFToken()

console.log('nuhydsegfyuewb')

const homeFriendsList = document.querySelector('[data-home-section= "friends"]')
async function handlerFriendAction(actionButton) {
    const response = await fetch(actionButton.dataset.url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    const data = await response.json()
    if (data.friend_html) {
        addFriendToHome(data.friend_html)
    }
    if (data.label){
        actionButton.textContent = data.label
        actionButton.disabled = true
    }
    if (data.remove){
        actionButton.closest('article').remove()
        if (!container.querySelector('article')) {
            container.innerHTML = '<div class= "empty-title"><p>Порожньо</p></div>'
}
    }
}
function addFriendToHome(friendHtml) {
    const friendsCount = homeFriendsList.querySelectorAll('article').length
    if (friendsCount >= 6) {
        return
    }
    homeFriendsList.querySelector('p')?.remove()
    homeFriendsList.insertAdjacentHTML('beforeend', friendHtml)

    connectFriendActionButtons(homeFriendsList)
}
function connectFriendActionButtons(parent = document) {
    const actionButtons = parent.querySelectorAll('[data-friend-action]')
    console.log(actionButtons)
    actionButtons.forEach((actionButton) => {
        if (actionButton.dataset.actionButton){
            return
        }
        actionButton.dataset.actionButton = 'true'
        actionButton.addEventListener(
            'click',
            async () => {
                await handlerFriendAction(actionButton)
            }
        )
    })
}

// window.connectFriendActionButtons = connectFriendActionButtons
// connectFriendActionButtons()

document.addEventListener('click', async function(event) {

    const actionButton = event.target.closest(
        '[data-friend-action]'
    );

    if (!actionButton) return

    await handlerFriendAction(actionButton)

})