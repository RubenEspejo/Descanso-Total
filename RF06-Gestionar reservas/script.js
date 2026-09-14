const tabla = document.getElementById("tablaReservas");
const buscarCodigo = document.getElementById("buscarCodigo");
const filtroEstado = document.getElementById("filtroEstado");
const mensaje = document.getElementById("mensajeReservas");

const totalSolicitadas = document.getElementById("totalSolicitadas");
const totalConfirmadas = document.getElementById("totalConfirmadas");
const totalReservas = document.getElementById("totalReservas");

let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

mostrarReservas(reservas);
actualizarContadores();


buscarCodigo.addEventListener("input", filtrarReservas);

filtroEstado.addEventListener("change", filtrarReservas);


function filtrarReservas() {

    const codigo = buscarCodigo.value.trim().toUpperCase();
    const estado = filtroEstado.value;

    const reservasFiltradas = reservas.filter(function(reserva) {

        const coincideCodigo =
            reserva.codigo.toUpperCase().includes(codigo);

        const coincideEstado =
            estado === "Todos" ||
            reserva.estado === estado;

        return coincideCodigo && coincideEstado;
    });

    mostrarReservas(reservasFiltradas);
}


function mostrarReservas(lista) {

    tabla.innerHTML = "";
    mensaje.textContent = "";

    if (lista.length === 0) {

        mensaje.textContent =
            "No existen reservas para mostrar.";

        mensaje.className =
            "mt-3 text-muted";

        return;
    }

    lista.forEach(function(reserva) {

        let accion = "";

        if (reserva.estado === "Solicitada") {

            accion = `
                <button
                    type="button"
                    class="btn btn-success btn-sm"
                    onclick="confirmarReserva('${reserva.codigo}')">

                    Confirmar

                </button>
            `;

        } else {

            accion = `
                <span class="text-muted">
                    Sin acciones
                </span>
            `;
        }

        tabla.innerHTML += `
            <tr>

                <td>
                    ${reserva.codigo}
                </td>

                <td>
                    ${reserva.nombre} ${reserva.apellido}
                </td>

                <td>
                    ${reserva.habitacion}
                </td>

                <td>
                    ${reserva.entrada}
                </td>

                <td>
                    ${reserva.salida}
                </td>

                <td>
                    ${reserva.estado}
                </td>

                <td>
                    ${accion}
                </td>

            </tr>
        `;
    });
}


function confirmarReserva(codigo) {

    const indice = reservas.findIndex(function(reserva) {
        return reserva.codigo === codigo;
    });

    if (indice === -1) {
        return;
    }

    const reservaSeleccionada = reservas[indice];

    const conflicto = reservas.some(function(reserva) {

        if (reserva.codigo === reservaSeleccionada.codigo) {
            return false;
        }

        if (
            reserva.estado !== "Confirmada" &&
            reserva.estado !== "Check-in"
        ) {
            return false;
        }

        if (
            reserva.habitacion !==
            reservaSeleccionada.habitacion
        ) {
            return false;
        }

        return fechasSeCruzan(
            reservaSeleccionada.entrada,
            reservaSeleccionada.salida,
            reserva.entrada,
            reserva.salida
        );
    });


    if (conflicto) {

        mensaje.textContent =
            "No se puede confirmar la reserva porque la habitación ya está asignada para ese período.";

        mensaje.className =
            "mt-3 text-danger";

        return;
    }


    reservaSeleccionada.estado = "Confirmada";

    localStorage.setItem(
        "reservas",
        JSON.stringify(reservas)
    );


    mensaje.textContent =
        "Reserva " +
        reservaSeleccionada.codigo +
        " confirmada correctamente.";

    mensaje.className =
        "mt-3 text-success";


    actualizarContadores();
    filtrarReservas();
}


function fechasSeCruzan(
    entrada1,
    salida1,
    entrada2,
    salida2
) {

    const inicio1 = new Date(entrada1);
    const fin1 = new Date(salida1);

    const inicio2 = new Date(entrada2);
    const fin2 = new Date(salida2);

    return (
        inicio1 < fin2 &&
        fin1 > inicio2
    );
}


function actualizarContadores() {

    const solicitadas = reservas.filter(function(reserva) {
        return reserva.estado === "Solicitada";
    });

    const confirmadas = reservas.filter(function(reserva) {
        return reserva.estado === "Confirmada";
    });

    totalSolicitadas.textContent =
        solicitadas.length;

    totalConfirmadas.textContent =
        confirmadas.length;

    totalReservas.textContent =
        reservas.length;
}