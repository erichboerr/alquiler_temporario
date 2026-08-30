import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const NavGroup = ({ icon: Icon, label, children, isCollapsed, setIsCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  // LOGICA DERIVADA: 
  // Si está colapsado, forzamos que el submenú se vea cerrado, 
  // pero no tocamos el estado interno 'isOpen' por ahora.
  const showChildren = !isCollapsed && isOpen;

  const handleClick = () => {
    if (isCollapsed && typeof setIsCollapsed === 'function') {
      // Si el usuario clickea el icono estando cerrado:
      // 1. Abrimos la barra lateral
      // 2. Abrimos el submenú
      setIsCollapsed(false);
      setIsOpen(true);
    } else {
      // Si ya está abierta la barra, comportamiento normal
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={handleClick}
        className={`w-full flex items-center rounded-lg transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-800
          ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-4 py-3'}`}
        title={isCollapsed ? label : ""}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="shrink-0" />} 
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap animate-in fade-in duration-300">
              {label}
            </span>
          )}
        </div>

        {!isCollapsed && (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
      </button>

      {/* Usamos la variable derivada 'showChildren' */}
      {showChildren && (
        <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};