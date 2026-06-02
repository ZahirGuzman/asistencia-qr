const boton = document.getElementById("btnAsistencia");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const seccionIdentificacion = document.getElementById("seccion-identificacion");

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

// OBTENER TOKEN Y FECHA
const urlParams = new URLSearchParams(window.location.search);
const tokenQR = (urlParams.get('token') || "").trim();
const ahora = new Date();
const fechaHoy = ahora.toLocaleDateString('en-CA', {timeZone: 'America/Argentina/Buenos_Aires'}).trim();

window.onload = () => {
    const guardadoNombre = localStorage.getItem("alumno_nombre");
    const guardadoEmail = localStorage.getItem("alumno_email");
    
    if (guardadoNombre && guardadoEmail) {
        inputNombre.value = guardadoNombre;
        inputEmail.value = guardadoEmail;
    }

    // BLOQUEO SI YA DIO EL PRESENTE
    const yaRegistroHoy = localStorage.getItem("asistencia_realizada_fecha");
    if (yaRegistroHoy === fechaHoy) {
        boton.disabled = true;
        mensaje.innerHTML = "✅ Ya registraste tu asistencia hoy. No podés duplicar el envío.";
        mensaje.style.color = "blue";
        seccionIdentificacion.style.display = "none";
    }
};

boton.addEventListener("click", () => {
    mensaje.innerHTML = "";

    // VALIDACIÓN DE SEGURIDAD CON FECHA
    if (tokenQR !== fechaHoy) {
        mensaje.innerHTML = `❌ QR inválido o de otra fecha.`;
        mensaje.style.color = "red";
        return;
    }

    // LIMPIEZA Y FORMATEO DE NOMBRE 
    let nombreSucio = inputNombre.value.trim();
    const email = inputEmail.value.trim();

    // Validar que tenga al menos un espacio (Nombre y Apellido)
    if (!nombreSucio.includes(" ")) {
        alert("Por favor, ingresá nombre y apellido separados por un espacio.");
        return;
    }

    // Convertir a "Formato De Nombre" (Mayúsculas en cada palabra)
    const nombre = nombreSucio
        .toLowerCase()
        .split(' ')
        .filter(palabra => palabra !== "")
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');


    // VALIDACIÓN DE MAIL
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(email)) {
        alert("Por favor, ingresá un correo electrónico válido (ejemplo@mail.com).");
        return;
    }

    if (nombre.length < 5) {
        alert("El nombre es demasiado corto.");
        return;
    }

    // VALIDACIÓN DE HORARIO
    const horaArg = parseInt(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }));
    const minArg = parseInt(ahora.toLocaleTimeString('es-AR', { minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }));
    const tiempoTotal = (horaArg * 60) + minArg;
    
    const inicio = (01 * 60) + 0; 
    const fin = (02 * 60) + 0; 

    if (tiempoTotal < inicio || tiempoTotal > fin) {
        mensaje.innerHTML = `❌ Fuera de horario.`;
        mensaje.style.color = "orange";
        return;
    }

    mensaje.innerHTML = "⏳ Validando GPS y enviando...";
    boton.disabled = true;

    navigator.geolocation.getCurrentPosition((pos) => {
        fetch(URL_WEB_APP, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            })
        }).then(() => {
            mensaje.innerHTML = "✅ Presente registrado con éxito.";
            mensaje.style.color = "green";
            seccionIdentificacion.style.display = "none";
            
            // MARCAMOS EL DISPOSITIVO
            localStorage.setItem("alumno_nombre", nombre);
            localStorage.setItem("alumno_email", email);
            localStorage.setItem("asistencia_realizada_fecha", fechaHoy);
            
            boton.disabled = true;
        }).catch(() => {
            mensaje.innerHTML = "❌ Error de conexión.";
            boton.disabled = false;
        });
    }, () => {
        mensaje.innerHTML = "❌ Debés activar el GPS.";
        boton.disabled = false;
    });
});
