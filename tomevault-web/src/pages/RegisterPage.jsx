import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CalendarDays, Home, ShieldCheck } from 'lucide-react';
import { register } from '../services/AuthService'; // Import the new register function

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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // New state for loading
  const [message, setMessage] = useState(null); // New state for success/error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear messages when input changes
    if (message) {
      setMessage(null);
    }
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

    // Optional: Only validate birthDate if it's provided. If not provided, it's fine.
    if (formData.birthDate && new Date(formData.birthDate) >= new Date()) {
      tempErrors.birthDate = 'La fecha de nacimiento debe ser en el pasado';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => { // Mark function as async
    e.preventDefault();
    setMessage(null); // Clear any previous messages
    setErrors({}); // Clear previous errors

    if (validate()) {
      setLoading(true); // Activate loading state
      try {
        // Call the register function from AuthService
        await register(formData);
        setMessage({ type: 'success', text: '¡Registro exitoso! Ahora puedes iniciar sesión.' });
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Wait 2 seconds before redirecting
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Ocurrió un error inesperado durante el registro.' });
        console.error('Error de registro:', error);
      } finally {
        setLoading(false); // Deactivate loading state
      }
    } else {
      console.log('Validation errors:', errors);
      setMessage({ type: 'error', text: 'Por favor, corrige los errores en el formulario.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Crear una Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">Regístrate para empezar</p>
        </div>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="sm:col-span-2">
            <label htmlFor="username" className="sr-only">Nombre de Usuario</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Nombre de Usuario"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby="username-error"
              />
            </div>
            {errors.username && <p id="username-error" className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label htmlFor="email" className="sr-only">Correo Electrónico</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Correo Electrónico"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby="email-error"
              />
            </div>
            {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Contraseña"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby="password-error"
              />
            </div>
            {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Confirmar Contraseña"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby="confirmPassword-error"
              />
            </div>
            {errors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="firstname" className="sr-only">Nombre</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="firstname"
                name="firstname"
                type="text"
                autoComplete="given-name"
                value={formData.firstname}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.firstname ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Nombre"
                aria-invalid={errors.firstname ? "true" : "false"}
                aria-describedby="firstname-error"
              />
            </div>
            {errors.firstname && <p id="firstname-error" className="mt-1 text-sm text-red-600">{errors.firstname}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastname" className="sr-only">Apellido</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="lastname"
                name="lastname"
                type="text"
                autoComplete="family-name"
                value={formData.lastname}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.lastname ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Apellido"
                aria-invalid={errors.lastname ? "true" : "false"}
                aria-describedby="lastname-error"
              />
            </div>
            {errors.lastname && <p id="lastname-error" className="mt-1 text-sm text-red-600">{errors.lastname}</p>}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="sr-only">Dirección</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Home className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                placeholder="Dirección (Opcional)"
                aria-invalid={errors.address ? "true" : "false"}
                aria-describedby="address-error"
              />
            </div>
            {errors.address && <p id="address-error" className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Birth Date */}
          <div className="sm:col-span-2">
            <label htmlFor="birthDate" className="sr-only">Fecha de Nacimiento</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900`}
                aria-invalid={errors.birthDate ? "true" : "false"}
                aria-describedby="birthDate-error"
              />
            </div>
            {errors.birthDate && <p id="birthDate-error" className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
          </div>

          {/* Display Messages */}
          {message && (
            <div className={`sm:col-span-2 p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="sm:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar'} {/* Change button text */}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}