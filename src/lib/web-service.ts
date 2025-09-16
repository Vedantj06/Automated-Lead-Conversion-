import ApiClient from "./api-client";

export interface WebCheckResponse {
  accessible: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
}

class WebService {
  private WEB_ENDPOINT = "/web";

  async checkUrl(url: string): Promise<WebCheckResponse> {
    const response = await ApiClient.post<WebCheckResponse>(
      `${this.WEB_ENDPOINT}/check`,
      { url }
    );
    return response.data;
  }

  async scrapeMetadata(url: string): Promise<any> {
    const response = await ApiClient.post<any>(
      `${this.WEB_ENDPOINT}/scrape`,
      { url }
    );
    return response.data;
  }
}

export const WebServiceInstance = new WebService();
export { WebService };
export default WebServiceInstance;
