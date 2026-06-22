const onlineSocket = new WebSocket(`ws://${window.location.host}/chat/online/`);
onlineSocket.onmessage = function(event) {
    const data = JSON.parse(event.data)
    const buttons = document.querySelectorAll(`[data-chat-user="${data.user_id}"]`);
    buttons.forEach(
        (button) => {
            const username = button.dataset.chatUsername
            const nickname = button.dataset.chatNickname
            const title = button.querySelector('.chat-button-title')
            const statusBadge = button.querySelector('.status-badge')
            const chatUserId = button.getAttribute("data-chat-user")
            const chatInfoText = document.querySelector(".user-info-text")
            const statusText = document.createElement('h4')
            if (data.status == 'online') {
                console.log(`${nickname} (У мережі)`)
                if (statusBadge) {
                    statusBadge.style.backgroundColor = "#22C55E"
                }
                statusText.textContent = "У мережі"
                if (chatInfoText && chatUserId === chatInfoText.dataset.userId) {
                    chatInfoText.appendChild(statusText)
                }
            }else{
                console.log(`${nickname} (Не в мережі)`)
                if (statusBadge) {
                    statusBadge.style.backgroundColor = "#CDCED2"
                }
                statusText.textContent = "Не в мережі"
                console.log(chatUserId)
                console.log(chatInfoText.getAttribute("data-user-id"))
                if (chatInfoText && chatUserId === chatInfoText.dataset.userId) {
                    chatInfoText.appendChild(statusText)
                }
            }
        }
    )
}