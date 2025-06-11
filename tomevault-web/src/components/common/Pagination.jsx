import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

/**
 * Componente de paginación reutilizable para listas (libros, usuarios, etc.)
 * @param {number} currentPage - Página actual (0-indexed)
 * @param {number} totalPages - Número total de páginas
 * @param {function} onPageChange - Callback cuando cambia la página
 * @param {number} totalItems - Total de elementos (no páginas)
 * @param {number} itemsPerPage - Cantidad de elementos por página
 * @param {string} itemName - Nombre del ítem para mostrar ("libro", "usuario", etc.)
 * @param {boolean} pluralizeItemName - Si el nombre debe pluralizarse automáticamente
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
  // No mostrar paginación si hay una o ninguna página
  if (totalPages <= 1) return null;

  // Calcular rango de elementos mostrados
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  // Determinar el nombre plural correcto
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

  // Generar páginas visibles (máximo 5, centradas en la página actual)
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
      {/* Información de resultados */}
      <div className="text-gray-400">
        Mostrando <span className="font-medium text-white">{startItem}-{endItem}</span>{' '}
        de {totalItems} {itemLabel}
      </div>

      {/* Navegación */}
      <nav aria-label="Paginación" className="flex items-center gap-1 sm:gap-2">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Números de página */}
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

        {/* Botón siguiente */}
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