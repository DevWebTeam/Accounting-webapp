document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('filter-button').addEventListener('click', function() {
        const date = document.getElementById('date-filter').value;
        const range = document.querySelector('input[name="range"]:checked')?.value;
        const currency = document.querySelector('input[name="currency"]:checked')?.value;

        if (!date || !range || !currency) {
            alert('يرجى ملء جميع الحقول.');
            return;
        }

        // Log or use the filter values for further processing
        console.log(`Date: ${date}`);
        console.log(`Range: ${range}`);
        console.log(`Currency: ${currency}`);

        // Example: send the filter values to the server or use them in the application
    });
});
