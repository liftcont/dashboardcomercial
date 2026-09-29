import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type {
  RDStationContact,
  RDStationDeal,
  RDStationCampaign,
  RDStationFunnelStage,
  DashboardMetrics,
  FunnelData,
  CampaignPerformance,
  TimeSeriesData,
  LeadSourceData,
} from '@/lib/rdstation/types';

export interface RDStationState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokensExpiry: number;

  contacts: RDStationContact[];
  deals: RDStationDeal[];
  campaigns: RDStationCampaign[];
  funnelStages: RDStationFunnelStage[];
  pipelines: any[];
  selectedPipelineId: string | null;
  startDate: string;
  endDate: string;

  metrics: DashboardMetrics | null;
  funnelData: FunnelData[];
  campaignPerformance: CampaignPerformance[];
  timeSeriesData: TimeSeriesData[];
  leadSources: LeadSourceData[];

  loading: {
    contacts: boolean;
    deals: boolean;
    campaigns: boolean;
    metrics: boolean;
  };

  error: string | null;

  setAuth: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  logout: () => void;
  setContacts: (contacts: RDStationContact[]) => void;
  setDeals: (deals: RDStationDeal[]) => void;
  prospectingDeals: RDStationDeal[];
  setProspectingDeals: (deals: RDStationDeal[]) => void;
  prospectingStages: RDStationFunnelStage[];
  setProspectingStages: (stages: RDStationFunnelStage[]) => void;
  setCampaigns: (campaigns: RDStationCampaign[]) => void;
  setFunnelStages: (stages: RDStationFunnelStage[]) => void;
  setPipelines: (pipelines: any[]) => void;
  setSelectedPipelineId: (id: string | null) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setFunnelData: (data: FunnelData[]) => void;
  setCampaignPerformance: (data: CampaignPerformance[]) => void;
  setTimeSeriesData: (data: TimeSeriesData[]) => void;
  setLeadSources: (data: LeadSourceData[]) => void;
  setLoading: (key: keyof RDStationState['loading'], value: boolean) => void;
  setError: (error: string | null) => void;
  computeMetrics: () => void;
  computeFunnelData: () => void;
  computeCampaignPerformance: () => void;
  computeTimeSeriesData: () => void;
  computeLeadSources: () => void;
}

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentDay = String(today.getDate()).padStart(2, '0');
const defaultStartDate = `${currentYear}-${currentMonth}-01`;
const defaultEndDate = `${currentYear}-${currentMonth}-${currentDay}`;

