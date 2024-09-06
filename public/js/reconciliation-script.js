

//**************************************************************************form pop-up handeling
// Common functionality for handling the button click and form display
function handleFormDisplay(buttonSelector, formSelector) {
    // Remove 'active' class from all buttons and forms
    $('.type').removeClass('active');
    $('.type-form').addClass('hidden').removeClass('active');
    $('.difference').removeClass('active');

    // Add 'active' class to the clicked button, the corresponding form, and the form's difference div
    $(buttonSelector).addClass('active');
    $(formSelector).removeClass('hidden').addClass('active');
    $(formSelector).find('.difference').addClass('active');
}

// Click event for the 'multiple' button
$('.type-multiple').on('click', function () {
    handleFormDisplay(this, '.multiple');
});

// Click event for the 'move' button
$('.type-move').on('click', function () {
    handleFormDisplay(this, '.move');
});

// Click event for the 'reconciliation' button
$('.type-reconciliation').on('click', function () {
    handleFormDisplay(this, '.reconciliation');
});







//**********************************************************************form displays handeling

$(document).on('input', 'form.active.reconciliation .credit, form.active.reconciliation .dept', updateDifference);

$(document).on('input', 'form.active.move .amount, form.active.move .fromWages, form.active.move ', updateDifferenceMove);


function updateDifference() {

    //* get the exchrate
    fromExchRate = parseFloat($('.reconciliation.active select[name="fromCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    toExchRate = parseFloat($('.reconciliation.active select[name="toCurrencyNameInArabic"] option:selected').attr('class')) || 1;

    //* calculate the credit & dept
    credit = parseFloat($('.reconciliation.active .credit').val()) * fromExchRate || 0;
    dept = parseFloat($('.reconciliation.active .dept').val()) * toExchRate || 0;
        
    diff = credit - dept;
    

    
    if(diff === 0) {
        $('.difference.active').html(`<p>${diff.toFixed(2)} نتيجة الحركة </p>`);
    } else {
        $('.difference.active').html(`<p class="not-zero">${diff.toFixed(2)} نتيجة الحركة </p>`)
    }

}



function updateDifferenceMove() {

    const amount = $('.move.active input.amount').val();
    
    //*calculate to wages
    const toWagesFixed = parseFloat($('form.active input[name="toWages"]').first().val()) || 0;
    const toWagesPercent = parseFloat($('form.active input[name="toWages"]').last().val()) || 0;
    
    let toWages = 0;
    if (toWagesPercent > 0) {
        toWages = (amount * toWagesPercent) / 100;
    } else {
        toWages = toWagesFixed;
    }

    //*calculate from wages
    const fromWagesFixed = parseFloat($('form.active input[name="fromWages"]').first().val()) || 0;
    const fromWagesPercent = parseFloat($('form.active input[name="fromWages"]').last().val()) || 0;

    let fromWages = 0;
    if (fromWagesPercent > 0) {
        fromWages = (amount * fromWagesPercent) / 100;
    } else {
        fromWages = fromWagesFixed;
    }



    //*calculate credit & dept
    const fromExchRate = $('.move.active input[name="fromExchRate"]').val() || 1;
    const toExchRate = $('.move.active input[name="toExchRate"]').val() || 1;

    const credit = (amount * fromExchRate + fromWages).toFixed(2) || 0;
    const dept = (amount * toExchRate + toWages).toFixed(2) || 0;


    $('.move.active .credit').val(credit);
    $('.move.active .dept').val(dept);



    const fromExchRateInial = parseFloat($('.move.active select[name="fromCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    const toExchRateInial = parseFloat($('.reconciliation.active select[name="toCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    //*calculate diff
    const diff = +((amount * fromExchRateInial + fromWages) - (amount * toExchRateInial + toWages)).toFixed(2);
    
    if(diff === 0) {
        $('.difference.active').html(`<p>${diff.toFixed(2)} نتيجة الحركة </p>`);
    } else {
        $('.difference.active').html(`<p class="not-zero">${diff.toFixed(2)} نتيجة الحركة </p>`)
    }
    
}





//*****************************************************************************form submit handeling
const userDataElement = document.getElementById('user-data');
const userName = userDataElement.getAttribute('data-username');



$('form.move').on('submit', async function (event) {
    try {
        event.preventDefault();

        const amount = $('.move.active input.amount').val();
    
        //*calculate to wages
        const toWagesFixed = parseFloat($('form.active input[name="toWages"]').first().val()) || 0;
        const toWagesPercent = parseFloat($('form.active input[name="toWages"]').last().val()) || 0;
        
        let toWages = 0;
        if (toWagesPercent > 0) {
            toWages = (amount * toWagesPercent) / 100;
        } else {
            toWages = toWagesFixed;
        }

        //*calculate from wages
        const fromWagesFixed = parseFloat($('form.active input[name="fromWages"]').first().val()) || 0;
        const fromWagesPercent = parseFloat($('form.active input[name="fromWages"]').last().val()) || 0;

        let fromWages = 0;
        if (fromWagesPercent > 0) {
            fromWages = (amount * fromWagesPercent) / 100;
        } else {
            fromWages = fromWagesFixed;
        }

        //*calculate credit & dept
        const fromExchRate = $('.move.active input[name="fromExchRate"]').val() || 1;
        const toExchRate = $('.move.active input[name="toExchRate"]').val() || 1;
    
        const credit = (amount * fromExchRate + fromWages).toFixed(2);
        const dept = (amount * toExchRate + toWages).toFixed(2);


        //*generate description
        let description = $('.move input[name="description"]').val() + " " + $('input[name="amount"]').val() + " " + $('.move select[name="currency"] option:selected').text();


        const response = await fetch('/finances/reconciliation/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromClientName: $('form.move select[name="fromClientName"] option:selected').text(),
                toClientName: $('form.move select[name="toClientName"] option:selected').text(),
                fromCurrencyNameInArabic: $('form.move select[name="fromCurrencyNameInArabic"] option:selected').text(),
                toCurrencyNameInArabic: $('form.move select[name="toCurrencyNameInArabic"] option:selected').text(),
                creditForUsNum: credit,
                deptedForUsNum: dept,
                type: 'حركة حوالة',
                description: description,
                userName: userName
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






$('form.reconciliation').on('submit', async function (event) {
    try {

        event.preventDefault();

        const response = await fetch('/finances/reconciliation/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description: $('form.reconciliation input[name="description"]').val(),
                fromClientName: $('form.reconciliation select[name="fromClientName"] option:selected').text(),
                toClientName: $('form.reconciliation select[name="toClientName"] option:selected').text(),
                fromCurrencyNameInArabic: $('form.reconciliation select[name="fromCurrencyNameInArabic"] option:selected').text(),
                toCurrencyNameInArabic: $('form.reconciliation select[name="toCurrencyNameInArabic"] option:selected').text(),
                creditForUsNum: $('form.reconciliation input[name="creditForUsNum"]').val(),
                deptedForUsNum: $('form.reconciliation input[name="deptedForUsNum"]').val(),
                type: 'حركة نسوبة',
                userName: userName
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        window.location.href = '/finances/reconciliation';



    } catch (error) {
        console.log(error.message)
    }
})
