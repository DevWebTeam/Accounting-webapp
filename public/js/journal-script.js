$('.close').on('click', () => {
    $('.pop-up').addClass('hidden')
})




let id = '';
$('.data').on('click', function () {
    id = $(this).attr('id');
    const number = $(this).find('td:last').text();


    $('.pop-up').removeClass('hidden');
    $('.pop-up h3').html(`${number} اجراءات الحركة رقم `);
})



$('.pop-up .delete').on('click', async function() {
    try {
        
        const response = await fetch(`/finances/journal/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        $(`#${id}`).addClass('deleted');
        $('.pop-up').removeClass('hidden');

        window.location.href = '/finances/journal';
        
    } catch (error) {
        console.log("Error fetching:", error);
    }
})



$('.pop-up .cancel').on('click', async function() {
    try {

        const response = await fetch(`/finances/journal/cancel/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })


        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        $(`#${id}`).addClass('canceled');
        $('.pop-up').removeClass('hidden');


        window.location.href = '/finances/journal';

    } catch (error) {
        console.log("Error Fetching:", error)
    }
})



$('.pop-up .modify').on('click', async function() {
    try {
        const response = await fetch(`/finances/reconciliation`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id
            })
        })


        if (!response.ok) {
            throw new Error("http error! Status:", response.status);
        }

        window.location.href = `/finances/reconciliation/${id}`

    } catch (error) {
        console.log("Error fetching:", error)
    }
})