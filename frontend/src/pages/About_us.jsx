export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section - Our Story */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Nuestra <span className="text-blue-600">Historia</span>
            </h1>
            <p className="mt-4 text-xl text-blue-600 font-medium">Pasión por Crear Sonrisas Saludables</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                Clínica Dental Vitalis nació en <span className="font-semibold text-blue-600">2015</span> del sueño de
                la
                <span className="font-semibold"> Dra. Elena Rojas</span> de transformar la experiencia odontológica en
                Bogotá. Cansada del modelo tradicional, frío y a menudo intimidante, se propuso crear un espacio donde
                la excelencia médica y la calidez humana fueran de la mano.
              </p>
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-600">
                <p className="text-gray-800 font-medium text-lg italic">
                  "Nuestra misión es simple: ofrecer la mejor odontología posible de una forma ética, personalizada y
                  accesible. Creemos que una sonrisa sana es un pilar fundamental para la salud general y la
                  autoconfianza, y nos dedicamos cada día a cuidar la de nuestros pacientes como si fuera la nuestra."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Un Equipo de <span className="text-blue-600">Expertos</span> Dedicado a Ti
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Conoce a los profesionales que hacen posible tu mejor sonrisa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Dr. Elena Rojas */}
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <img
                      src="/images/Doc_1.png"
                      alt="Dra. Elena Rojas"
                      className="w-48 h-48 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Dra. Elena Rojas</h3>

                  <div className="mb-4">
                    <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-2">
                      Fundadora y Directora
                    </span>
                    <p className="text-blue-600 font-semibold">Especialista en Rehabilitación Oral e Implantes</p>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                      <span className="text-sm">Universidad Javeriana</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">Posgrado NYU</span>
                    </div>
                  </div>

                  <p className="mt-6 text-gray-700 leading-relaxed">
                    La Dra. Rojas es una apasionada por los casos complejos, devolviendo la función y la estética a
                    sonrisas que lo necesitan. Su mayor satisfacción es ver la confianza renovada de sus pacientes.
                  </p>
                </div>
              </div>
            </div>

            {/* Dr. Santiago Morales */}
            <div className="group bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <img
                      src="/images/Doc_2.png"
                      alt="Dr. Santiago Morales"
                      className="w-48 h-48 rounded-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Santiago Morales</h3>

                  <div className="mb-4">
                    <span className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-2">
                      Especialista en Ortodoncia Digital
                    </span>
                    <p className="text-green-600 font-semibold">Universidad Nacional de Colombia</p>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <span className="text-sm">Pionero en Alineadores Invisibles</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">Planificación Digital</span>
                    </div>
                  </div>

                  <p className="mt-6 text-gray-700 leading-relaxed">
                    El Dr. Morales lidera nuestra área de ortodoncia. Es pionero en el uso de alineadores invisibles y
                    planificación digital, ofreciendo tratamientos más rápidos, predecibles y cómodos para niños y
                    adultos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Instalaciones Pensadas para Tu <span className="text-blue-600">Comodidad</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Desde el momento en que entras a Vitalis, notarás la diferencia. Nuestros espacios están diseñados
                  para ser luminosos, modernos y relajantes.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Equipos de Última Generación</h3>
                      <p className="text-gray-600">Tecnología que hace los tratamientos más eficientes y cómodos</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Espacios Relajantes</h3>
                      <p className="text-gray-600">Áreas de espera diseñadas para tu tranquilidad y bienestar</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Ambientes Luminosos</h3>
                      <p className="text-gray-600">Diseño moderno que transmite calma y profesionalismo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src="/images/Instalaciones modernas de Clínica Dental Vitalis.png"
                    alt="Instalaciones modernas de Clínica Dental Vitalis"
                    className="rounded-xl shadow-lg object-cover w-full h-80"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
