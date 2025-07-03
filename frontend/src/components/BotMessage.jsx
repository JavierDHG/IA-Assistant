"use client";

// --- Tarjetas especializadas para cada tipo de mensaje ---

const CitasCard = ({ titulo, citas }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
    <p className="text-sm font-medium text-gray-800">{titulo}</p>
    <div className="space-y-3">
      {citas.map((cita) => {
        // --- 1. Formateo de Fecha y Hora en JavaScript ---
        // Combinamos la fecha y hora para crear un objeto de fecha válido
        // Nota: Es importante agregar la 'T' para que sea un formato ISO 8601 válido
        const fechaObj = new Date(`${cita.date}T${cita.time}`);

        // Usamos el formateador del navegador, que es muy potente y respeta el idioma
        const fechaFormateada = new Intl.DateTimeFormat("es-CO", {
          dateStyle: "full", // ej: "lunes, 30 de junio de 2025"
        }).format(fechaObj);

        const horaFormateada = new Intl.DateTimeFormat("es-CO", {
          timeStyle: "short", // ej: "9:00 a. m."
        }).format(fechaObj);

        // --- 2. Renderizamos la tarjeta con la nueva estructura ---
        return (
          <div
            key={cita.id}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Icono */}
                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4m0 0V7a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h4m8-2v2H8V7h8z"
                    />
                  </svg>
                </div>

                {/* Contenedor para el texto, ahora se apila verticalmente */}
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    Doctor(a): {cita.doctor_name}{" "}
                    {/* El nombre del doctor ya viene formateado */}
                  </p>
                  <p className="text-xs text-gray-500">
                    Paciente: {cita.paciente_username}
                  </p>
                  <p className="text-sm text-blue-700 font-medium mt-2">
                    {/* Mostramos la fecha y hora ya formateadas */}
                    {fechaFormateada} a las {horaFormateada}
                  </p>
                </div>
              </div>

              {/* Badge de estado */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Confirmada
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Tarjeta para mostrar opciones como botones (ej: lista de doctores)
const OpcionesCard = ({ titulo, opciones, onOptionClick }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
    <p className="text-sm font-medium text-gray-800">{titulo}</p>
    <div className="grid grid-cols-1 gap-2">
      {opciones.map((opcion) => (
        <button
          key={opcion}
          onClick={() => onOptionClick(opcion)}
          className="w-full text-left px-4 py-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          {opcion}
        </button>
      ))}
    </div>
  </div>
);

// NUEVA TARJETA para mostrar horarios de forma ordenada
const HorariosCard = ({ titulo, dias, onOptionClick }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
    <p className="text-sm font-medium text-gray-800">{titulo}</p>
    {dias.map((diaInfo) => (
      <div
        key={diaInfo.fecha_completa}
        className="bg-gray-50 rounded-lg p-3 border border-gray-100"
      >
        <div className="flex items-center mb-3">
          <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
          <strong className="text-sm font-semibold text-gray-900">
            {diaInfo.dia_semana} {diaInfo.dia_numero}
          </strong>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {diaInfo.horarios.map((hora) => (
            <button
              key={hora}
              onClick={() =>
                onOptionClick(`Para el ${diaInfo.fecha_completa} a las ${hora}`)
              }
              className="px-3 py-2 text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 rounded-md border border-green-200 transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95"
            >
              {hora}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Tarjeta para el resumen de confirmación de cita
const ConfirmacionCard = ({ titulo, detalles, onOptionClick }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
    <p className="text-sm font-medium text-gray-800">{titulo}</p>
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
      <ul className="space-y-2">
        {Object.entries(detalles).map(([key, value]) => (
          <li key={key} className="flex items-start">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium text-gray-900">{key}:</span>
              <span className="text-gray-700 ml-1">{value}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={() => onOptionClick("Sí")}
        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="font-medium">Sí, agendar</span>
      </button>
      <button
        onClick={() => onOptionClick("No")}
        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="font-medium">No, cancelar</span>
      </button>
    </div>
  </div>
);

// --- Componente Principal que decide qué tarjeta mostrar ---
const BotMessage = ({ data, onOptionClick }) => {
  if (typeof data === "string" || data.text) {
    const textToShow = (typeof data === "string" ? data : data.text) || "";
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {textToShow}
        </p>
      </div>
    );
  }

  switch (data.tipo) {
    case "seleccion_simple":
      return (
        <OpcionesCard
          titulo={data.titulo}
          opciones={data.opciones}
          onOptionClick={onOptionClick}
        />
      );

    // NUEVO CASO para la lista de horarios
    case "lista_horarios":
      return (
        <HorariosCard
          titulo={data.titulo}
          dias={data.dias}
          onOptionClick={onOptionClick}
        />
      );

    case "confirmacion_cita":
      return (
        <ConfirmacionCard
          titulo={data.titulo}
          detalles={data.detalles}
          onOptionClick={onOptionClick}
        />
      );

    case "lista_citas":
      return <CitasCard titulo={data.titulo} citas={data.citas} />;

    default:
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 italic">
            {data.titulo || "No sé cómo mostrar esta respuesta."}
          </p>
        </div>
      );
  }
};

export default BotMessage;
