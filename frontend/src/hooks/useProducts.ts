import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/types';

export function useProducts(params?: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Boş parametreleri temizle
        const cleanParams: Record<string, any> = {};
        
        if (params) {
          Object.keys(params).forEach((key) => {
            const value = params[key];
            // Sadece dolu değerleri ekle
            if (value !== '' && value !== null && value !== undefined) {
              cleanParams[key] = value;
            }
          });
        }
        
        console.log('Fetching products with params:', cleanParams); // Debug için
        
        const response = await api.getProducts(cleanParams);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (err: any) {
        console.error('Fetch products error:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(params)]); // params dependency

  return { products, isLoading, error };
}

export function useFeaturedProducts(type?: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getFeaturedProducts(type, limit);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [type, limit]);

  return { products, isLoading };
}