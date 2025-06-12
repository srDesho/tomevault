import React, { createContext, useContext, useState } from 'react';

const AdminUsersContext = createContext();

export const AdminUsersProvider = ({ children }) => {
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminScrollPosition, setAdminScrollPosition] = useState(0);
  const [isAdminSearchActive, setIsAdminSearchActive] = useState(false);
  const [adminCurrentPage, setAdminCurrentPage] = useState(0);
  const [adminSearchPage, setAdminSearchPage] = useState(0);

  const clearAdminSearch = () => {
    setAdminSearchTerm('');
    setIsAdminSearchActive(false);
    setAdminSearchPage(0);
  };

  return (
    <AdminUsersContext.Provider
      value={{
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
        setAdminSearchPage,
      }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
};

export const useAdminUsersSearch = () => {
  const context = useContext(AdminUsersContext);
  if (!context) {
    throw new Error('useAdminUsersSearch must be used within an AdminUsersProvider');
  }
  return context;
};