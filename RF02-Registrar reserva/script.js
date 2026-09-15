const formulario = document.getElementById("reservaForm");
const nombre = document.getElementById("inputNombre");
const apellido = document.getElementById("inputApellido");
const email = document.getElementById("inputEmail");
const telefono = document.getElementById("inputTelefono");
const entrada = document.getElementById("entrada");
const salida = document.getElementById("salida");
const huespedes = document.getElementById("inputHuespedes");
const habitacion = document.getElementById("inputHabitacion");
const condiciones = document.getElementById("gridCheck");
const mensaje = document.getElementById("mensajeForm");
const resumen = document.getElementById("resumenReserva");
const detalleResumen = document.getElementById("detalleResumen");

const habitaciones = {
    HAB001: {
        nombre: "Habitación Simple",
        capacidad: 1,
        precio: 65000,
        reservas: [
            { entrada: "2026-09-18", salida: "2026-09-20" }
        ]
    },
    HAB002: {
        nombre: "Habitación Doble",
        capacidad: 2,
        precio: 85000,
        reservas: [
            { entrada: "2026-09-22", salida: "2026-09-25" }
        ]
    },
    HAB003: {
        nombre: "Habitación Superior",
        capacidad: 2,
        precio: 120000,
        reservas: []
    },
    HAB004: {
        nombre: "Suite Ejecutiva",
        capacidad: 3,
        precio: 180000,
        reservas: [
            { entrada: "2026-09-28", salida: "2026-10-02" }
        ]
    },
    HAB005: {
        nombre: "Suite Presidencial",
        capacidad: 4,
        precio: 350000,
        reservas: []
    }
};

mensaje.setAttribute("role", "status");
cargarSeleccion();

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    mensaje.textContent = "";
    mensaje.className = "mt-4";
    resumen.style.display = "none";

    if (
        nombre.value.trim() === "" ||
        apellido.value.trim() === "" ||
        email.value.trim() === "" ||
        telefono.value.trim() === "" ||
        entrada.value === "" ||
        salida.value === "" ||
        huespedes.value === "" ||
        habitacion.value === ""
    ) {
        mostrarError("Debes completar todos los campos.");
        return;
    }
    if (entrada.value < obtenerHoy()) {
    mostrarError("La fecha de entrada no puede ser anterior a hoy.");
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        mostrarError("Debes ingresar un correo electrónico válido.");
        return;
    }

    if (!/^\d{9}$/.test(telefono.value.trim())) {
        mostrarError("El teléfono debe contener 9 dígitos.");
        return;
    }



    if (salida.value <= entrada.value) {
        mostrarError(
            "La fecha de salida debe ser posterior a la fecha de entrada."
        );
        return;
    }

    const cantidad = Number(huespedes.value);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 4) {
        mostrarError("La cantidad de huéspedes debe ser un entero entre 1 y 4.");
        return;
    }

    const seleccionada = habitaciones[habitacion.value];

    if (!seleccionada) {
        mostrarError("Debes seleccionar una habitación válida.");
        return;
    }

    if (cantidad > seleccionada.capacidad) {
        mostrarError("La habitación seleccionada no tiene capacidad suficiente.");
        return;
    }

    if (!condiciones.checked) {
        mostrarError("Debes aceptar los términos y condiciones.");
        return;
    }

    let reservas;

    try {
        reservas = leerReservas();
    } catch (error) {
        mostrarError(
            "No se pudieron leer las reservas guardadas. " +
            "No se registró una nueva reserva."
        );
        return;
    }

    if (
        !estaDisponible(
            habitacion.value,
            entrada.value,
            salida.value,
            reservas
        )
    ) {
        mostrarError("La habitación seleccionada no está disponible para esas fechas.");
        return;
    }

    const noches = (
        Date.parse(salida.value) - Date.parse(entrada.value)
    ) / 86400000;

    if (!Number.isInteger(noches) || noches < 1) {
        mostrarError("Debes ingresar fechas válidas.");
        return;
    }

    const reserva = {
        codigo: generarCodigo(reservas),
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        email: email.value.trim(),
        telefono: telefono.value.trim(),
        entrada: entrada.value,
        salida: salida.value,
        huespedes: cantidad,
        codigoHabitacion: habitacion.value,
        habitacion: seleccionada.nombre,
        precio: seleccionada.precio,
        noches: noches,
        total: noches * seleccionada.precio,
        estado: "Solicitada"
    };

    try {
        reservas.push(reserva);
        localStorage.setItem("reservas", JSON.stringify(reservas));
    } catch (error) {
        mostrarError(
            "No se pudo guardar la reserva. " +
            "Comprueba el almacenamiento del navegador."
        );
        return;
    }

    mensaje.textContent = "Reserva solicitada correctamente.";
    mensaje.className = "mt-4 text-success";

    mostrarResumen(reserva);
    formulario.reset();
});

