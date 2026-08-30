import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // logout definido ANTES del useEffect porque verifySession lo llama en el catch
    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    useEffect(() => {
        const verifySession = async () => {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/auth/verify');
                setUser(response.data);
            } catch {
                // Token inválido o expirado — limpiamos la sesión
                logout();
            } finally {
                setLoading(false);
            }
        };
        verifySession();
    }, []);

    const login = async (userValue, password) => {
        const response = await api.post('/auth/login', { user: userValue, password });
        const { token, user: userData } = response.data;
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Loader mientras verifica la sesión — evita flash de login o contenido protegido
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="animate-spin h-10 w-10" />
                    <p className="text-sm">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};