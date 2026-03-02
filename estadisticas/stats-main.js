import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodo } from './stats-data.js';
import { refrescarUI, dibujarMenuOP, dibujarDiseñador } from './stats-ui.js';

async function iniciar() {
    // 1. Limpieza de cache obsoleta
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
        localStorage.removeItem('hex_stats_vFusion');
    }

    // 2. Carga inicial de datos
    const cache = localStorage.getItem('hex_stats_vFusion');
    if (!cache) {
        await cargarTodo();
    } else {
        Object.assign(statsGlobal, JSON.parse(cache));
    }

    // 3. Funciones de Ventana (Globales)
    window.setActivo = (id) => {
        estadoUI.personajeActivo = id;
        refrescarUI();
    };

    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const target = document.getElementById('pag-' + id);
        if (target) target.style.display = 'block';
        if (id === 'admin') dibujarMenuOP();
        if (id === 'publico') {
            estadoUI.personajeActivo = null;
            refrescarUI();
        }
    };

    window.mostrarDiseñador = () => {
        dibujarDiseñador();
    };

    window.agregarYRefrescar = () => {
        const id = document.getElementById('n-id').value.trim();
        if (!id) return alert("Falta el nombre o ID del personaje.");

        statsGlobal[id] = {
            hx: parseInt(document.getElementById('n-hx').value) || 0,
            vx: parseInt(document.getElementById('n-vx').value) || 0,
            af: {
                fi: parseInt(document.getElementById('n-fi').value) || 0,
                en: parseInt(document.getElementById('n-en').value) || 0,
                es: parseInt(document.getElementById('n-es').value) || 0,
                ma: parseInt(document.getElementById('n-ma').value) || 0,
                ps: parseInt(document.getElementById('n-ps').value) || 0,
                os: parseInt(document.getElementById('n-os').value) || 0
            },
            vi: {
                r: parseInt(document.getElementById('n-ra').value) || 0,
                rM: parseInt(document.getElementById('n-rm').value) || 0,
                a: parseInt(document.getElementById('n-aa').value) || 0,
                g: 0
            },
            sp: document.getElementById('n-sp').value.split(',').map(s => s.trim()).filter(s => s !== ""),
            spAf: [] // Las afinidades de hechizos se pueden derivar o dejar vacías para manuales
        };

        guardar();
        alert(`Personaje ${id} inyectado correctamente.`);
        window.mostrarPagina('publico');
    };

    window.actualizarTodo = async () => {
        if (confirm("¿Sincronizar con los Sheets de Google?")) {
            const ok = await cargarTodo();
            if (ok) {
                alert("Sincronización completa.");
                refrescarUI();
            }
        }
    };

    const _key = 'Y2FuZXk='; // caney
    window.ejecutarSyncLog = () => {
        const pass = prompt("Acceso OP:");
        if (pass === atob(_key)) {
            estadoUI.esAdmin = true;
            window.mostrarPagina('admin');
        }
    };

    // 4. Arrancar Interfaz
    refrescarUI();
}

iniciar();
