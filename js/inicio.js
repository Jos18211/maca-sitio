// =====================================================
// Taller MACA — Página de Inicio
// Carga de datos desde JSON + render dinámico + interacción
// =====================================================

let servicios = []

async function cargarServicios() {
    try {
        const respuesta = await fetch("data/servicios.json")
        servicios = await respuesta.json()
    } catch (error) {
        console.error("Error al cargar servicios.json", error)
        mensajeDestacados.textContent =
            "No se pudieron cargar los servicios en este momento."
    }
}

// Elementos del DOM
const contenedorDestacados = document.getElementById("contenedorDestacados")
const mensajeDestacados = document.getElementById("mensajeDestacados")

// Obtiene solo los servicios activos marcados como destacados
function obtenerDestacados() {
    return servicios.filter(function (servicio) {
        return servicio.activo && servicio.destacado
    })
}

// Da formato de colones a un número (60000 -> 60.000)
function formatearPrecio(numero) {
    return numero.toLocaleString("es-CR")
}

// Devuelve la clase visual según el campo "estado" del servicio
function obtenerClaseEstado(estado) {
    if (estado === "alta demanda") {
        return "state-warning"
    }
    return "state-success"
}

// Crea la tarjeta (article) de un servicio destacado
function crearTarjetaServicio(servicio) {
    const claseEstado = obtenerClaseEstado(servicio.estado)

    const tarjeta = document.createElement("article")
    tarjeta.classList.add("servicio-card")

    tarjeta.innerHTML = `
        <div class="servicio-imagen">
            <img src="${servicio.imagen}" alt="${servicio.nombre} en Taller MACA">
        </div>
        <div class="servicio-contenido">
            <span class="categoria-tag">${servicio.categoria}</span>
            <h3>${servicio.nombre}</h3>
            <p class="servicio-descripcion">${servicio.descripcion}</p>
            <p class="servicio-precio">
                &#8353;${formatearPrecio(servicio.precioEstimado)}
                <span>estimado</span>
            </p>
            <span class="state-box ${claseEstado}">${servicio.estado}</span>
            <div>
                <button type="button" class="btn-card" aria-expanded="false" onclick="alternarDetalle(this)">
                    Ver detalles
                </button>
                <div class="servicio-detalle">
                    Tipo: ${servicio.tipo === "combo" ? "Servicio combo" : "Servicio individual"}.
                    Precio sujeto a valoración previa en el taller; incluye materiales.
                </div>
            </div>
        </div>
    `
    return tarjeta
}

// Pinta la lista de destacados en el contenedor
function renderizarDestacados(lista) {
    contenedorDestacados.innerHTML = ""

    if (lista.length === 0) {
        mensajeDestacados.textContent =
            "Por el momento no hay servicios destacados disponibles."
        contenedorDestacados.innerHTML = `
            <div class="empty-state">
                <h3>Sin destacados por ahora</h3>
                <p>Visitá el catálogo completo para ver todos los servicios.</p>
            </div>
        `
        return
    }

    mensajeDestacados.textContent =
        `Mostrando ${lista.length} de los servicios más solicitados del taller.`

    for (const servicio of lista) {
        const tarjeta = crearTarjetaServicio(servicio)
        contenedorDestacados.appendChild(tarjeta)
    }
}

// Interacción inmediata: muestra u oculta el detalle de una tarjeta sin recargar
function alternarDetalle(boton) {
    const detalle = boton.nextElementSibling
    const expandido = boton.getAttribute("aria-expanded") === "true"

    detalle.classList.toggle("abierto")
    boton.setAttribute("aria-expanded", String(!expandido))
    boton.textContent = expandido ? "Ver detalles" : "Ocultar detalles"
}

// Carga inicial de la página
document.addEventListener("DOMContentLoaded", async function () {
    await cargarServicios()
    renderizarDestacados(obtenerDestacados())
})
