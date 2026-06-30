// =====================================================
// Taller MACA — Página de Catálogo
// Carga de datos desde JSON + filtros combinados + render dinámico
// =====================================================

let servicios = []

async function cargarServicios() {
    try {
        const respuesta = await fetch("data/servicios.json")
        servicios = await respuesta.json()
    } catch (error) {
        console.error("Error al cargar servicios.json", error)
        mensajeResultados.textContent =
            "No se pudieron cargar los servicios en este momento."
    }
}

// Elementos del DOM
const filtroCategoria = document.getElementById("filtroCategoria")
const filtroEstado = document.getElementById("filtroEstado")
const filtroBuscador = document.getElementById("filtroBuscador")
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros")
const mensajeResultados = document.getElementById("mensajeResultados")
const contenedorCatalogo = document.getElementById("contenedorCatalogo")

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

// Aplica categoría + estado + búsqueda de texto, combinados con AND
function filtrarServicios() {
    const categoria = filtroCategoria.value
    const estado = filtroEstado.value
    const texto = filtroBuscador.value.trim().toLowerCase()

    return servicios.filter(function (servicio) {
        if (!servicio.activo) {
            return false
        }

        const coincideCategoria = categoria === "todas" || servicio.categoria === categoria
        const coincideEstado = estado === "todos" || servicio.estado === estado
        const coincideTexto =
            texto === "" ||
            servicio.nombre.toLowerCase().includes(texto) ||
            servicio.descripcion.toLowerCase().includes(texto)

        return coincideCategoria && coincideEstado && coincideTexto
    })
}

// Crea la tarjeta (article) de un servicio del catálogo
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
            <button type="button" class="btn-secondary btn-agregar" onclick="agregarACotizacion(${servicio.id}, this)">
                Agregar a cotización
            </button>
        </div>
    `
    return tarjeta
}

// Pinta el catálogo filtrado en el contenedor
function renderizarCatalogo(lista) {
    contenedorCatalogo.innerHTML = ""

    if (lista.length === 0) {
        mensajeResultados.textContent = "No se encontraron servicios con esos filtros."
        contenedorCatalogo.innerHTML = `
            <div class="empty-state">
                <h3>Sin resultados</h3>
                <p>Probá con otra categoría, estado o término de búsqueda.</p>
            </div>
        `
        return
    }

    mensajeResultados.textContent = `Mostrando ${lista.length} de ${servicios.length} servicios.`

    for (const servicio of lista) {
        const tarjeta = crearTarjetaServicio(servicio)
        contenedorCatalogo.appendChild(tarjeta)
    }
}

// Vuelve a aplicar los filtros activos y renderiza el resultado
function aplicarFiltros() {
    renderizarCatalogo(filtrarServicios())
}

// Restablece los filtros a su estado por defecto
function limpiarFiltros() {
    filtroCategoria.value = "todas"
    filtroEstado.value = "todos"
    filtroBuscador.value = ""
    aplicarFiltros()
}

// Interacción inmediata: muestra u oculta el detalle de una tarjeta sin recargar
function alternarDetalle(boton) {
    const detalle = boton.nextElementSibling
    const expandido = boton.getAttribute("aria-expanded") === "true"

    detalle.classList.toggle("abierto")
    boton.setAttribute("aria-expanded", String(!expandido))
    boton.textContent = expandido ? "Ver detalles" : "Ocultar detalles"
}

// Agrega un servicio a la cotización y da retroalimentación visual en el botón
function agregarACotizacion(id, boton) {
    const servicio = servicios.find(function (servicio) {
        return servicio.id === id
    })
    if (!servicio) {
        return
    }

    agregarServicio(servicio)

    const textoOriginal = boton.textContent
    boton.textContent = "Agregado ✓"
    boton.disabled = true
    setTimeout(function () {
        boton.textContent = textoOriginal
        boton.disabled = false
    }, 1200)
}

// Eventos de los filtros
filtroCategoria.addEventListener("change", aplicarFiltros)
filtroEstado.addEventListener("change", aplicarFiltros)
filtroBuscador.addEventListener("input", aplicarFiltros)
btnLimpiarFiltros.addEventListener("click", limpiarFiltros)

// Carga inicial de la página
document.addEventListener("DOMContentLoaded", async function () {
    await cargarServicios()
    aplicarFiltros()
})
