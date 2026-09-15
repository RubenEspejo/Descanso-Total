const formulario = document.getElementById("formBuscarReserva");
const codigoReserva = document.getElementById("codigoReserva");
const mensajeBusqueda = document.getElementById("mensajeBusqueda");

const seccionServicios = document.getElementById("seccionServicios");
const codigoEncontrado = document.getElementById("codigoEncontrado");
const nombreHuesped = document.getElementById("nombreHuesped");
const habitacionReserva = document.getElementById("habitacionReserva");
const estadoReserva = document.getElementById("estadoReserva");

const cantidades = document.querySelectorAll(".qty-select");
const grandTotalEl = document.getElementById("grand-total");
const botonAgregar = document.getElementById("btnAgregarServicios");
const mensajeServicios = document.getElementById("mensajeServicios");

let codigoActivo = null;

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    codigoActivo = null;
    seccionServicios.style.display = "none";
    mensajeBusqueda.textContent = "";
    mensajeServicios.textContent = "";

    const codigo = codigoReserva.value.trim().toUpperCase();

    if (codigo === "") {
        mostrarMensaje(
            mensajeBusqueda,
            "Debes ingresar el código de reserva.",
            true
        );
        return;
    }

    try {
        const reservas = leerReservas();

        const reserva = reservas.find(function (reserva) {
            return reserva.codigo.trim().toUpperCase() === codigo;
        });

        if (!reserva) {
            mostrarMensaje(
                mensajeBusqueda,
                "No se encontró una reserva con ese código.",
                true
            );
            return;
        }

        if (!permiteServicios(reserva)) {
            mostrarMensaje(
                mensajeBusqueda,
                "Solo puedes agregar servicios a reservas Confirmadas o con Check-in.",
                true
            );
            return;
        }

        cargarServicios(reserva);

        codigoActivo = reserva.codigo;
        codigoEncontrado.textContent = reserva.codigo;
        nombreHuesped.textContent =
            [reserva.nombre, reserva.apellido].filter(Boolean).join(" ");
        habitacionReserva.textContent = reserva.habitacion;
        estadoReserva.textContent = reserva.estado;

        seccionServicios.style.display = "block";

        mostrarMensaje(
            mensajeBusqueda,
            "Reserva encontrada correctamente."
        );
        } catch (error) {
        mostrarMensaje(
            mensajeServicios,
            "No se pudieron guardar los servicios: " + error.message,
            true
        );
    }
});

function leerReservas() {
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

    if (
        !Array.isArray(reservas) ||
        reservas.some(function (reserva) {
            return !reserva || typeof reserva.codigo !== "string";
        })
    ) {
        throw new Error("Datos inválidos");
    }

    return reservas;
}

function permiteServicios(reserva) {
    return (
        reserva.estado === "Confirmada" ||
        reserva.estado === "Check-in"
    );
}

function cargarServicios(reserva) {
    const servicios = reserva.servicios || [];

    if (
        !Array.isArray(servicios) ||
        servicios.some(function (servicio) {
            return !servicio || typeof servicio.nombre !== "string";
        })
    ) {
        throw new Error("Servicios inválidos");
    }

    cantidades.forEach(function (campo) {
        const guardado = servicios.find(function (servicio) {
            return servicio.nombre === campo.dataset.servicio;
        });

        campo.value = guardado ? guardado.cantidad : 0;
    });

    calcularTotales();
}

function calcularTotales() {
    let total = 0;
    let valido = true;

    cantidades.forEach(function (campo) {
        const cantidad = Number(campo.value);
        const precio = Number(campo.dataset.price);
        const subtotalEl = campo.closest("tr").querySelector(".subtotal");

        if (
            campo.value === "" ||
            !Number.isSafeInteger(cantidad) ||
            cantidad < 0 ||
            !Number.isSafeInteger(cantidad * precio)
        ) {
            subtotalEl.textContent = "Cantidad inválida";
            campo.classList.add("is-invalid");
            valido = false;
            return;
        }

        campo.classList.remove("is-invalid");

        const subtotal = cantidad * precio;
        subtotalEl.textContent = "$" + subtotal.toLocaleString("es-CL");
        total += subtotal;
    });

    if (!Number.isSafeInteger(total)) {
        valido = false;
    }

    grandTotalEl.textContent = valido
        ? "$" + total.toLocaleString("es-CL")
        : "Revisa las cantidades";

    return valido ? total : null;
}

cantidades.forEach(function (campo) {
    campo.addEventListener("input", function () {
        mensajeServicios.textContent = "";
        calcularTotales();
    });
});

botonAgregar.addEventListener("click", function () {
    mensajeServicios.textContent = "";

    if (!codigoActivo) {
        return;
    }

    const totalServicios = calcularTotales();

    if (totalServicios === null) {
        mostrarMensaje(
            mensajeServicios,
            "Las cantidades deben ser números enteros iguales o mayores que cero.",
            true
        );
        return;
    }

    if (totalServicios === 0) {
        mostrarMensaje(
            mensajeServicios,
            "Debes seleccionar al menos un servicio con cantidad mayor que cero.",
            true
        );
        return;
    }

    const serviciosSeleccionados = [];

    cantidades.forEach(function (campo) {
        const cantidad = Number(campo.value);
        const precio = Number(campo.dataset.price);

        if (cantidad > 0) {
            serviciosSeleccionados.push({
                nombre: campo.dataset.servicio,
                unidad: campo.dataset.unidad,
                cantidad: cantidad,
                precio: precio,
                subtotal: cantidad * precio
            });
        }
    });

    try {
        const reservas = leerReservas();

        const reserva = reservas.find(function (reserva) {
            return reserva.codigo === codigoActivo;
        });

        if (!reserva || !permiteServicios(reserva)) {
            codigoActivo = null;
            seccionServicios.style.display = "none";

            mostrarMensaje(
                mensajeBusqueda,
                "La reserva ya no permite agregar servicios. Vuelve a consultarla.",
                true
            );
            return;
        }

        const totalAlojamiento =
            Number(reserva.precio) * Number(reserva.noches);

        const totalReserva = totalAlojamiento + totalServicios;

        if (
            !Number.isSafeInteger(totalAlojamiento) ||
            totalAlojamiento < 0 ||
            !Number.isSafeInteger(totalReserva)
        ) {
            throw new Error("Monto de alojamiento inválido");
        }

        reserva.servicios = serviciosSeleccionados;
        reserva.totalServicios = totalServicios;
        reserva.total = totalReserva;

        localStorage.setItem("reservas", JSON.stringify(reservas));

        mostrarMensaje(
            mensajeServicios,
            "Servicios guardados. Total de servicios: $" +
            totalServicios.toLocaleString("es-CL") +
            ". Total de la reserva: $" +
            totalReserva.toLocaleString("es-CL") + "."
        );
    } catch (error) {
        mostrarMensaje(
            mensajeServicios,
            "No se pudieron guardar los servicios. Revisa los datos y el almacenamiento.",
            true
        );
    }
});

codigoReserva.addEventListener("input", function () {
    codigoActivo = null;
    seccionServicios.style.display = "none";
    mensajeBusqueda.textContent = "";
    mensajeServicios.textContent = "";
});

function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.className = esError
        ? "mt-3 text-danger"
        : "mt-3 text-success";
}

calcularTotales();