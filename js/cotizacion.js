// =====================================================
// Taller MACA — Página de Mi cotización
// Render de la tabla (desde localStorage) + formulario de contacto
// =====================================================

let cotizacion = []

const CLAVE_SOLICITUDES = "maca_solicitudes"

// Elementos del DOM — tabla
const estadoSesionRequerida = document.getElementById("estadoSesionRequerida")
const estadoVacioCotizacion = document.getElementById("estadoVacioCotizacion")
const tablaCotizacionWrapper = document.getElementById("tablaCotizacionWrapper")
const resumenCotizacion = document.getElementById("resumenCotizacion")
const accionesCotizacion = document.getElementById("accionesCotizacion")
const cuerpoTablaCotizacion = document.getElementById("cuerpoTablaCotizacion")
const totalCotizacion = document.getElementById("totalCotizacion")
const btnVaciarCotizacion = document.getElementById("btnVaciarCotizacion")

// Elementos del DOM — formulario de contacto
const formularioSesionRequerida = document.getElementById("formularioSesionRequerida")
const formContacto = document.getElementById("formContacto")
const campoNombre = document.getElementById("campoNombre")
const campoTelefono = document.getElementById("campoTelefono")
const campoCorreo = document.getElementById("campoCorreo")
const campoFecha = document.getElementById("campoFecha")
const errorNombre = document.getElementById("errorNombre")
const errorTelefono = document.getElementById("errorTelefono")
const errorCorreo = document.getElementById("errorCorreo")
const errorFecha = document.getElementById("errorFecha")
const mensajeEnvio = document.getElementById("mensajeEnvio")

// Elementos del DOM — historial de solicitudes
const listaSolicitudesGuardadas = document.getElementById("listaSolicitudesGuardadas")

// Da formato de colones a un número (60000 -> 60.000)
function formatearPrecio(numero) {
    return numero.toLocaleString("es-CR")
}

// Suma el subtotal de cada servicio (precio x cantidad)
function calcularTotal(lista) {
    return lista.reduce(function (total, item) {
        return total + item.precioEstimado * item.cantidad
    }, 0)
}

// Crea la fila (tr) de un servicio de la cotización
function crearFilaCotizacion(item) {
    const fila = document.createElement("tr")

    fila.innerHTML = `
        <td data-label="Servicio">
            <div class="fila-servicio">
                <img src="${item.imagen}" alt="${item.nombre} en Taller MACA">
                <span>${item.nombre}</span>
            </div>
        </td>
        <td data-label="Precio unitario">&#8353;${formatearPrecio(item.precioEstimado)}</td>
        <td data-label="Cantidad">
            <input type="number" min="1" value="${item.cantidad}" class="input-cantidad"
                onchange="cambiarCantidad(${item.id}, this)">
        </td>
        <td data-label="Subtotal">&#8353;${formatearPrecio(item.precioEstimado * item.cantidad)}</td>
        <td data-label="Quitar">
            <button type="button" class="btn-card" onclick="eliminarFila(${item.id})">Eliminar</button>
        </td>
    `
    return fila
}

// Pinta la tabla completa a partir de lo guardado en localStorage.
// Requiere sesión simulada iniciada para mostrar cualquier contenido.
function renderizarTabla() {
    cuerpoTablaCotizacion.innerHTML = ""

    if (!obtenerUsuarioSesion()) {
        estadoSesionRequerida.classList.remove("oculto")
        estadoVacioCotizacion.classList.add("oculto")
        tablaCotizacionWrapper.classList.add("oculto")
        resumenCotizacion.classList.add("oculto")
        accionesCotizacion.classList.add("oculto")
        return
    }
    estadoSesionRequerida.classList.add("oculto")

    cotizacion = obtenerCotizacion()

    if (cotizacion.length === 0) {
        estadoVacioCotizacion.classList.remove("oculto")
        tablaCotizacionWrapper.classList.add("oculto")
        resumenCotizacion.classList.add("oculto")
        accionesCotizacion.classList.add("oculto")
        return
    }

    estadoVacioCotizacion.classList.add("oculto")
    tablaCotizacionWrapper.classList.remove("oculto")
    resumenCotizacion.classList.remove("oculto")
    accionesCotizacion.classList.remove("oculto")

    for (const item of cotizacion) {
        cuerpoTablaCotizacion.appendChild(crearFilaCotizacion(item))
    }

    totalCotizacion.textContent = `₡${formatearPrecio(calcularTotal(cotizacion))}`
}

