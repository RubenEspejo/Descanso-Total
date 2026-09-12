document.addEventListener('DOMContentLoaded', () => {
    const selects = document.querySelectorAll('.qty-select');
    const grandTotalEl = document.getElementById('grand-total');

    function calcularTotales() {
        let total = 0;
        selects.forEach(select => {
            const cantidad = Number(select.value);
            const precio = Number(select.getAttribute('data-price'));
            const subtotal = cantidad * precio;

            const fila = select.closest('tr');
            const subtotalEl = fila.querySelector('.subtotal');
            subtotalEl.textContent = "$ " + subtotal.toLocaleString('es-CL');

            total += subtotal;
        });

        grandTotalEl.textContent = "$ " + total.toLocaleString('es-CL');
    }

    selects.forEach(select => {
        select.addEventListener('change', calcularTotales);
    });

    calcularTotales();
});