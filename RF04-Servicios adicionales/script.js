const formulario = document.getElementById("formBuscarReserva");
const codigoReserva = document.getElementById("codigoReserva");
const mensajeBusqueda = document.getElementById("mensajeBusqueda");

const seccionServicios = document.getElementById("seccionServicios");
const codigoEncontrado = document.getElementById("codigoEncontrado");
const nombreHuesped = document.getElementById("nombreHuesped");
const habitacionReserva = document.getElementById("habitacionReserva");
const estadoReserva = document.getElementById("estadoReserva");

const selects = document.querySelectorAll(".qty-select");
const grandTotalEl = document.getElementById("grand-total");
const botonAgregar = document.getElementById("btnAgregarServicios");
const mensajeServicios = document.getElementById("mensajeServicios");

let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
let indiceReserva = -1;
let totalServicios = 0;


formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const codigo = codigoReserva.value.trim().toUpperCase();

    mensajeBusqueda.textContent = "";
    mensajeServicios.textContent = "";
    seccionServicios.style.display = "none";

    if (codigo === "") {

        mensajeBusqueda.textContent =
            "Debes ingresar el código de reserva.";

        mensajeBusqueda.className =
            "mt-3 text-danger";

        return;
    }

    reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    indiceReserva = reservas.findIndex(function(reserva) {
        return reserva.codigo.toUpperCase() === codigo;
    });

    if (indiceReserva === -1) {

        mensajeBusqueda.textContent =
            "No se encontró una reserva con ese código.";

        mensajeBusqueda.className =
            "mt-3 text-danger";

        return;
    }

    const reserva = reservas[indiceReserva];

    if (
        reserva.estado !== "Confirmada" &&
        reserva.estado !== "Check-in"
    ) {

        mensajeBusqueda.textContent =
            "Solo puedes agregar servicios a una reserva confirmada o con check-in.";

        mensajeBusqueda.className =
            "mt-3 text-danger";

        return;
    }

    codigoEncontrado.textContent = reserva.codigo;

    nombreHuesped.textContent =
        reserva.nombre + " " + reserva.apellido;

    habitacionReserva.textContent =
        reserva.habitacion;

    estadoReserva.textContent =
        reserva.estado;

    cargarServicios(reserva);

    seccionServicios.style.display = "block";

    mensajeBusqueda.textContent =
        "Reserva encontrada correctamente.";

    mensajeBusqueda.className =
        "mt-3 text-success";
});


selects.forEach(function(select) {

    select.addEventListener("change", calcularTotales);

});


function calcularTotales() {

    totalServicios = 0;

    selects.forEach(function(select) {

        const cantidad = Number(select.value);
        const precio = Number(select.getAttribute("data-price"));

        const subtotal = cantidad * precio;

        const fila = select.closest("tr");
        const subtotalEl = fila.querySelector(".subtotal");

        subtotalEl.textContent =
            "$" + subtotal.toLocaleString("es-CL");

        totalServicios += subtotal;
    });

    grandTotalEl.textContent =
        "$" + totalServicios.toLocaleString("es-CL");
}


function cargarServicios(reserva) {

    selects.forEach(function(select) {

        select.value = "0";

    });

    if (reserva.servicios) {

        reserva.servicios.forEach(function(servicioGuardado) {

            selects.forEach(function(select) {

                const nombreServicio =
                    select.getAttribute("data-servicio");

                if (
                    nombreServicio ===
                    servicioGuardado.nombre
                ) {

                    select.value =
                        servicioGuardado.cantidad;
                }
            });
        });
    }

    calcularTotales();
}


botonAgregar.addEventListener("click", function() {

    mensajeServicios.textContent = "";

    if (indiceReserva === -1) {
        return;
    }

    const serviciosSeleccionados = [];

    selects.forEach(function(select) {

        const cantidad = Number(select.value);
        const precio = Number(select.getAttribute("data-price"));
        const nombre = select.getAttribute("data-servicio");

        if (cantidad > 0) {

            serviciosSeleccionados.push({
                nombre: nombre,
                cantidad: cantidad,
                precio: precio,
                subtotal: cantidad * precio
            });
        }
    });


    if (serviciosSeleccionados.length === 0) {

        mensajeServicios.textContent =
            "Debes seleccionar al menos un servicio.";

        mensajeServicios.className =
            "mt-3 text-danger";

        return;
    }


    const reserva = reservas[indiceReserva];

    const totalAnteriorServicios =
        reserva.totalServicios || 0;

    const totalAlojamiento =
        reserva.total - totalAnteriorServicios;

    reserva.servicios =
        serviciosSeleccionados;

    reserva.totalServicios =
        totalServicios;

    reserva.total =
        totalAlojamiento + totalServicios;


    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );


    mensajeServicios.textContent =
        "Servicios agregados correctamente. Total de servicios: $" +
        totalServicios.toLocaleString("es-CL");

    mensajeServicios.className =
        "mt-3 text-success";
});


calcularTotales();