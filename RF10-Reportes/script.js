const inputDesde=document.getElementById('desde');
const inputHasta=document.getElementById('hasta');
const boton=document.getElementById('btnGenerar');
const textoResultado=document.getElementById('resultado');

const totalHabitaciones=16;
const precioNoche=100000;

boton.addEventListener('click', function() {

    const desde = inputDesde.value;
    const hasta = inputHasta.value;

    if(desde === "" || hasta === ""){
        textoResultado.textContent="Debes seleccionar ambas fechas, intente otra vez";
        textoResultado.style.color="red";
        return;
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);

    if(fechaHasta < fechaDesde){
        textoResultado.textContent="No es posible esta fecha, intente otra vez";
        textoResultado.style.color="red";
        return;
    }

    const porDia = 1000*60*60*24;
    const noches = Math.max(1,Math.round((fechaHasta-fechaDesde)/porDia));

    const ocupadas = Math.floor(Math.random()*totalHabitaciones)+1;
    const porcentaje = Math.round((ocupadas / totalHabitaciones) * 100);
    const ingresos = ocupadas * precioNoche * noches;
 
    textoResultado.innerHTML =
        "Ocupación: " + porcentaje + "% (" + ocupadas + " de " + totalHabitaciones + " habitaciones)<br>" +
        "Ingresos totales del período: $" + ingresos.toLocaleString('es-CL');
    textoResultado.style.color = "green";

});