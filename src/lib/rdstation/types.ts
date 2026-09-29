export type {
  RDStationConfig,
  TokenResponse,
  RDStationContact,
  RDStationDeal,
  RDStationCampaign,
  RDStationFunnelStage,
  PaginatedResponse,
} from './api';

export interface DashboardMetrics {
  totalContacts: number;
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  wonValue: number;
  lostDeals: number;
  pausedDeals: number;
  pausedValue: number;
  conversionRate: number;
  avgDealValue: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface FunnelData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  openCount: number;
  lostCount: number;
  wonCount: number;
  pausedCount: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface TimeSeriesData {
  date: string;
  contacts: number;
  deals: number;
  value: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
}