export const useRDStationStore = create<RDStationState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokensExpiry: 0,

      contacts: [],
      deals: [],
      prospectingDeals: [],
      prospectingStages: [],
      campaigns: [],
      funnelStages: [],
      pipelines: [],
      selectedPipelineId: null,
      startDate: defaultStartDate,
      endDate: defaultEndDate,

      metrics: null,
      funnelData: [],
      campaignPerformance: [],
      timeSeriesData: [],
      leadSources: [],

      loading: {
        contacts: false,
        deals: false,
        campaigns: false,
        metrics: false,
      },

      error: null,

      setAuth: (accessToken, refreshToken, expiresIn) =>
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          tokensExpiry: Date.now() + (expiresIn - 60) * 1000,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          tokensExpiry: 0,
          contacts: [],
          deals: [],
          campaigns: [],
          funnelStages: [],
          metrics: null,
          funnelData: [],
          campaignPerformance: [],
          timeSeriesData: [],
          leadSources: [],
        }),

      setContacts: (contacts) => set({ contacts }),
      setDeals: (deals) => set({ deals }),
      setProspectingDeals: (prospectingDeals) => set({ prospectingDeals }),
      setProspectingStages: (prospectingStages) => set({ prospectingStages }),
      setCampaigns: (campaigns) => set({ campaigns }),
      setFunnelStages: (funnelStages) => set({ funnelStages }),
      setPipelines: (pipelines) => set({ pipelines }),
      setSelectedPipelineId: (selectedPipelineId) => set({ selectedPipelineId }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),

      setMetrics: (metrics) => set({ metrics }),
      setFunnelData: (funnelData) => set({ funnelData }),
      setCampaignPerformance: (campaignPerformance) => set({ campaignPerformance }),
      setTimeSeriesData: (timeSeriesData) => set({ timeSeriesData }),
      setLeadSources: (leadSources) => set({ leadSources }),

      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        })),

      setError: (error) => set({ error }),

      computeMetrics: () => {
        const { deals, contacts } = get();
        
        const totalDeals = deals.length;
        const wonDeals = deals.filter((d) => d.status === 'won').length;
        const lostDeals = deals.filter((d) => d.status === 'lost').length;
        const pausedDeals = deals.filter((d) => d.status === 'paused').length;
        
        const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
        const wonValue = deals.filter((d) => d.status === 'won').reduce((sum, d) => sum + d.value, 0);
        const pausedValue = deals.filter((d) => d.status === 'paused').reduce((sum, d) => sum + d.value, 0);

        set({
          metrics: {
            totalContacts: contacts.length,
            totalDeals,
            totalValue,
            wonDeals,
            wonValue,
            lostDeals,
            pausedDeals,
            pausedValue,
            conversionRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
            avgDealValue: totalDeals > 0 ? totalValue / totalDeals : 0,
          },
        });
      },

      computeFunnelData: () => {
        const { deals, funnelStages, startDate, endDate } = get();
        
        const filteredDeals = deals.filter(d => {
          let isValid = true;
          const createdAt = d.created_at.split('T')[0];
          const updatedAt = d.updated_at ? d.updated_at.split('T')[0] : null;

          // Simple logic: if deal was created or updated within the range
          if (startDate && endDate) {
             const matchCreated = createdAt >= startDate && createdAt <= endDate;
             const matchUpdated = updatedAt ? (updatedAt >= startDate && updatedAt <= endDate) : false;
             isValid = matchCreated || matchUpdated;
          } else if (startDate) {
             const matchCreated = createdAt >= startDate;
             const matchUpdated = updatedAt ? updatedAt >= startDate : false;
             isValid = matchCreated || matchUpdated;
          } else if (endDate) {
             const matchCreated = createdAt <= endDate;
             const matchUpdated = updatedAt ? updatedAt <= endDate : false;
             isValid = matchCreated || matchUpdated;
          }
          return isValid;
        });
        
        const data: FunnelData[] = funnelStages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage_id === stage.id);
          const count = stageDeals.length;
          const openCount = stageDeals.filter(d => d.status === 'open').length;
          const lostCount = stageDeals.filter(d => d.status === 'lost').length;
          const wonCount = stageDeals.filter(d => d.status === 'won').length;
          const pausedCount = stageDeals.filter(d => d.status === 'paused').length;
          
          const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
          const prevStage = funnelStages.find((s) => s.order === stage.order - 1);
          const prevCount = prevStage
            ? filteredDeals.filter((d) => d.stage_id === prevStage.id).length
            : count;
          const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 100;

          return {
            stage: stage.name,
            count,
            value,
            conversionRate,
            openCount,
            lostCount,
            wonCount,
            pausedCount,
          };
        });

        set({ funnelData: data });
      },

      computeCampaignPerformance: () => {
        const { campaigns } = get();
        const data: CampaignPerformance[] = campaigns.map((c) => ({
          campaignId: c.id,
          campaignName: c.name,
          sent: c.deliveries_count,
          delivered: c.deliveries_count - c.bounces_count,
          opened: c.opens_count,
          clicked: c.clicks_count,
          bounced: c.bounces_count,
          unsubscribed: c.unsubscribes_count,
          openRate: c.deliveries_count > 0 ? (c.opens_count / c.deliveries_count) * 100 : 0,
          clickRate: c.deliveries_count > 0 ? (c.clicks_count / c.deliveries_count) * 100 : 0,
          bounceRate: c.deliveries_count > 0 ? (c.bounces_count / c.deliveries_count) * 100 : 0,
        }));
        set({ campaignPerformance: data });
      },

      computeTimeSeriesData: () => {
        const { contacts, deals } = get();
        const last30Days: TimeSeriesData[] = [];

        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const dayContacts = contacts.filter((c) =>
            c.created_at.startsWith(dateStr)
          ).length;

          const dayDeals = deals.filter((d) =>
            d.created_at.startsWith(dateStr)
          ).length;

          const dayValue = deals
            .filter((d) => d.created_at.startsWith(dateStr))
            .reduce((sum, d) => sum + d.value, 0);

          last30Days.push({
            date: dateStr,
            contacts: dayContacts,
            deals: dayDeals,
            value: dayValue,
          });
        }

        set({ timeSeriesData: last30Days });
      },

      computeLeadSources: () => {
        const { contacts } = get();
        const sourceMap = new Map<string, number>();

        contacts.forEach((c) => {
          const source = c.custom_fields?.source as string || 'Direto/Orgânico';
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        });

        const total = contacts.length;
        const data: LeadSourceData[] = Array.from(sourceMap.entries())
          .map(([source, count]) => ({
            source,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        set({ leadSources: data });
      },
    }),
    {
      name: 'rdstation-dashboard-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokensExpiry: state.tokensExpiry,
      }),
    }
  )
);