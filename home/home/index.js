document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-table');
    const tableContainer = document.getElementById('dash-container');
    let isTableVisible = true;

    toggleButton.addEventListener('click', () => {
        if (isTableVisible) {
            tableContainer.style.display = 'none';
            toggleButton.textContent = 'عرض الجدول';
        } else {
            tableContainer.style.display = 'block';
            toggleButton.textContent = 'إخفاء الجدول';
        }
        isTableVisible = !isTableVisible;
    });
});
