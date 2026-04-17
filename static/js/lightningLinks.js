let links = document.querySelectorAll('.links a')
console.log(links)


for (let link of links) {
    // link.addEventListener(
    //     'focus',
    //     function () {
    //         link.style = `
    //             background-color: #E9E5EE;
    //         `
    //     }
    // )

    if (link.href == window.location.href) {
        link.style.backgroundColor = '#E9E5EE'
    }
}