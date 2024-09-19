const DataElement = document.getElementById('data');
// const userName = DataElement.getAttribute('data-username');

const transaction = JSON.parse(DataElement.getAttribute('data-transaction'));
console.log(transaction);



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

//on off button
$(document).ready(function(){
    // Click event for "ON" button
    $('#onButton').on('click', function() {
        $('#onButton').addClass('active');
        $('#offButton').removeClass('active');
    });

    // Click event for "OFF" button
    $('#offButton').on('click', function() {
        $('#offButton').addClass('active');
        $('#onButton').removeClass('active');
    })
});


//add form popup handling


function showDifferenceReconciliation(fromCurrency, toCurrency) {
    fromExchRate = parseFloat($('.reconciliation.active select[name="fromCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    toExchRate = parseFloat($('.reconciliation.active select[name="toCurrencyNameInArabic"] option:selected').attr('class')) || 1;



    console.log(fromExchRate);
    console.log(toExchRate);


    //* calculate the credit & dept
    credit = parseFloat($('.reconciliation.active .credit').val()) * fromExchRate || 0;
    dept = parseFloat($('.reconciliation.active .dept').val()) * toExchRate || 0;
        
    diff = +credit - +dept;
    
    console.log('credit:', credit)
    console.log('dept:', dept)
    
    if(diff === 0) {
        $('.difference.active').html(`<p>${+diff.toFixed(2)} نتيجة الحركة </p>`);
    } else {
        $('.difference.active').html(`<p class="not-zero">${+diff.toFixed(2)} نتيجة الحركة </p>`)
    }
}



function showDifferenceMove(fromCurrency, toCurrency) {
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


    //*wages type
    const fromWagesType = $('form.active.move select[name="fromWagesType"]').val();
    const toWagesType = $('form.active.move select[name="toWagesType"]').val();

    //****** */
    console.log(fromWagesType);
    
    
    
    //*calculate credit & dept
    const fromExchRate = $('.move.active input[name="fromExchRate"]').val() || 1;
    const toExchRate = $('.move.active input[name="toExchRate"]').val() || 1;


     //*operation
     const forOperation = $('form.active.move select[name="fromOperation"]').val();
     const toOperation = $('form.active.move select[name="toOperation"]').val();
     
     let fromNoWages = 0;
     if (forOperation === 'multiply') {
         fromNoWages = amount * fromExchRate;
     } else {
         fromNoWages = amount / fromExchRate;
     }
 
     let toNoWages = 0;
     if (toOperation === 'multiply') {
         toNoWages = amount * toExchRate;
     } else {
         toNoWages = amount / toExchRate;
     }


    
    let credit = 0;
    if (fromWagesType === 'forUs') {
        credit = (fromNoWages + fromWages).toFixed(2) || 0;
    } else {
        credit = (fromNoWages - fromWages).toFixed(2) || 0;
    }

    let dept = 0;
    if (toWagesType === 'forUs') {
        dept = (toNoWages + toWages).toFixed(2) || 0;
    } else {
        dept = (toNoWages - toWages).toFixed(2) || 0;
    }
    

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


function displayTransactionsMultiple(transactions) {
    let htmlList = $('.transactions');
        htmlList.empty();

        transactions.forEach( (transaction, index) => {
            if (transaction.deptedForUs == 0) {
                html = `
                <div class="transaction cln-2">
                    <button type="button" class="item" id="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,0,0,1)"><path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path></svg>
                    </button>
                        <div class="item">
                            <p dir="rtl" lang="ar">لنا <span>${transaction.creditForUs}</span> <span>${transaction.fromNameCurrency}</span> على <span>${transaction.fromClientName}</span></p>        

                            <div class="icon for-us">
                                <p>لنا</p>
                            </div>
                        </div>
                </div>`;
            } else {
                html = `
                <div class="transaction cln-2">
                    <button type="button" class="item" id="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,0,0,1)"><path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path></svg>
                    </button>
    
                    <div class="item">
                        <p dir="rtl" lang="ar">علينا <span>${transaction.deptedForUs}</span> <span>${transaction.toNameCurrency}</span> على <span>${transaction.toClientName}</span></p>
                                
                        <div class="icon on-us">
                            <p>علينا</p>
                        </div>
                    </div>
                </div>`;
            }

        htmlList.append(html)})

        showDifferenceMultiple(transactions)
}

function showDifferenceMultiple(transactions) {
    
    let credit = 0;
    let dept = 0;
    let diff = 0;

    transactions.forEach(transaction => {
        if (transaction.deptedForUs == 0 ) {
            $('.multiple select[name="CurrencyName"]').val(transaction.fromCurrency);
            const fromExchRate = $('.multiple select[name="CurrencyName"] option:selected').attr('class');
            credit += +transaction.creditForUs * +fromExchRate;
        } else {
            $('.multiple select[name="CurrencyName"]').val(transaction.toCurrency);
            const toExchRate = $('.multiple select[name="CurrencyName"] option:selected').attr('class');
            dept += +transaction.deptedForUs * +toExchRate;
        }

        diff = (credit - dept).toFixed(3)
    })
    $('.active.multiple .diff').html(` لنا ${credit}$ دولار --- علينا ${dept}$ دولار <br>  محصله الحركه <span dir="ltr"> ${diff}</span> دولار أمريكي`)
}


switch (transaction.type  || transaction[0].type) {
    case 'حركة نسوبة':
        handleFormDisplay('.type-reconciliation', '.reconciliation');
        $('#onButton').addClass('active');
        $('#offButton').removeClass('active');

        //inputs
        $('.reconciliation input[name="deptedForUsNum"]').val(transaction.deptedForUs)
        $('.reconciliation input[name="creditForUsNum"]').val(transaction.creditForUs)
        $('.reconciliation input[name="description"]').val(transaction.description)

    
        //selects
        $('.reconciliation select[name="toClientName"]').val(transaction.toClient)
        $('.reconciliation select[name="fromClientName"]').val(transaction.fromClient)
        $('.reconciliation select[name="toCurrencyNameInArabic"]').val(transaction.toCurrency)
        $('.reconciliation select[name="fromCurrencyNameInArabic"]').val(transaction.fromCurrency)


        showDifferenceReconciliation(transaction.fromCurrency, transaction.toCurrency);
        break;

    case 'حركة اعتماد':
        handleFormDisplay('.type-reconciliation', '.reconciliation');
        $('#offButton').addClass('active');
        $('#onButton').removeClass('active');

        //inputs
        $('.reconciliation input[name="deptedForUsNum"]').val(transaction.deptedForUs)
        $('.reconciliation input[name="creditForUsNum"]').val(transaction.creditForUs)
        $('.reconciliation input[name="description"]').val(transaction.description)

    
        //selects
        $('.reconciliation select[name="toClientName"]').val(transaction.toClient)
        $('.reconciliation select[name="fromClientName"]').val(transaction.fromClient)
        $('.reconciliation select[name="toCurrencyNameInArabic"]').val(transaction.toCurrency)
        $('.reconciliation select[name="fromCurrencyNameInArabic"]').val(transaction.fromCurrency)


        showDifferenceReconciliation(transaction.fromCurrency, transaction.toCurrency);
        break;

    case 'حركة حوالة':
        handleFormDisplay('.type-move', '.move');


        //selects
        $('.move select[name="toClientName"]').val(transaction.toClient)
        $('.move select[name="fromClientName"]').val(transaction.fromClient)
        $('.move select[name="toCurrencyNameInArabic"]').val(transaction.toCurrency)
        $('.move select[name="fromCurrencyNameInArabic"]').val(transaction.fromCurrency)

        showDifferenceMove(transaction.fromCurrency, transaction.toCurrency)
        break;

    case 'متعددة':
        handleFormDisplay('.type-multiple', '.multiple');
        $('.multiple input[name="description"]').val(transaction[0].description);
        displayTransactionsMultiple(transaction)
        break;
    default:
        break;
}




//************************************************************************************************************************************form display handling



$(document).on('input', 'form.active.reconciliation .credit, form.active.reconciliation .dept', updateDifferenceReconciliation);

$(document).on('input', 'form.active.move .amount, form.active.move .fromWages, form.active.move ', updateDifferenceMove);


function updateDifferenceReconciliation() {

    //* get the exchrate
    fromExchRate = parseFloat($('.reconciliation.active select[name="fromCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    toExchRate = parseFloat($('.reconciliation.active select[name="toCurrencyNameInArabic"] option:selected').attr('class')) || 1;

    //* calculate the credit & dept
    credit = parseFloat($('.reconciliation.active .credit').val()) * fromExchRate || 0;
    dept = parseFloat($('.reconciliation.active .dept').val()) * toExchRate || 0;
        
    diff = +credit - +dept;
    

    
    if(diff === 0) {
        $('.difference.active').html(`<p>${+diff.toFixed(2)} نتيجة الحركة </p>`);
    } else {
        $('.difference.active').html(`<p class="not-zero">${+diff.toFixed(2)} نتيجة الحركة </p>`)
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


    //*wages type
    const fromWagesType = $('form.active.move select[name="fromWagesType"]').val();
    const toWagesType = $('form.active.move select[name="toWagesType"]').val();

    //****** */
    console.log(fromWagesType);
    
    
    
    //*calculate credit & dept
    const fromExchRate = $('.move.active input[name="fromExchRate"]').val() || 1;
    const toExchRate = $('.move.active input[name="toExchRate"]').val() || 1;


     //*operation
     const forOperation = $('form.active.move select[name="fromOperation"]').val();
     const toOperation = $('form.active.move select[name="toOperation"]').val();
     
     let fromNoWages = 0;
     if (forOperation === 'multiply') {
         fromNoWages = amount * fromExchRate;
     } else {
         fromNoWages = amount / fromExchRate;
     }
 
     let toNoWages = 0;
     if (toOperation === 'multiply') {
         toNoWages = amount * toExchRate;
     } else {
         toNoWages = amount / toExchRate;
     }


    
    let credit = 0;
    if (fromWagesType === 'forUs') {
        credit = (fromNoWages + fromWages).toFixed(2) || 0;
    } else {
        credit = (fromNoWages - fromWages).toFixed(2) || 0;
    }

    let dept = 0;
    if (toWagesType === 'forUs') {
        dept = (toNoWages + toWages).toFixed(2) || 0;
    } else {
        dept = (toNoWages - toWages).toFixed(2) || 0;
    }
    

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


$(document).ready(function() {
    $(document).on('click', '.active.multiple .add-transaction' , () => {

        let direction = '';
        direction = $('.active.multiple select[name="direction"] option:selected').text();
        
        
        const clientName = $('.active.multiple select[name="ClientName"] option:selected').text();
        const currencyName = $('.active.multiple select[name="CurrencyName"] option:selected').text();
        const ExchRate = $('.active.multiple select[name="CurrencyName"] option:selected').attr('class')
        const ForUsNum = $('.active.multiple input[name="ForUsNum"]').val();


        let Atransaction = {
            description: $('.active.multiple input[name="description"]').val(),
            fromClientName: direction === 'مدين لنا'? clientName : 'ارباح و الخسائر',
            fromCurrency: $('.active.multiple select[name="CurrencyName"]').val(),
            toCurrency: $('.active.multiple select[name="CurrencyName"]').val(),
            fromNameCurrency: direction === 'مدين لنا'? currencyName : 'دولار أمريكي',
            ExchRate: ExchRate,
            toClientName: direction === 'مدين لنا'? 'ارباح و الخسائر' : clientName,
            toNameCurrency: direction === 'مدين لنا'? 'دولار أمريكي' : currencyName,
            creditForUs: direction === 'مدين لنا'? +ForUsNum : 0,
            deptedForUs: direction === 'مدين لنا'? 0 : +ForUsNum,
            type: 'متعددة',
            direction: direction
        }


        transaction.push(Atransaction);

        displayTransactionsMultiple(transaction)
    })
});


$(document).on('click', '.active.multiple .transaction button.item', function() {
    const index = $(this).attr('id'); // Get the id which corresponds to the transaction index

    transaction.splice(index, 1); // Remove the transaction from the array
    console.log('after deleting:', transaction);
    displayTransactionsMultiple(transaction);
});


//********************************************************************************form submit logic
//move form submission logic
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




let type ='';
if ($('.toggle-btn .active'). attr('id') == 'onButton') {
    type = 'reconciliation'
} else {
    type = 'relience'
}

$('.recon-btn').on('click', () => {
    type = 'reconciliation';
    console.log(type)
});

$('.rely-btn').on('click', () => {
    type = 'reliance';
    console.log(type)
});

// reconciliation form submission logic
$('form.reconciliation').on('submit', async function (event) {
    event.preventDefault();

    try {
        let response;
        const formData = {
            description: $('form.reconciliation input[name="description"]').val(),
            fromClientName: $('form.reconciliation select[name="fromClientName"] option:selected').text(),
            toClientName: $('form.reconciliation select[name="toClientName"] option:selected').text(),
            fromCurrencyNameInArabic: $('form.reconciliation select[name="fromCurrencyNameInArabic"] option:selected').text(),
            toCurrencyNameInArabic: $('form.reconciliation select[name="toCurrencyNameInArabic"] option:selected').text(),
            creditForUsNum: $('form.reconciliation input[name="creditForUsNum"]').val(),
            deptedForUsNum: $('form.reconciliation input[name="deptedForUsNum"]').val(),
            type: type == 'reconciliation' ? 'حركة نسوبة' : 'حركة اعتماد'  // Set the type based on the button clicked
        };

        // Determine which type of transaction to submit


        // Send the request
        response = await fetch(`/finances/reconciliation/update/${transaction._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Redirect on success
        window.location.href = '/finances/journal';

    } catch (error) {
        console.error('Error during submission:', error);
    }
});