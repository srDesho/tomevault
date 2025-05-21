import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../services/AuthService'; // Ensure this path is correct
import { User, Lock } from 'lucide-react'; // Import necessary icons

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handles the submission of the login form.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Calls the authentication service to log in.
      const success = await AuthService.login(username, password); // Using real AuthService
      
      if (success) {
        onLoginSuccess(); // Notifies the parent component (App) of success.
        navigate('/'); // Redirects the user to the homepage.
      } else {
        setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError(err.message || 'Ocurrió un error al iniciar sesión. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      {/* Added hover:scale-105 effect for zoom */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido de Nuevo</h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        {/* Displays error messages. */}
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">Usuario</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                // Added text-gray-900 to ensure text visibility when typing
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                // Added text-gray-900 to ensure text visibility when typing
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          {/* Submit button for the form. */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Regístrate ahora
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;