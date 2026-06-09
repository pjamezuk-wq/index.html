const axios = require('axios');
const turf = require('@turf/turf');

// 1. Coordenadas en formato  (Requerido por Turf.js)
const centrosSalud = [
    { nombre: "Centro de Salud Mendoza Oeste", coords: [-60.73231, -31.64289] },
    { nombre: "Centro de Salud Chalet", coords: [-60.72852, -31.66197] },
    { nombre: "Policlinico Centenario", coords: [-60.71875, -31.6633] },
    { nombre: "Centro de Salud Centenario", coords: [-60.72695, -31.66299] },
    { nombre: "Centro de Salud Emaus", coords: [-60.72632, -31.66878] },
    { nombre: "Centro de Salud Varadero Sarsoti", coords: [-60.73427, -31.66723] },
    { nombre: "Centro de Salud San Lorenzo", coords: [-60.7297, -31.65579] },
    { nombre: "Centro de Salud Evita", coords: [-60.72651, -31.64878] },
    { nombre: "Centro de Salud Altos del Valle", coords: [-60.6844, -31.57357] },
    { nombre: "Centro de Salud Altos de Noguera", coords: [-60.70465, -31.56647] },
    { nombre: "Centro de Salud Callejon Roca", coords: [-60.68429, -31.57853] },
    { nombre: "Centro de Salud Las Delicias", coords: [-60.69531, -31.58286] },
    { nombre: "Centro de Salud San Martin Nº 8", coords: [-60.71695, -31.59681] },
    { nombre: "Centro de Salud San Martin de Porres", coords: [-60.69884, -31.59268] },
    { nombre: "Centro de Salud San Jose", coords: [-60.70486, -31.60316] },
    { nombre: "Centro de Salud Las Flores", coords: [-60.71303, -31.59304] },
    { nombre: "Centro de Salud Pompeya", coords: [-60.70944, -31.58656] },
    { nombre: "Centro de Salud Padre Cobo", coords: [-60.71251, -31.60747] },
    { nombre: "Centro de Salud Baranquita Oeste", coords: [-60.71951, -31.62056] },
    { nombre: "Centro de Salud Quilmes", coords: [-60.70972, -31.62891] },
    { nombre: "Centro de Salud Los Hornos", coords: [-60.70505, -31.61228] },
    { nombre: "Policlinico Vecinal", coords: [-60.69364, -31.61909] },
    { nombre: "Centro de Salud Villa del Parque", coords: [-60.72196, -31.63163] },
    { nombre: "Centro de Salud Villa Hipodromo", coords: [-60.71953, -31.60642] },
    { nombre: "Centro de Salud Dorrego", coords: [-60.68059, -31.59465] },
    { nombre: "Centro de Salud Gutierrez", coords: [-60.6844, -31.62688] },
    { nombre: "Centro de Salud Candioti", coords: [-60.6918, -31.63821] },
    { nombre: "Centro de Salud Alberti", coords: [-60.6837, -31.61172] },
    { nombre: "Centro de Salud Setubal", coords: [-60.6642, -31.59834] },
    { nombre: "Centro de Salud Guadalupe Central", coords: [-60.67553, -31.60296] },
    { nombre: "Centro de Salud Manzana 2", coords: [-60.70077, -31.6651] },
    { nombre: "Centro de Salud Colastine Norte", coords: [-60.60283, -31.62349] },
    { nombre: "Centro de Salud La Boca", coords: [-60.676, -31.69466] },
    { nombre: "Centro de Salud Demetrio Gomez", coords: [-60.69684, -31.65578] },
    { nombre: "Samco El Pozo", coords: [-60.65887, -31.6357] },
    { nombre: "Centro de Salud Colastine Sur", coords: [-60.60572, -31.66352] },
    { nombre: "Centro de Salud La Guardia", coords: [-60.6262, -31.63837] },
    { nombre: "Centro de Salud Rincon Norte", coords: [-60.56583, -31.60284] },
    { nombre: "Centro de Salud Abasto", coords: [-60.74242, -31.56093] },
    { nombre: "Centro de Salud San Agustin", coords: [-60.74853, -31.56407] },
    { nombre: "Centro de Salud Yapeyú", coords: [-60.73877, -31.56607] },
    { nombre: "Centro de Salud Estanislao Lopez", coords: [-60.72679, -31.57898] },
    { nombre: "Centro de Salud Cabaña Leiva", coords: [-60.72585, -31.56468] },
    { nombre: "Centro de Salud Aceria", coords: [-60.7121, -31.6045] }, 
    { nombre: "Centro de Salud Cabal", coords: [-60.72735, -31.59915] },
    { nombre: "Centro de Salud Juventud del Norte", coords: [-60.73222, -31.58925] },
    { nombre: "Centro de Salud Las Lomas", coords: [-60.73547, -31.59609] },
    { nombre: "Centro de Salud Los Troncos", coords: [-60.74538, -31.58294] },
    { nombre: "Centro de Salud Loyola Sur", coords: [-60.73903, -31.57856] }
];

const EPE_GEOJSON_URL = 'https://www.epe.santafe.gov.ar/mapaepe/datos/cortes_programados.geojson';

async function monitorearCortes() {
    try {
        // timeout para evitar que el script se quede colgado si el servidor de EPE responde lento
        const response = await axios.get(EPE_GEOJSON_URL, { timeout: 15000 });
        
        console.log(`\n--- Chequeo: ${new Date().toLocaleTimeString()} ---`);

        if (!response.data || !response.data.features || response.data.features.length === 0) {
            console.log("✅ No hay cortes reportados actualmente en el sistema de EPE.");
            return;
        }

        const cortes = response.data.features; 

        centrosSalud.forEach(centro => {
            const punto = turf.point(centro.coords);
            let afectado = false;

            cortes.forEach(corte => {
                const poligonoCorte = corte.geometry;

                if (poligonoCorte && (poligonoCorte.type === 'Polygon' || poligonoCorte.type === 'MultiPolygon')) {
                    try {
                        if (turf.booleanPointInPolygon(punto, poligonoCorte)) {
                            afectado = true;
                            // Extraemos datos comunes del GeoJSON de la EPE (pueden variar según el esquema exacto de ellos)
                            const detalle = corte.properties.detalle || corte.properties.descripcion || 'Corte Programado/Técnico';
                            console.error(`⚠️ ALERTA CRÍTICA: [${centro.nombre}] está afectado por un corte.`);
                            console.error(`   > Detalle EPE: ${detalle}`);
                        }
                    } catch (geoError) {
                        // Evita que un polígono mal formado rompa el loop completo
                        console.error(`❌ Error procesando geometría para un corte:`, geoError.message);
                    }
                }
            });

            if (!afectado) {
                // Opcional: Puedes comentar esta línea si el log se vuelve muy ruidoso con 49 centros
                console.log(`✅ ${centro.nombre}: Energía normal.`);
            }
        });

    } catch (error) {
        console.error("⚠️ Error al conectar con el servidor de EPE:", error.message);
    }
}

// Configurar intervalo: 5 minutos = 300000 milisegundos
const CINCO_MINUTOS = 300000;
setInterval(monitorearCortes, CINCO_MINUTOS);

// Primera ejecución inmediata al iniciar el script
monitorearCortes();