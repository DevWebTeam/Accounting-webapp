$('.filter-priority button.submit-btn').on('click', async function(event) {
    try {
        event.preventDefault();
        const priority = $('.filter-priority input').val();

        window.location.href = `/finances/general-budget/${priority}`

    } catch (error) {
        console.log("Error fetching:", error.message);
    }
})