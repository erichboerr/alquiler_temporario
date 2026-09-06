import { useEffect, useState } from 'react';
import { Plus, Trash2, CheckCircle2, Loader2, CalendarRange } from 'lucide-react';
import { useToast } from '../../common/hooks/useToast';
import {
  getTemporadas,
  getTemporada,
  crearTemporada,
  activarTemporada,
  crearMes,
  actualizarMes,
  eliminarMes,
  crearPeriodo,
  actualizarPeriodo,
  eliminarPeriodo,
} from '../../common/services/propiedad.service';

// A partir de las etiquetas existentes (ej "2026-2027") sugiere la próxima
// (ej "2027-2028"). Si todavía no hay ninguna temporada cargada, no sugerimos
// nada y dejamos que el admin escriba la primera a mano.
const sugerirEtiqueta = (temporadas) => {
  if (!temporadas.length) return '';
  const anios = temporadas
    .map((t) => parseInt(t.etiqueta?.match(/\d{4}/)?.[0], 10))
    .filter((n) => !Number.isNaN(n));
  if (!anios.length) return '';
  const ultimo = Math.max(...anios);
  return `${ultimo + 1}-${ultimo + 2}`;
};

// Fila vacía de período para agregar una nueva sin llamar todavía al backend
// (se crea recién cuando el admin completa las fechas y confirma).
const periodoVacio = () => ({ fechaDesde: '', fechaHasta: '', precio: '', disponible: true });

