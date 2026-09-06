import { useEffect, useState } from 'react';
import { Plus, Trash2, GripVertical, Home, Loader2 } from 'lucide-react';
import { useToast } from '../../common/hooks/useToast';
import {
  getPropiedadPublica,
  updatePropiedad,
  getCaracteristicas,
  crearCaracteristica,
  actualizarCaracteristica,
  reordenarCaracteristicas,
  eliminarCaracteristica,
} from '../../common/services/propiedad.service';

// Un solo <input>/<textarea> reutilizable para los campos generales de la propiedad.
// Guarda automáticamente al perder el foco, igual que en la planilla de Temporada.
const Campo = ({ label, value, onChange, onBlur, type = 'text', textarea, placeholder }) => (
  <label className="block">
    <span className="block text-sm font-medium text-slate-600 mb-1">{label}</span>
    {textarea ? (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={4}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    ) : (
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    )}
  </label>
);

const AdminPropiedad = () => {
  const { addToast } = useToast();

  const [propiedad, setPropiedad] = useState(null);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [descripcionNueva, setDescripcionNueva] = useState('');
  const [arrastrando, setArrastrando] = useState(null); // índice del ítem que se está arrastrando

  useEffect(() => {
    Promise.all([getPropiedadPublica(), getCaracteristicas()])
      .then(([datos, listaCaracteristicas]) => {
        setPropiedad(datos.propiedad);
        setCaracteristicas(listaCaracteristicas);
      })
      .catch(() => addToast('No se pudieron cargar los datos de la propiedad', 'error'))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCampo = (campo, valor) => setPropiedad((p) => ({ ...p, [campo]: valor }));

  const handleGuardarPropiedad = async () => {
    try {
      await updatePropiedad(propiedad);
    } catch {
      addToast('No se pudieron guardar los datos de la propiedad', 'error');
    }
  };

  // --- Características ---

  const handleAgregarCaracteristica = async () => {
    if (!descripcionNueva.trim()) return;
    try {
      const nueva = await crearCaracteristica(descripcionNueva.trim());
      setCaracteristicas((lista) => [...lista, nueva]);
      setDescripcionNueva('');
    } catch {
      addToast('No se pudo agregar la característica', 'error');
    }
  };

  const handleCambiarDescripcion = (id, descripcion) => {
    setCaracteristicas((lista) => lista.map((c) => (c.id === id ? { ...c, descripcion } : c)));
  };

  const handleGuardarDescripcion = async (id) => {
    const item = caracteristicas.find((c) => c.id === id);
    try {
      await actualizarCaracteristica(id, { descripcion: item.descripcion });
    } catch {
      addToast('No se pudo guardar la característica', 'error');
    }
  };

  const handleEliminarCaracteristica = async (id) => {
    try {
      await eliminarCaracteristica(id);
      setCaracteristicas((lista) => lista.filter((c) => c.id !== id));
    } catch {
      addToast('No se pudo eliminar la característica', 'error');
    }
  };

  // Reordenar arrastrando (drag and drop nativo, sin librerías externas)
  const handleDrop = async (indexDestino) => {
    if (arrastrando === null || arrastrando === indexDestino) return;

    const lista = [...caracteristicas];
    const [movido] = lista.splice(arrastrando, 1);
    lista.splice(indexDestino, 0, movido);
    setCaracteristicas(lista);
    setArrastrando(null);

    try {
      await reordenarCaracteristicas(lista.map((c, i) => ({ id: c.id, orden: i })));
    } catch {
      addToast('No se pudo guardar el nuevo orden', 'error');
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-16 text-slate-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Datos generales --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Home size={20} className="text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">Datos de la propiedad</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nombre de la propiedad" value={propiedad.nombre}
            onChange={(v) => handleCampo('nombre', v)} onBlur={handleGuardarPropiedad} />
          <Campo label="Dirección" value={propiedad.direccion}
            onChange={(v) => handleCampo('direccion', v)} onBlur={handleGuardarPropiedad} />
          <Campo label="Habitaciones" type="number" value={propiedad.habitaciones}
            onChange={(v) => handleCampo('habitaciones', v)} onBlur={handleGuardarPropiedad} />
          <Campo label="Baños" type="number" value={propiedad.banos}
            onChange={(v) => handleCampo('banos', v)} onBlur={handleGuardarPropiedad} />
          <Campo label="Ocupantes" placeholder="ej: 4 + 1" value={propiedad.ocupantes}
            onChange={(v) => handleCampo('ocupantes', v)} onBlur={handleGuardarPropiedad} />
        </div>

        <div className="mt-4">
          <Campo label="Descripción general" textarea value={propiedad.descripcion}
            onChange={(v) => handleCampo('descripcion', v)} onBlur={handleGuardarPropiedad} />
        </div>
      </div>

      {/* --- Características --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Características</h2>
        <p className="text-sm text-slate-500 mb-4">
          Arrastrá las filas por el ícono de la izquierda para cambiar el orden en que se muestran.
        </p>

        <div className="space-y-2">
          {caracteristicas.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setArrastrando(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-white"
            >
              <GripVertical size={16} className="text-slate-300 cursor-grab shrink-0" />
              <input
                type="text"
                value={item.descripcion}
                onChange={(e) => handleCambiarDescripcion(item.id, e.target.value)}
                onBlur={() => handleGuardarDescripcion(item.id)}
                className="flex-1 text-sm px-2 py-1 outline-none"
              />
              <button
                onClick={() => handleEliminarCaracteristica(item.id)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={descripcionNueva}
            onChange={(e) => setDescripcionNueva(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgregarCaracteristica()}
            placeholder="ej: Pileta, WiFi, Parrilla..."
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={handleAgregarCaracteristica}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>

      {/* --- Datos de contacto --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Datos de contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="WhatsApp (con código de país)" placeholder="5491122334455" value={propiedad.whatsappNumero}
            onChange={(v) => handleCampo('whatsappNumero', v)} onBlur={handleGuardarPropiedad} />
          <Campo label="Mensaje predeterminado" value={propiedad.whatsappMensaje}
            onChange={(v) => handleCampo('whatsappMensaje', v)} onBlur={handleGuardarPropiedad} />
        </div>
      </div>
    </div>
  );
};

export default AdminPropiedad;
