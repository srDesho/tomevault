import React from 'react';

const LoadingSpinner = () => {
  return (
    // Container to center the spinner and ensure minimum height.
    <div className="flex justify-center items-center min-h-[400px]">
      {/* Animated loading spinner. */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      {/* Screen reader text. */}
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default LoadingSpinner;
