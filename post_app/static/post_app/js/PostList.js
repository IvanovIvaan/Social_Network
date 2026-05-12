let currentPage = 1
let isLoading = false

const loaderLine = document.getElementById('post-loader-line')
const postList = document.querySelector('.post-list')

const observer = new IntersectionObserver(async(entries) => {
    if (entries[0].isIntersecting && isLoading == false){
        console.log("Пости оновились")

        
        isLoading = true
        currentPage ++

        const response = await fetch(`?page=${currentPage}`,{
            headers:{
                'X-Requested-With': 'XMLHttpRequest',
            }
        })

        // console.log(response)
        // console.log( await response.text())

        const data = await response.json()
        if(data.success) {
            
            const html = data.html
            loaderLine.insertAdjacentHTML('beforebegin', html)
            console.log(postList.innerHTML)
        } else {
            observer.disconnect()
        }
        isLoading = false
    }
}, {rootMargin: '200px'})
observer.observe(loaderLine)

