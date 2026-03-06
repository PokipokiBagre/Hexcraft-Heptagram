export let db = {
    personajes: {}, // Se llenará con el CSV público
    hechizos: {
        nodos: [],
        nodosOcultos: [],
        inventario: [],
        string: [] // Relaciones Source -> Target
    }
};

export let estadoUI = {
    vistaActual: 'catalogo', // catalogo, grimorio, gestion, aprendizaje
    personajeSeleccionado: null,
    esAdmin: false,
    filtroRol: 'Todos',
    filtroAct: 'Todos',
    filtrosGestion: { afinidad: 'Todos', clase: 'Todos', busqueda: '' },
    colaCambios: { agregar: [], quitar: [] } // Almacena lo que se subirá al Sheet
};
