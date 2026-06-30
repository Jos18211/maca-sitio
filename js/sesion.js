// =====================================================
// Taller MACA — Sesión simulada (solo en cotizacion.html)
// sessionStorage: usuario logueado, se borra al cerrar la pestaña
// =====================================================

const CLAVE_USUARIO = "maca_usuario"

// Elementos del DOM
const formLoginSimulado = document.getElementById("formLoginSimulado")
const loginNombre = document.getElementById("loginNombre")
const loginCorreo = document.getElementById("loginCorreo")
const btnCerrarSesion = document.getElementById("btnCerrarSesion")
const headerUsuario = document.getElementById("headerUsuario")
const usuarioActual = document.getElementById("usuarioActual")

// Guarda el usuario logueado en sessionStorage
function guardarUsuarioSesion(usuario) {
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

// Lee el usuario logueado desde sessionStorage
function obtenerUsuarioSesion() {
    const datos = sessionStorage.getItem(CLAVE_USUARIO)
    return datos ? JSON.parse(datos) : null
}

// Cierra la sesión simulada
function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_USUARIO)
    mostrarUsuarioActual()
}

// Refleja el usuario logueado (o su ausencia) en el header y en la tarjeta del dropdown
function mostrarUsuarioActual() {
    const usuario = obtenerUsuarioSesion()

    if (!usuario) {
        headerUsuario.innerHTML = `
            <span class="user-offline"></span>
            Usuario no logueado
        `
        usuarioActual.innerHTML = "No hay usuario logueado."
        return
    }

    headerUsuario.innerHTML = `
        <span class="user-online"></span>
        ${usuario.nombre}
    `
    usuarioActual.innerHTML = `
        <h4>${usuario.nombre}</h4>
        <p>${usuario.correo}</p>
    `
}

formLoginSimulado.addEventListener("submit", function (evento) {
    evento.preventDefault()

    const nombre = loginNombre.value.trim()
    const correo = loginCorreo.value.trim()

    if (nombre === "" || correo === "") {
        alert("Debe ingresar nombre y correo.")
        return
    }

    guardarUsuarioSesion({ nombre: nombre, correo: correo })
    loginNombre.value = ""
    loginCorreo.value = ""
    mostrarUsuarioActual()

    if (typeof actualizarVista === "function") {
        actualizarVista()
    }
})

btnCerrarSesion.addEventListener("click", function () {
    cerrarSesion()

    if (typeof actualizarVista === "function") {
        actualizarVista()
    }
})

// Carga inicial de la página
document.addEventListener("DOMContentLoaded", function () {
    mostrarUsuarioActual()
})
