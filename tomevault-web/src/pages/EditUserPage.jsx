import React, { useState, useEffect } from 'react';
import AdminUserService from '../services/AdminUserService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AdminUserService.getUserById(id);
        // Formatear birthDate para el input (YYYY-MM-DD)
        const formattedDate = userData.birthDate ? userData.birthDate.split('T')[0] : '';
        setUser({
          ...userData,
          birthDate: formattedDate
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Error loading user data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validación del formulario
  const validate = () => {
    const newErrors = {};

    if (!user.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (user.username.length < 3 || user.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters.';
    }

    if (!user.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Email must be valid.';
    }

    if (!user.firstname.trim()) {
      newErrors.firstname = 'First name is required.';
    }

    if (!user.lastname.trim()) {
      newErrors.lastname = 'Last name is required.';
    }

    if (user.birthDate && new Date(user.birthDate) >= new Date()) {
      newErrors.birthDate = 'Birth date must be in the past.';
    }

    return newErrors;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await AdminUserService.updateUser(id, user);
      setMessage({ type: 'success', text: 'User updated successfully.' });
      // Redirigir después de 2 segundos
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (err) {
      const errorText = err.message || 'Failed to update user.';
      setMessage({ type: 'error', text: errorText });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center">
        Edit User
      </h2>

      {/* Mensaje de éxito/error */}
      {message.text && (
        <div className={`p-4 rounded-lg text-center mb-6 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-500 ring-red-500' : 'border-gray-600'
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 ring-red-500' : 'border-gray-600'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstname"
              value={user.firstname}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.firstname ? 'border-red-500 ring-red-500' : 'border-gray-600'
              }`}
            />
            {errors.firstname && (
              <p className="mt-1 text-sm text-red-400">{errors.firstname}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastname"
              value={user.lastname}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.lastname ? 'border-red-500 ring-red-500' : 'border-gray-600'
              }`}
            />
            {errors.lastname && (
              <p className="mt-1 text-sm text-red-400">{errors.lastname}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={user.address}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date *
            </label>
            <input
              type="date"
              name="birthDate"
              value={user.birthDate}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.birthDate ? 'border-red-500 ring-red-500' : 'border-gray-600'
              }`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-400">{errors.birthDate}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;