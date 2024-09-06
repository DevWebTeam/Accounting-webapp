$('.close').on('click', () => {
    $('.pop-up').addClass('hidden')
})





$('.data').on('click', function () {
    const id = $(this).attr('id');
    console.log(id)
    $('.pop-up').removeClass('hidden');
    $('.pop-up h3').html(`${id} اجراءات الحركة رقم `);
})