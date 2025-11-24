import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, LoginCredentials, RegisterData, CreateOrderData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(data: RegisterData) {
    const response = await this.api.post<ApiResponse>('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials) {
    const response = await this.api.post<ApiResponse>('/auth/login', credentials);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get<ApiResponse>('/auth/profile');
    return response.data;
  }

  async getCategories(isActive?: boolean) {
    const response = await this.api.get<ApiResponse>('/categories', {
      params: { isActive },
    });
    return response.data;
  }

  async getProducts(params?: any) {
    const response = await this.api.get<ApiResponse>('/products', { params });
    return response.data;
  }

  async getFeaturedProducts(type?: string, limit?: number) {
    const response = await this.api.get<ApiResponse>('/products/featured', {
      params: { type, limit },
    });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.api.get<ApiResponse>(`/products/${id}`);
    return response.data;
  }

  async createOrder(data: CreateOrderData) {
    const response = await this.api.post<ApiResponse>('/orders', data);
    return response.data;
  }

  async getUserOrders(params?: any) {
    const response = await this.api.get<ApiResponse>('/orders/my-orders', { params });
    return response.data;
  }
  async getOrderStats() {
    const response = await this.api.get<ApiResponse>('/orders/admin/stats');
    return response.data;
  }

  async getProductStats() {
    const response = await this.api.get<ApiResponse>('/products/admin/stats');
    return response.data;
  }

  async getCustomerStats() {
    const response = await this.api.get<ApiResponse>('/customers/stats');
    return response.data;
  }

  async getAllCustomers(params?: any) {
    const response = await this.api.get<ApiResponse>('/customers', { params });
    return response.data;
  }

  async getCustomerDetails(id: string) {
    const response = await this.api.get<ApiResponse>(`/customers/${id}`);
    return response.data;
  }

  async getAllOrders(params?: any) {
    const response = await this.api.get<ApiResponse>('/orders/admin/all', { params });
    return response.data;
  }

  async updateOrderStatus(id: string, data: any) {
    const response = await this.api.put<ApiResponse>(`/orders/${id}/status`, data);
    return response.data;
  }
  async deleteProduct(id: string) {
    const response = await this.api.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  }

  async updateProduct(id: string, data: any) {
    const response = await this.api.put<ApiResponse>(`/products/${id}`, data);
    return response.data;
  }
}

export const api = new ApiService();