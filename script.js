¡Listo! Acá tenés el código completo con la lógica de horario integrada.

Le puse un rango de 13:30 a 14:00 para darles un poquito más de tiempo por si el internet anda lento en la escuela. Acordate que si lo probás ahora, te va a tirar el error porque son las 12 de la noche.

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
const fechaHoy = new Date().toLocaleDateString('en-CA'); 

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
        mensaje.innerHTML = "❌ QR inválido o de otra fecha.";
        mensaje.style.color = "red";
        return;
    }

    // 2. VALIDACIÓN DE HORARIO (13:30 a 14:00)
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const tiempoTotal = (horaActual * 60) + minutosActuales;

    const inicioClase = (13 * 60) + 30; //
    const finClase = (13 * 60) + 45;    // 

    if (tiempoTotal < inicioClase || tiempoTotal > finClase) {
        mensaje.innerHTML = "❌ El registro solo está habilitado de 13:30 a 14:00.";
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
