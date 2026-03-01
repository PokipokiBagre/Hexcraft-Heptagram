export let invGlobal = {}; export let objGlobal = {}; export let historial = []; 
export let estadoUI = {
    jugadorControl: null,
    jugadorInv: null,
    filtroRar: 'Todos',
    filtroMat: 'Todos',
    busquedaOP: "",
    busquedaCat: "", // NUEVO: Filtro para el catálogo
    busquedaInv: "", // NUEVO: Filtro para inventarios
    esAdmin: false
};
export function guardar() { localStorage.setItem('hex_db_v4', JSON.stringify({ inv: invGlobal, obj: objGlobal, his: historial })); }
