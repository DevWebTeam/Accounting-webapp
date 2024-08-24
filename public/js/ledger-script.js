const { json } = require("body-parser");

$('.overview-data').on('click', function () {
    const id = $(this).id;
    try {
        const response = fetch(`/ledger/client/currency/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.log(error.message)
    }
})






$('form').on('submit', function (event) {
    event.preventDefault();
    const clientName = $('select').val()
    console.log(clientName);
    
    try {
        const response = fetch(`/finances/by-client-gr-currency/${clientName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })



        if (!response.ok) {
            console.log(response)
        }


    } catch (error) {
        console.log(error.message);
    }
})