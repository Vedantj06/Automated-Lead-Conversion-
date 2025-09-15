import { ApiClient } from './api-client';

// Web search interfaces
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  publishedDate?: string;
  source?: string;
  imageUrl?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  query: string;
  searchTime: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  offset?: number;
  country?: string;
  language?: string;
  safeSearch?: boolean;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  site?: string; // search within specific site
}

// Web reader interfaces
export interface WebContent {
  url: string;
  title: string;
  content: string;
  author?: string;
  publishedDate?: string;
  description?: string;
  images?: string[];
  links?: string[];
  metadata?: Record<string, any>;
}

export interface WebReaderResponse {
  success: boolean;
  data?: WebContent;
  error?: string;
}

export interface BulkWebReaderRequest {
  urls: string[];
  options?: {
    timeout?: number;
    extractImages?: boolean;
    extractLinks?: boolean;
    followRedirects?: boolean;
  };
}

export interface BulkWebReaderResponse {
  success: boolean;
  results: {
    url: string;
    success: boolean;
    data?: WebContent;
    error?: string;
  }[];
}

// Lead discovery interfaces
export interface LeadSourceConfig {
  platform: 'linkedin' | 'google' | 'yellowpages' | 'bing' | 'custom';
  searchTerms: string[];
  location?: string;
  filters?: Record<string, any>;
}

export interface DiscoveredLead {
  name: string;
  title?: string;
  company: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  location?: string;
  industry?: string;
  source: string;
  sourceUrl?: string;
  confidence: number; // 0-100 score
}

export interface LeadDiscoveryRequest {
  sources: LeadSourceConfig[];
  targetRegions: string[];
  services: string[];
  limit?: number;
}

export interface LeadDiscoveryResponse {
  success: boolean;
  leads: DiscoveredLead[];
  totalFound: number;
  searchTime: number;
  sources: string[];
}

// Web service class
export class WebService {
  private static readonly SEARCH_ENDPOINT = import.meta.env.VITE_SEARCH_ENDPOINT || '/search';
  private static readonly WEB_READER_ENDPOINT = import.meta.env.VITE_WEB_READER_ENDPOINT || '/web-reader';

  /**
   * Perform web search
   */
  static async search(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await ApiClient.post<SearchResponse>(
        `${this.SEARCH_ENDPOINT}`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Web search error:', error);
      return {
        results: [],
        totalResults: 0,
        query: request.query,
        searchTime: 0,
      };
    }
  }

  /**
   * Quick search with just a query string
   */
  static async quickSearch(query: string, limit = 10): Promise<SearchResponse> {
    return this.search({ query, limit });
  }

  /**
   * Search for leads based on services and region
   */
  static async searchForLeads(
    service: string,
    region: string,
    limit = 20
  ): Promise<SearchResponse> {
    const query = `${service} services ${region} contact email`;
    return this.search({
      query,
      limit,
      safeSearch: true,
    });
  }

  /**
   * Extract content from a web page
   */
  static async readWebPage(url: string): Promise<WebReaderResponse> {
    try {
      const response = await ApiClient.post<WebReaderResponse>(
        `${this.WEB_READER_ENDPOINT}`,
        { url }
      );
      return response;
    } catch (error: any) {
      console.error('Web reader error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to read web page',
      };
    }
  }

  /**
   * Extract content from multiple web pages
   */
  static async bulkReadWebPages(request: BulkWebReaderRequest): Promise<BulkWebReaderResponse> {
    try {
      const response = await ApiClient.post<BulkWebReaderResponse>(
        `${this.WEB_READER_ENDPOINT}/bulk`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Bulk web reader error:', error);
      return {
        success: false,
        results: request.urls.map(url => ({
          url,
          success: false,
          error: error.response?.data?.message || 'Failed to read web page',
        })),
      };
    }
  }

  /**
   * Discover leads from web sources
   */
  static async discoverLeads(request: LeadDiscoveryRequest): Promise<LeadDiscoveryResponse> {
    try {
      const response = await ApiClient.post<LeadDiscoveryResponse>(
        `${this.SEARCH_ENDPOINT}/discover-leads`,
        request
      );
      return response;
    } catch (error: any) {
      console.error('Lead discovery error:', error);
      return {
        success: false,
        leads: [],
        totalFound: 0,
        searchTime: 0,
        sources: [],
      };
    }
  }

  /**
   * Extract contact information from a company website
   */
  static async extractContactInfo(websiteUrl: string): Promise<{
    emails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: Record<string, string>;
    contactPage?: string;
  }> {
    try {
      const response = await ApiClient.post<{
        emails: string[];
        phones: string[];
        addresses: string[];
        socialMedia: Record<string, string>;
        contactPage?: string;
      }>(
        `${this.WEB_READER_ENDPOINT}/extract-contacts`,
        { url: websiteUrl }
      );
      return response;
    } catch (error: any) {
      console.error('Extract contact info error:', error);
      return {
        emails: [],
        phones: [],
        addresses: [],
        socialMedia: {},
      };
    }
  }

  /**
   * Check if a website exists and is accessible
   */
  static async checkWebsiteStatus(url: string): Promise<{
    accessible: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  }> {
    try {
      const response = await ApiClient.post(
        `${this.WEB_READER_ENDPOINT}/check-status`,
        { url }
      );
      return response as { accessible: boolean; statusCode?: number; responseTime?: number; error?: string; };
    } catch (error: any) {
      console.error('Check website status error:', error);
      return {
        accessible: false,
        error: error.response?.data?.message || 'Failed to check website status',
      };
    }
  }
}

export default WebService;