import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFotoUrl } from '../../../common/services/api';

// Vista ampliada de una foto con flechas para recorrer el resto de la lista.
// indice === null significa "cerrado" — así el padre no necesita un booleano aparte.
const Lightbox = ({ fotos, indice, onCerrar, onCambiarIndice }) => {
  const abierto = indice !== null && indice !== undefined;

  const irAnterior = useCallback(() => {
    onCambiarIndice((i) => (i === 0 ? fotos.length - 1 : i - 1));
  }, [fotos.length, onCambiarIndice]);

  const irSiguiente = useCallback(() => {
    onCambiarIndice((i) => (i === fotos.length - 1 ? 0 : i + 1));
  }, [fotos.length, onCambiarIndice]);

  // Navegación con teclado: flechas y Escape, solo mientras está abierto
  useEffect(() => {
    if (!abierto) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCerrar();
      if (e.key === 'ArrowLeft') irAnterior();
      if (e.key === 'ArrowRight') irSiguiente();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar, irAnterior, irSiguiente]);

  if (!abierto) return null;

  const foto = fotos[indice];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
      onClick={onCerrar}
    >
      <button
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <X size={28} />
      </button>

      {fotos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); irAnterior(); }}
          aria-label="Foto anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:left-6"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      <img
        src={getFotoUrl(foto.url)}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
      />

      {fotos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); irSiguiente(); }}
          aria-label="Foto siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white sm:right-6"
        >
          <ChevronRight size={36} />
        </button>
      )}

      {fotos.length > 1 && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70">
          {indice + 1} / {fotos.length}
        </span>
      )}
    </div>
  );
};

export default Lightbox;
