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