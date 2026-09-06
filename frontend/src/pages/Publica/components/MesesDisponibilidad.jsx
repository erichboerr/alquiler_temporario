import { CalendarDays, Megaphone } from 'lucide-react';
import WhatsappIconLink from './WhatsappIconLink';
import { formatPrecio, formatRangoFechas } from '../../../common/utils/format';

// Un renglón de período dentro de la tarjeta:
// Disponible → "1 al 15 — $100.000 [ícono WhatsApp]"
// Reservado  → "1 al 15 — Reservado" (sin ícono, no tiene sentido consultar por algo ocupado)
const FilaPeriodo = ({ periodo, mesTitulo, whatsappNumero, whatsappMensajeBase }) => {
  // El mensaje incluye el mes Y el rango de fechas puntual del renglón,
  // así el que pregunta ya arranca la conversación siendo específico.
  const rango = formatRangoFechas(periodo.fechaDesde, periodo.fechaHasta);
  const mensaje = whatsappMensajeBase
    ? `${whatsappMensajeBase} ${mesTitulo} del ${rango}`
    : `Hola! Quería consultar disponibilidad para ${mesTitulo} del ${rango}.`;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-landing-marino-suave">{rango}</span>

      {periodo.disponible ? (
        <div className="flex items-center gap-2.5">
          <span className="font-display text-lg font-semibold text-landing-marea">
            {formatPrecio(periodo.precio)}
          </span>
          <WhatsappIconLink
            numero={whatsappNumero}
            mensaje={mensaje}
            ariaLabel={`Consultar por WhatsApp — ${mesTitulo}, ${rango}`}
          />
        </div>
      ) : (
        <span className="rounded-full bg-landing-arena-osc px-3 py-1 text-xs font-semibold uppercase tracking-wide text-landing-marino-suave">
          Reservado
        </span>
      )}
    </div>
  );
};

const MesCard = ({ mes, whatsappNumero, whatsappMensajeBase }) => (
  <article className="flex flex-col rounded-2xl border border-landing-arena-osc bg-white shadow-sm">
    <div className="px-6 pt-6 pb-2 text-center">
      <h3 className="font-display text-2xl font-semibold text-landing-marino">{mes.titulo}</h3>
    </div>

    <div className="flex-1 divide-y divide-landing-arena-osc px-6 pb-6">
      {mes.periodos?.length > 0 ? (
        mes.periodos.map((periodo) => (
          <FilaPeriodo
            key={periodo.id}
            periodo={periodo}
            mesTitulo={mes.titulo}
            whatsappNumero={whatsappNumero}
            whatsappMensajeBase={whatsappMensajeBase}
          />
        ))
      ) : (
        <p className="py-4 text-center text-sm text-landing-marino-suave">
          Todavía no hay períodos cargados para este mes.
        </p>
      )}
    </div>
  </article>
);

const MesesDisponibilidad = ({ meses, whatsappNumero, whatsappMensajeBase }) => {
  const hayMeses = meses && meses.length > 0;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14 sm:px-10 md:px-16">
      <div className="mb-8 flex items-center gap-3">
        <CalendarDays size={24} className="text-landing-marea" />
        <h2 className="font-display text-3xl font-semibold text-landing-marino sm:text-4xl">
          Disponibilidad y precios
        </h2>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <Megaphone  size={28} className="text-landing-atardecer" />
        <h2 className="font-display text-2xl font-semibold text-landing-atardecer sm:text-2xl">
          Se reserva con el 30% del total.
        </h2>
      </div>

      {hayMeses ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meses.map((mes) => (
            <MesCard
              key={mes.id}
              mes={mes}
              whatsappNumero={whatsappNumero}
              whatsappMensajeBase={whatsappMensajeBase}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-landing-arena-osc py-10 text-center text-landing-marino-suave">
          Todavía no hay meses cargados. Muy pronto vamos a publicar la disponibilidad.
        </p>
      )}
    </section>
  );
};

export default MesesDisponibilidad;
