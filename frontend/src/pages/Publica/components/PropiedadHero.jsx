import { useState } from 'react';
import { BedDouble, Bath, Users } from 'lucide-react';
import { getFotoUrl } from '../../../common/services/api';
import MapaModal from './MapaModal';

// Chip chico para un dato rápido (habitaciones, baños)
// eslint-disable-next-line no-unused-vars
const Chip = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-landing-marino shadow-sm backdrop-blur-sm">
    <Icon size={16} className="text-landing-marea" />
    {label}
  </div>
);

const PropiedadHero = ({ propiedad, fotoPortada }) => {
  const tieneFoto = Boolean(fotoPortada);
  // Modal del mapa: cerrado por defecto, se abre al tocar el ícono junto a la dirección
  const [mapaAbierto, setMapaAbierto] = useState(false);

  return (
    <header className="relative isolate">
      {/* Foto de portada — si todavía no hay fotos cargadas, mostramos un fondo
                degradado con el tono de la paleta en vez de dejar un hueco vacío o un ícono roto */}
      <div className="relative h-[30vh] min-h-7 w-full overflow-hidden bg-linear-to-br from-landing-marino to-landing-marea-suave">
        {tieneFoto && (
          <img
            src={getFotoUrl(fotoPortada.url)}
            alt={propiedad?.nombre || 'Propiedad'}
            className="h-full w-full object-cover"
          />
        )}
        {/* Degradé para que el texto blanco se lea bien encima de cualquier foto */}
        <div className="absolute inset-0 bg-linear-to-t from-landing-marino/90 via-landing-marino/20 to-transparent" />

        {/* Contenido sobre la foto */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 sm:pb-10 md:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-1.5 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Alquiler temporario
            </p>
            <h1 className="font-display text-3xl font-semibold leading-[1.05] text-white sm:text-4xl md:text-5xl">
              {propiedad?.nombre || 'Mi propiedad'}
            </h1>
            {propiedad?.direccion && (
              <p className="mt-2 flex items-center gap-2 text-sm text-white/90 sm:text-base">
                {propiedad.direccion}
                <button
                  onClick={() => setMapaAbierto(true)}
                  aria-label="Ver ubicación en el mapa"
                  title="Ver ubicación en el mapa"
                  className="ml-1 rounded-full p-1 hover:bg-white/20"
                >
                  {/* Único pin (antes había uno blanco al lado que quedaba repetido con este).
                      Se balancea suavemente cada tanto para que se note que es tocable. */}
                  <svg viewBox="0 0 24 24" className="h-5 w-5 animate-pin" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.5 11.6 7 12.06.28.26.72.26 1 0 .5-.46 7-6.81 7-12.06C19.5 5.36 16.14 2 12 2z"
                    />
                    <circle cx="12" cy="9.5" r="3" fill="#ffffff" />
                  </svg>
                </button>
              </p>
            )}

            {/* Chips de datos rápidos — solo se muestran si están cargados */}
            <div className="mt-4 flex flex-wrap gap-3">
              {Boolean(propiedad?.habitaciones) && (
                <Chip icon={BedDouble} label={`${propiedad.habitaciones} habitaciones`} />
              )}
              {Boolean(propiedad?.ocupantes) && (
                <Chip icon={Users} label={`${propiedad.ocupantes} personas`} />
              )}
              {Boolean(propiedad?.banos) && (
                <Chip
                  icon={Bath}
                  label={`${propiedad.banos} baño${propiedad.banos > 1 ? 's' : ''}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ola divisoria — el elemento de identidad de la página: marca la "orilla"
                entre la foto de portada y el resto del contenido (fondo arena) */}
      <svg
        className="block w-full text-landing-arena"
        viewBox="0 0 1440 50"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,20 C240,50 480,0 720,15 C960,30 1200,55 1440,25 L1440,50 L0,50 Z" />
      </svg>

      {mapaAbierto && (
        <MapaModal direccion={propiedad.direccion} onCerrar={() => setMapaAbierto(false)} />
      )}
    </header>
  );
};

export default PropiedadHero;
