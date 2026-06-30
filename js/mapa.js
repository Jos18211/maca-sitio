// =====================================================
// Taller MACA — Mapa de ubicación
// Google Maps JavaScript API, inicializado por el callback del <script>
// =====================================================

const UBICACION_TALLER = { lat: 10.018033, lng: -84.178709 }

function inicializarMapa() {
    const mapa = new google.maps.Map(document.getElementById("mapaTaller"), {
        center: UBICACION_TALLER,
        zoom: 16
    })

    new google.maps.Marker({
        position: UBICACION_TALLER,
        map: mapa,
        title: "Taller MACA"
    })
}
