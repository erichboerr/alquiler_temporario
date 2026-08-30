import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../common/hooks/useAuth';
import { useToast } from '../../../common/hooks/useToast';

export const useLoginForm = () => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(user, password);
            addToast(`¡Bienvenido, ${user}!`, 'success');
            navigate('/dashboard');
        } catch (err) {
            // El interceptor de api.js ya muestra el toast — no duplicamos el mensaje
            if (import.meta.env.DEV) {
                console.error('Error en login:', err.response?.data || err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return { user, setUser, password, setPassword, isSubmitting, handleSubmit };
};