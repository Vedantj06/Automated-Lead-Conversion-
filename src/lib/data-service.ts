import ApiClient from "./api-client";

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

class DataService<T> {
  constructor(private endpoint: string) {}

  async getAll(options?: { limit?: number; offset?: number }): Promise<ApiResponse<T[]>> {
    const response = await ApiClient.get<ApiResponse<T[]>>(this.endpoint, {
      params: options,
    });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<T>> {
    const response = await ApiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await ApiClient.post<ApiResponse<T>>(this.endpoint, data);
    return response.data;
  }

  async update(id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    const response = await ApiClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await ApiClient.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
    return response.data;
  }
}

export { DataService };
export default DataService;
