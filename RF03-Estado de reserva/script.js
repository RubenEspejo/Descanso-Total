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

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const codigo = codigoInput.value.trim().toUpperCase();

    resultado.style.display = "none";
    mensaje.textContent = "";

    if (codigo === "") {

        mensaje.textContent = "Debes ingresar el código de reserva.";
        mensaje.className = "mt-4 text-danger";

        return;
    }

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    const reserva = reservas.find(function(reserva) {
        return reserva.codigo.toUpperCase() === codigo;
    });

    if (!reserva) {

        mensaje.textContent = "No se encontró una reserva con ese código.";
        mensaje.className = "mt-4 text-danger";

        return;
    }

    reservaCodigo.textContent = reserva.codigo;

    huesped.textContent =
        reserva.nombre + " " + reserva.apellido;

    habitacion.textContent =
        reserva.habitacion;

    entrada.textContent =
        reserva.entrada;

    salida.textContent =
        reserva.salida;

    personas.textContent =
        reserva.huespedes;

    estadoReserva.textContent =
        reserva.estado;

    cambiarColorEstado(reserva.estado);

    resultado.style.display = "block";
});


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

    }
}