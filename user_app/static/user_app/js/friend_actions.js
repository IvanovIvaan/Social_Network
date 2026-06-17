// import { getCSRFToken } from './auth.js'
function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}
const csrfToken = getCSRFToken()

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
    if (window.location.pathname === '/friends/') {
        if (data.friend_html) {
            addFriendToHome(data.friend_html)
        }
        if (data.label){
            actionButton.textContent = data.label
            actionButton.disabled = true
        }
        if (data.remove){
            const article = actionButton.closest('article')
            const container = article.parentElement
            article.remove()
            
            if (!container.querySelector('article')) {
                container.innerHTML = '<div class= "empty-title"><p>Порожньо</p></div>'
            }
        }
    }
}
function addFriendToHome(friendHtml) {
    // const friendsCount = homeFriendsList.querySelectorAll('article').length
    // if (friendsCount >= 6) {
    //     return
    // }
    homeFriendsList.querySelector('p')?.remove()
    homeFriendsList.insertAdjacentHTML('beforeend', friendHtml)

    connectFriendActionButtons(homeFriendsList)
}
function connectFriendActionButtons(parent = document) {
    const actionButtons = parent.querySelectorAll('[data-friend-action]')
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

    const actionButton = event.target.closest('[data-friend-action]')

    if (!actionButton) return

    await handlerFriendAction(actionButton)

    if (actionButton.dataset.redirectUrl) {

        window.location.href = actionButton.dataset.redirectUrl
    }
})

document.addEventListener('click', function(event) {

    const card = event.target.closest('[data-user-card]')

    if (!card) {
        return
    }

    if (event.target.closest('[fast-action]')) {
        return
    }

    window.location.href = card.dataset.profileUrl

})