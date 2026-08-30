import Sidebar from "./Sidebar";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react"; // Importamos el icono de hamburguesa

const MainLayout = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Barra Lateral Fija */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* El margen izquierdo cambia dinámicamente */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"}`}
      >
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {/* Botón Burger */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-slate-500 font-medium hidden md:block">
              Panel de Administración
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">
                {user?.user}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold mt-1">
                {user?.rol}
              </p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.user?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
