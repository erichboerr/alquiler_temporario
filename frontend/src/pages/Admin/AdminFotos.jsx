import { useEffect, useRef, useState } from 'react';
import { Star, Trash2, GripVertical, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '../../common/hooks/useToast';
import { getFotoUrl } from '../../common/services/api';
import {
  getPropiedadPublica,
  subirFoto,
  eliminarFoto,
  reordenarFotos,
  marcarFotoPortada,
} from '../../common/services/propiedad.service';

const AdminFotos = () => {
  const { addToast } = useToast();
  const inputRef = useRef(null);

  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);

  useEffect(() => {
    cargarFotos();
  }, []);

  const cargarFotos = async () => {
    try {
      const datos = await getPropiedadPublica();
      setFotos(datos.fotos ?? []);
    } catch {
      addToast('No se pudieron cargar las fotos', 'error');
    } finally {
      setCargando(false);
    }
  };

  // La portada es siempre la de orden 0; el resto (orden 1 en adelante) es la galería
  const portada = fotos.find((f) => f.orden === 0) ?? null;
  const galeria = fotos.filter((f) => f.orden !== 0);

  const handleSubir = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('foto', archivo);
      await subirFoto(formData);
      await cargarFotos();
    } catch {
      addToast('No se pudo subir la foto', 'error');
    } finally {
      setSubiendo(false);
      e.target.value = ''; // permite volver a elegir el mismo archivo si hace falta
    }
  };

  const handleMarcarPortada = async (id) => {
    try {
      const actualizadas = await marcarFotoPortada(id);
      setFotos(actualizadas);
      addToast('Portada actualizada', 'success');
    } catch {
      addToast('No se pudo marcar como portada', 'error');
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarFoto(id);
      setFotos((lista) => lista.filter((f) => f.id !== id));
    } catch {
      addToast('No se pudo eliminar la foto', 'error');
    }
  };

  // Reordenar la galería (orden 1 en adelante) arrastrando — la portada nunca se mezcla acá
  const handleDrop = async (indexDestino) => {
    if (arrastrando === null || arrastrando === indexDestino) return;

    const lista = [...galeria];
    const [movida] = lista.splice(arrastrando, 1);
    lista.splice(indexDestino, 0, movida);
    setArrastrando(null);
    setFotos([portada, ...lista].filter(Boolean));

    try {
      // El orden empieza en 1 porque el 0 lo ocupa siempre la portada
      await reordenarFotos(lista.map((f, i) => ({ id: f.id, orden: i + 1 })));
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
      {/* --- Foto de portada --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2 mb-1">
          <Star size={20} className="text-amber-500" />
          <h1 className="text-xl font-bold text-slate-800">Foto de portada</h1>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Es la que se ve arriba de todo en la página. Para cambiarla, marcá otra foto de la galería
          de abajo con la estrella — no hace falta borrar la actual.
        </p>

        <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden bg-slate-100 border flex items-center justify-center">
          {portada ? (
            <img src={getFotoUrl(portada.url)} alt="Portada" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-2">
              <ImageIcon size={32} />
              <span className="text-sm">Sin foto de portada todavía</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Galería --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Fotos de la propiedad</h2>
        <p className="text-sm text-slate-500 mb-4">
          Arrastrá las fotos para cambiar el orden en que se muestran en la página.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {galeria.map((foto, index) => (
            <div
              key={foto.id}
              draggable
              onDragStart={() => setArrastrando(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="relative group border rounded-lg overflow-hidden bg-slate-50 cursor-grab"
            >
              <img src={getFotoUrl(foto.url)} alt="" className="w-full aspect-square object-cover" />

              <div className="absolute top-1 left-1 bg-black/40 rounded p-0.5">
                <GripVertical size={14} className="text-white" />
              </div>

              <div className="absolute inset-x-0 bottom-0 flex justify-between p-1.5 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMarcarPortada(foto.id)}
                  title="Usar como portada"
                  className="text-white hover:text-amber-400 p-1"
                >
                  <Star size={16} />
                </button>
                <button
                  onClick={() => handleEliminar(foto.id)}
                  title="Eliminar"
                  className="text-white hover:text-red-400 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Botón para agregar una foto nueva, como una tarjeta más de la grilla */}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="flex flex-col items-center justify-center gap-2 aspect-square rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            {subiendo ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
            <span className="text-xs font-medium">{subiendo ? 'Subiendo...' : 'Agregar foto'}</span>
          </button>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleSubir} className="hidden" />
        </div>

        {galeria.length === 0 && (
          <p className="text-sm text-slate-400 mt-2">Todavía no hay fotos en la galería.</p>
        )}
      </div>
    </div>
  );
};

export default AdminFotos;
