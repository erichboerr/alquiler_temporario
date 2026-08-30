// Normaliza el username antes de buscarlo en la DB.
// Aplica trim (saca espacios al inicio/fin) y lowercase (todo minúscula).
//
// ⚠️ Importante: para que esto funcione consistentemente, los usuarios
// deben guardarse también en lowercase al momento de crearse.
// Si cambiás esta lógica, asegurate de que el seeder y el CRUD de usuarios
// apliquen la misma normalización al hacer el INSERT.
export function normalizeUser(raw) {
    return raw?.trim().toLowerCase();
}