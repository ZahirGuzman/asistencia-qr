const boton = document.getElementById("btnAsistencia");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const seccionIdentificacion = document.getElementById("seccion-identificacion");

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

// 1. OBTENER TOKEN DE LA URL
const urlParams = new URLSearchParams(window.location.search);
const tokenQR = urlParams.get('token');

// 2. CONFIGURAR FECHA Y HORA DE ARGENTINA
const opcionesFecha = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
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
    // RESET DE MENSAJE
    mensaje.innerHTML = "";

    // VALIDACIÓN A: ¿Existe el token?
    if (!tokenQR) {
        mensaje.innerHTML = "❌ Error: Falta el token en el QR.";
        mensaje.style.color = "red";
        return;
    }

    // VALIDACIÓN B: ¿Es la fecha correcta?
    if (tokenQR !== fechaHoy) {
        mensaje.innerHTML = `❌ QR vencido. Hoy es ${fechaHoy} y el QR dice ${tokenQR}.`;
        mensaje.style.color = "red";
        return;
    }

    // VALIDACIÓN C: Horario (13:30 a 13:45)
    const ahora = new Date();
    const horaArg = parseInt(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }));
    const minArg = parseInt(ahora.toLocaleTimeString('es-AR', { minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }));
    const tiempoTotal = (horaArg * 60) + minArg;

    const inicioClase = (13 * 60) + 30; 
    const finClase = (13 * 60) + 45;

    if (tiempoTotal < inicioClase || tiempoTotal > finClase) {
        mensaje.innerHTML = `❌ Fuera de horario. (Son las ${horaArg}:${minArg < 10 ? '0'+minArg : minArg})`;
        mensaje.style.color = "orange";
        return;
    }

    // VALIDACIÓN D: Datos completos
    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();
    if (!nombre || !email) {
        alert("Por favor, completá tus datos.");
        return;
    }

    // SI PASÓ TODO, ENVIAR
    mensaje.innerHTML = "⏳ Enviando asistencia...";
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
            mensaje.innerHTML = "❌ Error al conectar con la planilla.";
            boton.disabled = false;
        });
    }, () => {
        mensaje.innerHTML = "❌ Error: Activa el GPS para validar tu ubicación.";
        boton.disabled = false;
    });
});
