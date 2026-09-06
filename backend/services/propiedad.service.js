import db from '../models/index.js';
import { createError } from '../utils/createError.js';
import fs from 'fs';
import path from 'path';

// Como es una sola propiedad, siempre trabajamos sobre la primera fila de la tabla.
// Si todavía no existe (primera vez que se levanta el sistema), la creamos vacía.
// Así el admin no necesita un endpoint especial de "alta inicial": entra a /admin
// y ya tiene un formulario para completar.
const getOrCrearPropiedad = async () => {
    let propiedad = await db.Propiedad.findOne({ order: [['id', 'ASC']] });
    if (!propiedad) {
        propiedad = await db.Propiedad.create({ nombre: 'Mi propiedad' });
    }
    return propiedad;
};

// GET público: trae todo lo que necesita la landing en una sola llamada
// (datos generales + fotos ordenadas + meses/períodos de la temporada ACTIVA).
// Si todavía no hay ninguna temporada marcada como activa, "meses" viene vacío
// en vez de romper — la landing ya sabe mostrar el estado "sin datos cargados".
const getPropiedadCompleta = async () => {
    const propiedad = await getOrCrearPropiedad();

    const [fotos, caracteristicas, temporadaActiva] = await Promise.all([
        db.Foto.findAll({ where: { propiedadId: propiedad.id }, order: [['orden', 'ASC']] }),
        db.Caracteristica.findAll({ where: { propiedadId: propiedad.id }, order: [['orden', 'ASC']] }),
        db.Temporada.findOne({
            where: { propiedadId: propiedad.id, activa: true },
            include: [{
                model: db.MesCard,
                as: 'meses',
                separate: true, // necesario para poder ordenar una asociación hasMany incluida
                order: [['orden', 'ASC']],
                include: [{
                    model: db.Periodo,
                    as: 'periodos',
                    separate: true,
                    order: [['orden', 'ASC']],
                }],
            }],
        }),
    ]);

    return { propiedad, fotos, caracteristicas, meses: temporadaActiva?.meses ?? [] };
};

// PUT protegido: actualiza los datos generales (nombre, dirección, descripción, WhatsApp, etc.)
// Las características tienen su propio CRUD más abajo, porque ahora son una tabla aparte.
const actualizarPropiedad = async (data) => {
    const propiedad = await getOrCrearPropiedad();

    // Solo pisamos los campos que vinieron en el body, para poder actualizar
    // parcialmente desde el panel admin (ej: solo el WhatsApp) sin mandar todo el objeto.
    const campos = ['nombre', 'direccion', 'descripcion', 'habitaciones', 'banos', 'ocupantes', 'whatsappNumero', 'whatsappMensaje'];
    campos.forEach((campo) => {
        if (data[campo] !== undefined) propiedad[campo] = data[campo];
    });

    await propiedad.save();
    return propiedad;
};

// --- Fotos ---

const agregarFoto = async (urlRelativa) => {
    const propiedad = await getOrCrearPropiedad();

    // La nueva foto se agrega al final del orden actual
    const ultima = await db.Foto.findOne({ where: { propiedadId: propiedad.id }, order: [['orden', 'DESC']] });
    const siguienteOrden = ultima ? ultima.orden + 1 : 0;

    return db.Foto.create({ propiedadId: propiedad.id, url: urlRelativa, orden: siguienteOrden });
};

const eliminarFoto = async (id) => {
    const foto = await db.Foto.findByPk(id);
    if (!foto) throw createError('Foto no encontrada', 404, 'FOTO_NOT_FOUND');

    // Borramos también el archivo físico del disco, no solo el registro,
    // para no ir acumulando archivos huérfanos en /uploads
    const rutaAbsoluta = path.join(process.cwd(), foto.url);
    fs.promises.unlink(rutaAbsoluta).catch(() => {
        // Si el archivo ya no está en disco no es un error fatal, seguimos igual
    });

    await foto.destroy();
    return { id };
};

// Recibe un array [{ id, orden }, ...] y actualiza el orden de cada foto de una sola vez.
// Se usa cuando el admin reordena arrastrando las fotos en la UI (orden 1 en adelante).
const reordenarFotos = async (ordenNuevo) => {
    await Promise.all(
        ordenNuevo.map(({ id, orden }) => db.Foto.update({ orden }, { where: { id } })),
    );
    return db.Foto.findAll({ order: [['orden', 'ASC']] });
};

