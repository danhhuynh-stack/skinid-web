import { useState, useMemo } from 'react';
import { useCatalog } from './useCatalog.js';
import { filterProducts } from '../services/catalogService.js';

/**
 * React hook to manage product filtering state and filtered results.
 */
export function useCatalogFilters(initialFilters = {}) {
  const { products, isReady } = useCatalog();
  const [filters, setFilters] = useState({
    brand: 'all',
    step: 'all',
    benefit: 'all',
    query: '',
    sort: 'featured',
    ...initialFilters
  });

  const filteredProducts = useMemo(() => {
    return filterProducts(products, filters);
  }, [products, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      brand: 'all',
      step: 'all',
      benefit: 'all',
      query: '',
      sort: 'featured'
    });
  };

  return {
    products,
    filteredProducts,
    filters,
    updateFilter,
    resetFilters,
    isReady
  };
}