const AdminTemporada = () => {
  const { addToast } = useToast();

  const [temporadas, setTemporadas] = useState([]);
  const [temporadaId, setTemporadaId] = useState(null);
  const [detalle, setDetalle] = useState(null); // temporada seleccionada con sus meses/períodos
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [creandoTemporada, setCreandoTemporada] = useState(false);
  const [etiquetaNueva, setEtiquetaNueva] = useState('');

  const [tituloMesNuevo, setTituloMesNuevo] = useState('');

  // Carga inicial: lista de temporadas para el selector
  useEffect(() => {
    cargarTemporadas();
  }, []);

  const cargarTemporadas = async (seleccionarId) => {
    try {
      const lista = await getTemporadas();
      setTemporadas(lista);
      // Si nos pasan un id explícito lo seleccionamos (recién creada/activada);
      // si no, mantenemos la selección actual o caemos en la activa / la más nueva.
      const idAUsar =
        seleccionarId ??
        temporadaId ??
        lista.find((t) => t.activa)?.id ??
        lista[0]?.id ??
        null;
      setTemporadaId(idAUsar);
    } catch {
      addToast('No se pudieron cargar las temporadas', 'error');
    }
  };

  // Cada vez que cambia la temporada seleccionada, traemos su detalle completo
  useEffect(() => {
    if (!temporadaId) {
      setDetalle(null);
      return;
    }
    setCargandoDetalle(true);
    getTemporada(temporadaId)
      .then(setDetalle)
      .catch(() => addToast('No se pudo cargar la temporada', 'error'))
      .finally(() => setCargandoDetalle(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporadaId]);

  const handleCrearTemporada = async () => {
    if (!etiquetaNueva.trim()) return;
    try {
      const nueva = await crearTemporada(etiquetaNueva.trim());
      addToast(`Temporada "${nueva.etiqueta}" creada`, 'success');
      setCreandoTemporada(false);
      setEtiquetaNueva('');
      await cargarTemporadas(nueva.id);
    } catch {
      addToast('No se pudo crear la temporada', 'error');
    }
  };

  const handleActivar = async () => {
    if (!temporadaId) return;
    try {
      await activarTemporada(temporadaId);
      addToast('Esta es ahora la temporada visible en la página pública', 'success');
      await cargarTemporadas(temporadaId);
    } catch {
      addToast('No se pudo activar la temporada', 'error');
    }
  };

  // --- Meses ---

  const handleAgregarMes = async () => {
    if (!tituloMesNuevo.trim() || !temporadaId) return;
    try {
      const mes = await crearMes(temporadaId, { titulo: tituloMesNuevo.trim() });
      setDetalle((d) => ({ ...d, meses: [...d.meses, { ...mes, periodos: [] }] }));
      setTituloMesNuevo('');
    } catch {
      addToast('No se pudo agregar el mes', 'error');
    }
  };

  const handleRenombrarMes = async (mes, titulo) => {
    setDetalle((d) => ({
      ...d,
      meses: d.meses.map((m) => (m.id === mes.id ? { ...m, titulo } : m)),
    }));
  };

  const handleGuardarMes = async (mes) => {
    try {
      await actualizarMes(mes.id, { titulo: mes.titulo });
    } catch {
      addToast('No se pudo guardar el título del mes', 'error');
    }
  };

  const handleEliminarMes = async (mesId) => {
    try {
      await eliminarMes(mesId);
      setDetalle((d) => ({ ...d, meses: d.meses.filter((m) => m.id !== mesId) }));
    } catch {
      addToast('No se pudo eliminar el mes', 'error');
    }
  };

  // --- Períodos ---

  const handleAgregarPeriodo = (mesId) => {
    setDetalle((d) => ({
      ...d,
      meses: d.meses.map((m) =>
        m.id === mesId ? { ...m, periodos: [...m.periodos, { ...periodoVacio(), _nuevo: true }] } : m,
      ),
    }));
  };

  const handleCambiarPeriodo = (mesId, index, campo, valor) => {
    setDetalle((d) => ({
      ...d,
      meses: d.meses.map((m) => {
        if (m.id !== mesId) return m;
        const periodos = [...m.periodos];
        periodos[index] = { ...periodos[index], [campo]: valor };
        return { ...m, periodos };
      }),
    }));
  };

  // Guarda el período: si es nuevo (todavía sin id) lo crea, si ya existe lo actualiza.
  // "overrides" permite pasar valores que todavía no llegaron al estado (evita guardar
  // con datos viejos cuando el guardado se dispara en el mismo evento que el cambio,
  // como pasa con el checkbox de "Reservado").
  const handleGuardarPeriodo = async (mesId, index, overrides = {}) => {
    const mes = detalle.meses.find((m) => m.id === mesId);
    const periodo = { ...mes.periodos[index], ...overrides };

    if (!periodo.fechaDesde || !periodo.fechaHasta) {
      addToast('Completá fecha desde y hasta antes de guardar', 'warning');
      return;
    }

    const payload = {
      fechaDesde: periodo.fechaDesde,
      fechaHasta: periodo.fechaHasta,
      // El precio se conserva aunque esté reservado — así al destildar "Reservado"
      // no se pierde el valor que ya tenía cargado.
      precio: periodo.precio || null,
      disponible: periodo.disponible,
    };

    try {
      const guardado = periodo._nuevo
        ? await crearPeriodo(mesId, payload)
        : await actualizarPeriodo(periodo.id, payload);

      setDetalle((d) => ({
        ...d,
        meses: d.meses.map((m) => {
          if (m.id !== mesId) return m;
          const periodos = [...m.periodos];
          periodos[index] = guardado;
          return { ...m, periodos };
        }),
      }));
      addToast('Período guardado', 'success');
    } catch {
      addToast('No se pudo guardar el período', 'error');
    }
  };

  const handleEliminarPeriodo = async (mesId, index) => {
    const mes = detalle.meses.find((m) => m.id === mesId);
    const periodo = mes.periodos[index];

    // Si todavía no se guardó en el backend, solo lo sacamos del estado local
    if (periodo._nuevo) {
      setDetalle((d) => ({
        ...d,
        meses: d.meses.map((m) =>
          m.id === mesId ? { ...m, periodos: m.periodos.filter((_, i) => i !== index) } : m,
        ),
      }));
      return;
    }

    try {
      await eliminarPeriodo(periodo.id);
      setDetalle((d) => ({
        ...d,
        meses: d.meses.map((m) =>
          m.id === mesId ? { ...m, periodos: m.periodos.filter((_, i) => i !== index) } : m,
        ),
      }));
    } catch {
      addToast('No se pudo eliminar el período', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Selector de temporada --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange size={20} className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">Temporada</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm min-w-48"
            value={temporadaId ?? ''}
            onChange={(e) => setTemporadaId(Number(e.target.value))}
          >
            {temporadas.length === 0 && <option value="">Sin temporadas todavía</option>}
            {temporadas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.etiqueta} {t.activa ? '· activa (visible en la página)' : ''}
              </option>
            ))}
          </select>

          {detalle && !detalle.activa && (
            <button
              onClick={handleActivar}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 size={16} /> Activar (mostrar en la página)
            </button>
          )}
          {detalle?.activa && (
            <span className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
              <CheckCircle2 size={16} /> Es la temporada activa
            </span>
          )}
        </div>

        {/* Crear nueva temporada — reutilizable año tras año */}
        <div className="mt-4 pt-4 border-t">
          {!creandoTemporada ? (
            <button
              onClick={() => {
                setEtiquetaNueva(sugerirEtiqueta(temporadas));
                setCreandoTemporada(true);
              }}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={16} /> Crear nueva temporada
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={etiquetaNueva}
                onChange={(e) => setEtiquetaNueva(e.target.value)}
                placeholder="ej: 2027-2028"
                className="border rounded-lg px-3 py-2 text-sm w-40"
              />
              <button
                onClick={handleCrearTemporada}
                className="text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Crear
              </button>
              <button
                onClick={() => setCreandoTemporada(false)}
                className="text-sm px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Planilla de meses / períodos de la temporada seleccionada --- */}
      {cargandoDetalle && (
        <div className="flex justify-center py-10 text-slate-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      )}

      {!cargandoDetalle && detalle && (
        <div className="space-y-4">
          {detalle.meses.map((mes) => (
            <div key={mes.id} className="bg-white p-5 rounded-xl shadow-sm border">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={mes.titulo}
                  onChange={(e) => handleRenombrarMes(mes, e.target.value)}
                  onBlur={() => handleGuardarMes(mes)}
                  className="font-bold text-slate-800 text-lg border-b border-transparent focus:border-blue-300 outline-none px-1"
                />
                <button
                  onClick={() => handleEliminarMes(mes.id)}
                  className="ml-auto text-slate-400 hover:text-red-500 p-1"
                  title="Eliminar tarjeta de mes"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2 pr-2 font-medium">Desde</th>
                      <th className="py-2 pr-2 font-medium">Hasta</th>
                      <th className="py-2 pr-2 font-medium">Precio</th>
                      <th className="py-2 pr-2 font-medium">Reservado</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mes.periodos.map((periodo, index) => (
                      <tr key={periodo.id ?? `nuevo-${index}`} className="border-b last:border-0">
                        <td className="py-2 pr-2">
                          <input
                            type="date"
                            value={periodo.fechaDesde || ''}
                            onChange={(e) => handleCambiarPeriodo(mes.id, index, 'fechaDesde', e.target.value)}
                            onBlur={() => handleGuardarPeriodo(mes.id, index)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="date"
                            value={periodo.fechaHasta || ''}
                            onChange={(e) => handleCambiarPeriodo(mes.id, index, 'fechaHasta', e.target.value)}
                            onBlur={() => handleGuardarPeriodo(mes.id, index)}
                            className="border rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            disabled={!periodo.disponible}
                            value={periodo.precio ?? ''}
                            onChange={(e) => handleCambiarPeriodo(mes.id, index, 'precio', e.target.value)}
                            onBlur={() => handleGuardarPeriodo(mes.id, index)}
                            placeholder={periodo.disponible ? '$' : 'No disponible'}
                            className="border rounded px-2 py-1 w-28 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          {/* "Reservado" en la UI = disponible:false en la base.
                              Al tildarlo, disponible pasa a false y se guarda solo. */}
                          <input
                            type="checkbox"
                            checked={!periodo.disponible}
                            onChange={(e) => {
                              const nuevoDisponible = !e.target.checked;
                              handleCambiarPeriodo(mes.id, index, 'disponible', nuevoDisponible);
                              handleGuardarPeriodo(mes.id, index, { disponible: nuevoDisponible });
                            }}
                          />
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => handleEliminarPeriodo(mes.id, index)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => handleAgregarPeriodo(mes.id)}
                className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus size={14} /> Agregar período
              </button>
            </div>
          ))}

          {/* Agregar nueva tarjeta de mes */}
          <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-2">
            <input
              type="text"
              value={tituloMesNuevo}
              onChange={(e) => setTituloMesNuevo(e.target.value)}
              placeholder="ej: Diciembre, Enero, Fiestas..."
              className="border rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button
              onClick={handleAgregarMes}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Agregar mes
            </button>
          </div>
        </div>
      )}

      {!cargandoDetalle && !detalle && temporadas.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center text-slate-500">
          Todavía no hay ninguna temporada creada. Usá "Crear nueva temporada" arriba para empezar.
        </div>
      )}
    </div>
  );
};

export default AdminTemporada;
