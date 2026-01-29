import axios, { AxiosInstance, AxiosError } from 'axios';
import { parseErrorMessage } from './errorHandler';

// Simple function to create and return httpClient
function createHttpClient(): AxiosInstance {
    // Get API URL from environment variable
    // In production (Railway), this should be set via environment variables
    // In development, it defaults to localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

    console.log('🔧 Creating HTTP Client');
    console.log('🔧 API URL:', API_URL);
    console.log('🔧 Environment:', process.env.NODE_ENV);

    const client = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    // Request interceptor
    client.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            // Enhanced error logging
            const errorDetails = {
                message: error.message,
                code: error.code,
                url: error.config?.url,
                baseURL: error.config?.baseURL,
                fullURL: `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
                method: error.config?.method?.toUpperCase(),
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                headers: error.config?.headers,
                requestData: error.config?.data,
            };

            console.error('❌ API Error Details:', errorDetails);
            console.error('❌ Full Error Object:', error);

            // Parse error message to user-friendly format
            const userFriendlyMessage = parseErrorMessage(error);

            // Attach user-friendly message to error object
            (error as any).userMessage = userFriendlyMessage;

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

    return client;
}

// Export the instance directly
const httpClient = createHttpClient();
export default httpClient;

// Also export the function for cases where a new instance is needed
export { createHttpClient };

