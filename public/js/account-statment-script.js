$(document).ready(function() {
    // Iterate over each checkbox inside a <td>
    $('.data input[type="checkbox"]').each(function() {
        // If the checkbox is checked
        if ($(this).is(':checked')) {
            // Add the 'checked' class to the parent <td>
            $(this).closest('.data').addClass('checked');
        }
    });
});
       

$('.data input').on('change', async function() {
    try {
        $('.pop-up').addClass('hidden');
        const id = $(this).attr('id');
        const inputState = $(this).val();
        console.log(inputState);
        const response = await fetch(`/finances/ledeger/currencies/client/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }


        if (inputState == 'checked') {
            $(this).val('unchecked')
            $(`.data#${id}`).removeClass('checked');
        } else {
            $(this).val('checked');
            $(`.data#${id}`).addClass('checked')
        }
        


    } catch (error) {
        console.log("Error fetching", error.message);
    }
})





$('form').on('submit', async function(event) {
    try {
        event.preventDefault();


        let DataElement = document.getElementById('data');
        let info = JSON.parse(DataElement.getAttribute('data-info'));

        const response = await fetch('/finances/ledger/currencies/client/date', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ids: info,
                startDate: $('input[name="startDate"]').val(),
                endDate: $('input[name="endDate"]').val(),
                type: $('select[name="type"] option:selected').text()
            })
        })

        if (!response.ok) {
            throw new Error('HTTP error! Status:', response.status);
        }


        const data = await response.json();

        transaction = encodeURIComponent(JSON.stringify(data.transactions));
        total = encodeURIComponent(JSON.stringify(data.total));
        account = encodeURIComponent(JSON.stringify(data.account));
        info = encodeURIComponent(JSON.stringify(data.info));

        window.location.href = `/finances/ledger/account-statement?transaction=${transaction}&total=${total}&account=${account}&info=${info}`;

    } catch(error) {
        console.log('Error fetching:', error);
    }
} )


//***************************************************************************************** popup handling same as journal

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