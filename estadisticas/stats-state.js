export let statsGlobal = {};
export let listaEstados = []; 
export let estadoUI = {
    vistaActual: 'catalogo',
    personajeSeleccionado: null,
    esAdmin: false,
    filtroRol: 'Todos',
    filtroAct: 'Todos',
    party: [null, null, null, null, null, null], // Slots
    hexLog: {} // Memoria del Log Agrupado
};

// Contenedor para las otras bases de datos cruzadas
export let dbExtra = {
    objetos: {}, // Guarda { "linda": 15, "corvin": 8 }
    hechizos: { inventario: [], nodos: [], nodosOcultos: [] }
};

export function guardar() {
    localStorage.setItem('hex_stats_v2', JSON.stringify({ 
        stats: statsGlobal,
        party: estadoUI.party
    }));
}
