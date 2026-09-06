import { X } from 'lucide-react';

// Embed de Google Maps a partir de la dirección de texto, sin necesitar API key
// (usa el endpoint clásico de maps.google.com con output=embed).
const MapaModal = ({ direccion, onCerrar }) => {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-landing-arena-osc px-5 py-4">
          <div>
            <p className="font-display text-lg font-semibold text-landing-marino">Ubicación</p>
            <p className="text-sm text-landing-marino-suave">{direccion}</p>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-2 text-landing-marino-suave hover:bg-landing-arena hover:text-landing-marino"
          >
            <X size={22} />
          </button>
        </div>

        <iframe
          title="Ubicación de la propiedad"
          src={src}
          className="h-[60vh] w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default MapaModal;
