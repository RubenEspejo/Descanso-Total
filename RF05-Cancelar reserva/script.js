const formulario = document.getElementById("CancelarForm");
const codigo = document.getElementById("inputCodigo");
const email = document.getElementById("inputEmail");
const detalleReserva = document.getElementById("detalleReserva");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    detalleReserva.replaceChildren();

    const codigoIngresado = codigo.value.trim().toUpperCase();
    const emailIngresado = email.value.trim().toLowerCase();

    if (codigoIngresado === "" || emailIngresado === "") {
        mostrarError("Debes ingresar el código de reserva y el correo electrónico.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIngresado)) {
        mostrarError("Debes ingresar un correo electrónico válido.");
        return;
    }

    try {
        const reservas = leerReservas();

        const reserva = buscarReserva(
            reservas,
            codigoIngresado,
            emailIngresado
        );

        if (!reserva) {
            mostrarError("No se encontró una reserva con los datos ingresados.");
            return;
        }

        mostrarReserva(reserva);
    } catch (error) {
        mostrarError("No se pudieron leer las reservas guardadas.");
    }
});

function leerReservas() {
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

    if (
        !Array.isArray(reservas) ||
        reservas.some(function (reserva) {
            return (
                !reserva ||
                typeof reserva.codigo !== "string" ||
                typeof reserva.email !== "string"
            );
        })
    ) {
        throw new Error("Datos de reservas inválidos");
    }

    return reservas;
}

function buscarReserva(reservas, codigoBuscado, correoBuscado) {
    return reservas.find(function (reserva) {
        return (
            reserva.codigo.trim().toUpperCase() === codigoBuscado &&
            reserva.email.trim().toLowerCase() === correoBuscado
        );
    });
}

function permiteCancelar(reserva) {
    return (
        reserva.estado === "Solicitada" ||
        reserva.estado === "Confirmada"
    );
}

function mostrarReserva(reserva) {
    detalleReserva.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title">Detalle de la reserva</h2>
                <div id="datosReserva"></div>
                <div id="accionesReserva"></div>
                <p id="mensajeCancelacion" class="mt-3" role="status"></p>
            </div>
        </div>
    `;

    const datosReserva = document.getElementById("datosReserva");
    const acciones = document.getElementById("accionesReserva");
    const mensaje = document.getElementById("mensajeCancelacion");

    const datos = [
        ["Código", reserva.codigo],
        [
            "Huésped",
            [reserva.nombre, reserva.apellido].filter(Boolean).join(" ")
        ],
        ["Email", reserva.email],
        ["Habitación", reserva.habitacion],
        ["Fecha de entrada", formatearFecha(reserva.entrada)],
        ["Fecha de salida", formatearFecha(reserva.salida)],
        ["Estado", reserva.estado]
    ];

    datos.forEach(function (dato) {
        const parrafo = document.createElement("p");
        const etiqueta = document.createElement("strong");

        etiqueta.textContent = dato[0] + ": ";
        parrafo.append(etiqueta, document.createTextNode(String(dato[1])));
        datosReserva.appendChild(parrafo);
    });

    if (permiteCancelar(reserva)) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "btn btn-danger";
        boton.textContent = "Cancelar reserva";

        boton.addEventListener("click", function () {
            cancelarReserva(
                reserva.codigo.trim().toUpperCase(),
                reserva.email.trim().toLowerCase()
            );
        });

        acciones.appendChild(boton);
    } else if (reserva.estado === "Cancelada") {
        mensaje.textContent = "Esta reserva ya se encuentra cancelada.";
    } else {
        mensaje.textContent =
            "Esta reserva no puede ser cancelada debido a su estado actual.";
        mensaje.className = "mt-3 text-danger";
    }
}

function cancelarReserva(codigoBuscado, correoBuscado) {
    const confirmar = window.confirm(
        "¿Estás seguro de que deseas cancelar esta reserva?"
    );

    if (!confirmar) {
        return;
    }

    try {
        const reservas = leerReservas();
        const reserva = buscarReserva(reservas, codigoBuscado, correoBuscado);

        if (!reserva) {
            mostrarError("La reserva ya no está disponible para su consulta.");
            return;
        }

        if (!permiteCancelar(reserva)) {
            mostrarReserva(reserva);
            return;
        }

        reserva.estado = "Cancelada";

        localStorage.setItem("reservas", JSON.stringify(reservas));

        mostrarReserva(reserva);

        const mensaje = document.getElementById("mensajeCancelacion");
        mensaje.textContent = "La reserva fue cancelada correctamente.";
        mensaje.className = "mt-3 text-success";
    } catch (error) {
        const mensaje = document.getElementById("mensajeCancelacion");
        mensaje.textContent =
            "No se pudo guardar la cancelación. Vuelve a consultar la reserva.";
        mensaje.className = "mt-3 text-danger";
    }
}

function formatearFecha(fecha) {
    if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return "Fecha no válida";
    }

    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function mostrarError(texto) {
    detalleReserva.replaceChildren();

    const mensaje = document.createElement("p");
    mensaje.className = "text-danger";
    mensaje.setAttribute("role", "alert");
    mensaje.textContent = texto;

    detalleReserva.appendChild(mensaje);
}

[codigo, email].forEach(function (campo) {
    campo.addEventListener("input", function () {
        detalleReserva.replaceChildren();
    });
});