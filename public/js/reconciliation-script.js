$('.type-multiple').on('click', function () {
    $('.type').removeClass('active');
    $('.type-form').addClass('hidden');

    $(this).addClass('active');
    $('.multiple').removeClass('hidden');
})


$('.type-move').on('click', function () {
    $('.type').removeClass('active');
    $('.type-form').addClass('hidden');


    $(this).addClass('active');
    $('.move').removeClass('hidden');
})

$('.type-reconciliation').on('click', function () {
    $('.type').removeClass('active');
    $('.type-form').addClass('hidden');


    $(this).addClass('active');
    $('.reconciliation').removeClass('hidden');
})






$('form.move').on('submit', function (event) {
    try {
        event.preventDefault();
        let credit = +$('input[name="fromExchRate"]').val() * +$('input[name="amount"]').val() + +$('input[name="fromWages"]').val();
        let debt = +$('input[name="toExchRate"]').val() * +$('input[name="amount"]').val() + +$('input[name="toWages"]').val();



        let description = $('input[name="description"]').val() + " "+ $('input[name="amount"]').val() + " " + $('select[name="currency"] option:selected').text();


        console.log({
            fromClientName: $('input[name="fromClientName"]').val(),
            toClientName: $('input[name="toClientName"]').val(),
            fromCurrencyNameInArabic: $('input[name="fromCurrencyNameInArabic"]').val(),
            toCurrencyNameInArabic: $('input[name="toCurrencyNameInArabic"]').val(),
            creditForUsNum: credit,
            debtedForUsNum: debt,
            type: 'حركة حوالة',
            description: description
        });


        const response = fetch('/finances/reconciliation/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromClientName: $('input[name="fromClientName"]').val(),
                toClientName: $('input[name="toClientName"]').val(),
                fromCurrencyNameInArabic: $('input[name="fromCurrencyNameInArabic"]').val(),
                toCurrencyNameInArabic: $('input[name="toCurrencyNameInArabic"]').val(),
                creditForUsNum: credit,
                debtedForUsNum: debt,
                type: 'حركة حوالة',
                description: description
                // username: userName
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        window.location.href = '/finances/reconciliation';


    } catch(error) {
        console.log(error.message)
    }
})