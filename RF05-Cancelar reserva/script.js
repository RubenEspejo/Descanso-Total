const formulario = document.getElementById("CancelarForm");
const codigo = document.getElementById("inputCodigo");
const email = document.getElementById("inputEmail");
const detalleReserva = document.getElementById("detalleReserva");

let reservaEncontrada = null;
let indiceReserva = -1;

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    detalleReserva.innerHTML = "";

    const codigoIngresado = codigo.value.trim().toUpperCase();
    const emailIngresado = email.value.trim().toLowerCase();

    if (codigoIngresado === "" || emailIngresado === "") {
        detalleReserva.innerHTML = `
            <p class="text-danger">
                Debes ingresar el código de reserva y el correo electrónico.
            </p>
        `;
        return;
    }

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    indiceReserva = reservas.findIndex(function(reserva) {

        return (
            reserva.codigo.toUpperCase() === codigoIngresado &&
            reserva.email.toLowerCase() === emailIngresado
        );
    });

    if (indiceReserva === -1) {
        detalleReserva.innerHTML = `
            <p class="text-danger">
                No se encontró una reserva con los datos ingresados.
            </p>
        `;
        return;
    }

    reservaEncontrada = reservas[indiceReserva];

    mostrarReserva(reservaEncontrada);
});


function mostrarReserva(reserva) {

    let botonCancelar = "";

    if (
        reserva.estado === "Solicitada" ||
        reserva.estado === "Confirmada"
    ) {
        botonCancelar = `
            <button
                type="button"
                class="btn btn-danger"
                id="btnCancelar">

                Cancelar reserva

            </button>
        `;
    }

    detalleReserva.innerHTML = `
        <div class="card">

            <div class="card-body">

                <h2 class="card-title">
                    Detalle de la reserva
                </h2>

                <p>
                    <strong>Código:</strong>
                    ${reserva.codigo}
                </p>

                <p>
                    <strong>Huésped:</strong>
                    ${reserva.nombre} ${reserva.apellido}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${reserva.email}
                </p>

                <p>
                    <strong>Habitación:</strong>
                    ${reserva.habitacion}
                </p>

                <p>
                    <strong>Fecha de entrada:</strong>
                    ${reserva.entrada}
                </p>

                <p>
                    <strong>Fecha de salida:</strong>
                    ${reserva.salida}
                </p>

                <p>
                    <strong>Estado:</strong>
                    ${reserva.estado}
                </p>

                ${botonCancelar}

                <p id="mensajeCancelacion" class="mt-3"></p>

            </div>

        </div>
    `;

    const boton = document.getElementById("btnCancelar");

    if (boton) {
        boton.addEventListener("click", cancelarReserva);
    }

    if (
        reserva.estado === "Check-in" ||
        reserva.estado === "Check-out"
    ) {
        document.getElementById("mensajeCancelacion").textContent =
            "Esta reserva no puede ser cancelada debido a su estado actual.";

        document.getElementById("mensajeCancelacion").className =
            "mt-3 text-danger";
    }

    if (reserva.estado === "Cancelada") {
        document.getElementById("mensajeCancelacion").textContent =
            "Esta reserva ya se encuentra cancelada.";

        document.getElementById("mensajeCancelacion").className =
            "mt-3 text-warning";
    }
}


function cancelarReserva() {

    const confirmar = confirm(
        "¿Estás seguro de que deseas cancelar esta reserva?"
    );

    if (!confirmar) {
        return;
    }

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];

    reservas[indiceReserva].estado = "Cancelada";

    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );

    reservaEncontrada = reservas[indiceReserva];

    mostrarReserva(reservaEncontrada);

    const mensaje = document.getElementById("mensajeCancelacion");

    mensaje.textContent =
        "La reserva fue cancelada correctamente.";

    mensaje.className =
        "mt-3 text-success";
}