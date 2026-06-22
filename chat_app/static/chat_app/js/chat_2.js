import { renderMessageImages, hasMessageImages, hasSelectedImages, clearSelectedImages, getSelectedImages } from "./loadImages.js";

function getCSRFToken() {
    return document.querySelector('meta[name = "csrf-token"]').getAttribute('content')
}

const currentUser = document.querySelector('meta[name="current-user"]').getAttribute('username')


const csrfToken = document.querySelector('meta[name = "csrf-token"]').getAttribute('content')

let activeChatType = null


// Змінні для роботи з підключенням по web-sockety
let chatSocket = null
let activeChatId = null

// Змінні для завантаження історії чатів, пагінація
let observer = null
let currentPage = 1
let isLoading = false
let hasNext = false

const chatSet = new Set()

const chatLabel = document.querySelector('.no-chat-opened-text')
const userInfoText = document.querySelector('.user-info-text')
const chatTitle = document.querySelector('#chat-title')
const chatStatus = document.querySelector('#chat-status')
let chatButtons = [...document.querySelectorAll('[data-chat-user]')]
const chatList = document.getElementById('chats_list')
// 
const chatWindow = document.querySelector('.chat-container')
const messages = document.getElementById('message_container')
const messageForm = document.getElementById('chat_form')
const messageInput = document.getElementById('message-input')

// Модальне вікно редагування групи
const editGroupModal = null
const threeDotesImage = document.querySelector('meta[name = "three-dotes"]').getAttribute('image')
const blackImageImage = document.querySelector('meta[name = "black-image"]').getAttribute('image')
const pencilImage = document.querySelector('meta[name = "pencil"]').getAttribute('image')
const trashImage = document.querySelector('meta[name = "trash"]').getAttribute('image')


// Вебсокет Картинки
const messageImagesInput = document.getElementById("message-images")
const messageImageButton = document.getElementById("message-image-button")




//
function renderMessage(data){
    const message = document.createElement('div')
    if (activeChatType === "chat") {
        if (data.sender === currentUser) {
            message.className = "our-message"
        } else {
            message.className = "message"
        }
        message.innerHTML = `
            <div class="message-content">
                <div class='message-text'>${data.text}</div>
            </div>
            <div class='message-time'>${data.created_at}</div>
        `
    } else if (activeChatType === "group") {
        if (data.sender === currentUser) {
            message.className = "our-group-message"
            message.innerHTML = `
                <div class = "our-group-message-container">
                    <div class="message-content">
                        <div class='message-text'>${data.text}</div>
                    </div>
                    <div class='message-time'>${data.created_at}</div>
                </div>
            `
            }
        } else {
            message.className = "group-message"
            message.innerHTML = `
                <div class="sender-avatar">
                    <img src= "${data.avatar}">
                </div>
                <div class = "group-message-container">
                    <h4>${data.nickname}</h4>
                    <div class="group-message-content">
                        <div class="message-content">
                            <div class='message-text'>${data.text}</div>
                        </div>
                        <div class='message-time'>${data.created_at}</div>
                    </div>
                </div>
            `
        }

    if(hasMessageImages(data)){
        message.querySelector(".message-content").appendChild(renderMessageImages(data.images))
    }

    return message
}

// function renderMessage(data) {
//     // Створюємо блок повідомлення.
//     const message = document.createElement("div");
//     // Додаємо клас повідомлення.
//     message.className = "message";
//     // Записуємо автора і текст.
//     message.textContent = `${data.sender}: ${data.text}`;
//     if(hasMessageImages(data)){
//         message.appendChild(renderMessageImages(data.images))
//     }
//     // Повертаємо готовий блок.
//     return message;
// }

// 
function resetMessages(chatId){
    activeChatId = chatId
    currentPage = 1
    hasNext = true
    isLoading = false
    if(observer){observer.disconnect()}
    messages.innerHTML = ''
    const sentinel = document.createElement('div') 
    sentinel.id = 'message-load-sentinel'
    messages.prepend(sentinel)
}
// 
async function loadMessages(prepend = false){
    if( isLoading || !hasNext ){
        return
    }
    isLoading = true
    const oldHeight = messages.scrollHeight
    const response = await fetch(
        `/chat/${activeChatId}/messages/?page=${currentPage}`,
        {
            headers: {
                'X-Requested-With': "XMLHttpRequest"
            }
        }
    )
    const data = await response.json()
    const fragment = document.createDocumentFragment()
    data.messages.forEach(
        (message) => {
            fragment.appendChild(renderMessage(message))
        }
    )
    const sentinel = document.getElementById('message-load-sentinel')
    if(prepend){
        sentinel.after(fragment)
    }else{
        messages.appendChild(fragment)
    }
    hasNext = data.has_next
    currentPage ++
    if(prepend){
        messages.scrollTop = messages.scrollHeight - oldHeight
    }else{
        messages.scrollTop = messages.scrollHeight
    }
    // якщо більше немає сторінок для завантаження
    if(!hasNext && observer){observer.disconnect()}
    isLoading= false
}
// 
function startObserver(){
    const sentinel = document.getElementById("message-load-sentinel")
    observer = new IntersectionObserver(
        async (entries) => {
            if (entries[0].isIntersecting && isLoading === false) {
                await loadMessages(true)
            }
        },
        {
            root: messages,
            rootMargin: "20px"
        }
    )
    observer.observe(sentinel)
}

