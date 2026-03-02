import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodo } from './stats-data.js';
import { refrescarUI, dibujarMenuOP, dibujarDisenador } from './stats-ui.js';

async function iniciar() {
    // 1. Cargar persistencia local
    const cache = localStorage.getItem('hex_stats_vFusion_Final');
    if (cache) Object.assign(statsGlobal, JSON.parse(cache));

    // 2. Sincronizar Sheets (Linda y demás aparecerán aquí)
    await cargarTodo();

    // 3. Funciones Globales
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
        dibujarDisenador();
    };

    window.agregarManual = () => {
        const id = document.getElementById('n-id').value.trim();
        if (!id) return alert("Falta ID del personaje.");

        statsGlobal[id] = {
            hx: parseInt(document.getElementById('n-hx').value) || 0,
            vx: parseInt(document.getElementById('n-vx').value) || 0,
            af: { fi: 0, en: 0, es: 0, ma: 0, ps: parseInt(document.getElementById('n-ps').value) || 0, os: 0 },
            vi: {
                act: parseInt(document.getElementById('n-ra').value) || 0,
                maxBase: parseInt(document.getElementById('n-rm').value) || 0,
                azul: parseInt(document.getElementById('n-aa').value) || 0,
                oro: parseInt(document.getElementById('n-go').value) || 0
            },
            spNom: [], spAf: []
        };

        guardar();
        alert(`Personaje ${id} agregado.`);
        window.mostrarPagina('publico');
    };

    window.actualizarTodo = async () => {
        if (confirm("¿Sincronizar con Google Sheets?")) {
            await cargarTodo();
            refrescarUI();
            alert("Sincronización completa.");
        }
    };

    window.ejecutarSyncLog = () => {
        const pass = prompt("Acceso OP:");
        if (pass === atob('Y2FuZXk=')) {
            estadoUI.esAdmin = true;
            window.mostrarPagina('admin');
        }
    };

    // 4. Inicio
    refrescarUI();
}

iniciar();
