import { Sparkles } from 'lucide-react';

// La propiedad no tiene datos todavía (recién creada, admin sin completar) → no mostramos la sección
const PropiedadCaracteristicas = ({ descripcion, caracteristicas }) => {
    const hayContenido = Boolean(descripcion) || (caracteristicas && caracteristicas.length > 0);
    if (!hayContenido) return null;

    return (
        <section className="mx-auto max-w-5xl px-6 py-14 sm:px-10 md:px-16">
            <h2 className="font-display text-3xl font-semibold text-landing-marino sm:text-4xl">
                La propiedad
            </h2>

            {descripcion && (
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-landing-marino-suave sm:text-lg">
                    {descripcion}
                </p>
            )}

            {caracteristicas?.length > 0 && (
                <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {caracteristicas.map((item, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-2.5 rounded-xl border border-landing-arena-osc bg-white px-4 py-3.5 text-sm font-medium text-landing-marino"
                        >
                            <Sparkles size={16} className="shrink-0 text-landing-marea" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default PropiedadCaracteristicas;
