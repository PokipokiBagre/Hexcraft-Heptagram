import { invGlobal, objGlobal, historial, guardar } from './obj-state.js';

export function modificar(j, o, c, callback) {
    if (!invGlobal[j]) invGlobal[j] = {};
    invGlobal[j][o] = Math.max(0, (invGlobal[j][o] || 0) + c);
    historial.push({ fecha: new Date().toLocaleString(), jugador: j, objeto: o, cambio: c, total: invGlobal[j][o] });
    guardar(); if(callback) callback(); 
}

export function modificarMulti(jugadores, obj, cant, callback) {
    jugadores.forEach(j => {
        if (!invGlobal[j]) invGlobal[j] = {};
        invGlobal[j][obj] = Math.max(0, (invGlobal[j][obj] || 0) + cant);
        historial.push({ fecha: new Date().toLocaleString(), jugador: j, objeto: obj, cambio: cant, total: invGlobal[j][obj] });
    });
    guardar(); if(callback) callback();
}

export function transferir(origen, destino, obj, cant, callback) {
    if (!invGlobal[origen] || !invGlobal[destino]) return;
    const disp = invGlobal[origen][obj] || 0;
    const aMover = Math.min(disp, cant);
    if (aMover <= 0) return;

    invGlobal[origen][obj] -= aMover;
    invGlobal[destino][obj] = (invGlobal[destino][obj] || 0) + aMover;
    
    historial.push({ fecha: new Date().toLocaleString(), jugador: origen, objeto: obj, cambio: -aMover, total: invGlobal[origen][obj] });
    historial.push({ fecha: new Date().toLocaleString(), jugador: destino, objeto: obj, cambio: aMover, total: invGlobal[destino][obj] });
    
    guardar(); if(callback) callback();
}

export function agregarObjetoManual(datos, reparticion, callback) {
    const { nombre, tipo, mat, eff, rar } = datos;
    if (!nombre) return alert("Falta nombre.");
    objGlobal[nombre] = { tipo, mat, eff, rar };
    Object.keys(reparticion).forEach(j => {
        const cant = parseInt(reparticion[j]) || 0;
        if (cant > 0) {
            if (!invGlobal[j]) invGlobal[j] = {};
            invGlobal[j][nombre] = (invGlobal[j][nombre] || 0) + cant;
            historial.push({ fecha: new Date().toLocaleString(), jugador: j, objeto: nombre, cambio: cant, total: invGlobal[j][nombre] });
        }
    });
    guardar(); callback();
}

// Descargar Excel de Estado Actual
export function descargarEstadoExcel() {
    let data = [["Objeto", "Tipo", "Material", "Efecto", "Rareza", "Dueños", "Cantidades"]];
    Object.keys(objGlobal).sort().forEach(o => {
        const info = objGlobal[o]; let d = [], c = [];
        Object.keys(invGlobal).forEach(jug => { if (invGlobal[jug][o] > 0) { d.push(jug); c.push(invGlobal[jug][o]); } });
        if(d.length > 0) data.push([o, info.tipo, info.mat, info.eff, info.rar, d.join(', '), c.join(', ')]);
        else data.push([o, info.tipo, info.mat, info.eff, info.rar, "Nadie", 0]);
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventarios");
    XLSX.writeFile(wb, "HEX_OBJ_ESTADO.xlsx");
}

// Descargar Excel de Log Histórico
export function descargarLogExcel() {
    let data = [["Fecha", "Jugador", "Objeto", "Cambio", "Total"]];
    historial.forEach(h => data.push([h.fecha, h.jugador, h.objeto, h.cambio, h.total]));
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, "HEX_LOG_OBJETOS.xlsx");
}
