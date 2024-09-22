$('.filter-priority button.submit-btn').on('click', async function(event) {
    try {
        event.preventDefault();
        const priority = $('.filter-priority input').val();

        window.location.href = `/finances/general-budget/${priority}`

    } catch (error) {
        console.log("Error fetching:", error.message);
    }
})



// search for a value in drop down 
$(document).ready(function(){
    // Toggle the dropdown when clicking on the search input
    $('#search').on('focus', function() {
        $('#dropdownMenu').addClass('show');
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('#dropdownMenu').removeClass('show');
        }
    });

    // Filter function
    $('#search').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('.dropdown-item').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#dropdownMenu p').on('click', function() {
        let searchVal = $(this).text(); // Use data-id to get the value
        $('.dropdown input[name="clientName"]').val(searchVal);
        $('#dropdownMenu').removeClass('show')
    });
    
});
//  end 




// $('.search-form').on('submit', async function(event) {
//     try {
//         event.preventDefault();
//         const response = await fetch('/finances/general-budget/client', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 clientName: 
//             })
//         })
//     }
// })