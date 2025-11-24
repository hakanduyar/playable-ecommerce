import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendSuccess = (res: Response, statusCode: number, data: any, message?: string, pagination?: any) => {
  const response: ApiResponse = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
    ...(pagination && { pagination })
  };
  
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, error: string, errors?: any[]) => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};