// 
function connectWebSocket(chatId){
    // Якщо вже було виконано якесь вебсокет з'єднання  
    if (chatSocket){
        // закриваємо його
        chatSocket.onmessage = null
        chatSocket.onclose = null
        chatSocket.close()
    }
    chatSocket = new WebSocket(`ws://${window.location.host}/chat/${chatId}/`)
    // обробляємо повідомлення від вебсокету
    chatSocket.onmessage = function (event){
        // 

        chatLabel.className = 'open-chat-label'
        messages.style = 'display: flex;'
        messages.scrollTop = messages.scrollHeight
        
        const data = JSON.parse(event.data)
        
        if (data.type === "update_unread") {
            const badge = document.querySelector(
                `[data-chat-id="${data.chat_id}"] .icon-new-chats`
            )
        
            if (!badge) return
        
            badge.textContent = data.unread_count
        
            badge.style.display = data.unread_count > 0 ? "flex" : "none"
}       
        
        if (data.sender || data.text) {
            messages.appendChild(renderMessage(data))
        }
    }
}
// Відкриває наявний чат або створюємо новий чат
async function openChatWithUser(userId, username, nickname, avatar) {
    if (!nickname) {
        nickname = username
    }
    const response = await fetch(
        `/chat/chat_with/${userId}/`, 
        {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        }
    )
    const data = await response.json()
    if (!data.success){
        return
    }

    activeChatType = "chat"

    const previousThreeDotes = document.querySelector(".three-dotes")
    if (previousThreeDotes) {
        previousThreeDotes.remove()
    }

    // Створення лейблу чата з ім'ям користувача та його АВАТАРКОЙ
    const previousUserAvatar = document.querySelector('.user-info .user-avatar')
    if (previousUserAvatar) {
        previousUserAvatar.remove()
    }
    const previousGroupAvatar = document.querySelector('.user-info .group-avatar')
    if (previousGroupAvatar) {
        previousGroupAvatar.remove()
    }
    
    const userAvatar = document.createElement('div')
    userAvatar.className = 'user-avatar'
    userAvatar.innerHTML = `
        <img src=${avatar}>
    `

    const previousUserCountText = document.querySelector('.user-group-count')
    if (previousUserCountText) {
        previousUserCountText.remove()
    }

    const emptyText = document.querySelector("#chats-empty-text")
    const emptyText2 = document.querySelector("#chats-empty-text-2")
    if (emptyText && emptyText2) {
        emptyText.remove()
        emptyText2.remove()
    }

    

    const userChatText = document.querySelector(".user-info-text")
    const previousStatusText = userChatText.querySelector("h4")
    if (previousStatusText) {
        previousStatusText.remove()
    }
    const statusChatText = document.createElement("h4")
    statusChatText.textContent = "Не в мережі"
    
    userChatText.appendChild(statusChatText)
    userChatText.dataset.userId = `${userId}`
    document.querySelector(".user-info").insertAdjacentElement('afterbegin', userAvatar)
    chatTitle.textContent = `${data.nickname || nickname}`
    
    chatWindow.classList.add('is-open')
    chatStatus.hidden = true
    messageForm.style = "display: flex;"

    // 
    resetMessages(data.chat_id)
    // Відкриваємо вебсокет з'єднання
    connectWebSocket(data.chat_id)
    await loadMessages()
    startObserver()

    // Додавання кнопки з користувачем в "Повідомлення"
    const chat = data.chat
    chatSet.add(chat.id)
    let letCreateButton = true
    const userList = document.querySelectorAll('#other_user_button')
    userList.forEach((button) => {
        if (button.getAttribute('data-chat-id') === `${chat.id}`) {
            letCreateButton = false
        }
    }) 
    
    if(!letCreateButton) return
    const chatWithUserButton = document.createElement('button')
    chatWithUserButton.className = 'chat'
    chatWithUserButton.id = 'other_user_button'
    chatWithUserButton.type = 'button'
    chatWithUserButton.dataset.chatId = chat.id
    chatWithUserButton.dataset.chatUser = userId
    chatWithUserButton.dataset.chatUsername = username
    chatWithUserButton.dataset.chatNickname = nickname
    chatWithUserButton.dataset.chatAvatar = avatar
    chatWithUserButton.innerHTML = `
        <div class="chats-image">
            <img src="${avatar}" alt="">
        </div>
    
        <div class="chat-text">
            <div class="chat-info">
                <h3>${nickname}</h3>
                <p>Привіт, лееллелелелеле</p>
            </div>
        </div>
    `
    chatList.appendChild(chatWithUserButton)
    chatButtons.push(chatWithUserButton)
}

// Відкриття груп

