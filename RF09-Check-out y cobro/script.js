const inputCodigo = document.getElementById("codigo");
const botonCalcular = document.getElementById("btnCalcular");
const botonConfirmar = document.getElementById("btnConfirmar");

const resultado = document.getElementById("resultado");
const resultadoConfirmacion = document.getElementById("resultadoConfirmacion");
const comprobante = document.getElementById("comprobante");

let codigoReservaCalculada = "";

const serviciosIniciales = [
    {
        codigo: "SE001",
        nombre: "Desayuno",
        precio: 12000
    },
    {
        codigo: "SE002",
        nombre: "Spa",
        precio: 25000
    },
    {
        codigo: "SE003",
        nombre: "Estacionamiento",
        precio: 10000
    },
    {
        codigo: "SE004",
        nombre: "Cena",
        precio: 20000
    }
];

function leerReservas() {
    const reservas = JSON.parse(
        localStorage.getItem("reservas") || "[]"
    );

    if (!Array.isArray(reservas)) {
        throw new Error(
            "Los datos de reservas no son válidos."
        );
    }

    return reservas;
}

function leerHabitaciones() {
    const habitaciones = JSON.parse(
        localStorage.getItem("habitaciones") || "[]"
    );

    if (!Array.isArray(habitaciones)) {
        throw new Error(
            "Los datos de habitaciones no son válidos."
        );
    }

    return habitaciones;
}

function guardarDatos(reservas, habitaciones) {
    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );

    localStorage.setItem(
        "habitaciones",
        JSON.stringify(habitaciones)
    );
}

function buscarReserva(codigo, reservas) {
    return reservas.find(function (reserva) {
        return (
            reserva.codigo &&
            reserva.codigo.trim().toUpperCase() === codigo
        );
    });
}

function buscarHabitacion(reserva, habitaciones) {
    return habitaciones.find(function (habitacion) {
        return (
            habitacion.codigo === reserva.codigoHabitacion ||
            habitacion.nombre === reserva.habitacion
        );
    });
}

function calcularNoches(entrada, salida) {
    const fechaEntrada =
        new Date(entrada + "T00:00:00");

    const fechaSalida =
        new Date(salida + "T00:00:00");

    if (
        isNaN(fechaEntrada.getTime()) ||
        isNaN(fechaSalida.getTime())
    ) {
        throw new Error(
            "Las fechas de la reserva no son válidas."
        );
    }

    const diferencia =
        fechaSalida.getTime() -
        fechaEntrada.getTime();

    const noches =
        Math.ceil(
            diferencia /
            (1000 * 60 * 60 * 24)
        );

    if (noches <= 0) {
        throw new Error(
            "La cantidad de noches no es válida."
        );
    }

    return noches;
}

function obtenerTarifa(reserva, habitacion) {
    const posiblesTarifas = [
        reserva.tarifaNoche,
        reserva.precioNoche,
        reserva.tarifa,
        reserva.precioHabitacion,
        reserva.precio,
        habitacion.precio
    ];

    for (const tarifa of posiblesTarifas) {
        const numero = Number(tarifa);

        if (
            !isNaN(numero) &&
            numero > 0
        ) {
            return numero;
        }
    }

    throw new Error(
        "La reserva no tiene una tarifa registrada."
    );
}

function obtenerCatalogoServicios() {
    const guardados =
        localStorage.getItem("servicios");

    if (guardados) {
        const servicios =
            JSON.parse(guardados);

        if (Array.isArray(servicios)) {
            return servicios;
        }
    }

    return serviciosIniciales;
}

function buscarServicioCatalogo(valor) {
    const catalogo =
        obtenerCatalogoServicios();

    return catalogo.find(function (servicio) {
        return (
            servicio.codigo === valor ||
            servicio.nombre === valor
        );
    });
}

