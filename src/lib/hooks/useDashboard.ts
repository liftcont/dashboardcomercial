'use client';

import { useEffect, useCallback } from 'react';
import { useRDStationStore } from '@/lib/store';
import { getRDStationAPI } from '@/lib/rdstation/api';

export function useDashboard() {
  const {
    isAuthenticated,
    loading,
    error,
    contacts,
    deals,
    campaigns,
    funnelStages,
    pipelines,
    selectedPipelineId,
    startDate,
    endDate,
    setAuth,
    logout,
    setContacts,
    setDeals,
    setCampaigns,
    setFunnelStages,
    setPipelines,
    setSelectedPipelineId,
    setStartDate,
    setEndDate,
    setLoading,
    setError,
    computeMetrics,
    computeFunnelData,
    computeCampaignPerformance,
    computeTimeSeriesData,
    computeLeadSources,
  } = useRDStationStore();

  const initializeAPI = useCallback(() => {
    return getRDStationAPI();
  }, []);

  const fetchAllData = useCallback(async () => {
    const api = initializeAPI();
    if (!api) return;

    setLoading('deals', true);
    setError(null);

    try {
      // Primeiro busca os funis
      let currentPipelineId = selectedPipelineId;
      if (!pipelines.length) {
        const pipelinesRes = await api.getPipelines().catch(() => []);
        setPipelines(pipelinesRes);
        if (pipelinesRes.length > 0 && !currentPipelineId) {
          currentPipelineId = pipelinesRes[0].id;
          setSelectedPipelineId(currentPipelineId);
        }
      }

      const [dealsRes, stagesRes, contactsRes, campaignsRes, prospectingDealsRes, prospectingStagesRes] = await Promise.all([
        api.getAllDeals(currentPipelineId || undefined),
        api.getFunnelStages(currentPipelineId || undefined),
        api.getContacts(1, 500).catch(() => ({ data: [] })),
        api.getCampaigns(1, 100).catch(() => ({ data: [] })),
        api.getAllDeals('6a91b08e165be40025782aa1').catch(() => []),
        api.getFunnelStages('6a91b08e165be40025782aa1').catch(() => [])
      ]);

      setDeals(dealsRes);
      useRDStationStore.getState().setProspectingDeals(prospectingDealsRes);
      useRDStationStore.getState().setProspectingStages(prospectingStagesRes);
      setFunnelStages(stagesRes);
      setContacts(contactsRes.data || []);
      setCampaigns(campaignsRes.data || []);

      computeMetrics();
      computeFunnelData();
      computeCampaignPerformance();
      computeTimeSeriesData();
      computeLeadSources();
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Falha ao carregar dados do RD Station CRM');
    } finally {
      setLoading('deals', false);
    }
  }, [
    initializeAPI,
    setDeals,
    setFunnelStages,
    setLoading,
    setError,
    computeMetrics,
    computeFunnelData,
    pipelines,
    selectedPipelineId,
    setPipelines,
    setSelectedPipelineId,
  ]);

  const handleAuthCallback = useCallback(async (code: string) => {}, []);

  useEffect(() => {
    // Carrega dados se vazio ou se mudar de pipeline
    if (!loading.deals) {
      fetchAllData();
    }
  }, [selectedPipelineId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (deals.length > 0) {
      computeMetrics();
      computeFunnelData();
    }
  }, [startDate, endDate, deals]); // eslint-disable-line react-hooks/exhaustive-deps

  const getAuthUrl = useCallback(() => {
    return null;
  }, []);

  return {
    isAuthenticated: true, // Bypass Auth for API Token
    loading,
    error,
    contacts,
    deals,
    campaigns,
    funnelStages,
    pipelines,
    selectedPipelineId,
    startDate,
    endDate,
    setSelectedPipelineId,
    setStartDate,
    setEndDate,
    metrics: useRDStationStore.getState().metrics,
    funnelData: useRDStationStore.getState().funnelData,
    campaignPerformance: useRDStationStore.getState().campaignPerformance,
    timeSeriesData: useRDStationStore.getState().timeSeriesData,
    leadSources: useRDStationStore.getState().leadSources,
    fetchAllData,
    handleAuthCallback,
    getAuthUrl,
    logout,
  };
}