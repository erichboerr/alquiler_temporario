// Formatea un número como precio en pesos argentinos: 150000 → "$150.000"
export function formatPrecio(valor) {
    if (valor === null || valor === undefined) return '';
    const numero = Number(valor);
    return numero.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

// Formatea un rango de fechas para mostrar en las tarjetas de mes.
// Recibe strings "YYYY-MM-DD" (como vienen del backend, tipo DATEONLY).
// Si ambas fechas caen en el mismo mes: "1 al 15"
// Si cruzan de mes (ej: 22 dic al 1 ene): "22 dic al 1 ene"
export function formatRangoFechas(fechaDesde, fechaHasta) {
    if (!fechaDesde || !fechaHasta) return '';

    // Parseamos manualmente (evita corrimientos de huso horario con `new Date("YYYY-MM-DD")`)
    const [anioD, mesD, diaD] = fechaDesde.split('-').map(Number);
    const [anioH, mesH, diaH] = fechaHasta.split('-').map(Number);

    const mismoMes = mesD === mesH && anioD === anioH;

    if (mismoMes) {
        return `${diaD} al ${diaH}`;
    }

    const nombreMes = (mes) =>
        new Date(2000, mes - 1, 1).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '');

    return `${diaD} ${nombreMes(mesD)} al ${diaH} ${nombreMes(mesH)}`;
}
