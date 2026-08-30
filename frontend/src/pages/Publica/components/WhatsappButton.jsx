import { MessageCircle } from 'lucide-react';

// Arma el link wa.me a partir del número y un mensaje.
// numero: formato internacional sin '+' ni espacios (ej: "5492255123456")
function armarLinkWhatsapp(numero, mensaje) {
    const base = `https://wa.me/${numero}`;
    return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

// className opcional para adaptar el estilo (botón grande del hero vs. chico de cada tarjeta)
const WhatsappButton = ({ numero, mensaje, children, className = '' }) => {
    // Si todavía no se cargó el número de contacto (propiedad recién creada, sin configurar),
    // no renderizamos un link roto — mejor no mostrar nada a que lleve a un wa.me/undefined
    if (!numero) return null;

    return (
        <a
            href={armarLinkWhatsapp(numero, mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-body font-semibold text-white transition-transform hover:scale-[1.03] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-marino ${className}`}
        >
            <MessageCircle size={18} />
            {children || 'Consultar por WhatsApp'}
        </a>
    );
};

export default WhatsappButton;
