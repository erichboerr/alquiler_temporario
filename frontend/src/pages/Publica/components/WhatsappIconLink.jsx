import { MessageCircle } from 'lucide-react';
import { armarLinkWhatsapp } from './WhatsappButton';

// Versión chica, solo ícono, pensada para ir al lado del precio de cada renglón de período.
// numero/mensaje: mismo formato que WhatsappButton.
const WhatsappIconLink = ({ numero, mensaje, ariaLabel }) => {
    if (!numero) return null;

    return (
        <a
            href={armarLinkWhatsapp(numero, mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel || 'Consultar por WhatsApp'}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#25D366] p-1.5 text-white transition-transform hover:scale-110 hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-marino"
        >
            <MessageCircle size={14} />
        </a>
    );
};

export default WhatsappIconLink;
