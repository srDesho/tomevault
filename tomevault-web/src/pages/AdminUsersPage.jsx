import React, { useState, useEffect } from 'react';
import AdminUserService from '../services/AdminUserService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Iconos válidos
import { 
  PencilIcon as EditIcon, 
  EyeIcon, 
  EyeOffIcon, 
  TrashIcon, 
  RefreshIcon, 
  LockClosedIcon, 
  XIcon,
  SearchIcon 
} from '@heroicons/react/outline';

// Importa el componente Pagination usado en HomePage
import Pagination from '../components/common/Pagination';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // ← Nuevo estado
  const [size] = useState(10); // ← Este es itemsPerPage
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const navigate = useNavigate();

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

  const fetchUsers = async (pageNum = 0) => {
    try {
      setLoading(true);
      const response = searchQuery
        ? await AdminUserService.searchUsers(searchQuery, pageNum, size, sortBy, sortDir)
        : await AdminUserService.getAllUsers(pageNum, size, sortBy, sortDir);

      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0); // ← Asegúrate de que tu API lo devuelve
      setPage(response.number || 0);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar usuarios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, [searchQuery, sortBy, sortDir]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setPage(0);
    fetchUsers(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchUsers(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchUsers(newPage);
  };

  const handleToggleStatus = async (user) => {
    try {
      await AdminUserService.toggleUserStatus(user.id, !user.enabled);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, enabled: !u.enabled } : u))
      );
      setMessage({ type: 'success', text: `Estado de ${user.username} actualizado.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al actualizar estado.' });
    }
  };

  const handleEditUser = (id) => {
    navigate(`/admin/users/${id}/edit`);
  };

  const handleResetPassword = (id) => {
    setResetPasswordModal(id);
    setNewPassword('');
    setPasswordError('');
  };

  const validatePassword = (password) => {
    const errors = [];
    if (!password) errors.push('La contraseña no puede estar vacía');
    if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('La contraseña debe contener al menos una letra mayúscula');
    if (!/[a-z]/.test(password)) errors.push('La contraseña debe contener al menos una letra minúscula');
    if (!/[0-9]/.test(password)) errors.push('La contraseña debe contener al menos un número');
    return errors;
  };

  const confirmResetPassword = async () => {
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setPasswordError(errors.join(', '));
      return;
    }

    try {
      await AdminUserService.resetUserPassword(resetPasswordModal, newPassword);
      setMessage({ type: 'success', text: 'Contraseña restablecida.' });
      setNewPassword('');
      setPasswordError('');
    } catch (err) {
      const errorText = err.message || 'Error al restablecer contraseña.';
      setMessage({ type: 'error', text: errorText });
    }

    setResetPasswordModal(null);
  };

  const confirmHardDelete = async () => {
    try {
      await AdminUserService.deleteUser(deleteConfirmModal);
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmModal));
      setMessage({ type: 'success', text: 'Usuario eliminado permanentemente.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar usuario.' });
    }
    setDeleteConfirmModal(null);
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 text-center">
        Gestión de Usuarios
      </h2>

      {/* Mensajes */}
      {message.text && (
        <div
          className={`p-4 rounded-lg text-center mb-6 ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {message.text}
        </div>
      )}

      {/* Búsqueda */}
      <div className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-1"
          >
            <SearchIcon className="h-4 w-4" />
            Buscar
          </button>
          {isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold flex items-center gap-1"
            >
              <RefreshIcon className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg shadow-lg text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID {sortBy === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('username')}
              >
                Usuario {sortBy === 'username' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {sortBy === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-3 text-left">Roles</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.roles?.join(', ') || 'USER'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.enabled ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {user.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 space-x-1">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-400 hover:text-blue-300 p-1 rounded transition"
                      title="Editar"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-yellow-400 hover:text-yellow-300 p-1 rounded transition"
                      title="Restablecer contraseña"
                    >
                      <LockClosedIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`p-1 rounded transition ${
                        user.enabled ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                      }`}
                      title={user.enabled ? 'Desactivar' : 'Activar'}
                    >
                      {user.enabled ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                    </button>

                    {isSuperAdmin && (
                      <button
                        onClick={() => setDeleteConfirmModal(user.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded transition"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación igual a HomePage */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalElements}
          itemsPerPage={size}
          itemName="usuario"
        />
      </div>

      {/* Modal: Restablecer contraseña */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-4">Restablecer Contraseña</h3>
            <p className="text-gray-300 mb-6">Ingresa una nueva contraseña para el usuario.</p>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ingrese nueva contraseña"
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmResetPassword}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => setResetPasswordModal(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación permanente */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-4">Eliminar Usuario</h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de eliminar permanentemente a este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmHardDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;