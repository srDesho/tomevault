import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const startPage = Math.max(0, currentPage - 2);
  const endPage = Math.min(totalPages - 1, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-8 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === page 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {page + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Pagination;