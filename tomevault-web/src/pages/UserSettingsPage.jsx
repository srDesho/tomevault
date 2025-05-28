import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changePassword } from '../services/UserService';
import { isAuthenticated } from '../services/AuthService';

const UserSettingsPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    birthDate: '',
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // Cargar el perfil del usuario al montar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuth) {
        setMessage({ type: 'error', text: 'No estás autenticado.' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setMessage({ type: '', text: '' });
        const data = await getUserProfile();
        setUserProfile(data);
        setProfileFormData({
          username: data.username || '',
          email: data.email || '',
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          address: data.address || '',
          birthDate: data.birthDate || '',
        });
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.message || 'Error al cargar el perfil.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuth]);

  // Manejar cambios en el formulario de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar el formulario de actualización de perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validaciones frontend (opcional pero recomendado)
    if (!profileFormData.firstname.trim()) {
      setMessage({ type: 'error', text: 'El nombre es obligatorio.' });
      return;
    }
    if (!profileFormData.lastname.trim()) {
      setMessage({ type: 'error', text: 'El apellido es obligatorio.' });
      return;
    }
    if (!profileFormData.birthDate) {
      setMessage({ type: 'error', text: 'La fecha de nacimiento es obligatoria.' });
      return;
    }
    if (new Date(profileFormData.birthDate) > new Date()) {
      setMessage({ type: 'error', text: 'La fecha de nacimiento no puede ser futura.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const response = await updateUserProfile(profileFormData);
      setMessage({ type: 'success', text: response.message });
      setUserProfile((prev) => ({ ...prev, ...profileFormData }));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al actualizar el perfil.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar el formulario de cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const response = await changePassword(passwordFormData);
      setMessage({ type: 'success', text: response.message });
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al cambiar la contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga inicial
  if (loading && !userProfile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <svg
          className="animate-spin -ml-1 mr-3 h-10 w-10 text-white"
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
        <span className="text-white text-lg">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center drop-shadow-lg">
        Ajustes del Usuario
      </h2>

      {/* Mensaje de estado */}
      {message.text && (
        <div
          className={`p-4 rounded-lg text-center mb-6 max-w-2xl mx-auto shadow-md ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white transition-opacity duration-300 opacity-100`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Formulario: Actualizar Perfil */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-white text-center">
            Actualizar Perfil
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-300">
                Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileFormData.username}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="Tu nombre de usuario"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileFormData.email}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="firstname" className="block text-sm font-medium mb-2 text-gray-300">
                Nombre(s)
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={profileFormData.firstname}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="Juan"
              />
            </div>

            <div>
              <label htmlFor="lastname" className="block text-sm font-medium mb-2 text-gray-300">
                Apellido(s)
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={profileFormData.lastname}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="Pérez"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2 text-gray-300">
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileFormData.address}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="Calle Falsa 123"
              />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium mb-2 text-gray-300">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={profileFormData.birthDate}
                onChange={handleProfileChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Formulario: Cambiar Contraseña */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-white text-center">
            Cambiar Contraseña
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium mb-2 text-gray-300"
              >
                Contraseña Actual
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordFormData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="••••••"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-gray-300">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordFormData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2 text-gray-300"
              >
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordFormData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;