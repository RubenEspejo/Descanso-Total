const habitaciones = [
    {
        codigo: "HAB001",
        nombre: "Habitación Simple",
        capacidad: 1,
        precio: 65000,
        reservas: [
            {
                entrada: "2026-09-18",
                salida: "2026-09-20"
            }
        ]
    },
    {
        codigo: "HAB002",
        nombre: "Habitación Doble",
        capacidad: 2,
        precio: 85000,
        reservas: [
            {
                entrada: "2026-09-22",
                salida: "2026-09-25"
            }
        ]
    },
    {
        codigo: "HAB003",
        nombre: "Habitación Superior",
        capacidad: 2,
        precio: 120000,
        reservas: []
    },
    {
        codigo: "HAB004",
        nombre: "Suite Ejecutiva",
        capacidad: 3,
        precio: 180000,
        reservas: [
            {
                entrada: "2026-09-28",
                salida: "2026-10-02"
            }
        ]
    },
    {
        codigo: "HAB005",
        nombre: "Suite Presidencial",
        capacidad: 4,
        precio: 350000,
        reservas: []
    }
];

const formulario = document.getElementById("formDisponibilidad");
const entrada = document.getElementById("entrada");
const salida = document.getElementById("salida");
const personas = document.getElementById("personas");
const resultados = document.getElementById("resultados");
const listaHabitaciones = document.getElementById("listaHabitaciones");
const mensaje = document.getElementById("mensajeSinResultados");

resultados.style.display = "none";
mensaje.setAttribute("aria-live", "polite");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();
    limpiarResultados();

    const fechaEntrada = entrada.value;
    const fechaSalida = salida.value;
    const cantidadPersonas = Number(personas.value);

    if (
        fechaEntrada === "" ||
        fechaSalida === "" ||
        personas.value === ""
    ) {
        mostrarMensaje(
            "Debes ingresar ambas fechas y la cantidad de personas.",
            true
        );
        return;
    }

    if (fechaSalida <= fechaEntrada) {
        mostrarMensaje(
            "La fecha de salida debe ser posterior a la fecha de entrada.",
            true
        );
        return;
    }

    if (
        !Number.isInteger(cantidadPersonas) ||
        cantidadPersonas < 1
    ) {
        mostrarMensaje(
            "La cantidad de personas debe ser un número entero mayor que cero.",
            true
        );
        return;
    }

    const disponibles = habitaciones.filter(function (habitacion) {
        return (
            habitacion.capacidad >= cantidadPersonas &&
            estaDisponible(habitacion, fechaEntrada, fechaSalida)
        );
    });

    if (disponibles.length === 0) {
        mostrarMensaje(
            "No existen habitaciones disponibles para las fechas " +
            "y cantidad de personas seleccionadas."
        );
        return;
    }

    mostrarMensaje(
        "Se encontraron " + disponibles.length +
        " habitación(es) disponible(s)."
    );

    disponibles.forEach(function (habitacion) {
        const columna = document.createElement("div");
        columna.className = "col-md-4";

        columna.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h3 class="card-title">${habitacion.nombre}</h3>

                    <p>
                        <strong>Código:</strong>
                        ${habitacion.codigo}
                    </p>

                    <p>
                        <strong>Capacidad:</strong>
                        ${habitacion.capacidad} huésped(es)
                    </p>

                    <p>
                        <strong>Precio por noche:</strong>
                        $${habitacion.precio.toLocaleString("es-CL")} CLP
                    </p>

                    <p class="text-success">
                        Disponible para las fechas seleccionadas
                    </p>

                    <button type="button" class="btn btn-primary">
                        Seleccionar habitación
                    </button>
                </div>
            </div>
        `;

        const boton = columna.querySelector("button");

        boton.addEventListener("click", function () {
            const seleccion = {
                codigoHabitacion: habitacion.codigo,
                nombreHabitacion: habitacion.nombre,
                precioPorNoche: habitacion.precio,
                entrada: fechaEntrada,
                salida: fechaSalida,
                personas: cantidadPersonas
            };

            try {
                localStorage.setItem(
                    "seleccionReserva",
                    JSON.stringify(seleccion)
                );

                window.location.href =
                    "../RF02-Registrar reserva/index.html";
            } catch (error) {
                mostrarMensaje(
                    "No se pudo guardar la selección. " +
                    "Comprueba que el almacenamiento del navegador esté habilitado.",
                    true
                );
            }
        });

        listaHabitaciones.appendChild(columna);
    });
});

function estaDisponible(habitacion, fechaEntrada, fechaSalida) {
    for (const reserva of habitacion.reservas) {
        if (
            fechaEntrada < reserva.salida &&
            fechaSalida > reserva.entrada
        ) {
            return false;
        }
    }

    return true;
}

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("text-danger", esError);
    resultados.style.display = "block";
}

function limpiarResultados() {
    listaHabitaciones.innerHTML = "";
    mensaje.textContent = "";
    mensaje.classList.remove("text-danger");
    resultados.style.display = "none";
}

[entrada, salida, personas].forEach(function (campo) {
    campo.addEventListener("input", limpiarResultados);
    campo.addEventListener("change", limpiarResultados);
});