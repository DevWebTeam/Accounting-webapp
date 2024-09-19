$('.close').on('click', () => {
    $('.pop-up').addClass('hidden')
    $('.pop-up-cancel').addClass('hidden')
})




let id = '';
let classes = '';
$('.data').on('click', function () {

    
    id = $(this).attr('id');
    const number = $(this).find('td:last').text();

    classes = $(this).attr('class');
    console.log(classes);


    if (!classes.includes('canceled') && !classes.includes('إلغاء') && !classes.includes('إلـغـاء')) {

        $('.pop-up').removeClass('hidden');
        $('.pop-up h3').html(`${number} اجراءات الحركة رقم `);

    } else if (classes.includes('إلغاء') || classes.includes('إلـغـاء')) {
        console.log('else if')
        $('.pop-up-cancel').removeClass('hidden');
        $('.pop-up-cancel h3').html(`${number} اجراءات الحركة رقم `);
    }
})



$('.delete').on('click', async function() {
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



$('.cancel').on('click', async function() {
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



$('.modify').on('click', async function() {
    if (!classes.includes('متعددة')) {
        window.location.href = `/finances/update-reconciliation/${id}`
    } else {
        window.location.href = `/finances/update-reconciliation/multiple/${id}`
    }
})