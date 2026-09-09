    const inputTexto = document.getElementById('codigo');
    const boton = document.getElementById('btnValidar');
    const parrafoResultado = document.getElementById('resultado');
    const codigoValido = "ABCDFG";


    const inputTexto2 = document.getElementById('registro');
    const botonRequistar = document.getElementById('btnRegistrar');
    const parrafoResultado2 = document.getElementById('resultado2');


    boton.addEventListener('click', function() {

        const textoIngresado = inputTexto.value;

        if (textoIngresado.trim() !== codigoValido){
            parrafoResultado.textContent="No has ingresado un codigo valido, intentalo otra vez";
            parrafoResultado.style.color = "red";
        } else {
            parrafoResultado.textContent = "Codigo valido";
            parrafoResultado.style.color = "green";
        }
        
    });

    botonRequistar.addEventListener('click', function() {

        const textoIngresado2 = inputTexto2.value;

        if (textoIngresado2.trim() == codigoValido){
            parrafoResultado2.textContent="Ingreso registrado exitosamente";
            parrafoResultado2.style.color ="green";

        }else{
            parrafoResultado2.textContent="Este codigo ya está tomado o no está disponible, intente otra vez";
            parrafoResultado2.style.color="red";
        }
    });



