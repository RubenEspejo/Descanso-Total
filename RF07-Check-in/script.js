const inputCodigo = document.getElementById("codigo");
const botonValidar = document.getElementById("btnValidar");
const mensajeValidacion = document.getElementById("resultado");

const inputRegistro = document.getElementById("registro");
const botonRegistrar = document.getElementById("btnRegistrar");
const mensajeRegistro = document.getElementById("resultado2");

function leerReservas() {
    const reservas = JSON.parse(
        localStorage.getItem("reservas") || "[]"
    );

    if (!Array.isArray(reservas)) {
        throw new Error("Los datos de reservas no son válidos.");
    }

    return reservas;
}

function leerHabitaciones() {
    const habitaciones = JSON.parse(
        localStorage.getItem("habitaciones") || "[]"
    );

    if (!Array.isArray(habitaciones)) {
        throw new Error("Los datos de habitaciones no son válidos.");
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

function obtenerFechaHoy() {
    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return anio + "-" + mes + "-" + dia;
}

function buscarHabitacion(reserva, habitaciones) {
    return habitaciones.find(function (habitacion) {
        if (reserva.codigoHabitacion) {
            return habitacion.codigo === reserva.codigoHabitacion;
        }

        return habitacion.nombre === reserva.habitacion;
    });
}

function comprobarIngreso(codigo, reservas, habitaciones) {
    if (codigo === "") {
        throw new Error(
            "Debes ingresar el código de reserva."
        );
    }

    const reserva = reservas.find(function (item) {
        return (
            item.codigo &&
            item.codigo.trim().toUpperCase() === codigo
        );
    });

    if (!reserva) {
        throw new Error(
            "No se encontró una reserva con ese código."
        );
    }

    if (reserva.estado !== "Confirmada") {
        throw new Error(
            "La reserva debe estar Confirmada. Estado actual: " +
            reserva.estado +
            "."
        );
    }

    if (!reserva.entrada) {
        throw new Error(
            "La reserva no tiene una fecha de entrada válida."
        );
    }

    const hoy = obtenerFechaHoy();

    if (reserva.entrada !== hoy) {
        throw new Error(
            "El check-in solo puede realizarse en la fecha de entrada. " +
            "Fecha de entrada: " +
            reserva.entrada +
            "."
        );
    }

    const habitacion = buscarHabitacion(
        reserva,
        habitaciones
    );

    if (!habitacion) {
        throw new Error(
            "La habitación de esta reserva no pertenece al catálogo actual."
        );
    }

    const ocupadaPorOtraReserva = reservas.some(
        function (otraReserva) {
            if (
                !otraReserva ||
                otraReserva.codigo === reserva.codigo ||
                otraReserva.estado !== "Check-in"
            ) {
                return false;
            }

            return (
                otraReserva.codigoHabitacion === habitacion.codigo ||
                otraReserva.habitacion === habitacion.nombre
            );
        }
    );

    if (ocupadaPorOtraReserva) {
        throw new Error(
            "No se puede registrar el ingreso: la habitación está ocupada por otro huésped."
        );
    }

    if (
        habitacion.estado === "En limpieza" ||
        habitacion.estado === "Pendiente de limpieza"
    ) {
        throw new Error(
            "No se puede registrar el ingreso: la habitación aún no está lista."
        );
    }

    if (
        habitacion.estado !== "Disponible" &&
        habitacion.estado !== "Ocupada"
    ) {
        throw new Error(
            "La habitación no está disponible para realizar el ingreso."
        );
    }

    if (
        habitacion.estado === "Ocupada" &&
        !ocupadaPorOtraReserva
    ) {
        habitacion.estado = "Disponible";
    }

    return {
        reserva,
        habitacion
    };
}

function validarReserva(event) {
    event.preventDefault();

    mensajeValidacion.textContent = "";
    mensajeRegistro.textContent = "";

    try {
        const codigo =
            inputCodigo.value.trim().toUpperCase();

        const reservas = leerReservas();
        const habitaciones = leerHabitaciones();

        const datos = comprobarIngreso(
            codigo,
            reservas,
            habitaciones
        );

        inputRegistro.value =
            datos.reserva.codigo;

        const huesped =
            datos.reserva.huesped ||
            datos.reserva.nombre ||
            datos.reserva.nombreHuesped ||
            "Huésped";

        mostrarMensaje(
            mensajeValidacion,
            "Reserva confirmada de " +
            huesped +
            ". " +
            datos.habitacion.nombre +
            " disponible. Puedes registrar el check-in."
        );

    } catch (error) {
        inputRegistro.value = "";

        mostrarMensaje(
            mensajeValidacion,
            error.message,
            true
        );
    }
}

function registrarIngreso(event) {
    event.preventDefault();

    mensajeRegistro.textContent = "";

    try {
        const codigo =
            inputRegistro.value.trim().toUpperCase();

        const reservas = leerReservas();
        const habitaciones = leerHabitaciones();

        const datos = comprobarIngreso(
            codigo,
            reservas,
            habitaciones
        );

        const fechaIngreso = new Date();

        datos.reserva.estado = "Check-in";

        datos.reserva.codigoHabitacion =
            datos.habitacion.codigo;

        datos.reserva.habitacion =
            datos.habitacion.nombre;

        datos.reserva.fechaCheckIn =
            fechaIngreso.toISOString();

        datos.habitacion.estado =
            "Ocupada";

        datos.habitacion.codigoReservaActual =
            datos.reserva.codigo;

        guardarDatos(
            reservas,
            habitaciones
        );

        mostrarMensaje(
            mensajeRegistro,
            "Check-in registrado correctamente. " +
            datos.habitacion.nombre +
            " ahora está Ocupada."
        );

        mensajeValidacion.textContent = "";

        inputCodigo.value = "";
        inputRegistro.value = "";

    } catch (error) {
        mostrarMensaje(
            mensajeRegistro,
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
        ? "mt-2 mb-0 text-danger"
        : "mt-2 mb-0 text-success";
}

botonValidar.addEventListener(
    "click",
    validarReserva
);

botonRegistrar.addEventListener(
    "click",
    registrarIngreso
);

inputCodigo
    .closest("form")
    .addEventListener(
        "submit",
        validarReserva
    );

inputRegistro
    .closest("form")
    .addEventListener(
        "submit",
        registrarIngreso
    );

inputCodigo.addEventListener(
    "input",
    function () {
        mensajeValidacion.textContent = "";
        mensajeRegistro.textContent = "";
        inputRegistro.value = "";
    }
);

inputRegistro.addEventListener(
    "input",
    function () {
        mensajeRegistro.textContent = "";
    }
);