function leerReservas() {
    const reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

    if (
        !Array.isArray(reservas) ||
        reservas.some(function (reserva) {
            return (
                !reserva ||
                typeof reserva.codigo !== "string" ||
                typeof reserva.habitacion !== "string" ||
                typeof reserva.estado !== "string" ||
                !Number.isFinite(Date.parse(reserva.entrada)) ||
                !Number.isFinite(Date.parse(reserva.salida)) ||
                reserva.salida <= reserva.entrada
            );
        })
    ) {
        throw new Error("Los datos de reservas no son válidos.");
    }

    return reservas;
}

function generarCodigo(reservas) {
    const usados = new Set(
        reservas.map(function (reserva) {
            return reserva.codigo.trim().toUpperCase();
        })
    );

    const disponibles = [];

    for (let numero = 1000; numero <= 9999; numero++) {
        const codigo = "DT-" + numero;

        if (!usados.has(codigo)) {
            disponibles.push(codigo);
        }
    }

    if (disponibles.length === 0) {
        throw new Error("No quedan códigos de reserva disponibles.");
    }

    const posicion = Math.floor(Math.random() * disponibles.length);

    return disponibles[posicion];
}

function estaDisponible(codigoHabitacion, fechaEntrada, fechaSalida, reservas) {
    const seleccionada = habitaciones[codigoHabitacion];

    const cruzaReservaDePrueba = seleccionada.reservas.some(function (reserva) {
        return (
            fechaEntrada < reserva.salida &&
            fechaSalida > reserva.entrada
        );
    });

    if (cruzaReservaDePrueba) {
        return false;
    }

    const cruzaReservaGuardada = reservas.some(function (reserva) {
        const mismaHabitacion =
            reserva.codigoHabitacion === codigoHabitacion ||
            reserva.habitacion === seleccionada.nombre;

        const bloqueaDisponibilidad =
            reserva.estado !== "Cancelada" &&
            reserva.estado !== "Check-out";

        const cruce =
            fechaEntrada < reserva.salida &&
            fechaSalida > reserva.entrada;

        return mismaHabitacion && bloqueaDisponibilidad && cruce;
    });

    return !cruzaReservaGuardada;
}

function cargarSeleccion() {
    try {
        const seleccion = JSON.parse(
            localStorage.getItem("seleccionReserva") || "null"
        );

        if (!seleccion) {
            return;
        }

        if (!habitaciones[seleccion.codigoHabitacion]) {
            return;
        }

        habitacion.value = seleccion.codigoHabitacion;
        entrada.value = seleccion.entrada;
        salida.value = seleccion.salida;
        huespedes.value = seleccion.personas;

        localStorage.removeItem("seleccionReserva");
    } catch (error) {
        mostrarError(
            "No se pudo recuperar la selección anterior. " +
            "Completa los datos de tu estadía."
        );
    }
}

function mostrarResumen(reserva) {
    detalleResumen.replaceChildren();

    const datos = [
        ["Código de reserva", reserva.codigo],
        ["Huésped", reserva.nombre + " " + reserva.apellido],
        ["Correo", reserva.email],
        ["Teléfono", reserva.telefono],
        ["Habitación", reserva.habitacion],
        ["Fecha de entrada", formatearFecha(reserva.entrada)],
        ["Fecha de salida", formatearFecha(reserva.salida)],
        ["Cantidad de huéspedes", reserva.huespedes],
        ["Noches", reserva.noches],
        ["Precio por noche", "$" + reserva.precio.toLocaleString("es-CL")],
        ["Total estimado", "$" + reserva.total.toLocaleString("es-CL")],
        ["Estado", reserva.estado]
    ];

    datos.forEach(function (dato) {
        const parrafo = document.createElement("p");
        const etiqueta = document.createElement("strong");

        etiqueta.textContent = dato[0] + ": ";
        parrafo.append(etiqueta, document.createTextNode(String(dato[1])));
        detalleResumen.appendChild(parrafo);
    });

    resumen.style.display = "block";
}

function formatearFecha(fecha) {
    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "mt-4 text-danger";
}
function obtenerHoy() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

entrada.min = obtenerHoy();