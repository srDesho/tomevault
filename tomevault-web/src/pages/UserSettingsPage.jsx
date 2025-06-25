// This component provides a user settings page for updating profile information and changing the password.
// It consumes the HomeSearchContext to maintain state consistency across different pages.

import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changePassword } from '../services/UserService';
import { isAuthenticated } from '../services/AuthService';
import { useHomeSearch } from '../context/HomeSearchContext';
import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import { UserIcon, LockClosedIcon } from '@heroicons/react/outline';

const UserSettingsPage = () => {
    // Consume the context to keep it "alive" during navigation
    const { homeScrollPosition } = useHomeSearch(); 
    
    // State to hold the user's profile data
    const [userProfile, setUserProfile] = useState(null);
    const [profileFormData, setProfileFormData] = useState({
        username: '',
        email: '',
        firstname: '',
        lastname: '',
        address: '',
        birthDate: '',
    });

    // State for the password change form
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Field-level validation errors
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    // States for managing UI feedback and authentication status
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isAuth, setIsAuth] = useState(isAuthenticated());
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showProfileConfirm, setShowProfileConfirm] = useState(false);
    const [pendingProfileData, setPendingProfileData] = useState(null);

    // Debug log to confirm context state is preserved
    useEffect(() => {
        console.log('UserSettings - context preserved:', { homeScrollPosition });
    }, [homeScrollPosition]);

    // Fetch user profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuth) {
                showToast('error', 'No estás autenticado.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getUserProfile();
                setUserProfile(data);
                setProfileFormData({
                    username: data.username || '',
                    email: data.email || '',
                    firstname: data.firstname || '',
                    lastname: data.lastname || '',
                    address: data.address || '',
                    birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
                });
            } catch (err) {
                showToast('error', err.message || 'Error al cargar el perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [isAuth]);

    // Show toast notification with auto-dismiss
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // Handle profile form input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData((prev) => ({ ...prev, [name]: value }));
        if (profileErrors[name]) {
            setProfileErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validate profile form fields
    const validateProfileForm = () => {
        const errors = {};
        
        if (!profileFormData.firstname.trim()) {
            errors.firstname = 'El nombre es requerido';
        }
        
        if (!profileFormData.lastname.trim()) {
            errors.lastname = 'El apellido es requerido';
        }
        
        if (!profileFormData.birthDate) {
            errors.birthDate = 'La fecha de nacimiento es requerida';
        } else if (new Date(profileFormData.birthDate) > new Date()) {
            errors.birthDate = 'La fecha no puede ser futura';
        }
        
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) {
            return;
        }

        // Mostrar confirmación en lugar de enviar directamente
        setPendingProfileData(profileFormData);
        setShowProfileConfirm(true);
    };

    // Confirm profile update
    const confirmProfileUpdate = async () => {
        try {
            setLoading(true);
            const response = await updateUserProfile(pendingProfileData);
            showToast('success', response.message || 'Perfil actualizado correctamente');
            setUserProfile((prev) => ({ ...prev, ...pendingProfileData }));
            setShowProfileConfirm(false);
            setPendingProfileData(null);
        } catch (err) {
            showToast('error', err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    // Handle password form input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordFormData((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validate password form fields
    const validatePasswordForm = () => {
        const errors = {};
        
        if (!passwordFormData.currentPassword) {
            errors.currentPassword = 'La contraseña actual es requerida';
        }
        
        if (!passwordFormData.newPassword) {
            errors.newPassword = 'La nueva contraseña es requerida';
        } else if (passwordFormData.newPassword.length < 6) {
            errors.newPassword = 'Debe tener al menos 6 caracteres';
        }
        
        if (!passwordFormData.confirmPassword) {
            errors.confirmPassword = 'Debes confirmar la contraseña';
        } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle password form submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await changePassword(passwordFormData);
            showToast('success', response.message || 'Contraseña cambiada correctamente');
            setPasswordFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowPasswordModal(false);
        } catch (err) {
            showToast('error', err.message || 'Error al cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !userProfile) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white text-lg">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="w-full px-2 sm:px-4 max-w-full overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6 lg:mb-8 text-center px-2 leading-tight">
                    Ajustes del Usuario
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

                <div className="space-y-6">
                    {/* Profile information section */}
                    <section className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <UserIcon className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg sm:text-xl font-semibold text-white">Información Personal</h3>
                        </div>
                        
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="username" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Nombre de Usuario
                                    </label>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        name="username" 
                                        value={profileFormData.username} 
                                        onChange={handleProfileChange} 
                                        className="w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Correo Electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        value={profileFormData.email} 
                                        onChange={handleProfileChange} 
                                        className="w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstname" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Nombre(s) <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="firstname" 
                                        name="firstname" 
                                        value={profileFormData.firstname} 
                                        onChange={handleProfileChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            profileErrors.firstname ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                        disabled={loading}
                                    />
                                    {profileErrors.firstname && (
                                        <p className="text-red-400 text-xs mt-1">{profileErrors.firstname}</p>
                                    )}
                                </div>
                                
                                <div>
                                    <label htmlFor="lastname" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Apellido(s) <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="lastname" 
                                        name="lastname" 
                                        value={profileFormData.lastname} 
                                        onChange={handleProfileChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            profileErrors.lastname ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                        disabled={loading}
                                    />
                                    {profileErrors.lastname && (
                                        <p className="text-red-400 text-xs mt-1">{profileErrors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="address" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Dirección
                                    </label>
                                    <input 
                                        type="text" 
                                        id="address" 
                                        name="address" 
                                        value={profileFormData.address} 
                                        onChange={handleProfileChange} 
                                        className="w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="birthDate" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Fecha de Nacimiento <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        id="birthDate" 
                                        name="birthDate" 
                                        value={profileFormData.birthDate} 
                                        onChange={handleProfileChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            profileErrors.birthDate ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                                        disabled={loading}
                                    />
                                    {profileErrors.birthDate && (
                                        <p className="text-red-400 text-xs mt-1">{profileErrors.birthDate}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Security section with password change button */}
                    <section className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <LockClosedIcon className="h-5 w-5 text-green-400" />
                            <h3 className="text-lg sm:text-xl font-semibold text-white">Seguridad</h3>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 bg-gray-750 rounded-lg border border-gray-600">
                            <div>
                                <h4 className="font-semibold text-white text-sm sm:text-base">Contraseña</h4>
                                <p className="text-gray-400 text-xs sm:text-sm">Actualiza tu contraseña regularmente</p>
                            </div>
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                            >
                                Cambiar Contraseña
                            </button>
                        </div>
                    </section>
                </div>

                {/* Profile confirmation modal */}
                {showProfileConfirm && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full mx-2">
                            <div className="flex items-center gap-3 mb-4">
                                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                <h3 className="text-lg sm:text-xl font-bold text-white">Confirmar Cambios</h3>
                            </div>
                            
                            <p className="text-gray-300 text-sm sm:text-base mb-4">
                                ¿Estás seguro de que quieres actualizar tu información de perfil?
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                <button 
                                    onClick={() => setShowProfileConfirm(false)}
                                    className="flex-1 py-2 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmProfileUpdate}
                                    disabled={loading} 
                                    className="flex-1 py-2 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Guardando...' : 'Sí, Actualizar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password change modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50">
                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full mx-2">
                            <div className="flex items-center gap-3 mb-4">
                                <LockClosedIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                <h3 className="text-lg sm:text-xl font-bold text-white">Cambiar Contraseña</h3>
                            </div>
                            
                            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
                                <div className="relative">
                                    <label htmlFor="currentPassword" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Contraseña Actual <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="currentPassword" 
                                        name="currentPassword" 
                                        value={passwordFormData.currentPassword} 
                                        onChange={handlePasswordChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-7 sm:top-8 text-gray-400 hover:text-gray-300"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOffIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                    {passwordErrors.currentPassword && (
                                        <p className="text-red-400 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>
                                
                                <div className="relative">
                                    <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Nueva Contraseña <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword" 
                                        name="newPassword" 
                                        value={passwordFormData.newPassword} 
                                        onChange={handlePasswordChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            passwordErrors.newPassword ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-7 sm:top-8 text-gray-400 hover:text-gray-300"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOffIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                    {passwordErrors.newPassword && (
                                        <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword}</p>
                                    )}
                                </div>
                                
                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium mb-1 text-gray-300">
                                        Confirmar Contraseña <span className="text-red-400">*</span>
                                    </label>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        value={passwordFormData.confirmPassword} 
                                        onChange={handlePasswordChange} 
                                        className={`w-full p-2 sm:p-3 text-sm rounded-lg bg-gray-700 border ${
                                            passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                                        } text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-7 sm:top-8 text-gray-400 hover:text-gray-300"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOffIcon className="h-4 w-4" />
                                        ) : (
                                            <EyeIcon className="h-4 w-4" />
                                        )}
                                    </button>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 py-2 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors order-2 sm:order-1"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="flex-1 py-2 sm:py-3 px-4 text-sm sm:text-base rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors order-1 sm:order-2"
                                    >
                                        {loading ? 'Cambiando...' : 'Cambiar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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

export default UserSettingsPage;