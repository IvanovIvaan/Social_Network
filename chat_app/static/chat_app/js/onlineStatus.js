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
            const statusText = document.querySelector(".user-info-text h4")
            const userStatus = button.dataset.userStatus
            
            if (data.status == 'online') {
                // console.log(`${nickname} (У мережі)`)
                if (statusBadge) {
                    statusBadge.style.backgroundColor = "#22C55E"
                }

                button.dataset.userStatus = "online"
                if (chatInfoText && chatUserId === chatInfoText.dataset.userId) {
                    statusText.textContent = "У мережі"
                }
            }else{
                // console.log(`${nickname} (Не в мережі)`)
                if (statusBadge) {
                    statusBadge.style.backgroundColor = "#CDCED2"
                }

                button.dataset.userStatus = "offline"
                if (chatInfoText && chatUserId === chatInfoText.dataset.userId) {
                    statusText.textContent = "Не в мережі"
                }
            }
        }
    )
}