function obtenerServiciosReserva(reserva) {
    const servicios =
        reserva.serviciosAdicionales ||
        reserva.servicios ||
        [];

    if (!Array.isArray(servicios)) {
        return [];
    }

    return servicios.map(function (item) {
        if (typeof item === "string") {
            const encontrado =
                buscarServicioCatalogo(item);

            if (!encontrado) {
                return {
                    nombre: item,
                    cantidad: 1,
                    precio: 0,
                    total: 0
                };
            }

            return {
                nombre: encontrado.nombre,
                cantidad: 1,
                precio: Number(encontrado.precio),
                total: Number(encontrado.precio)
            };
        }

        const codigo =
            item.codigo ||
            item.codigoServicio ||
            "";

        const nombre =
            item.nombre ||
            item.servicio ||
            "";

        const catalogo =
            buscarServicioCatalogo(
                codigo || nombre
            );

        const cantidad =
            Number(item.cantidad || 1);

        const precio =
            Number(
                item.precio ||
                item.precioUnitario ||
                item.valor ||
                catalogo?.precio ||
                0
            );

        return {
            nombre:
                nombre ||
                catalogo?.nombre ||
                codigo ||
                "Servicio",

            cantidad: cantidad,

            precio: precio,

            total:
                cantidad * precio
        };
    });
}

function formatearDinero(valor) {
    return "$" +
        Number(valor).toLocaleString(
            "es-CL"
        );
}

function calcularCobro(reserva, habitacion) {
    const noches =
        calcularNoches(
            reserva.entrada,
            reserva.salida
        );

    const tarifa =
        obtenerTarifa(
            reserva,
            habitacion
        );

    const alojamiento =
        noches * tarifa;

    const servicios =
        obtenerServiciosReserva(reserva);

    const totalServicios =
        servicios.reduce(
            function (acumulador, servicio) {
                return (
                    acumulador +
                    servicio.total
                );
            },
            0
        );

    const total =
        alojamiento +
        totalServicios;

    return {
        noches,
        tarifa,
        alojamiento,
        servicios,
        totalServicios,
        total
    };
}

function validarCheckOut(codigo) {
    if (codigo === "") {
        throw new Error(
            "Debes ingresar el código de reserva."
        );
    }

    const reservas =
        leerReservas();

    const habitaciones =
        leerHabitaciones();

    const reserva =
        buscarReserva(
            codigo,
            reservas
        );

    if (!reserva) {
        throw new Error(
            "No se encontró una reserva con ese código."
        );
    }

    if (reserva.estado !== "Check-in") {
        throw new Error(
            "Solo se puede realizar check-out de reservas en estado Check-in. Estado actual: " +
            reserva.estado +
            "."
        );
    }

    const habitacion =
        buscarHabitacion(
            reserva,
            habitaciones
        );

    if (!habitacion) {
        throw new Error(
            "La habitación asociada a la reserva no existe."
        );
    }

    return {
        reservas,
        habitaciones,
        reserva,
        habitacion
    };
}

function mostrarComprobante(reserva, habitacion, cobro) {
    const huesped =
        reserva.huesped ||
        reserva.nombre ||
        reserva.nombreHuesped ||
        "Huésped";

    let detalleServicios = "";

    if (cobro.servicios.length === 0) {
        detalleServicios =
            "<p>Servicios adicionales: $0</p>";
    } else {
        detalleServicios =
            "<hr><strong>Servicios adicionales</strong>";

        cobro.servicios.forEach(function (servicio) {
            detalleServicios +=
                "<p class='mb-1'>" +
                servicio.nombre +
                " x " +
                servicio.cantidad +
                ": " +
                formatearDinero(
                    servicio.total
                ) +
                "</p>";
        });
    }

    comprobante.innerHTML =
        "<p><strong>Reserva:</strong> " +
        reserva.codigo +
        "</p>" +

        "<p><strong>Huésped:</strong> " +
        huesped +
        "</p>" +

        "<p><strong>Habitación:</strong> " +
        habitacion.nombre +
        "</p>" +

        "<p><strong>Noches:</strong> " +
        cobro.noches +
        "</p>" +

        "<p><strong>Tarifa por noche:</strong> " +
        formatearDinero(
            cobro.tarifa
        ) +
        "</p>" +

        "<p><strong>Alojamiento:</strong> " +
        formatearDinero(
            cobro.alojamiento
        ) +
        "</p>" +

        detalleServicios +

        "<hr>" +

        "<p><strong>Total servicios:</strong> " +
        formatearDinero(
            cobro.totalServicios
        ) +
        "</p>" +

        "<h5>Total a pagar: " +
        formatearDinero(
            cobro.total
        ) +
        "</h5>";
}

