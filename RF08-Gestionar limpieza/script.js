const selectHabitacion = document.getElementById("habitacion");
const selectPersona = document.getElementById("persona");

const tablaLimpieza = document.getElementById("tablaLimpieza");

const resultado = document.getElementById("resultado");
const resultado2 = document.getElementById("resultado2");
const resultado3 = document.getElementById("resultado3");
const resultadoObservaciones = document.getElementById("resultadoObservaciones");

const estado = document.getElementById("estado");
const observaciones = document.getElementById("observaciones");

const btnAsignar = document.getElementById("btnAsignar");
const btnIniciar = document.getElementById("btnIniciar");
const btnCompletar = document.getElementById("btnCompletar");
const btnObservaciones = document.getElementById("btnObservaciones");

const habitacionesIniciales = [
    {
        codigo: "HAB001",
        nombre: "Habitación Simple",
        capacidad: 1,
        precio: 65000,
        estado: "Disponible"
    },
    {
        codigo: "HAB002",
        nombre: "Habitación Doble",
        capacidad: 2,
        precio: 85000,
        estado: "Disponible"
    },
    {
        codigo: "HAB003",
        nombre: "Habitación Superior",
        capacidad: 2,
        precio: 120000,
        estado: "En limpieza"
    },
    {
        codigo: "HAB004",
        nombre: "Suite Ejecutiva",
        capacidad: 3,
        precio: 180000,
        estado: "Ocupada"
    },
    {
        codigo: "HAB005",
        nombre: "Suite Presidencial",
        capacidad: 4,
        precio: 350000,
        estado: "Disponible"
    }
];

if (!localStorage.getItem("habitaciones")) {
    localStorage.setItem(
        "habitaciones",
        JSON.stringify(habitacionesIniciales)
    );
}

function obtenerHabitaciones() {
    return JSON.parse(
        localStorage.getItem("habitaciones") || "[]"
    );
}

function obtenerReservas() {
    return JSON.parse(
        localStorage.getItem("reservas") || "[]"
    );
}

function guardarHabitaciones(habitaciones) {
    localStorage.setItem(
        "habitaciones",
        JSON.stringify(habitaciones)
    );
}

function estaOcupadaPorReserva(habitacion) {
    const reservas = obtenerReservas();

    return reservas.some(function (reserva) {
        return (
            reserva.estado === "Check-in" &&
            (
                reserva.codigoHabitacion === habitacion.codigo ||
                reserva.habitacion === habitacion.nombre
            )
        );
    });
}

function requiereLimpieza(habitacion) {
    return (
        habitacion.estado === "Pendiente de limpieza" ||
        habitacion.estado === "En limpieza"
    );
}

function cargarVista(codigoSeleccionado = "") {
    const habitaciones = obtenerHabitaciones();

    tablaLimpieza.innerHTML = "";

    selectHabitacion.innerHTML =
        '<option value="">Seleccionar...</option>';

    const habitacionesLimpieza = habitaciones.filter(
        function (habitacion) {
            return (
                requiereLimpieza(habitacion) &&
                !estaOcupadaPorReserva(habitacion)
            );
        }
    );

    habitacionesLimpieza.forEach(function (habitacion) {
        const opcion = document.createElement("option");

        opcion.value = habitacion.codigo;

        opcion.textContent =
            habitacion.codigo +
            " - " +
            habitacion.nombre;

        selectHabitacion.appendChild(opcion);

        const fila = document.createElement("tr");

        const celdaCodigo = document.createElement("td");
        const celdaNombre = document.createElement("td");
        const celdaEstado = document.createElement("td");
        const celdaResponsable = document.createElement("td");

        celdaCodigo.textContent =
            habitacion.codigo;

        celdaNombre.textContent =
            habitacion.nombre;

        celdaEstado.textContent =
            habitacion.estado;

        celdaResponsable.textContent =
            habitacion.responsableLimpieza || "Sin asignar";

        fila.appendChild(celdaCodigo);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaResponsable);

        tablaLimpieza.appendChild(fila);
    });

    if (habitacionesLimpieza.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 4;

        celda.textContent =
            "No hay habitaciones pendientes de limpieza.";

        fila.appendChild(celda);

        tablaLimpieza.appendChild(fila);
    }

    if (
        codigoSeleccionado &&
        habitacionesLimpieza.some(
            habitacion =>
                habitacion.codigo === codigoSeleccionado
        )
    ) {
        selectHabitacion.value =
            codigoSeleccionado;
    }

    mostrarHabitacion();
}

