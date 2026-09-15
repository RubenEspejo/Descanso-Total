const inputCodigo = document.getElementById("codigo");
const botonValidar = document.getElementById("btnValidar");
const mensajeValidacion = document.getElementById("resultado");

const inputRegistro = document.getElementById("registro");
const botonRegistrar = document.getElementById("btnRegistrar");
const mensajeRegistro = document.getElementById("resultado2");

const habitacionesIniciales = [
    {
        codigo: "HAB001",
        nombre: "Habitación Simple",
        estado: "Disponible"
    },
    {
        codigo: "HAB002",
        nombre: "Habitación Doble",
        estado: "Disponible"
    },
    {
        codigo: "HAB003",
        nombre: "Habitación Superior",
        estado: "En limpieza"
    },
    {
        codigo: "HAB004",
        nombre: "Suite Ejecutiva",
        estado: "Ocupada"
    },
    {
        codigo: "HAB005",
        nombre: "Suite Presidencial",
        estado: "Disponible"
    }
];

function leerReservas() {
    const reservas = JSON.parse(
        localStorage.getItem("reservas") || "[]"
    );

    if (
        !Array.isArray(reservas) ||
        reservas.some(function (reserva) {
            return !reserva || typeof reserva.codigo !== "string";
        })
    ) {
        throw new Error("Los datos de reservas no son válidos.");
    }

    return reservas;
}

function leerHabitaciones() {
    const guardadas = localStorage.getItem("habitaciones");

    const habitaciones = guardadas === null
        ? habitacionesIniciales.map(function (habitacion) {
            return { ...habitacion };
        })
        : JSON.parse(guardadas);

    if (
        !Array.isArray(habitaciones) ||
        habitaciones.some(function (habitacion) {
            return (
                !habitacion ||
                typeof habitacion.codigo !== "string" ||
                typeof habitacion.estado !== "string"
            );
        })
    ) {
        throw new Error("Los datos de habitaciones no son compatibles.");
    }

    return habitaciones;
}

function comprobarIngreso(codigo, reservas, habitaciones) {
    if (codigo === "") {
        throw new Error("Debes ingresar el código de reserva.");
    }

    const reserva = reservas.find(function (item) {
        return item.codigo.trim().toUpperCase() === codigo;
    });

    if (!reserva) {
        throw new Error("No se encontró una reserva con ese código.");
    }

    if (reserva.estado !== "Confirmada") {
        throw new Error(
            "La reserva debe estar Confirmada. Estado actual: " +
            reserva.estado + "."
        );
    }

    const habitacion = habitaciones.find(function (item) {
        return reserva.codigoHabitacion
            ? item.codigo === reserva.codigoHabitacion
            : item.nombre === reserva.habitacion;
    });

    if (!habitacion) {
        throw new Error("La habitación no pertenece al catálogo actual.");
    }

    const ocupadaPorOtraReserva = reservas.some(function (item) {
        const mismaHabitacion =
            item.codigoHabitacion === habitacion.codigo ||
            item.habitacion === habitacion.nombre;

        return (
            item.codigo !== reserva.codigo &&
            item.estado === "Check-in" &&
            mismaHabitacion
        );
    });

    if (habitacion.estado === "Ocupada" || ocupadaPorOtraReserva) {
        throw new Error("No se puede registrar el ingreso: la habitación está ocupada.");
    }

    if (
        habitacion.estado === "En limpieza" ||
        habitacion.estado === "Pendiente de limpieza"
    ) {
        throw new Error("No se puede registrar el ingreso: la habitación no está limpia.");
    }

    if (habitacion.estado !== "Disponible") {
        throw new Error("La habitación no está disponible para el ingreso.");
    }

    return { reserva, habitacion };
}

function validarReserva(event) {
    event.preventDefault();

    mensajeValidacion.textContent = "";
    mensajeRegistro.textContent = "";

    try {
        const codigo = inputCodigo.value.trim().toUpperCase();
        const reservas = leerReservas();
        const habitaciones = leerHabitaciones();

        const datos = comprobarIngreso(codigo, reservas, habitaciones);

        inputRegistro.value = datos.reserva.codigo;

        mostrarMensaje(
            mensajeValidacion,
            "Reserva confirmada de " +
            datos.reserva.nombre +
            ". " +
            datos.habitacion.nombre +
            " disponible. Puedes registrar el check-in."
        );
    } catch (error) {
        inputRegistro.value = "";
        mostrarMensaje(mensajeValidacion, error.message, true);
    }
}

function registrarIngreso(event) {
    event.preventDefault();
    mensajeRegistro.textContent = "";

    try {
        const codigo = inputRegistro.value.trim().toUpperCase();
        const reservas = leerReservas();
        const habitaciones = leerHabitaciones();

        const datos = comprobarIngreso(codigo, reservas, habitaciones);
        const fechaIngreso = new Date();

        datos.reserva.estado = "Check-in";
        datos.reserva.codigoHabitacion = datos.habitacion.codigo;
        datos.reserva.fechaCheckIn = fechaIngreso.toISOString();

        datos.habitacion.estado = "Ocupada";

        guardarIngreso(reservas, habitaciones);

        mostrarMensaje(
            mensajeRegistro,
            "Check-in registrado el " +
            fechaIngreso.toLocaleString("es-CL") +
            ". Reserva: " +
            datos.reserva.codigo +
            ". Habitación: Ocupada."
        );

        mensajeValidacion.textContent = "";
    } catch (error) {
        mostrarMensaje(mensajeRegistro, error.message, true);
    }
}

function guardarIngreso(reservas, habitaciones) {
    const habitacionesAnteriores = localStorage.getItem("habitaciones");

    localStorage.setItem(
        "habitaciones",
        JSON.stringify(habitaciones)
    );

    try {
        localStorage.setItem(
            "reservas",
            JSON.stringify(reservas)
        );
    } catch (error) {
        if (habitacionesAnteriores === null) {
            localStorage.removeItem("habitaciones");
        } else {
            localStorage.setItem("habitaciones", habitacionesAnteriores);
        }

        throw error;
    }
}

function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.className = esError
        ? "mt-2 mb-0 text-danger"
        : "mt-2 mb-0 text-success";
}

botonValidar.addEventListener("click", validarReserva);
botonRegistrar.addEventListener("click", registrarIngreso);

inputCodigo.closest("form").addEventListener("submit", validarReserva);
inputRegistro.closest("form").addEventListener("submit", registrarIngreso);

inputCodigo.addEventListener("input", function () {
    mensajeValidacion.textContent = "";
    mensajeRegistro.textContent = "";
    inputRegistro.value = "";
});

inputRegistro.addEventListener("input", function () {
    mensajeRegistro.textContent = "";
});