export let db = {
    personajes: {}, // Formato: { Nombre: { isActive, isPlayer, hex, cantHechizos, mayorAfinidad, icono, rawRow } }
    csvHeadersPersonajes: [], // Guardamos la cabecera para poder exportar el CSV
    hechizos: {
        nodos: [],
        nodosOcultos: [],
        inventario: [],
        string: []
    }
};

export let estadoUI = {
    vistaActual: 'catalogo', 
    personajeSeleccionado: null,
    esAdmin: false,
    filtroRol: 'Todos',
    filtroAct: 'Todos',
    filtrosGrimorio: { afinidad: 'Todos', busqueda: '' }, // Filtros dentro del inventario de un Pj
    filtrosGestion: { afinidad: 'Todos', busqueda: '' },
    restarHexAsignacion: true, // Switch para restar HEX al asignar en OP
    colaCambios: { agregar: [], quitar: [] }
};
