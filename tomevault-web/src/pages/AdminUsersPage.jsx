// This component manages the user administration page, allowing admins to view, search, 
// sort, activate/deactivate, reset password, and delete users.
// It uses the AdminUsersContext for search and pagination state persistence across navigation.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AdminUserService from '../services/AdminUserService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminUsersSearch } from '../context/AdminUsersContext'; // Custom context for state persistence

// Icon imports
import { 
    PencilIcon as EditIcon, 
    EyeIcon, 
    EyeOffIcon, 
    TrashIcon, 
    LockClosedIcon, 
} from '@heroicons/react/outline';

// Import Pagination component
import Pagination from '../components/common/Pagination';

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // Consume the persistent state from AdminUsersContext
    const { 
        adminSearchTerm, 
        setAdminSearchTerm, 
        adminScrollPosition, 
        setAdminScrollPosition,
        isAdminSearchActive,
        setIsAdminSearchActive,
        clearAdminSearch,
        adminCurrentPage, 
        setAdminCurrentPage,
        adminSearchPage,
        setAdminSearchPage
    } = useAdminUsersSearch();
    
    // Core state management
    const [allUsers, setAllUsers] = useState([]); // All users for local search/filtering
    const [displayUsers, setDisplayUsers] = useState([]); // Users shown in the table
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [scrollRestored, setScrollRestored] = useState(false);
    
    // Admin-specific states
    const [sortBy, setSortBy] = useState('id');
    const [sortDir, setSortDir] = useState('asc');
    const [resetPasswordModal, setResetPasswordModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
    
    const SEARCH_SIZE = 10;
    
    // Refs for behavior control
    const isInitialLoad = useRef(true);
    const previousSearchTerm = useRef(adminSearchTerm);

    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

    // Load users in a paginated way (used for non-search view)
    const loadUsersPaginated = useCallback(async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await AdminUserService.getAllUsers(page, SEARCH_SIZE, sortBy, sortDir);
            setDisplayUsers(response.content || []);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Error loading users:", error);
            setDisplayUsers([]);
            setMessage({ type: 'error', text: 'Error al cargar usuarios.' });
        } finally {
            setIsLoading(false);
        }
    }, [sortBy, sortDir]);

    // Load all users for local search/filtering capability
    const loadAllUsersForSearch = useCallback(async () => {
        try {
            // Fetch a large enough number of users to cover most admin scenarios for local filtering
            const allUsersData = await AdminUserService.getAllUsers(0, 1000, sortBy, sortDir); 
            const users = allUsersData.content || [];
            setAllUsers(users);
            return users;
        } catch (error) {
            console.error("Error loading all users for search:", error);
            setAllUsers([]);
            return [];
        }
    }, [sortBy, sortDir]);

    // Memoized filtering logic based on allUsers and the search term
    const filteredUsers = useMemo(() => {
        if (!adminSearchTerm.trim() || allUsers.length === 0) {
            return [];
        }

        const lowerCaseSearchTerm = adminSearchTerm.toLowerCase();

        return allUsers.filter(user =>
            user.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
            (user.roles && user.roles.some(role => 
                role.toLowerCase().includes(lowerCaseSearchTerm)
            ))
        );
    }, [allUsers, adminSearchTerm]);

    // --- Context Synchronization and Effects (similar to HomePage) ---

    // Effect to detect when search is active
    useEffect(() => {
        setIsAdminSearchActive(adminSearchTerm.trim().length > 0);
    }, [adminSearchTerm, setIsAdminSearchActive]);

    // Effect to reset search page when the search term changes
    useEffect(() => {
        if (!isInitialLoad.current && isAdminSearchActive && adminSearchTerm !== previousSearchTerm.current) {
            setAdminSearchPage(0);
        }
        previousSearchTerm.current = adminSearchTerm;
    }, [adminSearchTerm, isAdminSearchActive, setAdminSearchPage]);

    // Effect to save scroll position
    useEffect(() => {
        let scrollTimer;
        const handleScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                setAdminScrollPosition(window.scrollY);
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
        };
    }, [setAdminScrollPosition]);

    // Initial data loading (combines pagination and search setup)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setScrollRestored(false);
            
            // Load all users first to handle potential persistent search state
            const allUsersData = await loadAllUsersForSearch();
            
            if (isAdminSearchActive && adminSearchTerm) {
                // Manually filter and paginate the initial search results
                const currentFilteredUsers = allUsersData.filter(user =>
                    user.username?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                    (user.roles && user.roles.some(role => 
                        role.toLowerCase().includes(adminSearchTerm.toLowerCase())
                    ))
                );

                const start = adminSearchPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = currentFilteredUsers.slice(start, end);

                setDisplayUsers(paginatedResults);
                setTotalPages(Math.ceil(currentFilteredUsers.length / SEARCH_SIZE));
                setTotalElements(currentFilteredUsers.length);
            } else {
                // Load regular paginated data
                await loadUsersPaginated(adminCurrentPage);
            }
            
            isInitialLoad.current = false;
            // The final setIsLoading(false) is handled inside loadUsersPaginated for the non-search case,
            // but we need it here for the search case.
            if (!(isAdminSearchActive && adminSearchTerm)) setIsLoading(false);
        };
        
        loadInitialData();
    }, []); // Run only once on mount

    // Updates displayed users when filters or pagination states change
    useEffect(() => {
        if (!isInitialLoad.current) {
            if (isAdminSearchActive && adminSearchTerm) {
                const start = adminSearchPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = filteredUsers.slice(start, end);
                setDisplayUsers(paginatedResults);
                setTotalPages(Math.ceil(filteredUsers.length / SEARCH_SIZE));
                setTotalElements(filteredUsers.length);
                setIsLoading(false); // Stop loading after local filtering/pagination
            } else if (!isAdminSearchActive) {
                // Only reload paginated data if the view switches back to non-search
                loadUsersPaginated(adminCurrentPage);
            }
        }
    }, [
        adminSearchTerm,
        isAdminSearchActive,
        filteredUsers,
        adminCurrentPage,
        loadUsersPaginated,
        adminSearchPage
    ]);

    // Restores scroll position after loading
    useEffect(() => {
        if (!isLoading && displayUsers.length > 0 && adminScrollPosition > 0 && !scrollRestored) {
            const restoreScroll = () => {
                const targetPosition = Math.min(adminScrollPosition, document.body.scrollHeight - window.innerHeight);
                if (targetPosition >= 0) {
                    window.scrollTo({ top: targetPosition, behavior: 'instant' });
                    setScrollRestored(true);
                }
            };

            const timer = setTimeout(restoreScroll, 50);
            return () => clearTimeout(timer);
        }
    }, [isLoading, displayUsers.length, adminScrollPosition, scrollRestored]);
    
    // --- Handlers for Page Functionality ---

    // Handles changing the page number for both search and non-search views
    const handlePageChange = (newPage) => {
        if (isAdminSearchActive && adminSearchTerm) {
            setAdminSearchPage(newPage);
            // Filtering and setting displayUsers is handled by the useEffect above
            window.scrollTo(0, 0);
        } else {
            setAdminCurrentPage(newPage);
            loadUsersPaginated(newPage);
            setAdminScrollPosition(0);
            setScrollRestored(true);
            window.scrollTo(0, 0);
        }
    };

    // Handles sorting table columns
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        // Force reload paginated users or update allUsers for search, which triggers dependent effects
        if (!isAdminSearchActive) {
            // If not searching, just reload current page with new sort
            loadUsersPaginated(adminCurrentPage); 
        } else {
            // If searching, reload all users for search with new sort
            // This will trigger the filtering/pagination logic in the useEffect
            loadAllUsersForSearch();
        }
    };

    // Toggles the 'enabled' status of a user (activate/deactivate)
    const handleToggleStatus = async (user) => {
        try {
            await AdminUserService.toggleUserStatus(user.id, !user.enabled);
            
            // Update the user's status in local state (both allUsers and displayUsers)
            const updateState = (prev) => 
                prev.map(u => u.id === user.id ? { ...u, enabled: !user.enabled } : u);

            setAllUsers(updateState);
            setDisplayUsers(updateState);
            
            setMessage({ type: 'success', text: `Estado de ${user.username} actualizado.` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al actualizar estado.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    // Navigation handler for user editing
    const handleEditUser = (id) => {
        navigate(`/admin/users/${id}/edit`);
    };

    // Opens the reset password modal
    const handleResetPassword = (id) => {
        setResetPasswordModal(id);
        setNewPassword('');
        setPasswordError('');
    };

    // Validation logic for the new password
    const validatePassword = (password) => {
        const errors = [];
        if (!password) errors.push('La contraseña no puede estar vacía');
        if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
        if (!/[A-Z]/.test(password)) errors.push('La contraseña debe contener al menos una letra mayúscula');
        if (!/[a-z]/.test(password)) errors.push('La contraseña debe contener al menos una letra minúscula');
        if (!/[0-9]/.test(password)) errors.push('La contraseña debe contener al menos un número');
        return errors;
    };

    // Submits the new password for the user
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
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            const errorText = err.message || 'Error al restablecer contraseña.';
            setMessage({ type: 'error', text: errorText });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }

        setResetPasswordModal(null);
    };

    // Permanently deletes a user (only for SUPER_ADMIN)
    const confirmHardDelete = async () => {
        try {
            await AdminUserService.deleteUser(deleteConfirmModal);
            
            // Update allUsers in local state
            const updatedAllUsers = allUsers.filter(u => u.id !== deleteConfirmModal);
            setAllUsers(updatedAllUsers);
            
            // Recalculate pagination for search results (similar to HomePage book deletion)
            if (isAdminSearchActive && adminSearchTerm) {
                const newFiltered = updatedAllUsers.filter(user =>
                    user.username?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                    (user.roles && user.roles.some(role => 
                        role.toLowerCase().includes(adminSearchTerm.toLowerCase())
                    ))
                );
                const totalFiltered = newFiltered.length;
                const newTotalPages = Math.ceil(totalFiltered / SEARCH_SIZE);
                // Adjust current page if the last item on the current page was deleted
                const safePage = Math.min(adminSearchPage, Math.max(0, newTotalPages - 1));
                
                if (safePage !== adminSearchPage) {
                    setAdminSearchPage(safePage);
                }

                const start = safePage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                setDisplayUsers(newFiltered.slice(start, end));
                setTotalPages(newTotalPages);
                setTotalElements(totalFiltered);
            } else {
                // If not in search, simply reload the current page
                await loadUsersPaginated(adminCurrentPage);
            }
            
            setMessage({ type: 'success', text: 'Usuario eliminado permanentemente.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al eliminar usuario.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
        setDeleteConfirmModal(null);
    };

    // Generates the user count text for the header (similar to HomePage)
    const getUserCountText = () => {
        if (isAdminSearchActive && adminSearchTerm) {
            const total = filteredUsers.length;
            const start = adminSearchPage * SEARCH_SIZE + 1;
            const end = Math.min((adminSearchPage + 1) * SEARCH_SIZE, total);
            return `${start}-${end} de ${total} usuarios encontrados`;
        }
        return `${totalElements} usuario${totalElements !== 1 ? 's' : ''} en total`;
    };

    if (isLoading && displayUsers.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 lg:mb-8 text-center px-2 leading-tight">
                <span className="block sm:inline break-words">Gestión de Usuarios</span>
                <span className="block text-sm sm:text-base lg:text-lg text-gray-300 mt-1 sm:mt-0 sm:ml-2 break-words">
                    ({getUserCountText()})
                </span>
                {isAdminSearchActive && adminSearchTerm && (
                    <span className="block text-xs sm:text-sm text-gray-400 mt-2 px-2 break-words">
                        Buscando: "{adminSearchTerm}"
                    </span>
                )}
            </h2>

            {/* Search Input Area */}
            <div className="mb-4 sm:mb-6 w-full max-w-full">
                <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="Buscar usuarios por nombre, email o rol..."
                    className="w-full max-w-full p-2 sm:p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                {adminSearchTerm && (
                    <button
                        onClick={clearAdminSearch}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                    >
                        Limpiar búsqueda y ver todos
                    </button>
                )}
            </div>

            {/* Messages */}
            {message.text && (
                <div className={`p-3 sm:p-4 rounded-lg text-center mb-3 sm:mb-4 mx-2 text-sm sm:text-base ${
                    message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                } text-white break-words`}>
                    {message.text}
                </div>
            )}

            {isLoading && displayUsers.length === 0 ? (
                <LoadingSpinner />
            ) : displayUsers.length > 0 ? (
                <>
                    {/* Users Table */}
                    <div className="overflow-x-auto mb-4">
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
                                {displayUsers.map((user) => (
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
                                        <td className="p-3 space-x-1 flex items-center">
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
                                                    title="Eliminar permanentemente"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={isAdminSearchActive ? adminSearchPage : adminCurrentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            totalItems={totalElements}
                            itemsPerPage={SEARCH_SIZE}
                            itemName="usuario"
                        />
                    )}
                </>
            ) : adminSearchTerm ? (
                // No search results
                <div className="py-8 sm:py-12 text-center px-2">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base break-words">
                            No se encontraron usuarios que coincidan con "{adminSearchTerm}"
                        </p>
                        <button
                            onClick={clearAdminSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
                        >
                            Ver todos los usuarios
                        </button>
                    </div>
                </div>
            ) : (
                // No users at all
                <div className="py-8 sm:py-12 text-center px-2">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg inline-block max-w-full">
                        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                            No hay usuarios registrados
                        </p>
                    </div>
                </div>
            )}

            {/* Modal: Reset Password */}
            {resetPasswordModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 break-words">Restablecer Contraseña</h3>
                        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                            Ingresa una nueva contraseña para el usuario.
                        </p>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2 text-left">
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
                                <p className="mt-2 text-sm text-red-400 break-words text-left">{passwordError}</p>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <button
                                onClick={confirmResetPassword}
                                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base order-2 sm:order-1"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setResetPasswordModal(null)}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Hard Delete */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2">
                        <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2 break-words">Eliminar Usuario</h3>
                        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                            ¿Estás seguro de eliminar **permanentemente** a este usuario? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <button
                                onClick={confirmHardDelete}
                                className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition text-sm sm:text-base order-2 sm:order-1"
                            >
                                Sí, Eliminar
                            </button>
                            <button
                                onClick={() => setDeleteConfirmModal(null)}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
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