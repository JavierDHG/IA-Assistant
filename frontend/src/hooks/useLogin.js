// src/hooks/useLogin.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login/', { // La ruta relativa está bien por el proxy
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.non_field_errors?.[0] || 'Usuario o contraseña incorrectos.');
            }

            // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
            if (data.key) { // Usamos data.key en lugar de data.token
                login(data.key, { username: username }); // Pasamos data.key
                navigate('/chat'); // Cambié '/chat' por una ruta más acorde a tu app
            } else {
                throw new Error('No se recibió el token del servidor.');
            }

        } catch (err) {
            console.error('ERROR capturado en el catch:', err.message);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleLogin, isLoading, error };
};