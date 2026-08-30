import { useAuth } from "../../common/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border">
      <h1 className="text-3xl font-bold text-slate-800">👋 ¡Hola de nuevo, {user?.user}!</h1>
      <p className="text-slate-500 mt-2">Este es tu resumen de hoy.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
          <h3 className="font-bold">Total Productos</h3>
          <p className="text-2xl">124</p>
        </div>
        {/* ... las otras tarjetas ... */}
      </div>
    </div>
  );
};

export default Dashboard;