// Marca una foto ya existente como la portada (orden 0), SIN borrar la que
// ocupaba ese lugar: simplemente se intercambian los órdenes entre ambas,
// así la que antes era portada pasa a formar parte de la galería normal.
const marcarFotoPortada = async (id) => {
    const propiedad = await getOrCrearPropiedad();
    const nuevaPortada = await db.Foto.findOne({ where: { id, propiedadId: propiedad.id } });
    if (!nuevaPortada) throw createError('Foto no encontrada', 404, 'FOTO_NOT_FOUND');

    const portadaActual = await db.Foto.findOne({ where: { propiedadId: propiedad.id, orden: 0 } });

    if (portadaActual && portadaActual.id !== nuevaPortada.id) {
        portadaActual.orden = nuevaPortada.orden;
        await portadaActual.save();
    }
    nuevaPortada.orden = 0;
    await nuevaPortada.save();

    return db.Foto.findAll({ where: { propiedadId: propiedad.id }, order: [['orden', 'ASC']] });
};

// --- Características ---
// Ítems cortos tipo lista (ej: "Pileta", "WiFi"), cada uno con su propio orden.
// Se separaron en su propia tabla (en vez de un campo JSON) para poder
// editar, borrar y reordenar cada una individualmente, igual que meses/períodos.

const listarCaracteristicas = async () => {
    const propiedad = await getOrCrearPropiedad();
    return db.Caracteristica.findAll({ where: { propiedadId: propiedad.id }, order: [['orden', 'ASC']] });
};

const crearCaracteristica = async ({ descripcion, orden }) => {
    if (!descripcion) throw createError('descripcion es requerida', 400, 'VALIDATION_ERROR');
    const propiedad = await getOrCrearPropiedad();

    const ultima = await db.Caracteristica.findOne({ where: { propiedadId: propiedad.id }, order: [['orden', 'DESC']] });
    const siguienteOrden = orden ?? (ultima ? ultima.orden + 1 : 0);

    return db.Caracteristica.create({ propiedadId: propiedad.id, descripcion, orden: siguienteOrden });
};

const actualizarCaracteristica = async (id, { descripcion, orden }) => {
    const caracteristica = await db.Caracteristica.findByPk(id);
    if (!caracteristica) throw createError('Característica no encontrada', 404, 'CARACTERISTICA_NOT_FOUND');

    if (descripcion !== undefined) caracteristica.descripcion = descripcion;
    if (orden !== undefined) caracteristica.orden = orden;
    await caracteristica.save();
    return caracteristica;
};

// Recibe [{ id, orden }, ...] para reordenar todas de una — igual patrón que reordenarFotos
const reordenarCaracteristicas = async (ordenNuevo) => {
    await Promise.all(
        ordenNuevo.map(({ id, orden }) => db.Caracteristica.update({ orden }, { where: { id } })),
    );
    return db.Caracteristica.findAll({ order: [['orden', 'ASC']] });
};

const eliminarCaracteristica = async (id) => {
    const caracteristica = await db.Caracteristica.findByPk(id);
    if (!caracteristica) throw createError('Característica no encontrada', 404, 'CARACTERISTICA_NOT_FOUND');

    await caracteristica.destroy();
    return { id };
};

// --- Temporadas ---
// Ej de etiqueta: "2026-2027". La siguiente sería "2027-2028", y así siempre
// se arma con el año en curso y el que viene.

// Lista todas las temporadas de la propiedad (para el selector del admin),
// más nuevas primero.
const listarTemporadas = async () => {
    const propiedad = await getOrCrearPropiedad();
    return db.Temporada.findAll({
        where: { propiedadId: propiedad.id },
        order: [['id', 'DESC']],
    });
};

// Trae una temporada puntual con sus meses y períodos, para precargar
// la plantilla del admin cuando selecciona una temporada existente.
const getTemporadaConDetalle = async (id) => {
    const temporada = await db.Temporada.findByPk(id, {
        include: [{
            model: db.MesCard,
            as: 'meses',
            separate: true,
            order: [['orden', 'ASC']],
            include: [{
                model: db.Periodo,
                as: 'periodos',
                separate: true,
                order: [['orden', 'ASC']],
            }],
        }],
    });
    if (!temporada) throw createError('Temporada no encontrada', 404, 'TEMPORADA_NOT_FOUND');
    return temporada;
};

const crearTemporada = async ({ etiqueta }) => {
    if (!etiqueta) throw createError('etiqueta es requerida', 400, 'VALIDATION_ERROR');
    const propiedad = await getOrCrearPropiedad();
    return db.Temporada.create({ propiedadId: propiedad.id, etiqueta, activa: false });
};

