import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export interface RDStationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface RDStationContact {
  id: string;
  email: string;
  name: string;
  phone?: string;
  mobile_phone?: string;
  company_name?: string;
  job_title?: string;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_conversion_at?: string;
  lead_score?: number;
  lead_stage?: string;
}

export interface RDStationDeal {
  id: string;
  name: string;
  value: number;
  stage_id: string;
  stage_name: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  won_at?: string;
  lost_at?: string;
  status: 'open' | 'won' | 'lost' | 'paused';
  deal_source?: { id: string; name: string } | null;
  deal_stage?: { id: string; name: string } | null;
}

export interface RDStationCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  sent_at?: string;
  opens_count: number;
  clicks_count: number;
  bounces_count: number;
  unsubscribes_count: number;
  deliveries_count: number;
  created_at: string;
}

export interface RDStationFunnelStage {
  id: string;
  name: string;
  order: number;
  deals_count: number;
  deals_value: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

class RDStationAPI {
  private client: AxiosInstance;
  private config: RDStationConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: RDStationConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.rd.services',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        } else if (this.refreshToken) {
          await this.refreshAccessToken();
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'contacts.read deals.read campaigns.read',
    });
    return `https://api.rd.services/auth/dialog?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await axios.post<TokenResponse>(
      'https://api.rd.services/auth/token',
      new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    this.setTokens(
      response.data.access_token,
      response.data.refresh_token,
      response.data.expires_in
    );
    return response.data;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token available');

    const response = await axios.post<TokenResponse>(
      'https://api.rd.services/auth/token',
      new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    this.setTokens(
      response.data.access_token,
      response.data.refresh_token,
      response.data.expires_in
    );
  }

  async getDeals(page = 1, perPage = 100, pipelineId?: string): Promise<PaginatedResponse<RDStationDeal>> {
    const params: any = { endpoint: 'deals', page, limit: perPage };
    if (pipelineId) params.deal_pipeline_id = pipelineId;
    
    const response = await axios.get('/api/crm', { params });
    const deals = response.data.deals || response.data;
    const mappedDeals = (Array.isArray(deals) ? deals : []).map((d: any) => ({
      id: d.id,
      name: d.name,
      value: d.amount_total || 0,
      stage_id: d.deal_stage?.id,
      stage_name: d.deal_stage?.name,
      contact_id: d.contacts?.[0]?.id || '',
      contact_name: d.contacts?.[0]?.name || 'Desconhecido',
      contact_email: d.contacts?.[0]?.emails?.[0]?.email || '',
      created_at: d.created_at,
      updated_at: d.updated_at,
      status: (d.closed_at ? (d.win ? 'won' : 'lost') : (d.hold ? 'paused' : 'open')) as 'open' | 'won' | 'lost' | 'paused',
      deal_source: d.deal_source ? { id: d.deal_source.id, name: d.deal_source.name } : null,
      deal_stage: d.deal_stage ? { id: d.deal_stage.id, name: d.deal_stage.name } : null
    }));

    return {
      data: mappedDeals,
      meta: { current_page: page, per_page: perPage, total_pages: 1, total_count: response.data.total || mappedDeals.length }
    };
  }

  async getAllDeals(pipelineId?: string): Promise<RDStationDeal[]> {
    let allDeals: RDStationDeal[] = [];
    let hasMore = true;
    let page = 1;
    
    while (hasMore) {
      const params: any = { endpoint: 'deals', page, limit: 200 };
      if (pipelineId) params.deal_pipeline_id = pipelineId;
      
      const response = await axios.get('/api/crm', { params });
      const deals = response.data.deals || response.data;
      
      const mappedDeals = (Array.isArray(deals) ? deals : []).map((d: any) => ({
        id: d.id,
        name: d.name,
        value: d.amount_total || 0,
        stage_id: d.deal_stage?.id,
        stage_name: d.deal_stage?.name,
        contact_id: d.contacts?.[0]?.id || '',
        contact_name: d.contacts?.[0]?.name || 'Desconhecido',
        contact_email: d.contacts?.[0]?.emails?.[0]?.email || '',
        created_at: d.created_at,
        updated_at: d.updated_at,
        status: (d.closed_at ? (d.win ? 'won' : 'lost') : (d.hold ? 'paused' : 'open')) as 'open' | 'won' | 'lost' | 'paused',
        deal_source: d.deal_source ? { id: d.deal_source.id, name: d.deal_source.name } : null,
        deal_stage: d.deal_stage ? { id: d.deal_stage.id, name: d.deal_stage.name } : null
      }));

      allDeals = [...allDeals, ...mappedDeals];
      
      if (response.data.has_more) {
        page++;
      } else {
        hasMore = false;
      }
    }
    
    return allDeals;
  }

  async getDealById(id: string): Promise<RDStationDeal> {
    const response = await this.client.get<RDStationDeal>(`/platform/deals/${id}`);
    return response.data;
  }

  async getCampaigns(page = 1, perPage = 100): Promise<PaginatedResponse<RDStationCampaign>> {
    const response = await axios.get('/api/marketing', {
      params: { endpoint: 'campaigns', page, per_page: perPage }
    });
    return response.data;
  }

  async getContacts(page = 1, perPage = 100): Promise<PaginatedResponse<RDStationContact>> {
    const response = await axios.get('/api/marketing', {
      params: { endpoint: 'contacts', page, per_page: perPage }
    });
    return response.data;
  }

  async getPipelines(): Promise<any[]> {
    const response = await axios.get('/api/crm', { params: { endpoint: 'deal_pipelines' } });
    const pipelines = response.data.deal_pipelines || response.data;
    return Array.isArray(pipelines) ? pipelines : [];
  }

  async getFunnelStages(pipelineId?: string): Promise<RDStationFunnelStage[]> {
    const params: any = { endpoint: 'deal_stages' };
    if (pipelineId) params.deal_pipeline_id = pipelineId;
    
    const response = await axios.get('/api/crm', { params });
    const stages = response.data.deal_stages || response.data;
    
    const sortedStages = (Array.isArray(stages) ? stages : [])
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        order: s.order || 0,
        deals_count: 0,
        deals_value: 0
      }))
      .sort((a, b) => a.order - b.order);
      
    console.log('Stages sorted:', sortedStages.map(s => `${s.order}: ${s.name}`));
    return sortedStages;
  }

  async getDealsByStage(stageId: string): Promise<RDStationDeal[]> {
    return [];
  }
}

let apiInstance: RDStationAPI | null = null;

export function getRDStationAPI(config?: RDStationConfig): RDStationAPI {
  if (!apiInstance && config) {
    apiInstance = new RDStationAPI(config);
  }
  if (!apiInstance) {
    // Allow initialization without config for the CRM token mode
    apiInstance = new RDStationAPI({ clientId: '', clientSecret: '', redirectUri: '' });
  }
  return apiInstance;
}

export function initializeRDStationAPI(config: RDStationConfig): RDStationAPI {
  apiInstance = new RDStationAPI(config);
  return apiInstance;
}