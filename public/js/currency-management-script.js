$('.side-bar-link.currencies').addClass('active');


$('#add-btn').on('click', () => {         
    $('.add-form').removeClass('hidden');
})


$('.close').on('click', () => {             
    $('form').addClass('hidden');
})



let currencyId = ''         //to keep currency id when clicking
                                           
$('.data').on('click', async function () {                 //clicking on a currency to modify it

    currencyId = this.id

    try {
        
        const response = await fetch(`/currencies/currency/${currencyId}`);                //fetching a currency by id
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log(result);
        
        
        $('.modify-form').removeClass('hidden');             //show form to modify currency

        $('#nameInArabic').val(result.nameInArabic);
        $('#nameInEnglish').val(result.nameInEnglish);
        $('#code').val(result.code);
        $('#symbol').val(result.symbol);
        $('#exchRate').val(result.exchRate);
        $('#priorityCu').val(result.priorityCu);

    } catch (error) {
        console.error('Error fetching currency details:', error);
    }
});


$('.patch-btn').on('click', function (event) {
    event.preventDefault();
    submitForm('PATCH');
})


$('.delete-btn').on('click', function (event) {
    event.preventDefault();
    submitForm('DELETE');
})


 async function submitForm(method) {
        let URL;
        if (method === 'PATCH') {
            URL = `currencies/currency/patch/${currencyId}`
        } else if (method === 'DELETE') {
            URL = `currencies/currency/delete/${currencyId}`
        }
        try {
            const response = await fetch(URL, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    nameInArabic: $('#nameInArabic').val(),
                    nameInEnglish: $('#nameInEnglish').val(),
                    code: $('#code').val(),
                    symbol: $('#symbol').val(),
                    exchRate: $('#exchRate').val(),
                    priorityCu: $('#priorityCu').val(),
                })

            })

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            console.log('fetch successful:', result);
            window.location.href = '/currencies';
        } catch (error) {
            console.log('Error fetching:', error);
        }
}



// $('.modify-form').on('submit', async function (event) {
//     event.preventDefault();
    
//     try {
//         const response = await fetch(`/currencies/currency/patch/${currencyId}`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 nameInArabic: $('#nameInArabic').val(),
//                 nameInEnglish: $('#nameInEnglish').val(),
//                 code: $('#code').val(),
//                 symbol: $('#symbol').val(),
//                 exchRate: $('#exchRate').val(),
//                 priorityCu: $('#priorityCu').val(),
//             })
//         })

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Update successful:', result);

//         window.location.href = '/currencies';           //redirect to this URL (replac the redirect in controller with a json message)

//     } catch (error) {
//         console.error('Error updating currency:', error);
//     }
// })