import React from 'react';
import { 
  BookOpenIcon, 
  ShieldCheckIcon,
  CodeIcon,
  HeartIcon,
  UserGroupIcon,
  DatabaseIcon,
  ServerIcon,
  ChartBarIcon,
  CollectionIcon
} from '@heroicons/react/outline';

const AboutPage = () => {
  // Features array for the main feature cards
  const features = [
    {
      icon: BookOpenIcon,
      title: "Contador de Lecturas", 
      description: "Registra cuántas veces has leído cada libro y lleva un seguimiento de tu progreso."
    },
    {
      icon: ChartBarIcon,
      title: "Estadísticas Básicas",
      description: "Visualiza qué libros has leído más veces en tu colección personal."
    },
    {
      icon: ShieldCheckIcon,
      title: "Seguridad",
      description: "Tus datos están protegidos con autenticación JWT y Spring Security."
    },
    {
      icon: CollectionIcon,
      title: "Biblioteca Personal", 
      description: "Organiza todos tus libros en una colección privada y accesible."
    }
  ];

  // Technology stack array for the tech grid
  const techStack = [
    { name: "Java + Spring Boot", category: "Backend" },
    { name: "Spring Security", category: "Seguridad" },
    { name: "PostgreSQL", category: "Base de Datos" },
    { name: "JWT", category: "Autenticación" },
    { name: "React", category: "Frontend" },
    { name: "Tailwind CSS", category: "Estilos" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero section with background gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Acerca de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                TomeVault
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Tu contador personal de lecturas. Registra, organiza y haz seguimiento de todos los libros 
              que has leído y los que planeas leer. Más que una biblioteca, es tu historial lector.
            </p>
          </div>
        </div>
      </div>

      {/* Main features section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          ¿Qué puedes hacer con TomeVault?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105"
            >
              <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Project details and tech stack section */}
      <div className="bg-gray-800/30 border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Project description */}
              <div className="flex items-center gap-3 mb-6">
                <CodeIcon className="h-8 w-8 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">El Proyecto</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  TomeVault nació como un proyecto personal para demostrar mis habilidades
                  como desarrollador Full Stack. Especialmente enfocado en el desarrollo backend
                  con Java y Spring Boot.
                </p>
                <p className="leading-relaxed">
                  La aplicación permite a los usuarios llevar un registro preciso de sus lecturas,
                  incrementando el contador cada vez que releen un libro y manteniendo un historial
                  completo de su journey lector.
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-medium">
                  <HeartIcon className="h-5 w-5" />
                  <span>Hecho con pasión por la tecnología y la lectura</span>
                </div>
              </div>
            </div>

            <div>
              {/* Technology stack grid */}
              <div className="flex items-center gap-3 mb-6">
                <UserGroupIcon className="h-8 w-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Stack Tecnológico</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {techStack.map((tech, index) => (
                  <div 
                    key={index}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <p className="text-white font-semibold">{tech.name}</p>
                    <p className="text-gray-400 text-sm">{tech.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer information section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
              C
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Cristian</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Desarrollador Backend especializado en Java y Spring Boot. 
              Apasionado por crear aplicaciones robustas y eficientes, 
              con un fuerte interés en la arquitectura de software y las mejores prácticas.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/srDesho"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Ver GitHub
              </a>
              <a
                href="mailto:cristianmo775@gmail.com"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          ¿Listo para comenzar a contar tus lecturas?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Únete a TomeVault y lleva el control de todos los libros que has leído 
          y los que tienes pendientes por descubrir.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Comenzar Ahora
        </a>
      </div>
    </div>
  );
};

export default AboutPage;