// Muestra el formulario de contacto solo si hay sesión simulada iniciada
function actualizarVisibilidadFormulario() {
    if (!obtenerUsuarioSesion()) {
        formularioSesionRequerida.classList.remove("oculto")
        formContacto.classList.add("oculto")
        return
    }
    formularioSesionRequerida.classList.add("oculto")
    formContacto.classList.remove("oculto")
}

// Cambia la cantidad de un servicio y recalcula la tabla en vivo
function cambiarCantidad(id, input) {
    let cantidad = parseInt(input.value, 10)
    if (isNaN(cantidad) || cantidad < 1) {
        cantidad = 1
        input.value = 1
    }
    actualizarCantidadServicio(id, cantidad)
    renderizarTabla()
}

// Quita un servicio de la cotización, pidiendo confirmación antes
function eliminarFila(id) {
    if (!confirm("¿Eliminar este servicio de la cotización?")) {
        return
    }
    eliminarServicio(id)
    renderizarTabla()
}

btnVaciarCotizacion.addEventListener("click", function () {
    vaciarCotizacion()
    renderizarTabla()
})

// =====================================================
// Historial de solicitudes enviadas (independiente de la cotización)
// =====================================================

// Lee las solicitudes enviadas guardadas en localStorage
function obtenerSolicitudes() {
    const datos = localStorage.getItem(CLAVE_SOLICITUDES)
    return datos ? JSON.parse(datos) : []
}

// Agrega una nueva solicitud al historial guardado en localStorage
function guardarSolicitud(solicitud) {
    const solicitudes = obtenerSolicitudes()
    solicitudes.push(solicitud)
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes))
}

// Crea la tarjeta (article) de una solicitud enviada
function crearTarjetaSolicitud(solicitud) {
    const tarjeta = document.createElement("article")
    tarjeta.classList.add("solicitud-card")

    const listaServicios = solicitud.servicios.map(function (servicio) {
        return `<li>${servicio.nombre} &times; ${servicio.cantidad}</li>`
    }).join("")

    tarjeta.innerHTML = `
        <div class="solicitud-encabezado">
            <span class="state-box state-success">Solicitud enviada</span>
            <span class="solicitud-fecha">${new Date(solicitud.fechaEnvio).toLocaleString("es-CR")}</span>
        </div>
        <ul class="solicitud-servicios">${listaServicios}</ul>
        <p class="solicitud-total">Total: &#8353;${formatearPrecio(solicitud.total)}</p>
        <p class="solicitud-contacto">Contacto: ${solicitud.nombre} · ${solicitud.telefono} · ${solicitud.correo}</p>
        <p class="solicitud-contacto">Fecha preferida: ${solicitud.fechaPreferida}</p>
    `
    return tarjeta
}

// Pinta el historial de solicitudes del usuario logueado actualmente
function renderizarSolicitudes() {
    listaSolicitudesGuardadas.innerHTML = ""

    const usuario = obtenerUsuarioSesion()
    if (!usuario) {
        listaSolicitudesGuardadas.innerHTML = `
            <div class="empty-state">
                <h3>Iniciá sesión</h3>
                <p>Debés iniciar sesión para ver tus solicitudes enviadas.</p>
            </div>
        `
        return
    }

    const solicitudesUsuario = obtenerSolicitudes().filter(function (solicitud) {
        return solicitud.usuarioCorreo === usuario.correo
    })

    if (solicitudesUsuario.length === 0) {
        listaSolicitudesGuardadas.innerHTML = `
            <div class="empty-state">
                <h3>Sin solicitudes</h3>
                <p>Todavía no enviaste ninguna solicitud de cotización.</p>
            </div>
        `
        return
    }

    for (const solicitud of solicitudesUsuario) {
        listaSolicitudesGuardadas.appendChild(crearTarjetaSolicitud(solicitud))
    }
}

// Vuelve a pintar todo el contenido sensible a la sesión simulada
function actualizarVista() {
    renderizarTabla()
    actualizarVisibilidadFormulario()
    renderizarSolicitudes()
}

