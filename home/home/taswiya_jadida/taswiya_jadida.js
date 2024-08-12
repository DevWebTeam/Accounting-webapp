document.addEventListener('DOMContentLoaded', function() {
    const contents = document.querySelectorAll('.content');
    const radios = document.querySelectorAll('input[name="content"]');
    const amount1 = document.getElementById('amount1');
    const amount2 = document.getElementById('amount2');
    const totalAmount = document.getElementById('totalAmount');
    const confirmButton = document.getElementById('confirmButton');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            contents.forEach(content => content.style.display = 'none');
            document.querySelector('.' + this.id).style.display = 'block';

            // تحديث نمط الأزرار
            radios.forEach(r => {
                r.nextElementSibling.style.backgroundColor = '';
                r.parentElement.style.borderColor = '#ccc';
            });
            this.nextElementSibling.style.backgroundColor = '#cce7ff';
            this.parentElement.style.borderColor = '#2196F3';
        });
    });

    // Trigger change event on the checked radio to display the default content
    document.querySelector('input[name="content"]:checked').dispatchEvent(new Event('change'));

    // حساب المبلغ الإجمالي
    function calculateTotal() {
        const val1 = parseFloat(amount1.value) || 0;
        const val2 = parseFloat(amount2.value) || 0;
        totalAmount.textContent = val1 + val2;
    }

    amount1.addEventListener('input', calculateTotal);
    amount2.addEventListener('input', calculateTotal);

    confirmButton.addEventListener('click', function() {
        alert('تم تأكيد المعاملة');
    });
});

