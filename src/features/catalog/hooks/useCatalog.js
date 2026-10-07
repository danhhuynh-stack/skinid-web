import { useEffect, useState } from 'react';
import { loadProductCatalog, refreshProductCatalog } from '../services/catalogRepository.js';

export function useCatalog() {
  const [state, setState] = useState({ products: [], isReady: false, error: null });

  useEffect(() => {
    let active = true;
    loadProductCatalog()
      .then((products) => {
        if (active) setState({ products, isReady: true, error: null });
        return refreshProductCatalog();
      })
      .then((products) => {
        if (active) setState({ products, isReady: true, error: null });
      })
      .catch((error) => {
        if (active) setState({ products: [], isReady: true, error });
      });
    return () => { active = false; };
  }, []);

  return {
    ...state,
    totalCount: state.products.length
  };
}
