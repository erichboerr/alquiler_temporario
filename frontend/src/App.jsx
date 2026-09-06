import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Providers — envuelven la app para dar acceso global al estado
import { AuthProvider } from './common/context/AuthProvider';
import { ToastProvider } from './common/context/ToastProvider';

// Hooks centralizados
import { useAuth } from './common/hooks/useAuth';
import { useToast } from './common/hooks/useToast';

// Servicio de API — interceptores de respuesta
import { setupInterceptors } from './common/services/api';

// Layout y páginas
import MainLayout from './common/components/MainLayout';
import ProtectedRoute from './common/components/ProtectedRoute';
import Login from './pages/Login/Login';
import AdminPropiedad from './pages/Admin/AdminPropiedad';
import AdminFotos from './pages/Admin/AdminFotos';
import AdminTemporada from './pages/Admin/AdminTemporada';
import Landing from './pages/Publica/Landing';

// AppContent va adentro de los Providers para poder usar sus hooks
function AppContent() {
    const { logout } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        // Registramos los interceptores de respuesta y guardamos la función de cleanup.
        // El return del useEffect la ejecuta automáticamente:
        //   - Antes de re-ejecutar el efecto (si logout o addToast cambian)
        //   - Cuando el componente se desmonta
        // Esto evita que se acumulen múltiples interceptores activos en simultáneo.
        const eject = setupInterceptors(addToast, logout);
        return () => eject();
    }, [addToast, logout]);

    return (
        <Routes>
            {/* Landing pública — la ve cualquier visitante, sin login */}
            <Route path="/" element={<Landing />} />

            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas — ProtectedRoute verifica sesión y rol */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/admin/propiedad" element={<AdminPropiedad />} />
                    <Route path="/admin/fotos" element={<AdminFotos />} />
                    <Route path="/admin/temporada" element={<AdminTemporada />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route
                path="*"
                element={
                    <div className="min-h-screen flex items-center justify-center bg-slate-100">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-slate-300">404</h1>
                            <p className="text-slate-500 mt-2">Página no encontrada</p>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            {/* ToastProvider va primero: si falla el Auth, los toasts siguen funcionando */}
            <ToastProvider>
                {/* AuthProvider verifica la sesión al montar */}
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;