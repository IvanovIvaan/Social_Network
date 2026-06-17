const buttonSections = document.querySelectorAll('#viewSection')
const blockContent = document.querySelector('.right-container')
const friendsHomeContainer = document.getElementById('friends-home')

const viewAllSectionsButton = document.getElementById('viewAllSections')
viewAllSectionsButton.classList.add('active-section')

viewAllSectionsButton.addEventListener(
    'click',
    function(){
        // window.location.reload()
        buttonSections.forEach((btn) => {
            btn.classList.remove('active-section')
        })
        friendsSectionList.innerHTML = ''
        friendsSectionList.classList.remove('friends-section-list')
        viewAllSectionsButton.classList.add('active-section')
        friendsHomeContainer.style = 'display: flex;'
    }
)

let currentSection = null;
let currentPage = 0
let isLoading = false

// const loaderLine = document.getElementById('users-loader-line')
const loaderLine = document.createElement('div')
loaderLine.style = `
        position: relative;
        bottom: 5vh;
        width: 100%;
        height: 5vh;
    `

const observer = new IntersectionObserver(async(entries) => {
    if (entries[0].isIntersecting && isLoading == false){
        
        isLoading = true
        currentPage ++

        const response = await fetch(`/friends/show-section/?section=${currentSection}&page=${currentPage}`,{
            headers:{
                'X-Requested-With': 'XMLHttpRequest',
            }
        })


        const data = await response.json()
        
        if(data.success) {
            const html = data.html
            loaderLine.insertAdjacentHTML('beforebegin', html)
        } else {
            observer.disconnect()
        }
        isLoading = false
    }
}, {rootMargin: '200px'})

// контейнер для списку користувачів однієї секції
const friendsSectionList = document.createElement('section')

buttonSections.forEach((button)=>{
    button.addEventListener(
        'click',
        function (){
            // window.location.reload()
            buttonSections.forEach((btn) => {
                btn.classList.remove('active-section')
                viewAllSectionsButton.classList.remove('active-section')
            })
            button.classList.add('active-section')
            // const title = button.getAttribute('data-section-title')


            currentSection = button.dataset.sectionLink
            currentPage = 0
            friendsHomeContainer.style = 'display: none;'
            friendsSectionList.innerHTML = ''
            friendsSectionList.className = 'friends-section-list'
            blockContent.insertAdjacentElement('afterbegin', friendsSectionList)
            friendsSectionList.insertAdjacentElement('beforeend', loaderLine)
            observer.disconnect()
            observer.observe(loaderLine)
        }
    )
})