// =====================================================
// Formulario de contacto
// =====================================================

function marcarError(input, elementoError, mensaje) {
    input.classList.add("input-error")
    input.classList.remove("input-success")
    elementoError.textContent = mensaje
}

function marcarExito(input, elementoError) {
    input.classList.add("input-success")
    input.classList.remove("input-error")
    elementoError.textContent = ""
}

function validarNombre() {
    const valor = campoNombre.value.trim()
    if (valor.length < 3) {
        marcarError(campoNombre, errorNombre, "Ingresá tu nombre completo (mínimo 3 caracteres).")
        return false
    }
    marcarExito(campoNombre, errorNombre)
    return true
}

function validarTelefono() {
    const valor = campoTelefono.value.trim()
    const formato = /^\d{4}-?\d{4}$/
    if (!formato.test(valor)) {
        marcarError(campoTelefono, errorTelefono, "Ingresá un teléfono válido, ej. 6283-4714.")
        return false
    }
    marcarExito(campoTelefono, errorTelefono)
    return true
}

function validarCorreo() {
    const valor = campoCorreo.value.trim()
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formato.test(valor)) {
        marcarError(campoCorreo, errorCorreo, "Ingresá un correo electrónico válido.")
        return false
    }
    marcarExito(campoCorreo, errorCorreo)
    return true
}

function validarFecha() {
    const valor = campoFecha.value
    if (!valor) {
        marcarError(campoFecha, errorFecha, "Elegí una fecha preferida.")
        return false
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fechaElegida = new Date(valor + "T00:00:00")

    if (fechaElegida < hoy) {
        marcarError(campoFecha, errorFecha, "La fecha no puede ser anterior a hoy.")
        return false
    }
    marcarExito(campoFecha, errorFecha)
    return true
}

// Validación en tiempo real (mientras el usuario escribe)
campoNombre.addEventListener("input", validarNombre)
campoTelefono.addEventListener("input", validarTelefono)
campoCorreo.addEventListener("input", validarCorreo)
campoFecha.addEventListener("input", validarFecha)

// Validación al enviar el formulario
formContacto.addEventListener("submit", function (evento) {
    evento.preventDefault()

    const usuario = obtenerUsuarioSesion()
    if (!usuario) {
        mensajeEnvio.textContent = "Iniciá sesión antes de enviar tu solicitud."
        mensajeEnvio.className = "mensaje-envio error"
        return
    }

    const nombreValido = validarNombre()
    const telefonoValido = validarTelefono()
    const correoValido = validarCorreo()
    const fechaValida = validarFecha()

    if (!nombreValido || !telefonoValido || !correoValido || !fechaValida) {
        mensajeEnvio.textContent = "Revisá los campos marcados antes de enviar."
        mensajeEnvio.className = "mensaje-envio error"
        return
    }

    if (cotizacion.length === 0) {
        mensajeEnvio.textContent =
            "Agregá al menos un servicio desde el catálogo antes de enviar tu solicitud."
        mensajeEnvio.className = "mensaje-envio error"
        return
    }

    guardarSolicitud({
        id: Date.now(),
        usuarioNombre: usuario.nombre,
        usuarioCorreo: usuario.correo,
        nombre: campoNombre.value.trim(),
        telefono: campoTelefono.value.trim(),
        correo: campoCorreo.value.trim(),
        fechaPreferida: campoFecha.value,
        servicios: cotizacion.map(function (item) {
            return {
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioEstimado: item.precioEstimado
            }
        }),
        total: calcularTotal(cotizacion),
        fechaEnvio: new Date().toISOString()
    })

    mensajeEnvio.textContent =
        `¡Listo, ${campoNombre.value.trim()}! Tu solicitud fue registrada. Te contactamos pronto al ${campoTelefono.value.trim()}.`
    mensajeEnvio.className = "mensaje-envio exito"

    formContacto.reset()
    campoNombre.classList.remove("input-success")
    campoTelefono.classList.remove("input-success")
    campoCorreo.classList.remove("input-success")
    campoFecha.classList.remove("input-success")

    renderizarSolicitudes()
})

// Carga inicial de la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarVista()
})
