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

        
        $('.pop-up').removeClass('hidden');


        window.location.href = '/finances/journal';

    } catch (error) {
        console.log("Error Fetching:", error)
    }
})



$('.pop-up .modify').on('click', async function() {
    window.location.href = `/finances/update-reconciliation/${id}`
})