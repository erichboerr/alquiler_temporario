// Arma el link wa.me a partir del número y un mensaje.
// numero: formato internacional sin '+' ni espacios (ej: "5492255123456")
// Vive en su propio archivo (no en WhatsappButton.jsx) porque un archivo que
// exporta un componente Y una función suelta rompe el Fast Refresh de Vite
// (warning: react-refresh/only-export-components).
export function armarLinkWhatsapp(numero, mensaje) {
    const base = `https://wa.me/${numero}`;
    return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
