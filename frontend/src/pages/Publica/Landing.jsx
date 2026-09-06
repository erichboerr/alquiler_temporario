import { useEffect, useState } from 'react';
import { getPropiedadPublica } from '../../common/services/propiedad.service';
import PropiedadHero from './components/PropiedadHero';
import PropiedadCaracteristicas from './components/PropiedadCaracteristicas';
import GaleriaAcordeon from './components/GaleriaAcordeon';
import MesesDisponibilidad from './components/MesesDisponibilidad';

const Landing = () => {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getPropiedadPublica()
            .then(setDatos)
            .catch(() => setError(true))
            .finally(() => setCargando(false));
    }, []);

    // Loader simple mientras llega la respuesta — evita el flash de página vacía
    if (cargando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-landing-arena">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-landing-marea-suave border-t-landing-marea" />
            </div>
        );
    }

    // Si el backend no responde (servidor caído, red, etc.), mostramos algo accionable
    // en vez de una pantalla en blanco — no es el estado normal de "sin datos cargados"
    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-landing-arena px-6 text-center">
                <p className="font-display text-2xl text-landing-marino">No pudimos cargar la página</p>
                <p className="text-landing-marino-suave">Probá de nuevo en unos minutos.</p>
            </div>
        );
    }

    const { propiedad, fotos, caracteristicas, meses } = datos;
    const fotoPortada = fotos?.[0] ?? null;
    // La foto de posición 0 ya se muestra arriba como portada (PropiedadHero),
    // así que en el acordeón de fotos mostramos solo de la 1 en adelante para no repetirla.
    const fotosGaleria = fotos?.slice(1) ?? [];

    return (
        <div className="min-h-screen bg-landing-arena font-body">
            <PropiedadHero propiedad={propiedad} fotoPortada={fotoPortada} />
            <PropiedadCaracteristicas
                descripcion={propiedad?.descripcion}
                caracteristicas={caracteristicas}
            />
            <GaleriaAcordeon fotos={fotosGaleria} />
            <MesesDisponibilidad
                meses={meses}
                whatsappNumero={propiedad?.whatsappNumero}
                whatsappMensajeBase={propiedad?.whatsappMensaje}
            />
        </div>
    );
};

export default Landing;
