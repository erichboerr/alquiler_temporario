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
        propiedad = await db.Propiedad.create({ nombre: 'Mi propiedad', caracteristicas: [] });
    }
    return propiedad;
};

// GET público: trae todo lo que necesita la landing en una sola llamada
// (datos generales + fotos ordenadas + meses con sus períodos ordenados).
const getPropiedadCompleta = async () => {
    const propiedad = await getOrCrearPropiedad();

    const [fotos, meses] = await Promise.all([
        db.Foto.findAll({ where: { propiedadId: propiedad.id }, order: [['orden', 'ASC']] }),
        db.MesCard.findAll({
            where: { propiedadId: propiedad.id },
            order: [['orden', 'ASC']],
            include: [{
                model: db.Periodo,
                as: 'periodos',
                separate: true, // necesario para poder ordenar una asociación hasMany incluida
                order: [['orden', 'ASC']],
            }],
        }),
    ]);

    return { propiedad, fotos, meses };
};

// PUT protegido: actualiza los datos generales (nombre, dirección, características, WhatsApp, etc.)
const actualizarPropiedad = async (data) => {
    const propiedad = await getOrCrearPropiedad();

    // Solo pisamos los campos que vinieron en el body, para poder actualizar
    // parcialmente desde el panel admin (ej: solo el WhatsApp) sin mandar todo el objeto.
    const campos = ['nombre', 'direccion', 'descripcion', 'habitaciones', 'banos', 'ocupantes', 'caracteristicas', 'whatsappNumero', 'whatsappMensaje'];
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
// Se usa cuando el admin reordena arrastrando las fotos en la UI.
const reordenarFotos = async (ordenNuevo) => {
    await Promise.all(
        ordenNuevo.map(({ id, orden }) => db.Foto.update({ orden }, { where: { id } })),
    );
    return db.Foto.findAll({ order: [['orden', 'ASC']] });
};

// --- Tarjetas de mes ---

const crearMes = async ({ titulo, orden }) => {
    const propiedad = await getOrCrearPropiedad();
    const ultima = await db.MesCard.findOne({ where: { propiedadId: propiedad.id }, order: [['orden', 'DESC']] });
    const siguienteOrden = orden ?? (ultima ? ultima.orden + 1 : 0);

    return db.MesCard.create({ propiedadId: propiedad.id, titulo, orden: siguienteOrden });
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
        // Si no está disponible, el precio no importa aunque venga cargado
        precio: disponible === false ? null : precio,
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
    if (precio !== undefined) periodo.precio = periodo.disponible === false ? null : precio;
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
    crearMes,
    actualizarMes,
    eliminarMes,
    crearPeriodo,
    actualizarPeriodo,
    eliminarPeriodo,
};
