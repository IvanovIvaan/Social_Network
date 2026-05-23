
export function getCSRFToken() {
    return document.querySelector('meta[name= "csrf-token"]').getAttribute('content')
}

document.addEventListener('click', function (event) {
    const button = event.target.closest('.delete-post');

    if (button) {
        const url = button.dataset.url;
        const postId = button.dataset.postId;

        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById(`post-${postId}`)?.remove();
            }
        });
    }
});