function mostrarHabitacion() {
    const habitaciones = obtenerHabitaciones();

    const habitacion = habitaciones.find(
        function (item) {
            return item.codigo === selectHabitacion.value;
        }
    );

    resultado.textContent = "";
    resultado2.textContent = "";
    resultado3.textContent = "";
    resultadoObservaciones.textContent = "";

    if (!habitacion) {
        estado.textContent =
            "Selecciona una habitación";

        selectPersona.value = "";

        observaciones.value = "";
        observaciones.disabled = true;

        btnAsignar.disabled = true;
        btnIniciar.disabled = true;
        btnCompletar.disabled = true;
        btnObservaciones.disabled = true;

        return;
    }

    resultado.textContent =
        habitacion.nombre +
        " - " +
        habitacion.estado;

    resultado.style.color = "green";

    selectPersona.value =
        habitacion.responsableLimpieza || "";

    observaciones.value =
        habitacion.observaciones || "";

    observaciones.disabled = false;
    btnObservaciones.disabled = false;

    estado.textContent =
        habitacion.estado;

    btnAsignar.disabled = false;

    btnIniciar.disabled = !(
        habitacion.estado === "Pendiente de limpieza" &&
        habitacion.responsableLimpieza
    );

    btnCompletar.disabled = !(
        habitacion.estado === "En limpieza" &&
        habitacion.responsableLimpieza
    );
}

selectHabitacion.addEventListener(
    "change",
    mostrarHabitacion
);

btnAsignar.addEventListener(
    "click",
    function () {
        const habitaciones = obtenerHabitaciones();

        const habitacion = habitaciones.find(
            function (item) {
                return item.codigo === selectHabitacion.value;
            }
        );

        if (!habitacion) {
            resultado2.textContent =
                "Debes seleccionar una habitación.";

            resultado2.style.color = "red";
            return;
        }

        if (!selectPersona.value) {
            resultado2.textContent =
                "Debes seleccionar una persona a cargo.";

            resultado2.style.color = "red";
            return;
        }

        if (estaOcupadaPorReserva(habitacion)) {
            resultado2.textContent =
                "La habitación está ocupada.";

            resultado2.style.color = "red";
            return;
        }

        habitacion.responsableLimpieza =
            selectPersona.value;

        guardarHabitaciones(habitaciones);

        resultado2.textContent =
            selectPersona.value +
            " asignada correctamente.";

        resultado2.style.color = "green";

        cargarVista(habitacion.codigo);
    }
);

btnIniciar.addEventListener(
    "click",
    function () {
        const habitaciones = obtenerHabitaciones();

        const habitacion = habitaciones.find(
            function (item) {
                return item.codigo === selectHabitacion.value;
            }
        );

        if (!habitacion) {
            resultado3.textContent =
                "Debes seleccionar una habitación.";

            resultado3.style.color = "red";
            return;
        }

        if (!habitacion.responsableLimpieza) {
            resultado3.textContent =
                "Primero debes asignar una persona.";

            resultado3.style.color = "red";
            return;
        }

        if (
            habitacion.estado !==
            "Pendiente de limpieza"
        ) {
            resultado3.textContent =
                "La habitación no está pendiente de limpieza.";

            resultado3.style.color = "red";
            return;
        }

        habitacion.estado =
            "En limpieza";

        habitacion.estadoLimpieza =
            "En limpieza";

        habitacion.fechaInicioLimpieza =
            new Date().toISOString();

        guardarHabitaciones(habitaciones);

        cargarVista(habitacion.codigo);

        resultado3.textContent =
            "Limpieza iniciada correctamente.";

        resultado3.style.color = "green";
    }
);

btnCompletar.addEventListener(
    "click",
    function () {
        const habitaciones = obtenerHabitaciones();

        const habitacion = habitaciones.find(
            function (item) {
                return item.codigo === selectHabitacion.value;
            }
        );

        if (!habitacion) {
            resultado3.textContent =
                "Debes seleccionar una habitación.";

            resultado3.style.color = "red";
            return;
        }

        if (
            habitacion.estado !== "En limpieza"
        ) {
            resultado3.textContent =
                "La habitación no se encuentra en limpieza.";

            resultado3.style.color = "red";
            return;
        }

        habitacion.estado =
            "Disponible";

        habitacion.estadoLimpieza =
            "Finalizada";

        habitacion.fechaFinLimpieza =
            new Date().toISOString();

        guardarHabitaciones(habitaciones);

        cargarVista();

        resultado3.textContent =
            "Limpieza completada. Habitación disponible.";

        resultado3.style.color = "green";
    }
);

btnObservaciones.addEventListener(
    "click",
    function () {
        const habitaciones = obtenerHabitaciones();

        const habitacion = habitaciones.find(
            function (item) {
                return item.codigo === selectHabitacion.value;
            }
        );

        if (!habitacion) {
            resultadoObservaciones.textContent =
                "Debes seleccionar una habitación.";

            resultadoObservaciones.style.color =
                "red";

            return;
        }

        habitacion.observaciones =
            observaciones.value.trim();

        guardarHabitaciones(habitaciones);

        resultadoObservaciones.textContent =
            "Observaciones guardadas correctamente.";

        resultadoObservaciones.style.color =
            "green";
    }
);

cargarVista();