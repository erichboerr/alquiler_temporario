import { useState } from 'react';
import { ChevronDown, ImageOff } from 'lucide-react';
import { getFotoUrl } from '../../../common/services/api';

const GaleriaAcordeon = ({ fotos }) => {
    // Abierto por defecto: las fotos son parte central de la decisión de alquilar,
    // así que el visitante las ve apenas entra, no tiene que buscar el botón.
    const [abierto, setAbierto] = useState(true);
    const hayFotos = fotos && fotos.length > 0;

    return (
        <section className="mx-auto max-w-5xl px-6 pb-4 sm:px-10 md:px-16">
            <div className="overflow-hidden rounded-2xl border border-landing-arena-osc bg-white">
                <button
                    onClick={() => setAbierto((v) => !v)}
                    aria-expanded={abierto}
                    className="flex w-full items-center justify-between px-6 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-landing-marino"
                >
                    <span className="font-display text-2xl font-semibold text-landing-marino">
                        Fotos {hayFotos ? `(${fotos.length})` : ''}
                    </span>
                    <ChevronDown
                        size={22}
                        className={`shrink-0 text-landing-marea transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Transición suave de alto usando grid-template-rows: 0fr → 1fr.
                    Evita el salto brusco de un simple show/hide condicional. */}
                <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${abierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                    <div className="overflow-hidden">
                        <div className="border-t border-landing-arena-osc px-6 py-6">
                            {hayFotos ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {fotos.map((foto) => (
                                        <div
                                            key={foto.id}
                                            className="aspect-square overflow-hidden rounded-xl bg-landing-arena"
                                        >
                                            <img
                                                src={getFotoUrl(foto.url)}
                                                alt=""
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-10 text-center text-landing-marino-suave">
                                    <ImageOff size={28} />
                                    <p className="text-sm">Todavía no hay fotos cargadas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GaleriaAcordeon;