async function openChatById(chatId, title, userCount, avatar){
    chatTitle.textContent = title
    const previousUserCountText = document.querySelector('.user-group-count')
    if (previousUserCountText) {
        previousUserCountText.remove()
    }
    const userCountText = document.createElement('p')
    userCountText.className = 'user-group-count'
    userCountText.textContent = `${userCount} учасникiв`
    userInfoText.insertAdjacentElement("beforeend", userCountText)
    chatWindow.classList.add("is-open")
    chatStatus.hidden = true
    messageForm.style = "display: flex;"
    activeChatType = "group"

    const previousUserAvatar = document.querySelector('.user-info .user-avatar')
    if (previousUserAvatar) {
        previousUserAvatar.remove()
    }
    const previousGroupAvatar = document.querySelector('.user-info .group-avatar')
    if (previousGroupAvatar) {
        previousGroupAvatar.remove()
    }
    const groupAvatar = document.createElement('div')
    groupAvatar.className = 'group-avatar'
    if (avatar) {
        groupAvatar.innerHTML = `
            <img src="${avatar}">
        `
    } else {
        groupAvatar.innerHTML = `
            <h3>${title.slice(0, 2).toUpperCase()}</h3>
        `
    }

    document.querySelector('.user-info').insertAdjacentElement('afterbegin', groupAvatar)
    resetMessages(chatId)
    connectWebSocket(chatId)
    await loadMessages()
    startObserver()

    const previousThreeDotes = document.querySelector(".three-dotes")
    if (!previousThreeDotes) {
        const threeDotes = document.createElement('div')
        threeDotes.className = 'three-dotes'
        threeDotes.innerHTML = `
            <img src="${threeDotesImage}">
            `

        threeDotes.addEventListener('click', () => {
            const editGroupModal = document.createElement('div')
            editGroupModal.className = 'edit-group-modal'
            editGroupModal.innerHTML = `
                <div class="edit-group-nav">
                    <div class= "three-dotes-opened">
                        <img src="${threeDotesImage}">
                    </div>
                </div>

                <div class="edit-group-button">
                    <div class= "edit-group-icon">
                        <img src="${blackImageImage}">
                    </div>
                    <p>Медіа</p>
                </div>
                <div class="edit-group-button">
                    <div class= "edit-group-icon">
                        <img src="${pencilImage}">
                    </div>
                    <p>Редагувати групу</p>
                </div>
                <div class="edit-group-hr"></div>
                <div class="edit-group-button">
                    <div class= "edit-group-icon">
                        <img src="${trashImage}">
                    </div>
                    <p>Видалити чат</p>
                </div>
            `
            threeDotes.appendChild(editGroupModal)

            if (editGroupModal) {
                document.addEventListener("click", function (event) {
                    const currentTarget = event.target.closest(".edit-group-modal")
                    const threeDotesTarget = event.target.closest(".three-dotes")
                    const threeDotesOpenedTarget = event.target.closest(".three-dotes-opened")
        
                    if (!currentTarget & !threeDotesTarget) {
                        editGroupModal.remove()
                    } else if (threeDotesOpenedTarget) {
                        editGroupModal.remove()
                    }
                })
            }
        })


        chatLabel.appendChild(threeDotes)
    }
}




function bindGroupChatButtons(){
    const groupButtons = document.querySelectorAll(".chat-group-button")
    groupButtons.forEach((button) => {
        if(button.dataset.groupBound === "true"){
            return
        }
        button.dataset.groupBound = "true"
        button.addEventListener(
            "click",
            async () => {
                await openChatById(button.dataset.chatId, 
                    button.dataset.chatTitle, 
                    button.dataset.userCount, 
                    button.dataset.groupAvatar)
            }
        )
    })
}

window.openChatById = openChatById
window.bindGroupChatButtons = bindGroupChatButtons


document.addEventListener('click', async (event) => {

    const button = event.target.closest('[data-chat-user]')

    if (!button) return

    await openChatWithUser(
        button.dataset.chatUser,
        button.dataset.chatUsername,
        button.dataset.chatNickname,
        button.dataset.chatAvatar,
    )
})

// Вiдправляємо повiдомлення iз зображеннями через HTTP Upload EndPoint
export async function sendMessageWithImages(text){
    const formData = new FormData()
    formData.append("text", text)

    getSelectedImages().forEach((image) => {
        formData.append("images", image)
    })
    const response = await fetch(
        `/chat/${activeChatId}/messages/upload/`,
        {
            method: "POST",
            headers: { "X-CSRFToken": csrfToken },
            body: formData
        }
    )
    return response.json()
}
// Як тiльки ми будемо клiкати по кнопцi, ми вiдкриємо панель завантаження зображень
messageImageButton.addEventListener(
    'click',
    function(){
        messageImagesInput.click()
    }
)


messageForm.addEventListener(
    'submit',
    async function (event){
        event.preventDefault()
        const text = messageInput.value.trim()
        // if (!text){return}
        if (!text && !hasSelectedImages()) return;
        if (hasSelectedImages()){
            const data = await sendMessageWithImages(text)
            if (!data.success) return;
            messageInput.value = ""
            clearSelectedImages()
            return
        }
        chatSocket.send(JSON.stringify({text: text}))
        messageInput.value = ''
    }
)

bindGroupChatButtons()
