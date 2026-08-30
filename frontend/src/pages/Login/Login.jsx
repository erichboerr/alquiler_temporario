import { LogIn, Loader2 } from 'lucide-react';
import { useLoginForm } from './hooks/useLoginForm';

const Login = () => {
    const { user, setUser, password, setPassword, isSubmitting, handleSubmit } = useLoginForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
                    {import.meta.env.VITE_APP_NAME || 'Mi App'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Usuario</label>
                        <input
                            type="text"
                            required
                            autoComplete="username"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;