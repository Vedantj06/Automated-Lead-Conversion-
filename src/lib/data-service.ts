import { ApiClient } from './api-client';

// Generic interfaces for data operations
export interface BaseEntity {
  _uid: string;
  _id: string;
  _tid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface QueryResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface UpdateResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}

// Generic data service class
export class DataService<T extends BaseEntity> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all records with optional filtering and pagination
   */
  async getAll(options?: QueryOptions): Promise<QueryResponse<T>> {
    try {
      const params = new URLSearchParams();
      
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) {
        const page = Math.floor(options.offset / (options.limit || 50)) + 1;
        params.append('page', page.toString());
      }
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);
      
      // Add filters as direct query parameters (backend expects them without filter_ prefix)
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      const response = await ApiClient.get<any>(url);
      
      // Transform backend response to frontend format
      return {
        data: response.data || [],
        total: response.pagination?.total || response.count || 0,
        limit: response.pagination?.limit || options?.limit || 50,
        offset: response.pagination ? (response.pagination.page - 1) * response.pagination.limit : (options?.offset || 0)
      };
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      return await ApiClient.get<T>(`${this.endpoint}/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, '_uid' | '_id' | '_tid' | 'createdAt' | 'updatedAt'>): Promise<CreateResponse<T>> {
    try {
      const response = await ApiClient.post<any>(this.endpoint, data);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message || 'Record created successfully'
      };
    } catch (error: any) {
      console.error(`Error creating ${this.endpoint}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create record',
      };
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<T>): Promise<UpdateResponse<T>> {
    try {
      const response = await ApiClient.put<any>(`${this.endpoint}/${id}`, data);
      return {
        success: response.success || true,
        data: response.data,
        message: response.message || 'Record updated successfully'
      };
    } catch (error: any) {
      console.error(`Error updating ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update record',
      };
    }
  }

  /**
   * Partially update an existing record
   */
  async patch(id: string, data: Partial<T>): Promise<UpdateResponse<T>> {
    try {
      const response = await ApiClient.patch<UpdateResponse<T>>(`${this.endpoint}/${id}`, data);
      return response;
    } catch (error: any) {
      console.error(`Error patching ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to patch record',
      };
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<DeleteResponse> {
    try {
      const response = await ApiClient.delete<DeleteResponse>(`${this.endpoint}/${id}`);
      return response;
    } catch (error: any) {
      console.error(`Error deleting ${this.endpoint}/${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete record',
      };
    }
  }

  /**
   * Bulk create multiple records
   */
  async bulkCreate(data: Omit<T, '_uid' | '_id' | '_tid' | 'createdAt' | 'updatedAt'>[]): Promise<CreateResponse<T[]>> {
    try {
      const response = await ApiClient.post<CreateResponse<T[]>>(`${this.endpoint}/bulk`, { records: data });
      return response;
    } catch (error: any) {
      console.error(`Error bulk creating ${this.endpoint}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to bulk create records',
      };
    }
  }

  /**
   * Search records with custom query
   */
  async search(query: string, options?: QueryOptions): Promise<QueryResponse<T>> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.sortBy) params.append('sortBy', options.sortBy);
      if (options?.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await ApiClient.get<QueryResponse<T>>(`${this.endpoint}/search?${params.toString()}`);
      return response;
    } catch (error) {
      console.error(`Error searching ${this.endpoint}:`, error);
      throw error;
    }
  }
}

export default DataService;