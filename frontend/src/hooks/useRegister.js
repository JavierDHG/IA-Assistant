// src/hooks/useRegister.js

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useRegister = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (username, email, password, confirmPassword) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password1: password,        // CAMBIO: de 'password' a 'password1'
                    password2: confirmPassword
                }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                // Ahora los mensajes de error serán más precisos
                const errorMessage = data.email?.[0] || data.username?.[0] || data.password1?.[0] || data.password2?.[0] || 'Error en el registro.';
                throw new Error(errorMessage);
            }

            if (data.key) {
                login(data.key, { username: username }); 
                navigate('/chat'); // Redirige al login después del registro exitoso
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleRegister, error, isLoading };
};

export default useRegister;