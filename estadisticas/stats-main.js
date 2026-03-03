import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarStatsDesdeCSV } from './stats-data.js';
import { refrescarUI, dibujarMenuOP, dibujarDiseñador } from './stats-ui.js';

async function iniciar() {
    await cargarStatsDesdeCSV();

    window.mostrarPagina = (id) => {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        document.getElementById('pag-' + id).style.display = 'block';
        if(id === 'admin') dibujarMenuOP();
        refrescarUI();
    };

    window.mostrarDiseñador = () => { dibujarDiseñador(); };

    window.agregarLocal = () => {
        const id = document.getElementById('n-id').value;
        if(!id) return alert("Falta ID");
        statsGlobal[id] = {
            hx: parseInt(document.getElementById('n-hx').value)||0,
            vx: parseInt(document.getElementById('n-vx').value)||0,
            fi: parseInt(document.getElementById('n-fi').value)||0, en: parseInt(document.getElementById('n-en').value)||0, es: parseInt(document.getElementById('n-es').value)||0, ma: parseInt(document.getElementById('n-ma').value)||0, ps: parseInt(document.getElementById('n-ps').value)||0, os: parseInt(document.getElementById('n-os').value)||0,
            r: parseInt(document.getElementById('n-ra').value)||0, rm: parseInt(document.getElementById('n-rm').value)||10, az: parseInt(document.getElementById('n-aa').value)||0, gd:0, hechizos:{afin:[],noms:[],cost:[]}
        };
        guardar(); refrescarUI(); window.mostrarPagina('publico');
    };

    window.verDetalle = (id) => { alert("Personaje: " + id + "\nPronto: Despliegue de Hechizos"); };
    window.actualizarTodo = async () => { if(confirm("¿Sincronizar?")) { await cargarStatsDesdeCSV(); refrescarUI(); } };
    window.ejecutarSyncLog = () => { if (prompt("Val:") === atob('Y2FuZXk=')) { estadoUI.esAdmin = true; window.mostrarPagina('admin'); } };

    refrescarUI();
}
iniciar();
