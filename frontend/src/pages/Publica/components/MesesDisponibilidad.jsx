import { CalendarDays } from 'lucide-react';
import WhatsappButton from './WhatsappButton';
import { formatPrecio, formatRangoFechas } from '../../../common/utils/format';

// Un renglón de período dentro de la tarjeta: "1 al 15 — $100.000" o "1 al 15 — No disponible"
const FilaPeriodo = ({ periodo }) => (
    <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-landing-marino-suave">
            {formatRangoFechas(periodo.fechaDesde, periodo.fechaHasta)}
        </span>
        {periodo.disponible ? (
            <span className="font-display text-lg font-semibold text-landing-marea">
                {formatPrecio(periodo.precio)}
            </span>
        ) : (
            <span className="rounded-full bg-landing-arena-osc px-3 py-1 text-xs font-semibold uppercase tracking-wide text-landing-marino-suave">
                No disponible
            </span>
        )}
    </div>
);

const MesCard = ({ mes, whatsappNumero, whatsappMensajeBase }) => {
    // El mensaje de WhatsApp incluye el mes de la tarjeta, así el admin sabe
    // de entrada por qué período está preguntando el interesado
    const mensaje = whatsappMensajeBase
        ? `${whatsappMensajeBase} (${mes.titulo})`
        : `Hola! Quería consultar disponibilidad para ${mes.titulo}.`;

    return (
        <article className="flex flex-col rounded-2xl border border-landing-arena-osc bg-white shadow-sm">
            <div className="px-6 pt-6 pb-2 text-center">
                <h3 className="font-display text-2xl font-semibold text-landing-marino">{mes.titulo}</h3>
            </div>

            <div className="flex-1 divide-y divide-landing-arena-osc px-6">
                {mes.periodos?.length > 0 ? (
                    mes.periodos.map((periodo) => <FilaPeriodo key={periodo.id} periodo={periodo} />)
                ) : (
                    <p className="py-4 text-center text-sm text-landing-marino-suave">
                        Todavía no hay períodos cargados para este mes.
                    </p>
                )}
            </div>

            <div className="px-6 pb-6 pt-4">
                <WhatsappButton numero={whatsappNumero} mensaje={mensaje} className="w-full">
                    Consultar
                </WhatsappButton>
            </div>
        </article>
    );
};

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
