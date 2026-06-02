window.onload = () => {
    const boton = document.getElementById("btnAsistencia");
    const mensaje = document.getElementById("mensaje");
    const inputNombre = document.getElementById("inputNombre");
    const inputEmail = document.getElementById("inputEmail");
    const seccionIdentificacion = document.getElementById("seccion-identificacion");

    const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

    // 1. CARGAR DATOS GUARDADOS
    const guardadoNombre = localStorage.getItem("alumno_nombre");
    const guardadoEmail = localStorage.getItem("alumno_email");
    if (guardadoNombre && guardadoEmail) {
        inputNombre.value = guardadoNombre;
        inputEmail.value = guardadoEmail;
        seccionIdentificacion.style.display = "none";
    }

    // 2. LOGICA DEL BOTON
    boton.addEventListener("click", () => {
        mensaje.innerHTML = "Procesando...";
        mensaje.style.color = "black";

        // Obtener fecha y hora de Argentina
        const ahora = new Date();
        const fechaHoy = ahora.toLocaleDateString('en-CA', {timeZone: 'America/Argentina/Buenos_Aires'});
        const horaArg = parseInt(ahora.toLocaleTimeString('es-AR', { hour: '2-digit', hour12: false, timeZone: 'America/Argentina/Buenos_Aires' }));
        const minArg = parseInt(ahora.toLocaleTimeString('es-AR', { minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }));

        // Obtener token de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenQR = urlParams.get('token');

        // VALIDACIÓN 1: TOKEN
        if (tokenQR !== fechaHoy) {
            mensaje.innerHTML = `❌ QR inválido o fecha incorrecta.`;
            mensaje.style.color = "red";
            return;
        }

        // VALIDACIÓN 2: HORARIO (13:30 a 13:45)
        const tiempoTotal = (horaArg * 60) + minArg;
        const inicio = (13 * 60) + 30;
        const fin = (13 * 60) + 45;

        if (tiempoTotal < inicio || tiempoTotal > fin) {
            mensaje.innerHTML = `❌ Fuera de horario. Son las ${horaArg}:${minArg < 10 ? '0'+minArg : minArg}`;
            mensaje.style.color = "orange";
            return;
        }

        // VALIDACIÓN 3: DATOS VACÍOS
        const nombre = inputNombre.value.trim();
        const email = inputEmail.value.trim();
        if (!nombre || !email) {
            alert("Completá tus datos");
            return;
        }

        // GUARDAR DATOS LOCALMENTE
        localStorage.setItem("alumno_nombre", nombre);
        localStorage.setItem("alumno_email", email);

        // REGISTRAR GPS Y ENVIAR
        mensaje.innerHTML = "⏳ Validando ubicación...";
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
            }).catch(() => {
                mensaje.innerHTML = "❌ Error de conexión.";
                boton.disabled = false;
            });
        }, () => {
            mensaje.innerHTML = "❌ Activá el GPS para validar asistencia.";
            boton.disabled = false;
        });
    });
};
