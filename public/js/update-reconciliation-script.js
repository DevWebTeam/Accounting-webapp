const DataElement = document.getElementById('data');
const userName = DataElement.getAttribute('data-username');

// Get the transaction attribute, which is a string, and parse it to an object
const transaction = JSON.parse(DataElement.getAttribute('data-transaction'));

console.log(transaction);  // Should now be an object
console.log(transaction.type);  // Should print the value of the 'type' property



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



//add form popup handling
switch (transaction.type) {
    case 'حركة نسوبة':
        handleFormDisplay('.type-reconciliation', '.reconciliation');

        break;
    case 'حركة اعتماد':
        handleFormDisplay('.type-reconciliation', '.reconciliation');

        break;
    case 'حركة حوالة':
        console.log('hawala')
        handleFormDisplay('.type-move', '.move');

        break;
    case 'متعددة':
         handleFormDisplay('.type-multiple', '.multiple');
        
        break;
    default:
        break;
}




//add input val handling







//add from update submission
