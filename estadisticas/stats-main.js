import { statsGlobal, estadoUI, guardar } from './stats-state.js';
import { cargarTodoDesdeCSV, procesarTextoCSV } from './stats-data.js';
import { dibujarCatalogo, dibujarDetalle, dibujarMenuOP, dibujarFormularioCrear, dibujarFormularioEditar } from './stats-ui.js';
import { generarCSVExportacion, descargarArchivoCSV, calcularVidaRojaMax } from './stats-logic.js';

window.mostrarCatalogo = () => { estadoUI.vistaActual = 'catalogo'; refrescarVistas(); };
window.abrirDetalle = (nombre) => { estadoUI.personajeSeleccionado = nombre; estadoUI.vistaActual = 'detalle'; refrescarVistas(); };

window.abrirMenuOP = () => { 
    if (estadoUI.esAdmin) {
        estadoUI.vistaActual = 'op'; refrescarVistas(); return;
    }
    const pass = prompt("Acceso Restringido. Contraseña:");
    if (pass === atob('Y2FuZXk=')) { 
        estadoUI.esAdmin = true;
        estadoUI.vistaActual = 'op'; 
        refrescarVistas();
    } else {
        if(pass !== null) alert("Acceso denegado.");
    }
};

window.mostrarPaginaOP = (subvista) => {
    estadoUI.vistaActual = 'op';
    refrescarVistas();
    const sub = document.getElementById('sub-vista-op');
    if(subvista === 'crear') sub.innerHTML = dibujarFormularioCrear();
    if(subvista === 'editar') sub.innerHTML = dibujarFormularioEditar();
};

window.modificarBuff = (statId, cantidad) => {
    const p = statsGlobal[estadoUI.personajeSeleccionado];
    if(!p) return;
    p.buffs[statId] = (p.buffs[statId] || 0) + cantidad;
    guardar();
    document.getElementById('sub-vista-op').innerHTML = dibujarFormularioEditar();
};

// NUEVO: Modifica los stats vitales y el HEX desde el perfil público
window.modLibre = (statId, cantidad) => {
    const p = statsGlobal[estadoUI.personajeSeleccionado];
    if(!p) return;
    
    // Suma y asegura que no queden números negativos
    p[statId] = Math.max(0, (p[statId] || 0) + cantidad);
    
    // Lógica para que la Vida Actual no sobrepase la Vida Máxima (límite)
    if (statId === 'vidaRojaActual') {
        const max = calcularVidaRojaMax(p);
        if (p.vidaRojaActual > max) p.vidaRojaActual = max;
    }
    
    guardar();
    refrescarVistas(); // Redibuja el perfil al instante
};

window.modForm = (inputId, cantidad) => {
    const input = document.getElementById(inputId);
    if(input) {
        let val = parseInt(input.value) || 0;
        input.value = Math.max(0, val + cantidad); 
    }
};

window.ejecutarCreacionNPC = () => {
    const nombre = document.getElementById('npc-nombre').value.trim();
    if(!nombre) return alert("Falta dar un nombre al personaje.");
    
    // Se extraen todos los datos de la matriz expandida
    statsGlobal[nombre] = {
        isNPC: true,
        hex: parseInt(document.getElementById('npc-hex').value) || 0,
        vex: parseInt(document.getElementById('npc-vex').value) || 0,
        vidaRojaActual: parseInt(document.getElementById('npc-vra').value) || 0,
        vidaRojaMax: parseInt(document.getElementById('npc-vrm').value) || 0,
        vidaAzul: parseInt(document.getElementById('npc-va').value) || 0,
        guardaDorada: parseInt(document.getElementById('npc-gd').value) || 0,
        danoRojo: parseInt(document.getElementById('npc-dr').value) || 0,
        danoAzul: parseInt(document.getElementById('npc-da').value) || 0,
        elimDorada: parseInt(document.getElementById('npc-ed').value) || 0,
        afinidades: { 
            fisica: parseInt(document.getElementById('npc-fis').value) || 0, 
            energetica: parseInt(document.getElementById('npc-ene').value) || 0, 
            espiritual: parseInt(document.getElementById('npc-esp').value) || 0, 
            mando: parseInt(document.getElementById('npc-man').value) || 0, 
            psiquica: parseInt(document.getElementById('npc-psi').value) || 0, 
            oscura: parseInt(document.getElementById('npc-osc').value) || 0 
        },
        buffs: { fisica:0, energetica:0, espiritual:0, mando:0, psiquica:0, oscura:0, danoRojo:0, danoAzul:0, elimDorada:0, vidaRojaMaxExtra:0 }
    };
    guardar(); alert("¡Personaje Forjado!"); window.abrirDetalle(nombre);
};

window.forzarSincronizacion = async () => {
    if(confirm("¿Seguro? Borrarás los NPCs locales y resetearás buffs.")) {
        await cargarTodoDesdeCSV(); alert("Sincronización completada."); window.mostrarCatalogo();
    }
};

window.descargarAumentada = () => { descargarArchivoCSV(generarCSVExportacion(), "HEX_ESTADOS_AUMENTADO.csv"); };
window.subirAumentada = (e) => {
    const archivo = e.target.files[0]; if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(ev) { procesarTextoCSV(ev.target.result); alert("CSV inyectado."); window.mostrarCatalogo(); };
    lector.readAsText(archivo);
};

function refrescarVistas() {
    document.getElementById('vista-catalogo').classList.add('oculto');
    document.getElementById('vista-detalle').classList.add('oculto');
    document.getElementById('vista-op').classList.add('oculto');

    if (estadoUI.vistaActual === 'catalogo') { document.getElementById('vista-catalogo').classList.remove('oculto'); dibujarCatalogo(); }
    else if (estadoUI.vistaActual === 'detalle') { document.getElementById('vista-detalle').classList.remove('oculto'); dibujarDetalle(); }
    else if (estadoUI.vistaActual === 'op') { 
        document.getElementById('vista-op').classList.remove('oculto'); 
        document.getElementById('vista-op').innerHTML = dibujarMenuOP();
    }
}

async function iniciar() {
    try {
        const cache = localStorage.getItem('hex_stats_v2');
        if (!cache) await cargarTodoDesdeCSV();
        else { Object.assign(statsGlobal, JSON.parse(cache).stats); }
    } catch (error) { console.error("Error crítico:", error); }
    finally { refrescarVistas(); }
}

iniciar();

