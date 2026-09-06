import { Link } from 'react-router-dom';
import { Package, Home, Images, CalendarRange, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout } = useAuth();

    // El nombre de la app se lee del .env (VITE_APP_NAME).
    // Si no está definido cae en 'Administracion de Propiedades' — nunca hardcodeado acá.
    const appName = import.meta.env.VITE_APP_NAME || 'Administracion';

    // setIsCollapsed no se usa acá por ahora (era para el submenú de Productos
    // que sacamos), se deja recibido para no romper la firma que usa MainLayout.
    void setIsCollapsed;

    return (
        <aside className={`bg-slate-900 h-screen text-slate-300 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>

            {/* Logo / nombre de la app */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800 h-16">
                <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
                    <Package size={20} className="text-white" />
                </div>
                {!isCollapsed && (
                    <span className="text-white font-bold text-xl tracking-tight truncate">
                        {appName}
                    </span>
                )}
            </div>

            {/* Navegación principal — orden: Propiedad, Fotos, Temporada */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                <Link
                    to="/admin/propiedad"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Home size={20} className="shrink-0" />
                    {!isCollapsed && <span>Propiedad</span>}
                </Link>

                <Link
                    to="/admin/fotos"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <Images size={20} className="shrink-0" />
                    {!isCollapsed && <span>Fotos</span>}
                </Link>

                <Link
                    to="/admin/temporada"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <CalendarRange size={20} className="shrink-0" />
                    {!isCollapsed && <span>Temporada</span>}
                </Link>
            </nav>

            {/* Botón de logout */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span>Salir</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