function calcularCheckOut(event) {
    event.preventDefault();

    resultado.textContent = "";
    resultadoConfirmacion.textContent = "";
    botonConfirmar.disabled = true;
    codigoReservaCalculada = "";

    try {
        const codigo =
            inputCodigo.value
                .trim()
                .toUpperCase();

        const datos =
            validarCheckOut(codigo);

        const cobro =
            calcularCobro(
                datos.reserva,
                datos.habitacion
            );

        mostrarComprobante(
            datos.reserva,
            datos.habitacion,
            cobro
        );

        codigoReservaCalculada =
            datos.reserva.codigo;

        botonConfirmar.disabled = false;

        mostrarMensaje(
            resultado,
            "Cobro calculado correctamente."
        );

    } catch (error) {
        comprobante.innerHTML =
            "<p class='text-muted'>Ingresa una reserva válida para calcular el cobro.</p>";

        mostrarMensaje(
            resultado,
            error.message,
            true
        );
    }
}

function confirmarCheckOut() {
    resultadoConfirmacion.textContent = "";

    try {
        if (!codigoReservaCalculada) {
            throw new Error(
                "Primero debes calcular el cobro."
            );
        }

        const datos =
            validarCheckOut(
                codigoReservaCalculada.toUpperCase()
            );

        const cobro =
            calcularCobro(
                datos.reserva,
                datos.habitacion
            );

        datos.reserva.estado =
            "Check-out";

        datos.reserva.fechaCheckOut =
            new Date().toISOString();

        datos.reserva.totalAlojamiento =
            cobro.alojamiento;

        datos.reserva.totalServicios =
            cobro.totalServicios;

        datos.reserva.totalCobro =
            cobro.total;

        datos.reserva.nochesCobradas =
            cobro.noches;

        datos.habitacion.estado =
            "Pendiente de limpieza";

        datos.habitacion.estadoLimpieza =
            "Pendiente de limpieza";

        datos.habitacion.responsableLimpieza =
            "";

        datos.habitacion.observaciones =
            "";

        datos.habitacion.codigoReservaActual =
            "";

        delete datos.habitacion.fechaInicioLimpieza;
        delete datos.habitacion.fechaFinLimpieza;

        guardarDatos(
            datos.reservas,
            datos.habitaciones
        );

        mostrarMensaje(
            resultadoConfirmacion,
            "Check-out registrado correctamente. La habitación quedó pendiente de limpieza."
        );

        botonConfirmar.disabled = true;

        codigoReservaCalculada = "";

    } catch (error) {
        mostrarMensaje(
            resultadoConfirmacion,
            error.message,
            true
        );
    }
}

function mostrarMensaje(
    elemento,
    texto,
    esError = false
) {
    elemento.textContent = texto;

    elemento.className = esError
        ? "mt-3 mb-0 text-danger"
        : "mt-3 mb-0 text-success";
}

botonCalcular.addEventListener(
    "click",
    calcularCheckOut
);

botonConfirmar.addEventListener(
    "click",
    confirmarCheckOut
);

inputCodigo
    .closest("form")
    .addEventListener(
        "submit",
        calcularCheckOut
    );

inputCodigo.addEventListener(
    "input",
    function () {
        resultado.textContent = "";
        resultadoConfirmacion.textContent = "";

        botonConfirmar.disabled = true;

        codigoReservaCalculada = "";

        comprobante.innerHTML =
            "<p class='text-muted'>Ingresa una reserva para calcular el cobro.</p>";
    }
);