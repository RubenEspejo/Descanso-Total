const nochesTotal = document.getElementById('noches');
const parrafoTexto = document.getElementById('resultado');
const boton = document.getElementById('btnIngresar');


const precioNoche = 100000;
const costoServicio = 125000;

boton.addEventListener('click', function(){
    const noches = Number(nochesTotal.value.trim());

    if (nochesTotal.value.trim() === "" || isNaN(noches) || noches <= 0) {
        parrafoTexto.textContent="Ingresa un número de noches válido";
        parrafoTexto.style.color="red";
        return;
    }

    const subTotal = noches * precioNoche;
    const total = subTotal + costoServicio;

    parrafoTexto.innerHTML =
        "Noches: " + noches + "<br>" +
        "Subtotal alojamiento: $" + subTotal.toLocaleString('es-CL') + "<br>" +
        "Servicio adicional: $" + costoServicio.toLocaleString('es-CL') + "<br>" +
        "<strong>Total a pagar: $" + total.toLocaleString('es-CL') + "</strong>";
    parrafoTexto.style.color = "green";
   

    
});