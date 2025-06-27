// Modern registration page with dark theme, proper sizing and zoom effect
// Matches the original white form dimensions with dark theme and hover animation
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CalendarDays, Home, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { register } from '../services/AuthService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    birthDate: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (message) {
      setMessage(null);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.username) {
      tempErrors.username = 'El nombre de usuario es requerido';
      isValid = false;
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      tempErrors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres';
      isValid = false;
    }

    if (!formData.email) {
      tempErrors.email = 'El correo electrónico es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'El correo electrónico no es válido';
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = 'La confirmación de contraseña es requerida';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!formData.firstname) {
      tempErrors.firstname = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.lastname) {
      tempErrors.lastname = 'El apellido es requerido';
      isValid = false;
    }

    if (formData.birthDate && new Date(formData.birthDate) >= new Date()) {
      tempErrors.birthDate = 'La fecha de nacimiento debe ser en el pasado';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});

    if (validate()) {
      setLoading(true);
      try {
        await register(formData);
        setMessage({ type: 'success', text: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado durante el registro.' });
      } finally {
        setLoading(false);
      }
    } else {
      setMessage({ type: 'error', text: 'Por favor, corrige los errores en el formulario.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-700 transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Crear una Cuenta
          </h2>
          <p className="mt-1 text-sm text-gray-400">Regístrate para empezar</p>
        </div>
        
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">Nombre de Usuario</label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                  errors.username ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Nombre de Usuario"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Correo Electrónico</label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Correo Electrónico"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-10 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-10 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirmar Contraseña"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstname" className="sr-only">Nombre</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstname}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                    errors.firstname ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Nombre"
                />
              </div>
              {errors.firstname && <p className="mt-1 text-xs text-red-400">{errors.firstname}</p>}
            </div>

            <div>
              <label htmlFor="lastname" className="sr-only">Apellido</label>
              <div className="relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastname}
                  onChange={handleChange}
                  className={`block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                    errors.lastname ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Apellido"
                />
              </div>
              {errors.lastname && <p className="mt-1 text-xs text-red-400">{errors.lastname}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="sr-only">Dirección</label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Home className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Dirección (Opcional)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="birthDate" className="sr-only">Fecha de Nacimiento</label>
            <div className="relative rounded-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className={`block w-full pl-9 pr-3 py-2 bg-gray-700 text-white border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
            </div>
            {errors.birthDate && <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>}
          </div>

          {message && (
            <div className={`p-3 rounded text-center text-sm ${
              message.type === 'success' 
                ? 'bg-green-900 bg-opacity-50 text-green-200' 
                : 'bg-red-900 bg-opacity-50 text-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}