import { estadoUI, db } from './inventario-state.js';
import { inicializarDatos, sincronizarColaBD, exportarCSVPersonajes } from './inventario-data.js';
import { dibujarCatalogo, dibujarGrimorio, dibujarAprendizaje, dibujarGestion } from './inventario-ui.js';

async function arrancarApp() {
    const loader = document.getElementById('loader');
    const ok = await inicializarDatos();
    
    if(!ok) {
        loader.innerHTML = "<span style='color:var(--red-alert);'>Fallo Crítico al cargar Bases de Datos Maestras.</span>";
        return;
    }
    
    loader.style.display = 'none';
    window.cambiarVista('catalogo');
}

window.cambiarVista = (vista) => {
    estadoUI.vistaActual = vista;
    document.querySelectorAll('.vista-seccion').forEach(el => el.classList.add('oculto'));
    
    if (vista === 'catalogo') { document.getElementById('c-catalogo').classList.remove('oculto'); dibujarCatalogo(); } 
    else if (vista === 'grimorio') { document.getElementById('c-grimorio').classList.remove('oculto'); dibujarGrimorio(); } 
    else if (vista === 'aprendizaje') { document.getElementById('c-aprendizaje').classList.remove('oculto'); dibujarAprendizaje(); }
    else if (vista === 'gestion') { document.getElementById('c-gestion').classList.remove('oculto'); dibujarGestion(); }
    
    actualizarBotonSync();
    window.scrollTo(0,0);
};

window.abrirGrimorio = (pj) => {
    estadoUI.personajeSeleccionado = pj;
    // Reseteamos filtros internos al entrar a un personaje
    estadoUI.filtrosGrimorio = { afinidad: 'Todos', busqueda: '' }; 
    window.cambiarVista('grimorio');
};

window.abrirMenuOP = () => {
    if(estadoUI.esAdmin) {
        estadoUI.esAdmin = false; alert("Modo OP Desactivado.");
        window.cambiarVista('catalogo'); return;
    }
    const pass = prompt("Contraseña de Operador:");
    if (pass === atob('Y2FuZXk=')) {
        estadoUI.esAdmin = true;
        alert("Modo OP Activado. Funciones Administrativas Desbloqueadas.");
        window.cambiarVista(estadoUI.vistaActual);
    } else if (pass !== null) alert("Acceso denegado.");
};

// --- FILTROS ---
window.setFiltro = (tipo, valor) => {
    if(tipo === 'rol') { estadoUI.filtroRol = valor; ['Todos','Jugador','NPC'].forEach(k => document.getElementById('btn-rol-'+k).classList.remove('btn-active')); document.getElementById('btn-rol-'+valor).classList.add('btn-active'); }
    if(tipo === 'act') { estadoUI.filtroAct = valor; ['Todos','Activo','Inactivo'].forEach(k => document.getElementById('btn-act-'+k).classList.remove('btn-active')); document.getElementById('btn-act-'+valor).classList.add('btn-active'); }
    dibujarCatalogo();
};

window.aplicarFiltrosGrimorio = () => {
    estadoUI.filtrosGrimorio.afinidad = document.getElementById('f-grim-afinidad').value;
    estadoUI.filtrosGrimorio.busqueda = document.getElementById('f-grim-texto').value;
    dibujarGrimorio();
};

window.aplicarFiltrosGestion = () => {
    estadoUI.filtrosGestion.afinidad = document.getElementById('op-f-afinidad').value;
    estadoUI.filtrosGestion.busqueda = document.getElementById('op-f-texto').value;
    dibujarGestion();
};

window.toggleRestarHex = (isChecked) => {
    estadoUI.restarHexAsignacion = isChecked;
};

window.descargarCSVHex = () => {
    exportarCSVPersonajes();
};

// --- GESTIÓN DE LA COLA Y HEX ---
window.accionCola = (accion, nombreHechizo, afinidad = '', hex = 0, origen = 'Desconocido') => {
    const pj = estadoUI.personajeSeleccionado;
    
    if(accion === 'agregar') {
        // Enviar a la cola para Google Sheets (API)
        estadoUI.colaCambios.agregar.push([pj, nombreHechizo, afinidad, hex, "Normal", origen]);
        
        // Si el OP dejó marcado restar HEX, o si aprendió desde el Árbol, descontamos
        if(estadoUI.restarHexAsignacion || estadoUI.vistaActual === 'aprendizaje') {
            const charObj = db.personajes[pj];
            charObj.hex = Math.max(0, charObj.hex - hex);
            
            // Modificamos la fila cruda (rawRow) para que la exportación del CSV de personajes salga bien
            const hexParts = charObj.rawRow[1].split('_');
            hexParts[0] = charObj.hex.toString();
            charObj.rawRow[1] = hexParts.join('_');
        }
    } else if (accion === 'quitar') {
        estadoUI.colaCambios.quitar.push({ Personaje: pj, Hechizo: nombreHechizo });
    }
    
    if(estadoUI.vistaActual === 'gestion') dibujarGestion();
    actualizarBotonSync();
};

function actualizarBotonSync() {
    const btn = document.getElementById('btn-sync-global');
    const hayCambios = estadoUI.colaCambios.agregar.length > 0 || estadoUI.colaCambios.quitar.length > 0;
    
    if (hayCambios) {
        btn.classList.remove('oculto');
        btn.innerText = `🔥 GUARDAR HECHIZOS (${estadoUI.colaCambios.agregar.length} Nuevos) 🔥`;
    } else {
        btn.classList.add('oculto');
    }
}

window.ejecutarSincronizacion = async () => {
    const btn = document.getElementById('btn-sync-global');
    btn.innerText = "Sincronizando Mágia..."; btn.disabled = true;
    
    const exito = await sincronizarColaBD(estadoUI.colaCambios);
    if(exito) {
        alert("¡Grimorio Actualizado Exitosamente en Servidor!");
        estadoUI.colaCambios = { agregar: [], quitar: [] };
        
        // Al terminar de guardar los hechizos, sugerir descargar el CSV si se restó HEX
        if(estadoUI.restarHexAsignacion && estadoUI.esAdmin) {
            if(confirm("Se restaron puntos de HEX a los personajes. ¿Deseas descargar el nuevo archivo CSV de personajes para subirlo a tu base de datos?")) {
                exportarCSVPersonajes();
            }
        }
        
        window.cambiarVista('catalogo');
    } else {
        alert("Error de conexión. Inténtalo de nuevo.");
    }
    btn.disabled = false;
};

window.onload = arrancarApp;
