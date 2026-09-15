const formulario = document.getElementById("formConsulta");
const codigoInput = document.getElementById("codigoInput");
const resultado = document.getElementById("resultado");
const mensaje = document.getElementById("mensajeConsulta");

const reservaCodigo = document.getElementById("reservaCodigo");
const estadoReserva = document.getElementById("estadoReserva");
const entrada = document.getElementById("entrada");
const salida = document.getElementById("salida");
const habitacion = document.getElementById("habitacion");
const huesped = document.getElementById("huesped");
const personas = document.getElementById("personas");

mensaje.setAttribute("role", "status");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const codigo = codigoInput.value.trim().toUpperCase();

    resultado.style.display = "none";
    mensaje.textContent = "";
    mensaje.className = "mt-4";

    if (codigo === "") {
        mostrarError("Debes ingresar el código de reserva.");
        return;
    }

    let reservas;

    try {
        reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

        if (
            !Array.isArray(reservas) ||
            reservas.some(function (reserva) {
                return !reserva || typeof reserva.codigo !== "string";
            })
        ) {
            throw new Error("Datos de reservas inválidos");
        }
    } catch (error) {
        mostrarError("No se pudieron leer las reservas guardadas.");
        return;
    }

    const reserva = reservas.find(function (reserva) {
        return reserva.codigo.trim().toUpperCase() === codigo;
    });

    if (!reserva) {
        mostrarError("No se encontró una reserva con ese código.");
        return;
    }

    reservaCodigo.textContent = reserva.codigo;
    huesped.textContent = [reserva.nombre, reserva.apellido]
        .filter(Boolean)
        .join(" ");

    habitacion.textContent = reserva.habitacion;
    entrada.textContent = formatearFecha(reserva.entrada);
    salida.textContent = formatearFecha(reserva.salida);
    personas.textContent = reserva.huespedes;
    estadoReserva.textContent = reserva.estado;

    cambiarColorEstado(reserva.estado);

    resultado.style.display = "block";
});

function formatearFecha(fecha) {
    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return "Fecha no válida";
    }

    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function cambiarColorEstado(estado) {
    estadoReserva.className = "badge";

    if (estado === "Confirmada") {
        estadoReserva.classList.add("bg-success");
    } else if (estado === "Solicitada") {
        estadoReserva.classList.add("bg-warning", "text-dark");
    } else if (estado === "Check-in") {
        estadoReserva.classList.add("bg-primary");
    } else if (estado === "Check-out") {
        estadoReserva.classList.add("bg-secondary");
    } else if (estado === "Cancelada") {
        estadoReserva.classList.add("bg-danger");
    } else {
        estadoReserva.classList.add("bg-dark");
    }
}

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "mt-4 text-danger";
}

codigoInput.addEventListener("input", function () {
    resultado.style.display = "none";
    mensaje.textContent = "";
});