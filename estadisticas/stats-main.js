import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarMenuOP, dibujarPantallaCrear, verDetalle } from './stats-ui.js';
import { descargarCSV } from './stats-logic.js';

async function iniciar() {
    // 1. Cargar datos del CSV (A-P)
    await cargarStatsDesdeCSV();

    // 2. VINCULACIÓN DE BOTONES (window.functionName)
    // Estos nombres deben coincidir EXACTAMENTE con los onclick de tu index.html
    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const target = document.getElementById('pag-' + id);
        if(target) target.style.display = 'block';
        if(id === 'admin') dibujarMenuOP();
        refrescarUI();
    };

    window.actualizarTodo = async () => {
        if(confirm("¿Sincronizar datos con el Sheet?")) {
            await cargarStatsDesdeCSV();
            refrescarUI();
        }
    };

    window.ejecutarSyncLog = () => {
        const pass = prompt("Validation Code:");
        if (pass === atob('Y2FuZXk=')) { // pass: caney
            estadoUI.esAdmin = true;
            window.mostrarPagina('admin');
        }
    };

    // Funciones internas del Menú OP y Catálogo
    window.verDetalle = verDetalle;
    window.mostrarPantallaCrear = dibujarPantallaCrear;
    window.descargarEstadoCSV = descargarCSV;
    
    window.agregarLocal = () => {
        const id = document.getElementById('n-id').value.trim();
        if(!id) return alert("Falta ID del personaje.");
        
        statsGlobal[id] = {
            id: id, 
            hex: document.getElementById('n-hx').value || "0", 
            vex: document.getElementById('n-vx').value || "0",
            fi: document.getElementById('n-fi').value || "0", 
            en: document.getElementById('n-en').value || "0", 
            es: document.getElementById('n-es').value || "0", 
            ma: document.getElementById('n-ma').value || "0", 
            ps: document.getElementById('n-ps').value || "0", 
            os: document.getElementById('n-os').value || "0",
            r: document.getElementById('n-ra').value || "0", 
            rm: document.getElementById('n-rm').value || "10", 
            az: document.getElementById('n-aa').value || "0", 
            go: 0, dr: 0, da: 0, eo: 0
        };
        guardar();
        alert("¡Personaje inyectado localmente!");
        refrescarUI();
        window.mostrarPagina('publico');
    };

    // 3. Renderizar vista inicial
    refrescarUI();
}

iniciar();
