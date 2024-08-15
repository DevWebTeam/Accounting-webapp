$('.side-bar-link.currencies').addClass('active');      //change class




$('#add-btn').on('click', () => {           
    $('.add-form').removeClass('hidden');
})


$('.close').on('click', () => {            
    $('form').addClass('hidden');
})



let Id = ''         
                                           
$('.data').on('click', async function () {                 

    Id = this.id

    try {
        
        const response = await fetch(`/currencies/currency/${Id}`);              
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        
        $('.modify-form').removeClass('hidden');          


                                                                //modify     
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
            URL = `currencies/currency/patch/${Id}`
        } else if (method === 'DELETE') {
            URL = `currencies/currency/delete/${Id}`
        }


        try {
            const response = await fetch(URL, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    nameInArabic: $('#nameInArabic').val(),             //modify
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