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


botonAgregar.addEventListener("click", function(event) {
    event.preventDefault();

    mensajeServicios.textContent = "";

    try {
        if (indiceReserva === -1) {
            throw new Error("Primero busca una reserva.");
        }

        const codigoSeleccionado = reservas[indiceReserva].codigo;
        const serviciosSeleccionados = [];
        let nuevoTotalServicios = 0;

        for (const select of selects) {
            const cantidad = Number(select.value);
            const precio = Number(select.getAttribute("data-price"));
            const nombre = select.getAttribute("data-servicio");

            if (
                select.value === "" ||
                !Number.isSafeInteger(cantidad) ||
                cantidad < 0 ||
                !Number.isFinite(precio) ||
                precio <= 0
            ) {
                throw new Error(
                    "Revisa las cantidades. Deben ser enteros iguales o mayores que cero."
                );
            }

            if (cantidad > 0) {
                const subtotal = cantidad * precio;

                serviciosSeleccionados.push({
                    nombre: nombre,
                    cantidad: cantidad,
                    precio: precio,
                    subtotal: subtotal
                });

                nuevoTotalServicios += subtotal;
            }
        }

        if (serviciosSeleccionados.length === 0) {
            throw new Error("Debes seleccionar al menos un servicio.");
        }

        if (!Number.isSafeInteger(nuevoTotalServicios)) {
            throw new Error("El importe de servicios no es válido.");
        }

        const reservasActuales = JSON.parse(
            localStorage.getItem("reservas") || "[]"
        );

        if (!Array.isArray(reservasActuales)) {
            throw new Error("Los datos guardados no son válidos.");
        }

        const reserva = reservasActuales.find(function(item) {
            return item && item.codigo === codigoSeleccionado;
        });

        if (!reserva) {
            throw new Error("La reserva ya no existe. Vuelve a buscarla.");
        }

        if (
            reserva.estado !== "Confirmada" &&
            reserva.estado !== "Check-in"
        ) {
            throw new Error(
                "El estado actual de la reserva no permite agregar servicios."
            );
        }

        const totalAnterior = Number(reserva.total);
        const serviciosAnteriores = Number(reserva.totalServicios ?? 0);

        if (
            reserva.total == null ||
            String(reserva.total).trim() === "" ||
            !Number.isFinite(totalAnterior) ||
            !Number.isFinite(serviciosAnteriores) ||
            serviciosAnteriores < 0 ||
            totalAnterior < serviciosAnteriores
        ) {
            throw new Error("El total anterior de la reserva no es válido.");
        }

        const totalAlojamiento = totalAnterior - serviciosAnteriores;
        const nuevoTotal = totalAlojamiento + nuevoTotalServicios;

        if (!Number.isFinite(nuevoTotal)) {
            throw new Error("No se pudo calcular el total de la reserva.");
        }

        reserva.servicios = serviciosSeleccionados;
        reserva.totalServicios = nuevoTotalServicios;
        reserva.total = nuevoTotal;

        localStorage.setItem(
            "reservas",
            JSON.stringify(reservasActuales)
        );

        reservas = reservasActuales;
        indiceReserva = reservas.findIndex(function(item) {
            return item.codigo === codigoSeleccionado;
        });

        totalServicios = nuevoTotalServicios;
        calcularTotales();

        mensajeServicios.textContent =
            "Servicios guardados. Total de servicios: $" +
            nuevoTotalServicios.toLocaleString("es-CL") +
            ". Total de la reserva: $" +
            nuevoTotal.toLocaleString("es-CL") + ".";

        mensajeServicios.className = "mt-3 text-success";
    } catch (error) {
        mensajeServicios.textContent = error.message;
        mensajeServicios.className = "mt-3 text-danger";
    }
});

calcularTotales();