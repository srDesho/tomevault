import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

/**
 * Reusable pagination component for lists (books, users, etc.)
 * @param {number} currentPage - Current page (0-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {number} totalItems - Total number of items (not pages)
 * @param {number} itemsPerPage - Number of items per page
 * @param {string} itemName - Item name for display ("book", "user", etc.)
 * @param {boolean} pluralizeItemName - Whether to automatically pluralize the item name
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  itemName = 'elemento',
  pluralizeItemName = true,
}) => {
  // Don't show pagination if there's only one page or none
  if (totalPages <= 1) return null;

  // Calculate range of displayed items
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  // Determine correct plural name for Spanish
  const getItemName = (count) => {
    if (!pluralizeItemName) return itemName;
    const singular = itemName.toLowerCase();
    const plurals = {
      libro: 'libros',
      usuario: 'usuarios',
      rol: 'roles',
      categoría: 'categorías',
      etiqueta: 'etiquetas'
    };
    return count === 1 ? singular : (plurals[singular] || `${singular}s`);
  };

  const itemLabel = getItemName(totalItems);

  // Generate visible pages (max 5, centered on current page)
  const getPageNumbers = () => {
    const pagesToShow = 5;
    const half = Math.floor(pagesToShow / 2);

    let startPage = currentPage - half;
    let endPage = currentPage + half;

    if (startPage < 0) {
      startPage = 0;
      endPage = Math.min(totalPages - 1, pagesToShow - 1);
    }

    if (endPage >= totalPages) {
      endPage = totalPages - 1;
      startPage = Math.max(0, endPage - pagesToShow + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-sm">
      {/* Results information */}
      <div className="text-gray-400">
        Mostrando <span className="font-medium text-white">{startItem}-{endItem}</span>{' '}
        de {totalItems} {itemLabel}
      </div>

      {/* Navigation controls */}
      <nav aria-label="Paginación" className="flex items-center gap-1 sm:gap-2">
        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Page number buttons */}
        <div className="flex gap-1">
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded min-w-[36px] text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
              aria-label={`Ir a página ${page + 1}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page + 1}
            </button>
          ))}
        </div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;