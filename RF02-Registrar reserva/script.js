const formulario = document.getElementById("reservaForm");

const nombre = document.getElementById("inputNombre");
const apellido = document.getElementById("inputApellido");
const email = document.getElementById("inputEmail");
const telefono = document.getElementById("inputTelefono");
const rut = document.getElementById("inputRut");

const entrada = document.getElementById("entrada");
const salida = document.getElementById("salida");
const huespedes = document.getElementById("inputHuespedes");
const habitacion = document.getElementById("inputHabitacion");
const condiciones = document.getElementById("gridCheck");

const mensaje = document.getElementById("mensajeForm");
const resumen = document.getElementById("resumenReserva");
const detalleResumen = document.getElementById("detalleResumen");

const habitaciones = {
    simple: {
        nombre: "Habitación Simple",
        capacidad: 1,
        precio: 55000,
        reservas: [
            {
                entrada: "2026-09-18",
                salida: "2026-09-20"
            }
        ]
    },

    doble: {
        nombre: "Habitación Doble",
        capacidad: 2,
        precio: 75000,
        reservas: [
            {
                entrada: "2026-09-22",
                salida: "2026-09-25"
            }
        ]
    },

    familiar: {
        nombre: "Habitación Familiar",
        capacidad: 4,
        precio: 105000,
        reservas: []
    },

    suite: {
        nombre: "Suite",
        capacidad: 5,
        precio: 140000,
        reservas: [
            {
                entrada: "2026-09-28",
                salida: "2026-10-02"
            }
        ]
    }
};

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    mensaje.textContent = "";
    mensaje.className = "mt-4";
    resumen.style.display = "none";

    if (
        nombre.value.trim() === "" ||
        apellido.value.trim() === "" ||
        email.value.trim() === "" ||
        telefono.value.trim() === "" ||
        rut.value.trim() === "" ||
        entrada.value === "" ||
        salida.value === "" ||
        huespedes.value === "" ||
        habitacion.value === ""
    ) {
        mostrarError("Debes completar todos los campos.");
        return;
    }

    if (nombre.value.trim().length < 3) {
        mostrarError("El nombre debe tener al menos 3 caracteres.");
        return;
    }

    if (apellido.value.trim().length < 3) {
        mostrarError("El apellido debe tener al menos 3 caracteres.");
        return;
    }

    if (!validarEmail(email.value)) {
        mostrarError("Debes ingresar un correo electrónico válido.");
        return;
    }

    if (!validarTelefono(telefono.value)) {
        mostrarError("El teléfono debe contener 9 dígitos.");
        return;
    }

    if (!validarRut(rut.value)) {
        mostrarError("El RUT debe tener un formato válido. Ej: 20123456-7");
        return;
    }

    if (salida.value <= entrada.value) {
        mostrarError("La fecha de salida debe ser posterior a la fecha de entrada.");
        return;
    }

    if (Number(huespedes.value) < 1) {
        mostrarError("Debes ingresar al menos un huésped.");
        return;
    }

    if (!condiciones.checked) {
        mostrarError("Debes aceptar los términos y condiciones.");
        return;
    }

    const habitacionSeleccionada = habitaciones[habitacion.value];

    if (Number(huespedes.value) > habitacionSeleccionada.capacidad) {
        mostrarError("La habitación seleccionada no tiene capacidad suficiente.");
        return;
    }

    if (!estaDisponible(habitacionSeleccionada, entrada.value, salida.value)) {
        mostrarError("La habitación seleccionada no está disponible para esas fechas.");
        return;
    }

    const codigo = generarCodigo();

    const fechaEntrada = new Date(entrada.value + "T00:00:00");
    const fechaSalida = new Date(salida.value + "T00:00:00");

    const diferencia = fechaSalida - fechaEntrada;
    const noches = diferencia / (1000 * 60 * 60 * 24);

    const total = noches * habitacionSeleccionada.precio;

    const reserva = {
        codigo: codigo,
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        email: email.value.trim(),
        telefono: telefono.value.trim(),
        rut: rut.value.trim(),
        entrada: entrada.value,
        salida: salida.value,
        huespedes: Number(huespedes.value),
        habitacion: habitacionSeleccionada.nombre,
        precio: habitacionSeleccionada.precio,
        noches: noches,
        total: total,
        estado: "Solicitada"
    };

    guardarReserva(reserva);

    mensaje.textContent = "Reserva solicitada correctamente.";
    mensaje.className = "mt-4 text-success";

    detalleResumen.innerHTML = `
        <p><strong>Código de reserva:</strong> ${reserva.codigo}</p>
        <p><strong>Huésped:</strong> ${reserva.nombre} ${reserva.apellido}</p>
        <p><strong>Habitación:</strong> ${reserva.habitacion}</p>
        <p><strong>Fecha de entrada:</strong> ${reserva.entrada}</p>
        <p><strong>Fecha de salida:</strong> ${reserva.salida}</p>
        <p><strong>Cantidad de huéspedes:</strong> ${reserva.huespedes}</p>
        <p><strong>Noches:</strong> ${reserva.noches}</p>
        <p><strong>Precio por noche:</strong> $${reserva.precio.toLocaleString("es-CL")}</p>
        <p><strong>Total estimado:</strong> $${reserva.total.toLocaleString("es-CL")}</p>
        <p><strong>Estado:</strong> ${reserva.estado}</p>
    `;

    resumen.style.display = "block";
});

function validarEmail(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarTelefono(numero) {
    return /^\d{9}$/.test(numero);
}

function validarRut(rut) {
    return /^\d{7,8}-[\dkK]$/.test(rut);
}

function generarCodigo() {
    const numero = Math.floor(1000 + Math.random() * 9000);
    return "DT-" + numero;
}

function estaDisponible(habitacion, fechaEntrada, fechaSalida) {

    const nuevaEntrada = new Date(fechaEntrada);
    const nuevaSalida = new Date(fechaSalida);

    for (let reserva of habitacion.reservas) {

        const entradaReserva = new Date(reserva.entrada);
        const salidaReserva = new Date(reserva.salida);

        if (
            nuevaEntrada < salidaReserva &&
            nuevaSalida > entradaReserva
        ) {
            return false;
        }
    }

    return true;
}

function guardarReserva(reserva) {

    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    reservas.push(reserva);

    localStorage.setItem("reservas", JSON.stringify(reservas));
}

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "mt-4 text-danger";
}