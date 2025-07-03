import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import BotMessage from "./BotMessage";

const ChatAsistente = () => {
  // --- ESTADO DEL COMPONENTE ---
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // --- LÓGICA DE REINICIO AL CARGAR ---
  useEffect(() => {
    const iniciarNuevaConversacion = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        // 1. Enviamos el mensaje especial para borrar la memoria en el backend
        await fetch("/api/v1/asistente-citas/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ mensaje: "__RESET_CONVERSATION__" }),
        });

        // 2. Una vez reiniciado, establecemos el mensaje de bienvenida inicial
        const saludoInicial = {
          sender: "bot",
          data: {
            text: "¡Hola! Soy tu asistente virtual. Puedes pedirme agendar o cancelar una cita, o ver la lista de doctores.",
          },
        };

        setMessages([saludoInicial]);
      } catch (error) {
        console.error("Error al reiniciar la conversación:", error);
        setMessages([
          {
            sender: "bot",
            data: {
              text: "Tuve un problema al iniciar. Por favor, recarga la página.",
            },
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    iniciarNuevaConversacion();
  }, [token]);

  // --- FUNCIÓN PARA ENVIAR MENSAJES ---
  const enviarMensajeAlBackend = async (textoDelMensaje) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/asistente-citas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ mensaje: textoDelMensaje }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: "bot", data: data.respuesta };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error al contactar la API:", error);
      const errorMessage = {
        sender: "bot",
        data: {
          text: "Lo siento, tuve un problema para conectarme. Intenta de nuevo.",
        },
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- MANEJO DEL ENVÍO DEL FORMULARIO ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { sender: "user", text: inputValue };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    enviarMensajeAlBackend(inputValue);
    setInputValue("");
  };

  // --- MANEJO DE CLICS EN BOTONES DE OPCIONES ---
  const handleOptionClick = (textoOpcion) => {
    const userMessage = { sender: "user", text: textoOpcion };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    enviarMensajeAlBackend(textoOpcion);
  };

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            {/* --- SVG DE CHIP/IA --- */}
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M8 12a4 4 0 118 0 4 4 0 01-8 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Asistente Virtual
            </h1>
            <p className="text-sm text-gray-500">Clínica Dental Vitalis</p>
          </div>
        </div>
      </div>

      {/* Messages Area - Ahora con altura fija y scroll interno */}
      <div className="flex-1 min-h-0 px-4 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 h-full">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" ? (
                <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 p-4">
                    <BotMessage
                      data={msg.data}
                      onOptionClick={handleOptionClick}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
                <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form - Fijo en la parte inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isLoading}
                className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatAsistente;
