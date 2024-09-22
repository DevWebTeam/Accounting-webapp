
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

$(document).on('input', 'form.active.reconciliation .credit, form.active.reconciliation .dept', updateDifferenceReconciliation);

$(document).on('input', 'form.active.move .amount, form.active.move .fromWages, form.active.move ', updateDifferenceMove);


function updateDifferenceReconciliation() {

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
    const toExchRateInial = parseFloat($('.move.active select[name="toCurrencyNameInArabic"] option:selected').attr('class')) || 1;
    //*calculate diff

    console.log('amount', amount)
    console.log('fromExchRateInial:', fromExchRateInial,'toExchRateInital:', toExchRateInial)
    console.log('fromwages:', fromWages, 'towages:', toWages)


    const diff = +((amount * fromExchRateInial + fromWages) - (amount * toExchRateInial + toWages)).toFixed(2);

    console.log('diff:', diff);
    
    if(diff === 0) {
        $('.difference.active').html(`<p>${diff.toFixed(2)} نتيجة الحركة </p>`);
    } else {
        $('.difference.active').html(`<p class="not-zero">${diff.toFixed(2)} نتيجة الحركة </p>`)
    }
    
}



function updateDifferenceMultiple(movementList) {
    let totalCredit = 0;
    let totalDept = 0;
    movementList.forEach(transaction => {
        //get exchRate of currency and multiply currency*exchRate
        if (transaction.creditForUs != 0)
            totalCredit += transaction.creditForUs * transaction.ExchRate;

        if (transaction.deptedForUs != 0)
            totalDept += transaction.deptedForUs * transaction.ExchRate;
    })


    totalCredit = totalCredit.toFixed(3);
    totalDept = totalDept.toFixed(3);

    let diff = (totalCredit - totalDept).toFixed(3)

    $('.active.multiple .diff').html(` لنا ${totalCredit}$ دولار --- علينا ${totalDept}$ دولار <br>  محصله الحركه <span dir="ltr"> ${diff}</span> دولار أمريكي`)

    
}




let transactionList = [];
$(document).ready(function() {
    $(document).on('click', '.active.multiple .add-transaction' , () => {

        let direction = '';
        direction = $('.active.multiple select[name="direction"] option:selected').text();
        
        
        const clientName = $('.active.multiple select[name="ClientName"] option:selected').text();
        const currencyName = $('.active.multiple select[name="CurrencyName"] option:selected').text();
        const ExchRate = $('.active.multiple select[name="CurrencyName"] option:selected').attr('class')
        const ForUsNum = $('.active.multiple input[name="ForUsNum"]').val();


        let transaction = {
            description: $('.active.multiple input[name="description"]').val(),
            fromClientName: direction === 'مدين لنا'? clientName : 'ارباح و الخسائر',
            fromCurrencyName: direction === 'مدين لنا'? currencyName : 'دولار أمريكي',
            ExchRate: ExchRate,
            toClientName: direction === 'مدين لنا'? 'ارباح و الخسائر' : clientName,
            toCurrencyName: direction === 'مدين لنا'? 'دولار أمريكي' : currencyName,
            creditForUs: direction === 'مدين لنا'? ForUsNum : 0,
            deptedForUs: direction === 'مدين لنا'? 0 : ForUsNum,
            type: 'متعددة',
            direction: direction
        }


        transactionList.push(transaction);

        console.log(transactionList);

        let htmlList = $('.transactions');
        htmlList.empty();

        transactionList.forEach( (transaction, index) => {
            if (transaction.direction === "مدين لنا") {
                html = `
                <div class="transaction cln-2">
                    <button type="button" class="item" id="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,0,0,1)"><path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path></svg>
                    </button>
                        <div class="item">
                            <p dir="rtl" lang="ar">لنا <span>${transaction.creditForUs}</span> <span>${transaction.fromCurrencyName}</span> على <span>${transaction.fromClientName}</span></p>        

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
                        <p dir="rtl" lang="ar">علينا <span>${transaction.deptedForUs}</span> <span>${transaction.toCurrencyName}</span> على <span>${transaction.toClientName}</span></p>
                                
                        <div class="icon on-us">
                            <p>علينا</p>
                        </div>
                    </div>
                </div>`;
            }
        htmlList.append(html)})

        updateDifferenceMultiple(transactionList);
            


    })
});





$(document).on('click', '.active.multiple .transaction button.item', function() {
    const index = $(this).attr('id'); // Get the id which corresponds to the transaction index

    transactionList.splice(index, 1); // Remove the transaction from the array
    console.log(transactionList);

    let htmlList = $('.transactions');
    htmlList.empty(); // Clear the current list

    transactionList.forEach((transaction, index) => {
        let html;
        if (transaction.direction === "مدين لنا") {
            html = `
            <div class="transaction cln-2">
                <button class="item" id="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,0,0,1)">
                        <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path>
                    </svg>
                </button>
                <div class="item">
                    <p dir="rtl" lang="ar">لنا <span>${transaction.creditForUs}</span> <span>${transaction.fromCurrencyName}</span> على <span>${transaction.fromClientName}</span></p>
                    <div class="icon for-us">
                        <p>لنا</p>
                    </div>
                </div>
            </div>`;
        } else {
            html = `
            <div class="transaction cln-2">
                <button class="item" id="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="rgba(255,0,0,1)">
                        <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path>
                    </svg>
                </button>
                <div class="item">
                    <p dir="rtl" lang="ar">علينا <span>${transaction.deptedForUs}</span> <span>${transaction.toCurrencyName}</span> على <span>${transaction.toClientName}</span></p>
                    <div class="icon on-us">
                        <p>علينا</p>
                    </div>
                </div>
            </div>`;
        }

        htmlList.append(html);
    });

    updateDifferenceMultiple(transactionList);
});




//sync dropdown
$(document).on('change', 'form.active select[name="fromCurrencyNameInArabic"]', function() {
    const selectedVal = $(this).val();

    $('form.active select[name="toCurrencyNameInArabic"]').val(selectedVal);  // Update the second select
});







//*****************************************************************************form submit handeling


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




let type = 'reconciliation';

// Set event listeners for the buttons before form submission
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

        console.log(formData);

        // Send the request
        response = await fetch('/finances/reconciliation/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Redirect on success
        window.location.href = '/finances/reconciliation';

    } catch (error) {
        console.error('Error during submission:', error);
    }
});



//multiple form submission logic
$('.multiple').on('submit', async function(event) {
    try {
        event.preventDefault();
        const response = await fetch('/finances/reconciliation/new-multiple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transactions: transactionList
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        window.location.href = '/finances/reconciliation';
    } catch (error) {
        console.log("Error fetching:", error);
    }
});


//*********************************************drop down
// search for a value in drop down 
$(document).ready(function(){
    // Toggle the dropdown when clicking on the search input
    $('#search').on('focus', function() {
        $('#dropdownMenu').addClass('show');
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('#dropdownMenu').removeClass('show');
        }
    });

    // Filter function
    $('#search').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('.dropdown-item').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('#dropdownMenu p').on('click', function() {
        let searchVal = $(this).data('id'); // Use data-id to get the value
        console.log(searchVal);
        console.log($('#clientSelect').val());
        $('.multiple #clientSelect').val(searchVal);
        console.log($('#clientSelect').val());
        $('#dropdownMenu').removeClass('show')
    });
    
});
//  end 

$(document).ready(function(){
    // Set the initial active state
    $('#onButton').addClass('active');

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
