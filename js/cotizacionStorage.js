// =====================================================
// Taller MACA — Almacenamiento de la cotización
// CRUD sobre localStorage, compartido entre catalogo.html
// y cotizacion.html
// =====================================================

const CLAVE_COTIZACION = "maca_cotizacion"

// Lee la cotización guardada en localStorage
function obtenerCotizacion() {
    const datos = localStorage.getItem(CLAVE_COTIZACION)
    return datos ? JSON.parse(datos) : []
}

// Reemplaza la cotización guardada en localStorage
function guardarCotizacion(cotizacion) {
    localStorage.setItem(CLAVE_COTIZACION, JSON.stringify(cotizacion))
}

// Agrega un servicio a la cotización; si ya estaba, suma una unidad
function agregarServicio(servicio) {
    const cotizacion = obtenerCotizacion()
    const existente = cotizacion.find(function (item) {
        return item.id === servicio.id
    })

    if (existente) {
        existente.cantidad += 1
    } else {
        cotizacion.push({
            id: servicio.id,
            nombre: servicio.nombre,
            precioEstimado: servicio.precioEstimado,
            imagen: servicio.imagen,
            cantidad: 1
        })
    }

    guardarCotizacion(cotizacion)
}

// Cambia la cantidad de un servicio ya agregado
function actualizarCantidadServicio(id, cantidad) {
    const cotizacion = obtenerCotizacion()
    const item = cotizacion.find(function (item) {
        return item.id === id
    })
    if (!item) {
        return
    }
    item.cantidad = cantidad
    guardarCotizacion(cotizacion)
}

// Quita un servicio de la cotización
function eliminarServicio(id) {
    const cotizacion = obtenerCotizacion().filter(function (item) {
        return item.id !== id
    })
    guardarCotizacion(cotizacion)
}

// Vacía toda la cotización, pidiendo confirmación antes
function vaciarCotizacion() {
    if (!confirm("¿Vaciar toda la cotización? Esta acción no se puede deshacer.")) {
        return
    }
    guardarCotizacion([])
}
