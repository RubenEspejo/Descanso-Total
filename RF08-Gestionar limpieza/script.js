const inputHabitacion = document.getElementById('habitacion');
const parrafoResultado = document.getElementById('resultado');

const selectPersona = document.getElementById('persona');
const botonAsignar = document.getElementById('btnAsignar');
const parrafoResultado2 = document.getElementById('resultado2');

const parrafoEstado = document.getElementById('estado');
const botonCompletar = document.getElementById('btnCompletar');
const parrafoResultado3 = document.getElementById('resultado3');

botonAsignar.addEventListener('click', function() {
    const habitacion = inputHabitacion.value.trim();
    const persona = selectPersona.value;

    if(habitacion === "" || persona === ""){
        parrafoResultado2.textContent = "Debes ingresar la habitacion e ingresar a la persona a cargo, intente otra vez";
        parrafoResultado2.style.color ="red";
        return;
    }

    
    parrafoResultado.textContent = "Habitación " + habitacion + " registrada";
    parrafoResultado.style.color="green";

    parrafoResultado2.textContent = persona + " asignada correctamente";
    parrafoResultado2.style.color="green";

    parrafoEstado.textContent= "En limpieza";

    botonCompletar.disabled=false;

});

botonCompletar.addEventListener('click', function() {
 
    parrafoEstado.textContent = "Limpieza completada";
 
    parrafoResultado3.textContent = "Estado actualizado correctamente";
    parrafoResultado3.style.color = "green";
});