Tenés razón, vamos a blindarlo. El problema es que new Date().getHours() a veces toma la hora del servidor o está en formato UTC, por eso te sigue dejando pasar aunque sean las 12 de la noche.

Acá tenés el código definitivo. Reemplacé la forma de obtener la hora por una que obliga al navegador a usar la hora oficial de Argentina, sin importar cómo esté configurada la compu o el celular.

Copiá y pegá esto en tu script.js:

JavaScript
const boton = document.getElementById("btnAsistencia");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const seccionIdentificacion = document.getElementById("seccion-identificacion");

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

// LÓGICA DE QR DINÁMICO
const urlParams = new URLSearchParams(window.location.search);
const tokenQR = urlParams.get('token');

// Fecha formateada para Argentina (YYYY-MM-DD)
const fechaHoy = new Date().toLocaleDateString('en-CA', {timeZone: 'America/Argentina/Buenos_Aires'}); 

window.onload = () => {
    const guardadoNombre = localStorage.getItem("alumno_nombre");
    const guardadoEmail = localStorage.getItem("alumno_email");
    if (guardadoNombre && guardadoEmail) {
        inputNombre.value = guardadoNombre;
        inputEmail.value = guardadoEmail;
        seccionIdentificacion.style.display = "none";
    }
};

boton.addEventListener("click", () => {
    // 1. Verificamos el token (Fecha)
    if (tokenQR !== fechaHoy) {
        mensaje.innerHTML = `❌ QR inválido o de otra fecha. (Hoy: ${fechaHoy})`;
        mensaje.style.color = "red";
        return;
    }

    // 2. VALIDACIÓN DE HORARIO FORZADA (Zona horaria Argentina)
    const ahora = new Date();
    const opciones = { timeZone: 'America/Argentina/Buenos_Aires', hour12: false };
    
    // Obtenemos hora y minutos exactos de Bs. As.
    const horaArg = parseInt(ahora.toLocaleTimeString('es-AR', { ...opciones, hour: '2-digit' }));
    const minArg = parseInt(ahora.toLocaleTimeString('es-AR', { ...opciones, minute: '2-digit' }));
    
    const tiempoTotal = (horaArg * 60) + minArg;
    const inicioClase = (13 * 60) + 30; // 13:30
    const finClase = (13 * 60) + 45;    // 13:45

    // Esto te sirve para ver qué hora está leyendo el código realmente
    console.log("Hora Arg detectada:", horaArg + ":" + minArg);

    if (tiempoTotal < inicioClase || tiempoTotal > finClase) {
        mensaje.innerHTML = `❌ Registro fuera de horario. Hora actual: ${horaArg}:${minArg < 10 ? '0'+minArg : minArg}. El horario es de 13:30 a 13:45.`;
        mensaje.style.color = "orange";
        return;
    }

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();

    if (!nombre || !email) {
        alert("Completá tus datos primero.");
        return;
    }

    localStorage.setItem("alumno_nombre", nombre);
    localStorage.setItem("alumno_email", email);

    if (!navigator.geolocation) {
        mensaje.innerHTML = "Tu navegador no soporta GPS.";
        return;
    }

    mensaje.innerHTML = "Validando ubicación y enviando...";
    boton.disabled = true;

    navigator.geolocation.getCurrentPosition((pos) => {
        const datos = {
            nombre: nombre,
            email: email,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };

        fetch(URL_WEB_APP, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(datos)
        }).then(() => {
            mensaje.innerHTML = "✅ Presente registrado con éxito.";
            mensaje.style.color = "#27ae60";
            seccionIdentificacion.style.display = "none";
        }).catch(() => {
            mensaje.innerHTML = "Error al enviar a la planilla.";
            boton.disabled = false;
        });
    }, () => {
        mensaje.innerHTML = "❌ Activá el GPS para validar asistencia.";
        boton.disabled = false;
    });
});
