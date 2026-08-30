import { Link } from 'react-router-dom';
import { Package, LayoutDashboard, LogOut } from 'lucide-react';
import { NavGroup } from './NavItem';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { logout } = useAuth();

    // El nombre de la app se lee del .env (VITE_APP_NAME).
    // Si no está definido cae en 'Mi App' — nunca hardcodeado acá.
    const appName = import.meta.env.VITE_APP_NAME || 'Mi App';

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

            {/* Navegación principal */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    <LayoutDashboard size={20} className="shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                </Link>

                {/* Ejemplo de grupo con submenú — reemplazar con las rutas del proyecto */}
                <NavGroup icon={Package} label="Productos" isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
                    <Link to="/productos/inventario" className="block py-2 text-sm pl-2 hover:text-white">
                        Inventario
                    </Link>
                </NavGroup>
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