const boton = document.getElementById("btnAsistencia");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("inputNombre");
const inputEmail = document.getElementById("inputEmail");
const seccionIdentificacion = document.getElementById("seccion-identificacion");

// CONFIGURACIÓN: Pegá acá la URL que te dio Google Apps Script al publicar
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzQJnGA4Tik4xffOTN1xSkRXTG7E2tVGZYKj9vxbn8-XtxAGaR_1HQVOZdXcmwJfFGJ/exec";

// LÓGICA DE QR DINÁMICO
const urlParams = new URLSearchParams(window.location.search);
const tokenQR = urlParams.get('token');
const fechaHoy = new Date().toISOString().split('T')[0];

// 3. ARMAR LA URL COMPLETA
const urlFinal = `${miWebUrl}?token=${fechaLocal}`;

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
    if (tokenQR !== fechaHoy) {
        mensaje.innerHTML = "❌ QR inválido o de otra fecha.";
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

    mensaje.innerHTML = "Enviando presente...";
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
            mensaje.innerHTML = "✅ Presente registrado.";
            seccionIdentificacion.style.display = "none";
        }).catch(() => {
            mensaje.innerHTML = "Error al enviar.";
            boton.disabled = false;
        });
    }, () => {
        mensaje.innerHTML = "❌ Activá el GPS para validar asistencia.";
        boton.disabled = false;
    });
});
