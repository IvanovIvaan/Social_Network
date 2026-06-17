

console.log('CHAT JS LOADED')

let chatSocket = null
let observer = null
let activeChatId = null
let currentPage = 1
let isLoading = false
let hasNext = false

const noChatOpened = document.querySelector('.no-chat-opened-text')


const chatTitle = document.querySelector('#chat-title')
const chatStatus = document.querySelector('#chat-status')
const chatButtons = document.querySelectorAll('[data-chat-user]')

const chatWindow = document.getElementById('chat-window')
const messages = document.getElementById('messages')
const messageForm = document.getElementById('message-form')
const messageContainer = document.getElementById('message_container')


const chatForm = document.querySelector('form')

chatForm.addEventListener(
    'submit',
    function(event) {
        event.preventDefault()

        // const text = chatForm.querySelector('input').value
        const formData = new FormData(chatForm)
        const formObject = Object.fromEntries(formData)
        chatSocket.send(JSON.stringify(formObject))
        console.log(formObject)
        chatForm.reset()

        messageContainer.appendChild(renderMessage(formObject.message))
    }
)


function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}
const csrfToken = document.querySelector('meta[name = "csrf-token"]').getAttribute('content')



const chatSet = new Set()

const chatList = document.querySelector('#chats_list')


function renderMessage(data){
    const message = document.createElement('div')
    message.className = "message"
    if (typeof data === 'string') {
        message.innerHTML = `
            <div class= "message-text">${data}</div>
        `
    } else {
        message.innerHTML = `
            <div class= "message-text">${data.text}</div>
        `
        // console.log(`${data.sender}: ${data.text}`)
    }
    return message
}
// 
function resetMessages(chatId){
    activeChatId = chatId
    currentPage = 1
    hasNext = true
    isLoading = false
    if(observer){observer.disconnect()}
    messageContainer.innerHTML = ''
    const sentinel = document.createElement('div') 
    sentinel.id = 'message-load-sentinel'
    messageContainer.prepend(sentinel)
}
// 
async function loadMessages(prepend = false){
    if( isLoading || !hasNext ){
        return
    }
    isLoading = true
    const oldHeight = messageContainer.scrollHeight
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
        messageContainer.appendChild(fragment)
    }
    hasNext = data.has_next
    currentPage++
    if(prepend){
        messageContainer.scrollTop = messageContainer.scrollHeight - oldHeight
    }else{
        messageContainer.scrollTop = messageContainer.scrollHeight
    }
    // якщо більше немає сторінок для завантаження
    if(!hasNext && observer){observer.disconnect()}
    isLoading= false
}



function connectWebSocket(chat_Id) {
    if (chatSocket){
        chatSocket.close()
        messageContainer.innerHTML = ''
    }
    
    chatSocket = new WebSocket(`ws://${window.location.host}/chat/${chat_Id}/`)
    chatSocket.onmessage = function (event){
        const data = JSON.parse(event.data)
        // chatStatus.textContent = data.message
        chatStatus.textContent = ''
        noChatOpened.className = 'open-chat-label'



        messageContainer.appendChild(renderMessage(data))
        messageContainer.scrollTop = messageContainer.scrollHeight
    }
//..................................................
    chatSocket.onerror = function(error) {
    console.log('WebSocket error:', error)
    }
}

function chatButtonExists(userId) {
    return !!document.querySelector(`[data-chat-user="${userId}"]`)
}


async function openChatWithUser(userId, username, nickname, avatar) {
    const response = await fetch(
        `/chat/chat_with/${userId}/`, 
        {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken
            }
        }
    )
    if (!response.ok) {
        console.error('HTTP error', response.status)
        return
    }
    const data = await response.json()
    if (!data.success){
        return
    }
    const previousUserAvatar = document.querySelector('.user-avatar')
    if (previousUserAvatar) {
        previousUserAvatar.remove()
    }

    chatForm.style = 'display: flex;'
    
    const userAvatar = document.createElement('div')
    userAvatar.className = 'user-avatar'
    userAvatar.innerHTML = `
        <img src=${avatar}>
    `
    document.querySelector('.user-info').insertAdjacentElement('afterbegin', userAvatar)

    chatTitle.textContent = `${data.nickname || nickname}`

    console.log('userId:', userId)
    console.log('exists:', chatButtonExists(userId))
    
    
    connectWebSocket(data.chat_id)

    

    function addChatButton(chat) {
        if (chatSet.has(chat.id)) return
        chatSet.add(chat.id)
        const userList = document.querySelectorAll('#other_user_button')
        userList.forEach((button) => {
            if (button.getAttribute('data-chat-id') === `${chat.Id}`) {
                return
            }
        }) 
        const chatWithUserButton = document.createElement('button')
        chatWithUserButton.className = 'chat'
        chatWithUserButton.dataset.chatUser = chat.userId
        chatWithUserButton.dataset.chatId = chat.Id
        chatWithUserButton.innerHTML = `
            <div class="chats-image">
                <img src="${chat.avatar}" alt="">
            </div>
            <div class= "chat-text">
                <h3>${chat.nickname}</h3>
                <p>Привіт, тівирП, лєлєлєлєлє.</p>
            </div>
    
        `
        chatList.appendChild(chatWithUserButton)

    }

    const chat = data.chat
    addChatButton(chat)
}



async function openChatById(chatId, title){
    chatTitle.textContent = title
    chatWindow.classList.add("is-open")
    chatStatus.hidden = true
    resetMessages(chatId)
    connectWebSocket(chatId)
    await loadMessages()
    startObserver()
}

// Підключаємо вже наявні кнопки групових чатів у правому блоці.

function bindGroupChatButtons(){
    const groupButtons = document.querySelectorAll("[data-chat-id]")
    groupButtons.forEach((button) => {
        if(button.dataset.groupBound = "true"){
            return
        }
        button.dataset.groupBound = "true"
        button.addEventListener(
            "click",
            async () => {
                await openChatById(button.dataset.chatId, button.dataset.chatTitle)
            }
        )
    })
}

// Робимо функцію відкриття чату доступною для group_chat.js після створення нової групи.

window.openChatById = openChatById

    
//     створення кнопки з користувачем у повідомленнях
// .................................................

    

chatButtons.forEach((button) => {
    button.addEventListener(
        'click',
        async () => {
            await openChatWithUser(
                button.dataset.chatUser, 
                button.dataset.chatUsername, 
                button.dataset.chatNickname,
                button.dataset.chatAvatar,
            )
        }
    )
})