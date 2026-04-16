import axiosInstance from "../lib/axiosInstance";


class HttpService {
  async get<T>(
    url: string,
    config?: object
  ): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.get<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async post<T>(
    url: string,
    data: object
  ): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.post<T>(url, data);
    return { data: response.data, status: response.status };
  }

  async put<T>(
    url: string,
    data?: object
  ): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.put<T>(url, data);
    return { data: response.data, status: response.status };
  }

  async patch<T>(
    url: string,
    data: object
  ): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.patch<T>(url, data);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string): Promise<{ data: T; status: number }> {
    const response = await axiosInstance.delete<T>(url);
    return { data: response.data, status: response.status };
  }
}

const httpService = new HttpService();
export default httpService;