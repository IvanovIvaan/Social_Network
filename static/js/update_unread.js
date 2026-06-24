function updateTotalUnread() {
    let total = 0

    document.querySelectorAll(".icon-new-chats").forEach((badge) => {
        const count = parseInt(badge.textContent || "0")
        total += count
    })

    const totalBadge = document.getElementById("all-unread-count")

    if (!totalBadge) return

    totalBadge.style.display = total > 0 ? "flex" : "none"
    totalBadge.textContent = total
}
updateTotalUnread()