const inputFechaOcupacion =
    document.getElementById("fechaOcupacion");

const inputDesde =
    document.getElementById("desde");

const inputHasta =
    document.getElementById("hasta");

const btnOcupacion =
    document.getElementById("btnOcupacion");

const btnIngresos =
    document.getElementById("btnIngresos");

const resultadoOcupacion =
    document.getElementById("resultadoOcupacion");

const resultadoIngresos =
    document.getElementById("resultadoIngresos");

const cantidadOcupadas =
    document.getElementById("cantidadOcupadas");

const porcentajeOcupacion =
    document.getElementById("porcentajeOcupacion");

const totalIngresos =
    document.getElementById("totalIngresos");

const tablaOcupacion =
    document.getElementById("tablaOcupacion");

const tablaIngresos =
    document.getElementById("tablaIngresos");

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

function obtenerHuesped(reserva) {
    return (
        reserva.huesped ||
        reserva.nombre ||
        reserva.nombreHuesped ||
        "Sin información"
    );
}

function obtenerHabitacionReserva(
    reserva,
    habitaciones
) {
    return habitaciones.find(function (habitacion) {
        return (
            habitacion.codigo === reserva.codigoHabitacion ||
            habitacion.nombre === reserva.habitacion
        );
    });
}

function estaOcupadaEnFecha(reserva, fecha) {
    if (
        reserva.estado !== "Check-in" &&
        reserva.estado !== "Check-out"
    ) {
        return false;
    }

    if (
        !reserva.entrada ||
        !reserva.salida
    ) {
        return false;
    }

    return (
        fecha >= reserva.entrada &&
        fecha < reserva.salida
    );
}

function consultarOcupacion(event) {
    event.preventDefault();

    resultadoOcupacion.textContent = "";

    cantidadOcupadas.textContent = "0";
    porcentajeOcupacion.textContent = "0%";

    tablaOcupacion.innerHTML = "";

    try {
        const fecha =
            inputFechaOcupacion.value;

        if (!fecha) {
            throw new Error(
                "Debes seleccionar una fecha."
            );
        }

        const reservas =
            leerReservas();

        const habitaciones =
            leerHabitaciones();

        const habitacionesOcupadas =
            new Map();

        reservas.forEach(function (reserva) {

            if (
                !estaOcupadaEnFecha(
                    reserva,
                    fecha
                )
            ) {
                return;
            }

            const habitacion =
                obtenerHabitacionReserva(
                    reserva,
                    habitaciones
                );

            if (!habitacion) {
                return;
            }

            habitacionesOcupadas.set(
                habitacion.codigo,
                {
                    habitacion,
                    reserva
                }
            );
        });

        const ocupadas =
            habitacionesOcupadas.size;

        const total =
            habitaciones.length;

        const porcentaje =
            total > 0
                ? (ocupadas / total) * 100
                : 0;

        cantidadOcupadas.textContent =
            ocupadas +
            " de " +
            total;

        porcentajeOcupacion.textContent =
            porcentaje.toLocaleString(
                "es-CL",
                {
                    maximumFractionDigits: 1
                }
            ) +
            "%";

        if (ocupadas === 0) {

            tablaOcupacion.innerHTML =
                "<tr>" +
                "<td colspan='4'>No existen habitaciones ocupadas para la fecha seleccionada.</td>" +
                "</tr>";

        } else {

            habitacionesOcupadas.forEach(
                function (datos) {

                    const fila =
                        document.createElement("tr");

                    const celdaHabitacion =
                        document.createElement("td");

                    const celdaReserva =
                        document.createElement("td");

                    const celdaHuesped =
                        document.createElement("td");

                    const celdaEstado =
                        document.createElement("td");

                    celdaHabitacion.textContent =
                        datos.habitacion.codigo +
                        " - " +
                        datos.habitacion.nombre;

                    celdaReserva.textContent =
                        datos.reserva.codigo;

                    celdaHuesped.textContent =
                        obtenerHuesped(
                            datos.reserva
                        );

                    celdaEstado.textContent =
                        datos.reserva.estado;

                    fila.appendChild(
                        celdaHabitacion
                    );

                    fila.appendChild(
                        celdaReserva
                    );

                    fila.appendChild(
                        celdaHuesped
                    );

                    fila.appendChild(
                        celdaEstado
                    );

                    tablaOcupacion.appendChild(
                        fila
                    );
                }
            );
        }

        mostrarMensaje(
            resultadoOcupacion,
            "Reporte de ocupación generado correctamente."
        );

    } catch (error) {

        tablaOcupacion.innerHTML =
            "<tr>" +
            "<td colspan='4'>Sin datos para mostrar.</td>" +
            "</tr>";

        mostrarMensaje(
            resultadoOcupacion,
            error.message,
            true
        );
    }
}

