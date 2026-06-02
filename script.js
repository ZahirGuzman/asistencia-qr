const boton = document.getElementById("btnAsistencia");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const seccionIdentificacion = document.getElementById("seccion-identificacion");

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

// 1. OBTENER TOKEN DE LA URL Y LIMPIARLO
const urlParams = new URLSearchParams(window.location.search);
const tokenQR = (urlParams.get('token') || "").trim();

// 2. OBTENER FECHA DE HOY (Argentina) Y LIMPIARLA
const ahora = new Date();
const fechaHoy = ahora.toLocaleDateString('en-CA', {timeZone: 'America/Argentina/Buenos_Aires'}).trim();

window.onload = () => {
    const guardadoNombre = localStorage.getItem("alumno_nombre");
    const guardadoEmail = localStorage.getItem("alumno_email");
    if (guardadoNombre && guardadoEmail) {
        inputNombre.value = guardadoNombre;
        inputEmail.value = guardadoEmail;
    }
};

boton.addEventListener("click", () => {
    // RESET MENSAJE
    mensaje.innerHTML = "";

    // VALIDACIÓN DE SEGURIDAD (FECHA)
    // Comparamos sin importar si hay espacios locos
    if (tokenQR !== fechaHoy) {
        mensaje.innerHTML = `❌ Error de Validación.<br>Recibido: [${tokenQR}]<br>Esperado: [${fechaHoy}]`;
        mensaje.style.color = "red";
        return;
    }

    // VALIDACIÓN DE HORARIO (13:30 a 13:45)
    // PARA PROBAR AHORA: Si querés que funcione ya, cambiá el 13 por 00
    const horaArg = parseInt(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }));
    const minArg = parseInt(ahora.toLocaleTimeString('es-AR', { minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }));
    const tiempoTotal = (horaArg * 60) + minArg;
    
   const inicio = (0 * 60) + 0;   // 00:00 (medianoche)
   const fin = (1 * 60) + 59;   // 23:59 (casi medianoche)
    if (tiempoTotal < inicio || tiempoTotal > fin) {
        mensaje.innerHTML = `❌ Fuera de horario.<br>Son las ${horaArg}:${minArg < 10 ? '0'+minArg : minArg}`;
        mensaje.style.color = "orange";
        return;
    }

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();

    if (!nombre || !email) {
        alert("Completá tus datos.");
        return;
    }

    mensaje.innerHTML = "⏳ Enviando presente...";
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
            localStorage.setItem("alumno_nombre", nombre);
            localStorage.setItem("alumno_email", email);
        }).catch(() => {
            mensaje.innerHTML = "❌ Error al conectar con la planilla.";
            boton.disabled = false;
        });
    }, () => {
        mensaje.innerHTML = "❌ Activá el GPS.";
        boton.disabled = false;
    });
});
