import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyA-ecBHtWxZCibVMSgq5sMgmZD7mqpP21g",
    authDomain: "serverless-1f963.firebaseapp.com",
    projectId: "serverless-1f963",
    storageBucket: "serverless-1f963.firebasestorage.app",
    messagingSenderId: "839234889175",
    appId: "1:839234889175:web:9ea979489db6f34b9e9792",
    measurementId: "G-1ZE8XQPW73"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
});

async function cargarDatos() {
    try {
        const response = await fetch('https://getdatos-6ytmihoema-uc.a.run.app');
        if (!response.ok) throw new Error("Error en la respuesta de la red");
        
        const datos = await response.json();
        dibujarTabla(datos);
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function dibujarTabla(datos) {
    const cuerpo = document.getElementById("cuerpoTabla");
    if (!cuerpo) return;

    cuerpo.innerHTML = ""; 

    datos.forEach((item) => {
        // Codificación segura para el onclick
        const objetoSeguro = btoa(unescape(encodeURIComponent(JSON.stringify(item))));
        
        let fila = `<tr>
            <td>
                <a href="javascript:void(0)" class="pais-link" onclick="verTarjeta('${objetoSeguro}')">
                    ${item.pais || 'N/A'}
                </a>
            </td>
            <td>${item.capital || 'N/A'}</td>
            <td>${item.moneda || 'N/A'}</td>
            <td>${Number(item.poblacion || 0).toLocaleString()}</td>
            <td>${Number(item.area_km2 || 0).toLocaleString()}</td>
        </tr>`;
        cuerpo.innerHTML += fila;
    });

    // Inicializar DataTable
    $('#tablaPaises').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 10,
        destroy: true,
        responsive: true,
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>'
    });
}

// Función para actualizar la UI de la gráfica
function actualizarGraficaDensidad(poblacion, area) {
    const densidad = Math.round(poblacion / area);
    const barra = document.getElementById('bar-densidad');
    const texto = document.getElementById('val-densidad');

    if(!barra || !texto) return;

    texto.innerText = `${densidad.toLocaleString()} hab/km²`;

    let color = '#2ecc71'; // Verde (Bajo)
    if (densidad > 200) color = '#e74c3c'; // Rojo (Alto)
    else if (densidad >= 50) color = '#f1c40f'; // Amarillo (Medio)

    // Calculamos escala visual (basada en 400 como máximo relativo)
    let ancho = Math.min((densidad / 400) * 100, 100);

    setTimeout(() => {
        barra.style.width = ancho + '%';
        barra.style.backgroundColor = color;
    }, 200);
}

// Vinculamos al objeto window porque app.js es un módulo
window.verTarjeta = function(datosB64) {
    try {
        const item = JSON.parse(decodeURIComponent(escape(atob(datosB64))));
        const contenido = document.getElementById("contenidoModal");
        
        // Inyectamos la Card de información + el contenedor de la gráfica
        contenido.innerHTML = `
            <div class="card border-0">
                <div class="card-body p-0">
                    <h3 class="text-center mb-3" style="color: #073460;">🗾 ${item.pais}</h3>
                    
                    <div class="p-3 bg-light rounded-3 mb-4">
                        <p class="mb-2"><strong>🗽 Capital:</strong> ${item.capital}</p>
                        <p class="mb-2"><strong>💲 Moneda:</strong> ${item.moneda}</p>
                        <p class="mb-2"><strong>👨‍👨‍👦‍👦 Población:</strong> ${Number(item.poblacion).toLocaleString()}</p>
                        <p class="mb-0"><strong>🌎 Extensión:</strong> ${Number(item.area_km2).toLocaleString()} km²</p>
                    </div>

                    <div class="density-card">
                        <div class="density-header">
                            <span class="small fw-bold text-uppercase text-muted">Análisis de Densidad</span>
                            <span class="density-value" id="val-densidad">Calculando...</span>
                        </div>

                        <div class="meter-container">
                            <div id="bar-densidad" class="meter-bar"></div>
                        </div>

                        <div class="density-legend">
                            <div class="legend-item"><span class="dot low"></span> Bajo</div>
                            <div class="legend-item"><span class="dot medium"></span> Medio</div>
                            <div class="legend-item"><span class="dot high"></span> Alto</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Disparamos la lógica de la barra
        actualizarGraficaDensidad(item.poblacion, item.area_km2);

        // Mostramos el modal
        const myModal = new bootstrap.Modal(document.getElementById('modalPais'));
        myModal.show();

    } catch (e) {
        console.error("Error al procesar el modal:", e);
    }
}