function obtenerFechaCheckOut(reserva) {
    if (!reserva.fechaCheckOut) {
        return "";
    }

    const fecha =
        new Date(reserva.fechaCheckOut);

    if (isNaN(fecha.getTime())) {
        return "";
    }

    const anio =
        fecha.getFullYear();

    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            fecha.getDate()
        ).padStart(2, "0");

    return (
        anio +
        "-" +
        mes +
        "-" +
        dia
    );
}

function consultarIngresos(event) {
    event.preventDefault();

    resultadoIngresos.textContent = "";
    totalIngresos.textContent = "$0";
    tablaIngresos.innerHTML = "";

    try {
        const desde =
            inputDesde.value;

        const hasta =
            inputHasta.value;

        if (
            desde === "" ||
            hasta === ""
        ) {
            throw new Error(
                "Debes seleccionar ambas fechas."
            );
        }

        if (hasta < desde) {
            throw new Error(
                "La fecha hasta no puede ser anterior a la fecha desde."
            );
        }

        const reservas =
            leerReservas();

        const reservasPeriodo =
            reservas.filter(function (reserva) {

                if (
                    reserva.estado !== "Check-out"
                ) {
                    return false;
                }

                const fechaCheckOut =
                    obtenerFechaCheckOut(
                        reserva
                    );

                if (!fechaCheckOut) {
                    return false;
                }

                return (
                    fechaCheckOut >= desde &&
                    fechaCheckOut <= hasta
                );
            });

        let total = 0;

        reservasPeriodo.forEach(
            function (reserva) {

                const monto =
                    Number(
                        reserva.totalCobro
                    ) || 0;

                total += monto;

                const fila =
                    document.createElement("tr");

                const celdaReserva =
                    document.createElement("td");

                const celdaHuesped =
                    document.createElement("td");

                const celdaFecha =
                    document.createElement("td");

                const celdaTotal =
                    document.createElement("td");

                celdaReserva.textContent =
                    reserva.codigo;

                celdaHuesped.textContent =
                    obtenerHuesped(
                        reserva
                    );

                celdaFecha.textContent =
                    obtenerFechaCheckOut(
                        reserva
                    );

                celdaTotal.textContent =
                    formatearDinero(
                        monto
                    );

                fila.appendChild(
                    celdaReserva
                );

                fila.appendChild(
                    celdaHuesped
                );

                fila.appendChild(
                    celdaFecha
                );

                fila.appendChild(
                    celdaTotal
                );

                tablaIngresos.appendChild(
                    fila
                );
            }
        );

        if (
            reservasPeriodo.length === 0
        ) {

            tablaIngresos.innerHTML =
                "<tr>" +
                "<td colspan='4'>No existen check-out registrados en el período seleccionado.</td>" +
                "</tr>";

        }

        totalIngresos.textContent =
            formatearDinero(total);

        mostrarMensaje(
            resultadoIngresos,
            "Reporte de ingresos generado correctamente."
        );

    } catch (error) {

        tablaIngresos.innerHTML =
            "<tr>" +
            "<td colspan='4'>Sin datos para mostrar.</td>" +
            "</tr>";

        mostrarMensaje(
            resultadoIngresos,
            error.message,
            true
        );
    }
}

function formatearDinero(valor) {
    return "$" +
        Number(valor).toLocaleString(
            "es-CL"
        );
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

btnOcupacion.addEventListener(
    "click",
    consultarOcupacion
);

btnIngresos.addEventListener(
    "click",
    consultarIngresos
);

inputFechaOcupacion
    .closest("form")
    .addEventListener(
        "submit",
        consultarOcupacion
    );

inputDesde
    .closest("form")
    .addEventListener(
        "submit",
        consultarIngresos
    );