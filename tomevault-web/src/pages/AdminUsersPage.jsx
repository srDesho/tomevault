// This component manages the user administration page, allowing admins to view, search, 
// sort, activate/deactivate, reset password, and delete users.
// It uses the AdminUsersContext for search and pagination state persistence across navigation.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AdminUserService from '../services/AdminUserService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminUsersSearch } from '../context/AdminUsersContext';

// Icon imports
import { 
    PencilIcon as EditIcon, 
    EyeIcon, 
    EyeOffIcon, 
    TrashIcon, 
    LockClosedIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldExclamationIcon
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
    const [allUsers, setAllUsers] = useState([]);
    const [displayUsers, setDisplayUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);
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
    const [toggleStatusModal, setToggleStatusModal] = useState(null);
    
    const SEARCH_SIZE = 10;
    
    // Refs for behavior control
    const isInitialLoad = useRef(true);
    const previousSearchTerm = useRef(adminSearchTerm);

    // Permission management logic
    const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
    const isAdmin = currentUser?.roles?.includes('ADMIN');

    /**
     * Determines if the current user has permission to modify the target user
     * SUPER_ADMIN can modify any user
     * ADMIN can only modify users with USER role
     */
    const canModifyUser = (targetUser) => {
        // SUPER_ADMIN has full access to all users
        if (isSuperAdmin) {
            return true;
        }

        // Non-admin users cannot modify any users
        if (!isAdmin) {
            return false;
        }

        // ADMIN cannot modify other ADMIN or SUPER_ADMIN users
        const targetRoles = targetUser.roles || [];
        const isTargetAdminOrSuperAdmin = targetRoles.some(role => 
            role === 'ADMIN' || role === 'SUPER_ADMIN'
        );

        return !isTargetAdminOrSuperAdmin;
    };

    /**
     * Generates tooltip message explaining why a user cannot be modified
     */
    const getDisabledTooltip = (targetUser) => {
        if (!canModifyUser(targetUser)) {
            return "Los ADMIN no pueden modificar otros ADMIN o SUPER_ADMIN";
        }
        return "";
    };

    // Show toast notification with auto-dismiss
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // Load all users for local filtering and pagination (filters deleted users)
    const loadAllUsersForDisplay = useCallback(async () => {
        try {
            const allUsersData = await AdminUserService.getAllUsers(0, 1000, sortBy, sortDir);
            const users = allUsersData.content || [];
            const nonDeletedUsers = users.filter(user => !user.deleted);
            setAllUsers(nonDeletedUsers);
            return nonDeletedUsers;
        } catch (error) {
            console.error("Error loading all users:", error);
            setAllUsers([]);
            return [];
        }
    }, [sortBy, sortDir]);

    // Memoized filtering logic based on allUsers and the search term
    const filteredUsers = useMemo(() => {
        if (!adminSearchTerm.trim() || allUsers.length === 0) {
            return allUsers;
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

    // Initial data loading
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setScrollRestored(false);
            
            const allUsersData = await loadAllUsersForDisplay();
            
            if (isAdminSearchActive && adminSearchTerm) {
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
                const start = adminCurrentPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = allUsersData.slice(start, end);
                
                setDisplayUsers(paginatedResults);
                setTotalPages(Math.ceil(allUsersData.length / SEARCH_SIZE));
                setTotalElements(allUsersData.length);
            }
            
            isInitialLoad.current = false;
            setIsLoading(false);
        };
        
        loadInitialData();
    }, []);

    // Updates displayed users when filters or pagination states change
    useEffect(() => {
        if (!isInitialLoad.current && allUsers.length > 0) {
            if (isAdminSearchActive && adminSearchTerm) {
                const start = adminSearchPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = filteredUsers.slice(start, end);
                setDisplayUsers(paginatedResults);
                setTotalPages(Math.ceil(filteredUsers.length / SEARCH_SIZE));
                setTotalElements(filteredUsers.length);
                setIsLoading(false);
            } else if (!isAdminSearchActive) {
                const start = adminCurrentPage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                const paginatedResults = allUsers.slice(start, end);
                setDisplayUsers(paginatedResults);
                setTotalPages(Math.ceil(allUsers.length / SEARCH_SIZE));
                setTotalElements(allUsers.length);
            }
        }
    }, [
        adminSearchTerm,
        isAdminSearchActive,
        filteredUsers,
        allUsers,
        adminCurrentPage,
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
    
    // Handles changing the page number for both search and non-search views
    const handlePageChange = (newPage) => {
        if (isAdminSearchActive && adminSearchTerm) {
            setAdminSearchPage(newPage);
            const start = newPage * SEARCH_SIZE;
            const end = start + SEARCH_SIZE;
            const paginatedResults = filteredUsers.slice(start, end);
            setDisplayUsers(paginatedResults);
            window.scrollTo(0, 0);
        } else {
            setAdminCurrentPage(newPage);
            const start = newPage * SEARCH_SIZE;
            const end = start + SEARCH_SIZE;
            const paginatedResults = allUsers.slice(start, end);
            setDisplayUsers(paginatedResults);
            setHomeScrollPosition(0);
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
        
        loadAllUsersForDisplay();
    };

    // Navigation handler for user editing with permission check
    const handleEditUser = (user) => {
        if (!canModifyUser(user)) {
            showToast('error', 'No tienes permisos para editar este usuario.');
            return;
        }
        navigate(`/admin/users/${user.id}/edit`);
    };

    // Opens the reset password modal with permission check
    const handleResetPassword = (user) => {
        if (!canModifyUser(user)) {
            showToast('error', 'No tienes permisos para restablecer la contraseña de este usuario.');
            return;
        }
        setResetPasswordModal(user.id);
        setNewPassword('');
        setPasswordError('');
    };

    // Opens the toggle status confirmation modal with permission check
    const handleToggleStatusClick = (user) => {
        if (!canModifyUser(user)) {
            showToast('error', 'No tienes permisos para cambiar el estado de este usuario.');
            return;
        }
        setToggleStatusModal(user);
    };

    // Handles delete click with permission check
    const handleDeleteClick = (user) => {
        if (!canModifyUser(user)) {
            showToast('error', 'No tienes permisos para eliminar este usuario.');
            return;
        }
        setDeleteConfirmModal(user.id);
    };

    // Toggles the 'enabled' status of a user (activate/deactivate) after confirmation
    const confirmToggleStatus = async () => {
        if (!toggleStatusModal) return;

        const user = toggleStatusModal;
        const newEnabledStatus = !user.enabled;
        
        try {
            await AdminUserService.toggleUserStatus(user.id, newEnabledStatus);
            
            const updateState = (prev) => 
                prev.map(u => u.id === user.id ? { ...u, enabled: newEnabledStatus } : u);

            setAllUsers(updateState);
            setDisplayUsers(updateState);
            
            showToast('success', `Usuario ${newEnabledStatus ? 'activado' : 'desactivado'} correctamente.`);
        } catch (err) {
            showToast('error', 'Error al actualizar estado del usuario.');
        } finally {
            setToggleStatusModal(null);
        }
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
            showToast('success', 'Contraseña restablecida.');
            setNewPassword('');
            setPasswordError('');
        } catch (err) {
            const errorText = err.message || 'Error al restablecer contraseña.';
            showToast('error', errorText);
        }

        setResetPasswordModal(null);
    };

    // Soft deletes a user and reloads data to maintain proper pagination
    const handleSoftDelete = async (userId) => {
        try {
            await AdminUserService.deleteUser(userId);
            
            const updatedAllUsers = await loadAllUsersForDisplay();
            
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
                const totalUsers = updatedAllUsers.length;
                const newTotalPages = Math.ceil(totalUsers / SEARCH_SIZE);
                const safePage = Math.min(adminCurrentPage, Math.max(0, newTotalPages - 1));
                
                if (safePage !== adminCurrentPage) {
                    setAdminCurrentPage(safePage);
                }
                
                const start = safePage * SEARCH_SIZE;
                const end = start + SEARCH_SIZE;
                setDisplayUsers(updatedAllUsers.slice(start, end));
                setTotalPages(newTotalPages);
                setTotalElements(totalUsers);
            }
            
            showToast('success', 'Usuario eliminado correctamente.');
        } catch (err) {
            showToast('error', 'Error al eliminar usuario.');
        }
        setDeleteConfirmModal(null);
    };

    // Generates the user count text for the header
    const getUserCountText = () => {
        if (isAdminSearchActive && adminSearchTerm) {
            const total = filteredUsers.length;
            const start = adminSearchPage * SEARCH_SIZE + 1;
            const end = Math.min((adminSearchPage + 1) * SEARCH_SIZE, total);
            return `${start}-${end} de ${total} usuarios encontrados`;
        }
        const start = adminCurrentPage * SEARCH_SIZE + 1;
        const end = Math.min((adminCurrentPage + 1) * SEARCH_SIZE, totalElements);
        return `${start}-${end} de ${totalElements} usuarios en total`;
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

            {/* Toast notification */}
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
                                {displayUsers.map((user) => {
                                    const canModify = canModifyUser(user);
                                    const disabledTooltip = getDisabledTooltip(user);
                                    
                                    return (
                                        <tr
                                            key={user.id}
                                            className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${
                                                !canModify ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <td className="p-3">{user.id}</td>
                                            <td className="p-3">
  <div className="flex items-center gap-2">
    {user.username}
    {!canModify && (
      <LockClosedIcon 
        className="h-4 w-4 text-yellow-400" 
        title={disabledTooltip}
      />
    )}
  </div>
</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map((role, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                role === 'SUPER_ADMIN' ? 'bg-red-600 text-white' :
                                                                role === 'ADMIN' ? 'bg-orange-600 text-white' :
                                                                'bg-blue-600 text-white'
                                                            }`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
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
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={!canModify}
                                                    className={`p-1 rounded transition ${
                                                        canModify
                                                            ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                                                            : 'text-gray-600 cursor-not-allowed'
                                                    }`}
                                                    title={canModify ? 'Editar' : disabledTooltip}
                                                >
                                                    <EditIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user)}
                                                    disabled={!canModify}
                                                    className={`p-1 rounded transition ${
                                                        canModify
                                                            ? 'text-yellow-400 hover:text-yellow-300 cursor-pointer'
                                                            : 'text-gray-600 cursor-not-allowed'
                                                    }`}
                                                    title={canModify ? 'Restablecer contraseña' : disabledTooltip}
                                                >
                                                    <LockClosedIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatusClick(user)}
                                                    disabled={!canModify}
                                                    className={`p-1 rounded transition ${
                                                        canModify
                                                            ? user.enabled 
                                                                ? 'text-red-400 hover:text-red-300 cursor-pointer'
                                                                : 'text-green-400 hover:text-green-300 cursor-pointer'
                                                            : 'text-gray-600 cursor-not-allowed'
                                                    }`}
                                                    title={
                                                        canModify 
                                                            ? (user.enabled ? 'Desactivar' : 'Activar')
                                                            : disabledTooltip
                                                    }
                                                >
                                                    {user.enabled ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                                                </button>

                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        disabled={!canModify}
                                                        className={`p-1 rounded transition ${
                                                            canModify
                                                                ? 'text-red-400 hover:text-red-300 cursor-pointer'
                                                                : 'text-gray-600 cursor-not-allowed'
                                                        }`}
                                                        title={canModify ? 'Eliminar usuario' : disabledTooltip}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
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
                                className={`w-full p-2 sm:p-3 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
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
                                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base order-2 sm:order-1"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setResetPasswordModal(null)}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Toggle Status */}
            {toggleStatusModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
                        <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2 break-words">
                            {toggleStatusModal.enabled ? 'Desactivar Usuario' : 'Activar Usuario'}
                        </h3>
                        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                            ¿Estás seguro de {toggleStatusModal.enabled ? 'desactivar' : 'activar'} al usuario 
                            <strong> "{toggleStatusModal.username}"</strong>?
                            {toggleStatusModal.enabled 
                                ? ' El usuario no podrá acceder al sistema hasta que sea reactivado.' 
                                : ' El usuario podrá acceder al sistema nuevamente.'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <button
                                onClick={confirmToggleStatus}
                                className={`${
                                    toggleStatusModal.enabled 
                                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                                        : 'bg-green-500 hover:bg-green-600'
                                } text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base order-2 sm:order-1`}
                            >
                                Sí, {toggleStatusModal.enabled ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                                onClick={() => setToggleStatusModal(null)}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Confirm Soft Delete */}
            {deleteConfirmModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-2xl max-w-sm w-full text-center mx-2 border border-gray-700">
                        <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2 break-words">Eliminar Usuario</h3>
                        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base break-words">
                            ¿Estás seguro de eliminar a este usuario? 
                            El usuario será desactivado y no aparecerá en las listas normales.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                            <button
                                onClick={() => handleSoftDelete(deleteConfirmModal)}
                                className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-600 transition text-sm sm:text-base order-2 sm:order-1"
                            >
                                Sí, Eliminar
                            </button>
                            <button
                                onClick={() => setDeleteConfirmModal(null)}
                                className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base order-1 sm:order-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default AdminUsersPage;