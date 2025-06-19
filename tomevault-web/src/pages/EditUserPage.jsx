// Admin page for editing user information with validation and proper error handling
import React, { useState, useEffect } from 'react';
import AdminUserService from '../services/AdminUserService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

const EditUserPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    birthDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // Show toast notification with auto-dismiss
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AdminUserService.getUserById(id);
        // Format birthDate for input (YYYY-MM-DD)
        const formattedDate = userData.birthDate ? userData.birthDate.split('T')[0] : '';
        setUser({
          ...userData,
          birthDate: formattedDate
        });
      } catch (err) {
        showToast('error', 'Error al cargar los datos del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    // Clear error if exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};

    if (!user.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (user.username.length < 3 || user.username.length > 20) {
      newErrors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres';
    }

    if (!user.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!user.firstname.trim()) {
      newErrors.firstname = 'El nombre es requerido';
    }

    if (!user.lastname.trim()) {
      newErrors.lastname = 'El apellido es requerido';
    }

    if (user.birthDate && new Date(user.birthDate) >= new Date()) {
      newErrors.birthDate = 'La fecha de nacimiento debe ser en el pasado';
    }

    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await AdminUserService.updateUser(id, user);
      showToast('success', 'Usuario actualizado correctamente');
      // Redirect after 2 seconds
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (err) {
      const errorText = err.message || 'Error al actualizar el usuario';
      showToast('error', errorText);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 lg:mb-8 text-center px-2 leading-tight">
          Editar Usuario
        </h2>

        {/* Toast notification - appears in top right corner */}
        {toast && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in max-w-md ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-6 w-6 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base font-medium">{toast.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Username */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Nombre de Usuario <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Nombre(s) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={user.firstname}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.firstname ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.firstname && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.firstname}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Apellido(s) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={user.lastname}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.lastname ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.lastname && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.lastname}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Fecha de Nacimiento <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={user.birthDate}
                onChange={handleChange}
                className={`w-full p-2 sm:p-3 text-sm bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.birthDate}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base order-1 sm:order-2"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditUserPage;