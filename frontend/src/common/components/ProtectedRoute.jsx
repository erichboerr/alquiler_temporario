import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. Mientras verifica la sesión (AuthContext loading), no mostramos nada
    if (loading) return <div>Cargando...</div>; 

    // 2. Si no hay usuario, directo al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si se definieron roles permitidos y el usuario NO tiene ese rol
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        // Lo mandamos al dashboard si intenta entrar a algo prohibido
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Si todo está bien, permitimos el acceso
    return <Outlet />;
};

export default ProtectedRoute;