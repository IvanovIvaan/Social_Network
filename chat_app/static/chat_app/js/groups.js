const openGroupModalButton = document.querySelector("#open-group-modal")
const groupModal = document.querySelector("#group-modal")
const groupStepUsers = document.querySelector("#group-step-users")
const groupStepName = document.querySelector("#group-step-name")
const closeGroupModalButton = document.querySelector("#close-group-modal")
const closeGroupNameModalButton = document.querySelector("#close-group-name-modal")
const cancelGroupModalButton = document.querySelector("#cancel-group-modal")
const nextGroupStepButton = document.querySelector("#next-group-step")
const backGroupStepButton = document.querySelector("#back-group-step")
const createGroupButton = document.querySelector("#create-group")
const groupNameInput = document.querySelector("#group-name")
const selectedCount = document.querySelector("#selected-count")
const selectedUsersList = document.querySelector("#selected-users-list")
const groupUserCheckboxes = document.querySelectorAll(".group-user-checkbox")
const groupList = document.querySelector("#group-list")
const usualGroupAvatar = document.querySelector(".usual-group-avatar")

const currentUserNickname = document.querySelector('meta[name="current-user"]').getAttribute('nickname')
const currentUserAvatar = document.querySelector('meta[name="current-user"]').getAttribute('avatar')

const deleteImage = document.querySelector('meta[name="delete-image"]').getAttribute('image')

const searchInput = document.querySelector("#search-friends")
const userItems = document.querySelectorAll(".group-friend")
const addGroupAvatarButton = document.getElementById("add-group-avatar-input")


// Відстеження введення назви групи для задавання звичайної аватарки
groupNameInput.addEventListener(
    "input",
    function () {
        const query = groupNameInput.value.toUpperCase().trim().slice(0, 2)

        usualGroupAvatar.textContent = query
    }
)



// Пошук користувачів
searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase().trim()

    userItems.forEach((item) => {
        const name = item.dataset.name.toLowerCase()

        if (name.includes(query)) {
            item.style.display = "flex"
        } else {
            item.style.display = "none"
        }
    })
})


function openGroupModal(){
    groupModal.hidden = false
    groupModal.style = "display: flex;"
    groupStepUsers.hidden = false
    groupStepUsers.style = 'display: flex;'
    groupStepName.hidden = true
    groupStepName.style = 'display: none;'
}
function closeGroupModal(){
    groupModal.hidden = true
    groupModal.style = "display: none;"
    groupNameInput.value = ""
    selectedUsersList.innerHTML = ""
    groupUserCheckboxes.forEach((checkbox) => {
        checkbox.checked = false
    })
    updateSelectedCount()
}
function updateSelectedCount(){
    const count = document.querySelectorAll(".group-user-checkbox:checked").length
    selectedCount.textContent = count
}

function renderSelectedUsers(){

    selectedUsersList.innerHTML = ""
    const ourUserContainer = document.createElement('div')
    ourUserContainer.className = "selected-user"
    ourUserContainer.innerHTML = `
        <div class= "selected-user-info">
            <div class="contact-avatar">
                <img src="${currentUserAvatar}" alt="">
            </div
            <div class="selecter-user-nickname">
                <h3>${currentUserNickname}</h3>
            </div>
        </div>
        <div class= "selected-user-action">
            <h3>Ви</h3>
        </div>
    `
    selectedUsersList.appendChild(ourUserContainer)

    groupUserCheckboxes.forEach((checkbox) =>{
        if(checkbox.checked){
            const userContainer = document.createElement('div')
            userContainer.className = "selected-user"
            userContainer.id = checkbox.value
            userContainer.innerHTML = `
                <div class= "selected-user-info">
                    <div class="contact-avatar">
                        <img src="${checkbox.dataset.avatar}" alt="">
                    </div>

                    <div class="selecter-user-nickname">
                        <h3>${checkbox.dataset.nickname}</h3>
                    </div>
                </div>
                <div class= "selected-user-action">
                    <button class = "delete-selected" type="button">
                        <img src="${deleteImage}">
                    </button>
                </div>
            `
            
            
            selectedUsersList.appendChild(userContainer)
        }
    })
}

document.addEventListener('click', function(event) {
    const button = event.target.closest('.delete-selected')
    if (!button) return
    const selectedUser = button.closest('.selected-user')
    if (selectedUser) {
        selectedUser.remove()
        groupUserCheckboxes.forEach((checkbox) => {
            if (checkbox.value === selectedUser.id) {
                checkbox.checked = false
            }  
    })
    }
})

function showNameStep(){
    renderSelectedUsers()
    groupStepUsers.hidden = true
    groupStepUsers.style = 'display: none;'
    groupStepName.hidden = false
    groupStepName.style = 'display: flex;'
}


function showUsersStep(){
    groupStepUsers.hidden = false
    groupStepUsers.style = 'display: flex;'
    groupStepName.hidden = true
    groupStepName.style = 'display: none;'
}



function addGroupButton(chatId, name, userCount, avatar){
    document.getElementById("add-group-avatar-input").value = ""
    const groupEmpty = document.getElementById("group-empty")
    if (groupEmpty){
        groupEmpty.remove()
    }
    const button = document.createElement("button")
    button.type = "button"
    button.className = "chat-group-button chat"
    button.dataset.chatId = chatId
    button.dataset.chatTitle = name
    button.dataset.userCount = userCount
    console.log(avatar)
    if (avatar) {
        console.log(avatar)
        button.dataset.groupAvatar = avatar
        button.innerHTML = `
            <div class="group-avatar">
                <img src="${avatar}">
            </div>
            ${name.slice(0, 25)}
        `
    } else {
        button.innerHTML = `
            <div class="group-avatar">
                <h3>${name.slice(0, 2).toUpperCase()}</h3>
            </div>
            ${name.slice(0, 25)}
        `
    }
    const emptyText = document.querySelector("#groups-empty-text")
    const emptyText2 = document.querySelector("#groups-empty-text-2")
    if (emptyText && emptyText2) {
        emptyText.remove()
        emptyText2.remove()
    }
    groupList.appendChild(button)

    window.bindGroupChatButtons()
}

async function createGroup(){
    const formData = new FormData()
    formData.append("name", groupNameInput.value)
    groupUserCheckboxes.forEach((checkbox) => {
        if(checkbox.checked){
            formData.append("users", checkbox.value)
        }
    })
    if (addGroupAvatarButton.files.length > 0) {
        formData.append("avatar", addGroupAvatarButton.files[0])
    }
    const response = await fetch(
        `/chat/create_group/`,
        {
            method: "POST",
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: formData
        }
    )
    const data = await response.json()
    if(!data.success){
        return
    }
    addGroupButton(data.chat_id, data.name, data.user_count, data.avatar)
    closeGroupModal()
}

openGroupModalButton.addEventListener("click", openGroupModal)
closeGroupModalButton.addEventListener("click", closeGroupModal)
closeGroupNameModalButton.addEventListener("click", closeGroupModal)
cancelGroupModalButton.addEventListener("click", closeGroupModal)
nextGroupStepButton.addEventListener("click", showNameStep)
backGroupStepButton.addEventListener("click", showUsersStep)
createGroupButton.addEventListener("click", createGroup)
groupUserCheckboxes.forEach((checkbox) => {checkbox.addEventListener("change", updateSelectedCount)})