// Marca una temporada como la activa (la que se muestra en la landing pública)
// y desactiva cualquier otra que estuviera activa antes, para que nunca
// haya más de una activa a la vez.
const activarTemporada = async (id) => {
    const temporada = await db.Temporada.findByPk(id);
    if (!temporada) throw createError('Temporada no encontrada', 404, 'TEMPORADA_NOT_FOUND');

    await db.Temporada.update(
        { activa: false },
        { where: { propiedadId: temporada.propiedadId } },
    );
    temporada.activa = true;
    await temporada.save();
    return temporada;
};

const eliminarTemporada = async (id) => {
    const temporada = await db.Temporada.findByPk(id);
    if (!temporada) throw createError('Temporada no encontrada', 404, 'TEMPORADA_NOT_FOUND');

    // onDelete: CASCADE en la migración se encarga de borrar sus meses y períodos
    await temporada.destroy();
    return { id };
};

// --- Tarjetas de mes ---

const crearMes = async (temporadaId, { titulo, orden }) => {
    const temporada = await db.Temporada.findByPk(temporadaId);
    if (!temporada) throw createError('Temporada no encontrada', 404, 'TEMPORADA_NOT_FOUND');

    const ultima = await db.MesCard.findOne({ where: { temporadaId }, order: [['orden', 'DESC']] });
    const siguienteOrden = orden ?? (ultima ? ultima.orden + 1 : 0);

    return db.MesCard.create({ temporadaId, titulo, orden: siguienteOrden });
};

const actualizarMes = async (id, { titulo, orden }) => {
    const mes = await db.MesCard.findByPk(id);
    if (!mes) throw createError('Tarjeta de mes no encontrada', 404, 'MES_NOT_FOUND');

    if (titulo !== undefined) mes.titulo = titulo;
    if (orden !== undefined) mes.orden = orden;
    await mes.save();
    return mes;
};

const eliminarMes = async (id) => {
    const mes = await db.MesCard.findByPk(id);
    if (!mes) throw createError('Tarjeta de mes no encontrada', 404, 'MES_NOT_FOUND');

    // onDelete: CASCADE en la migración se encarga de borrar sus períodos
    await mes.destroy();
    return { id };
};

// --- Períodos (renglones dentro de cada tarjeta de mes) ---

const crearPeriodo = async (mesId, { fechaDesde, fechaHasta, precio, disponible, orden }) => {
    const mes = await db.MesCard.findByPk(mesId);
    if (!mes) throw createError('Tarjeta de mes no encontrada', 404, 'MES_NOT_FOUND');

    if (!fechaDesde || !fechaHasta) {
        throw createError('fechaDesde y fechaHasta son requeridas', 400, 'VALIDATION_ERROR');
    }

    const ultimo = await db.Periodo.findOne({ where: { mesId }, order: [['orden', 'DESC']] });
    const siguienteOrden = orden ?? (ultimo ? ultimo.orden + 1 : 0);

    return db.Periodo.create({
        mesId,
        fechaDesde,
        fechaHasta,
        // El precio se guarda tal cual venga, se conserva aunque esté reservado
        // (la landing pública ya sabe ocultarlo cuando disponible es false)
        precio: precio || null,
        disponible: disponible ?? true,
        orden: siguienteOrden,
    });
};

const actualizarPeriodo = async (id, { fechaDesde, fechaHasta, precio, disponible, orden }) => {
    const periodo = await db.Periodo.findByPk(id);
    if (!periodo) throw createError('Período no encontrado', 404, 'PERIODO_NOT_FOUND');

    if (fechaDesde !== undefined) periodo.fechaDesde = fechaDesde;
    if (fechaHasta !== undefined) periodo.fechaHasta = fechaHasta;
    if (disponible !== undefined) periodo.disponible = disponible;
    // El precio se guarda tal cual venga, se conserva aunque esté reservado
    if (precio !== undefined) periodo.precio = precio || null;
    if (orden !== undefined) periodo.orden = orden;

    await periodo.save();
    return periodo;
};

const eliminarPeriodo = async (id) => {
    const periodo = await db.Periodo.findByPk(id);
    if (!periodo) throw createError('Período no encontrado', 404, 'PERIODO_NOT_FOUND');

    await periodo.destroy();
    return { id };
};

export default {
    getPropiedadCompleta,
    actualizarPropiedad,
    agregarFoto,
    eliminarFoto,
    reordenarFotos,
    marcarFotoPortada,
    listarCaracteristicas,
    crearCaracteristica,
    actualizarCaracteristica,
    reordenarCaracteristicas,
    eliminarCaracteristica,
    listarTemporadas,
    getTemporadaConDetalle,
    crearTemporada,
    activarTemporada,
    eliminarTemporada,
    crearMes,
    actualizarMes,
    eliminarMes,
    crearPeriodo,
    actualizarPeriodo,
    eliminarPeriodo,
};
