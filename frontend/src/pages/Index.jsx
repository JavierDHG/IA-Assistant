import { Link } from "react-router-dom"

export default function DentalClinicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Tu Sonrisa, Nuestra <span className="text-blue-600">Pasión</span>
            </h1>
            <p className="mt-4 text-xl text-blue-600 font-medium">Odontología de Vanguardia en Bogotá</p>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              En Clínica Dental Vitalis, ofrecemos una experiencia dental integral para toda la familia, combinando la
              última tecnología con un trato cálido y humano. Recupera la confianza en tu sonrisa con nosotros.
            </p>
            <div className="mt-10">
              <Link to="/chat">
                <button className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Solicitar Cita Online
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Servicios Diseñados para Tu <span className="text-blue-600">Bienestar</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                image: "/images/Ortodoncia Invisible y Digital.png",
                title: "Ortodoncia Invisible y Digital",
                description:
                  "Alinea tus dientes de forma discreta y cómoda. Usamos tecnología de escaneo 3D para planificar tu tratamiento con precisión milimétrica.",
              },
              {
                image: "/images/Implantes Dentales.png",
                title: "Implantes Dentales",
                description:
                  "Recupera piezas perdidas con soluciones permanentes y de apariencia natural. Vuelve a comer y sonreír sin preocupaciones.",
              },
              {
                image: "/images/Diseño de Sonrisa.png",
                title: "Diseño de Sonrisa",
                description:
                  "Transformamos tu sonrisa. A través de carillas, blanqueamiento y contorneado, creamos la armonía perfecta para tu rostro.",
              },
              {
                image: "/images/Odontología General y Prevención.png",
                title: "Odontología General y Prevención",
                description:
                  "Desde limpiezas profesionales hasta el tratamiento de caries, cuidamos la salud de tu boca para prevenir problemas a futuro.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ¿Por Qué Elegir <span className="text-blue-600">Clínica Dental Vitalis</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔬",
                title: "Tecnología de Punta",
                description:
                  "Invertimos en la mejor tecnología, como radiografía digital de baja dosis y escáneres intraorales, para diagnósticos más precisos y tratamientos menos invasivos.",
              },
              {
                icon: "😌",
                title: "Confort y Cero Dolor",
                description:
                  "Nuestra prioridad es tu comodidad. Ofrecemos técnicas de sedación consciente y un ambiente relajante para que tu visita sea una experiencia tranquila y libre de ansiedad.",
              },
              {
                icon: "👨‍⚕️",
                title: "Equipo de Especialistas",
                description:
                  "Nuestro equipo está formado por odontólogos apasionados y especializados en cada área, garantizando que recibas el mejor tratamiento posible bajo un mismo techo.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Testimonios de Nuestros <span className="text-blue-600">Pacientes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start">
                <div className="text-blue-600 text-4xl mr-4">"</div>
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    El trato en Vitalis es increíble. La Dra. Rojas me explicó todo el proceso de mi implante con
                    paciencia y el resultado superó mis expectativas. ¡Totalmente recomendados!
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      A
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Ana M.</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start">
                <div className="text-green-600 text-4xl mr-4">"</div>
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    Llevé a mi hijo para su ortodoncia y no puedo estar más feliz. El sistema online para agendar y ver
                    las citas es súper fácil de usar y el personal es muy amable.
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      C
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">Carlos R.</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            ¿Listo para Transformar tu <span className="text-blue-200">Sonrisa</span>?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Tu primera cita de valoración es el paso más importante. Permítenos mostrarte cómo podemos ayudarte.
          </p>
          <Link to="/chat">
            <button className="inline-flex items-center px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              Solicitar Cita Online
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
